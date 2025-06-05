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

// 캐시된 changelog 데이터 (메모리 캐시)
let cachedChangelogData: ChangelogEntry[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 30 * 60 * 1000 // 30분

// 지원되는 기본 필드들
const TRANSLATABLE_FIELDS = ['title', 'content'] as const

/**
 * 단일 changelog 항목을 번역합니다
 */
async function translateChangelogEntry(
  entry: ChangelogEntry,
  targetLanguage: SupportedLanguage
): Promise<ChangelogEntry> {
  try {
    // 번역이 필요한 필드들을 처리
    const translatedEntry = { ...entry }

    // 제목 번역
    if (entry.title && entry.title.trim().length > 0) {
      const titleResult = await translateSingleTextWithCache(
        entry.title,
        [targetLanguage],
        { cacheDir: './cache', maxAge: 7 * 24 * 60 * 60 * 1000 } // 7일 캐시
      )
      translatedEntry.title =
        titleResult.translations[targetLanguage] || entry.title
    }

    // 내용 번역 (길이 제한 적용)
    if (entry.content && entry.content.trim().length > 0) {
      // 내용이 너무 길면 요약하거나 첫 부분만 번역
      const contentToTranslate =
        entry.content.length > 1000
          ? entry.content.substring(0, 1000) + '...'
          : entry.content

      const contentResult = await translateSingleTextWithCache(
        contentToTranslate,
        [targetLanguage],
        { cacheDir: './cache', maxAge: 7 * 24 * 60 * 60 * 1000 }
      )
      translatedEntry.content =
        contentResult.translations[targetLanguage] || entry.content
    }

    // 섹션 제목들 번역
    if (entry.sections && entry.sections.length > 0) {
      const translatedSections = await Promise.all(
        entry.sections.map(async (section) => {
          if (section.title && section.title.trim().length > 0) {
            const sectionTitleResult = await translateSingleTextWithCache(
              section.title,
              [targetLanguage],
              { cacheDir: './cache', maxAge: 7 * 24 * 60 * 60 * 1000 }
            )
            return {
              ...section,
              title:
                sectionTitleResult.translations[targetLanguage] ||
                section.title,
            }
          }
          return section
        })
      )
      translatedEntry.sections = translatedSections
    }

    return translatedEntry
  } catch (error) {
    console.error(`번역 중 오류 발생 (${entry.id}):`, error)
    // 번역 실패 시 원본 반환
    return entry
  }
}

/**
 * changelog 데이터를 가져오고 캐시합니다
 */
async function getChangelogData(): Promise<ChangelogEntry[]> {
  const now = Date.now()

  // 캐시가 유효한 경우 캐시된 데이터 반환
  if (cachedChangelogData && now - cacheTimestamp < CACHE_DURATION) {
    console.log('📦 캐시된 changelog 데이터 사용')
    return cachedChangelogData
  }

  try {
    console.log('🔄 새로운 changelog 데이터 가져오는 중...')
    const entries = await parseCursorChangelog({
      includeImages: true,
      includeVideos: true,
      generateDetailedSections: true,
    })

    // 최신 데이터를 캐시에 저장
    cachedChangelogData = entries
    cacheTimestamp = now

    console.log(`✅ ${entries.length}개의 changelog 항목을 가져왔습니다`)
    return entries
  } catch (error) {
    console.error('❌ changelog 데이터 가져오기 실패:', error)

    // 캐시된 데이터가 있으면 그것을 사용 (만료되었더라도)
    if (cachedChangelogData) {
      console.log('⚠️ 오류 발생으로 인한 만료된 캐시 데이터 사용')
      return cachedChangelogData
    }

    throw error
  }
}

/**
 * GET /api/changelog?lang=ko
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') as SupportedLanguage
    const limit = searchParams.get('limit')
    const version = searchParams.get('version')

    // 언어 파라미터 검증
    if (lang && !Object.keys(SUPPORTED_LANGUAGES).includes(lang)) {
      return NextResponse.json(
        {
          error: 'Unsupported language',
          supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
          message: `Language '${lang}' is not supported. Supported languages: ${Object.keys(
            SUPPORTED_LANGUAGES
          ).join(', ')}`,
        },
        { status: 400 }
      )
    }

    // changelog 데이터 가져오기
    let entries = await getChangelogData()

    // 특정 버전 필터링
    if (version) {
      entries = entries.filter((entry) => entry.version === version)
      if (entries.length === 0) {
        return NextResponse.json(
          {
            error: 'Version not found',
            message: `No changelog entry found for version '${version}'`,
          },
          { status: 404 }
        )
      }
    }

    // 개수 제한
    if (limit) {
      const limitNum = parseInt(limit, 10)
      if (limitNum > 0 && limitNum <= 100) {
        entries = entries.slice(0, limitNum)
      }
    }

    // 번역 처리
    let translatedEntries = entries
    if (lang) {
      console.log(`🌐 ${lang} 언어로 ${entries.length}개 항목 번역 시작`)

      try {
        // 배치 번역 (병렬 처리하되 동시 요청 수 제한)
        const BATCH_SIZE = 3 // API 요청 제한을 고려
        const translatedBatches: ChangelogEntry[] = []

        for (let i = 0; i < entries.length; i += BATCH_SIZE) {
          const batch = entries.slice(i, i + BATCH_SIZE)
          const batchPromises = batch.map((entry) =>
            translateChangelogEntry(entry, lang)
          )

          const batchResults = await Promise.all(batchPromises)
          translatedBatches.push(...batchResults)

          console.log(
            `✅ ${i + 1}-${Math.min(i + BATCH_SIZE, entries.length)} 번역 완료`
          )
        }

        translatedEntries = translatedBatches
        console.log(`🎉 총 ${translatedEntries.length}개 항목 번역 완료`)
      } catch (translationError) {
        console.error('번역 중 일부 오류 발생:', translationError)
        // 번역 실패 시에도 원본 데이터 반환
      }
    }

    // 응답 구성
    const response = {
      success: true,
      data: {
        entries: translatedEntries,
        metadata: {
          language: lang || 'en',
          total: translatedEntries.length,
          originalTotal: entries.length,
          version: version || null,
          limit: limit ? parseInt(limit, 10) : null,
          generatedAt: new Date().toISOString(),
          cacheAge: Date.now() - cacheTimestamp,
        },
      },
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600', // 30분 캐시
        'Content-Type': 'application/json; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('API 오류:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS 요청 처리 (CORS)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
