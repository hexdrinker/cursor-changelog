import { NextRequest, NextResponse } from 'next/server'
import {
  parseCursorChangelog,
  type ChangelogEntry,
} from '@/lib/utils/cursor-changelog-parser'
import { translateSingleTextWithCache } from '@/lib/utils/cached-translator'
import {
  type SupportedLanguage,
  SUPPORTED_LANGUAGES,
} from '@/lib/utils/translator'

/**
 * 동기화 결과 타입
 */
interface SyncResult {
  success: boolean
  timestamp: string
  newEntries: number
  updatedEntries: number
  totalEntries: number
  translatedLanguages: SupportedLanguage[]
  errors?: string[]
  duration: number
}

/**
 * 인증 토큰 확인
 */
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const syncToken = process.env.SYNC_TOKEN

  // 환경변수에 SYNC_TOKEN이 설정되어 있으면 인증 확인
  if (syncToken) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false
    }
    const token = authHeader.replace('Bearer ', '')
    return token === syncToken
  }

  // SYNC_TOKEN이 없으면 인증 없이 허용 (개발 환경)
  return true
}

/**
 * 단일 changelog 항목을 모든 지원 언어로 번역
 */
async function translateChangelogEntry(
  entry: ChangelogEntry,
  targetLanguages: SupportedLanguage[]
): Promise<{
  entry: ChangelogEntry
  translations: Record<SupportedLanguage, Partial<ChangelogEntry>>
}> {
  const translations: Record<
    SupportedLanguage,
    Partial<ChangelogEntry>
  > = {} as any

  try {
    // 각 언어별로 번역 수행
    for (const lang of targetLanguages) {
      const translatedEntry: Partial<ChangelogEntry> = {}

      // 제목 번역
      if (entry.title && entry.title.trim().length > 0) {
        const titleResult = await translateSingleTextWithCache(
          entry.title,
          [lang],
          {
            cacheDir: './cache/sync',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 캐시
          }
        )
        translatedEntry.title = titleResult.translations[lang] || entry.title
      }

      // 내용 번역 (길이 제한 적용)
      if (entry.content && entry.content.trim().length > 0) {
        const contentToTranslate =
          entry.content.length > 1000
            ? entry.content.substring(0, 1000) + '...'
            : entry.content

        const contentResult = await translateSingleTextWithCache(
          contentToTranslate,
          [lang],
          {
            cacheDir: './cache/sync',
            maxAge: 7 * 24 * 60 * 60 * 1000,
          }
        )
        translatedEntry.content =
          contentResult.translations[lang] || entry.content
      }

      // 섹션 제목들 번역
      if (entry.sections && entry.sections.length > 0) {
        const translatedSections = await Promise.all(
          entry.sections.slice(0, 5).map(async (section) => {
            // 최대 5개 섹션만 번역
            if (section.title && section.title.trim().length > 0) {
              const sectionTitleResult = await translateSingleTextWithCache(
                section.title,
                [lang],
                {
                  cacheDir: './cache/sync',
                  maxAge: 7 * 24 * 60 * 60 * 1000,
                }
              )
              return {
                ...section,
                title: sectionTitleResult.translations[lang] || section.title,
              }
            }
            return section
          })
        )
        translatedEntry.sections = translatedSections
      }

      translations[lang] = translatedEntry
    }

    return { entry, translations }
  } catch (error) {
    console.error(`번역 중 오류 발생 (${entry.id}):`, error)
    // 번역 실패 시 빈 번역으로 반환
    for (const lang of targetLanguages) {
      translations[lang] = {}
    }
    return { entry, translations }
  }
}

/**
 * 메모리 캐시 (간단한 구현)
 */
let syncCache: {
  entries: ChangelogEntry[]
  translations: Record<
    string,
    Record<SupportedLanguage, Partial<ChangelogEntry>>
  >
  lastSync: number
} = {
  entries: [],
  translations: {},
  lastSync: 0,
}

/**
 * changelog 동기화 수행
 */
async function performSync(
  targetLanguages: SupportedLanguage[] = ['ko', 'ja', 'zh', 'es']
): Promise<SyncResult> {
  const startTime = Date.now()
  const errors: string[] = []

  try {
    console.log('🔄 Changelog 동기화 시작...')

    // 1. 최신 changelog 데이터 가져오기
    const newEntries = await parseCursorChangelog({
      includeImages: true,
      includeVideos: true,
      generateDetailedSections: true,
    })

    console.log(`📥 ${newEntries.length}개의 changelog 항목을 가져왔습니다`)

    let newEntriesCount = 0
    let updatedEntriesCount = 0

    // 2. 새로운 항목과 업데이트된 항목 감지
    const existingIds = new Set(syncCache.entries.map((e) => e.id))
    const newItems = newEntries.filter((entry) => !existingIds.has(entry.id))
    newEntriesCount = newItems.length

    // 기존 항목 중 내용이 변경된 것들 감지 (간단한 해시 비교)
    const updatedItems = newEntries.filter((entry) => {
      const existing = syncCache.entries.find((e) => e.id === entry.id)
      return existing && existing.rawHtml !== entry.rawHtml
    })
    updatedEntriesCount = updatedItems.length

    console.log(`🆕 새로운 항목: ${newEntriesCount}개`)
    console.log(`🔄 업데이트된 항목: ${updatedEntriesCount}개`)

    // 3. 번역이 필요한 항목들 식별
    const itemsToTranslate = [...newItems, ...updatedItems]

    if (itemsToTranslate.length > 0) {
      console.log(
        `🌐 ${itemsToTranslate.length}개 항목을 ${targetLanguages.join(
          ', '
        )} 언어로 번역 시작`
      )

      // 4. 배치 번역 (병렬 처리하되 API 제한 고려)
      const BATCH_SIZE = 2 // API 요청 제한을 고려한 작은 배치 크기

      for (let i = 0; i < itemsToTranslate.length; i += BATCH_SIZE) {
        const batch = itemsToTranslate.slice(i, i + BATCH_SIZE)

        try {
          const batchPromises = batch.map((entry) =>
            translateChangelogEntry(entry, targetLanguages)
          )

          const batchResults = await Promise.all(batchPromises)

          // 번역 결과를 캐시에 저장
          batchResults.forEach(({ entry, translations }) => {
            syncCache.translations[entry.id] = translations
          })

          console.log(
            `✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 번역 완료 (${
              i + 1
            }-${Math.min(i + BATCH_SIZE, itemsToTranslate.length)})`
          )

          // API 속도 제한을 위한 짧은 대기
          if (i + BATCH_SIZE < itemsToTranslate.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        } catch (error) {
          const errorMsg = `배치 ${Math.floor(i / BATCH_SIZE) + 1} 번역 실패: ${
            error instanceof Error ? error.message : String(error)
          }`
          console.error(errorMsg)
          errors.push(errorMsg)
        }
      }
    }

    // 5. 캐시 업데이트
    syncCache.entries = newEntries
    syncCache.lastSync = Date.now()

    const duration = Date.now() - startTime

    console.log(`✅ 동기화 완료 (${duration}ms)`)

    return {
      success: true,
      timestamp: new Date().toISOString(),
      newEntries: newEntriesCount,
      updatedEntries: updatedEntriesCount,
      totalEntries: newEntries.length,
      translatedLanguages: targetLanguages,
      errors: errors.length > 0 ? errors : undefined,
      duration,
    }
  } catch (error) {
    const errorMsg = `동기화 실패: ${
      error instanceof Error ? error.message : String(error)
    }`
    console.error(errorMsg)
    errors.push(errorMsg)

    return {
      success: false,
      timestamp: new Date().toISOString(),
      newEntries: 0,
      updatedEntries: 0,
      totalEntries: syncCache.entries.length,
      translatedLanguages: targetLanguages,
      errors,
      duration: Date.now() - startTime,
    }
  }
}

/**
 * POST /api/sync - 수동 동기화 트리거
 */
export async function POST(request: NextRequest) {
  // 인증 확인
  if (!verifyAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Valid authorization token required' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { languages = ['ko', 'ja', 'zh', 'es'], force = false } = body

    // 언어 파라미터 검증
    const validLanguages = languages.filter((lang: string) =>
      Object.keys(SUPPORTED_LANGUAGES).includes(lang)
    )

    if (validLanguages.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid languages',
          supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
          message: 'At least one valid language must be specified',
        },
        { status: 400 }
      )
    }

    // 강제 동기화가 아니고 최근에 동기화했으면 스킵
    const timeSinceLastSync = Date.now() - syncCache.lastSync
    const minSyncInterval = 10 * 60 * 1000 // 10분

    if (!force && timeSinceLastSync < minSyncInterval) {
      const nextSyncTime = new Date(syncCache.lastSync + minSyncInterval)
      return NextResponse.json(
        {
          success: false,
          message: 'Sync skipped - too recent',
          lastSync: new Date(syncCache.lastSync).toISOString(),
          nextAllowedSync: nextSyncTime.toISOString(),
          timeSinceLastSync: Math.round(timeSinceLastSync / 1000),
        },
        { status: 429 }
      )
    }

    // 동기화 수행
    const result = await performSync(validLanguages)

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    })
  } catch (error) {
    console.error('동기화 API 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sync - 동기화 상태 조회
 */
export async function GET(request: NextRequest) {
  // 인증 확인
  if (!verifyAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Valid authorization token required' },
      { status: 401 }
    )
  }

  const timeSinceLastSync = Date.now() - syncCache.lastSync
  const nextSyncTime = new Date(syncCache.lastSync + 60 * 60 * 1000) // 1시간 후

  return NextResponse.json({
    lastSync:
      syncCache.lastSync > 0
        ? new Date(syncCache.lastSync).toISOString()
        : null,
    timeSinceLastSync: Math.round(timeSinceLastSync / 1000),
    nextRecommendedSync: nextSyncTime.toISOString(),
    totalEntries: syncCache.entries.length,
    translatedEntries: Object.keys(syncCache.translations).length,
    supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
    status: 'ready',
  })
}

/**
 * OPTIONS - CORS 지원
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
