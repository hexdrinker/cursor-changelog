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

/**
 * 날짜별로 changelog 항목들을 그룹화
 */
function groupChangelogByDate(
  entries: ChangelogEntry[]
): Record<string, ChangelogEntry[]> {
  return entries.reduce((acc, entry) => {
    const date = entry.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(entry)
    return acc
  }, {} as Record<string, ChangelogEntry[]>)
}

/**
 * 단일 changelog 항목을 번역합니다
 */
async function translateChangelogEntry(
  entry: ChangelogEntry,
  targetLanguage: SupportedLanguage
): Promise<ChangelogEntry> {
  try {
    const translatedEntry = { ...entry }

    // 제목 번역
    if (entry.title && entry.title.trim().length > 0) {
      const titleResult = await translateSingleTextWithCache(
        entry.title,
        [targetLanguage],
        { cacheDir: './cache', maxAge: 7 * 24 * 60 * 60 * 1000 }
      )
      translatedEntry.title =
        titleResult.translations[targetLanguage] || entry.title
    }

    // 내용 번역 (길이 제한 적용)
    if (entry.content && entry.content.trim().length > 0) {
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
    return entry
  }
}

/**
 * changelog 데이터를 가져오고 캐시합니다
 */
async function getChangelogData(): Promise<ChangelogEntry[]> {
  const now = Date.now()

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

    cachedChangelogData = entries
    cacheTimestamp = now

    console.log(`✅ ${entries.length}개의 changelog 항목을 가져왔습니다`)
    return entries
  } catch (error) {
    console.error('❌ changelog 데이터 가져오기 실패:', error)

    if (cachedChangelogData) {
      console.log('⚠️ 오류 발생으로 인한 만료된 캐시 데이터 사용')
      return cachedChangelogData
    }

    throw error
  }
}

/**
 * GET /api/changelog/paginated?lang=ko&page=0&date=2024-01-01
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') as SupportedLanguage
    const page = parseInt(searchParams.get('page') || '0', 10)
    const targetDate = searchParams.get('date')

    // 언어 파라미터 검증
    if (lang && !Object.keys(SUPPORTED_LANGUAGES).includes(lang)) {
      return NextResponse.json(
        {
          error: 'Unsupported language',
          supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
          message: `Language '${lang}' is not supported.`,
        },
        { status: 400 }
      )
    }

    // changelog 데이터 가져오기
    const allEntries = await getChangelogData()

    // 날짜별 그룹화
    const groupedByDate = groupChangelogByDate(allEntries)
    const sortedDates = Object.keys(groupedByDate).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    )

    // 특정 날짜 요청 시
    if (targetDate) {
      const entriesForDate = groupedByDate[targetDate] || []

      if (entriesForDate.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            entries: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalDates: sortedDates.length,
              currentDate: targetDate,
              hasNext: false,
              hasPrev: false,
            },
            metadata: {
              language: lang || 'en',
              generatedAt: new Date().toISOString(),
            },
          },
        })
      }

      // 해당 날짜의 데이터 번역
      let translatedEntries = entriesForDate
      if (lang) {
        console.log(
          `🌐 ${targetDate} 날짜의 ${entriesForDate.length}개 항목을 ${lang}로 번역 시작`
        )

        try {
          const BATCH_SIZE = 3
          const translatedBatches: ChangelogEntry[] = []

          for (let i = 0; i < entriesForDate.length; i += BATCH_SIZE) {
            const batch = entriesForDate.slice(i, i + BATCH_SIZE)
            const batchPromises = batch.map((entry) =>
              translateChangelogEntry(entry, lang)
            )

            const batchResults = await Promise.all(batchPromises)
            translatedBatches.push(...batchResults)

            console.log(
              `✅ ${i + 1}-${Math.min(
                i + BATCH_SIZE,
                entriesForDate.length
              )} 번역 완료`
            )
          }

          translatedEntries = translatedBatches
          console.log(
            `🎉 ${targetDate} 날짜 총 ${translatedEntries.length}개 항목 번역 완료`
          )
        } catch (translationError) {
          console.error('번역 중 일부 오류 발생:', translationError)
        }
      }

      const currentDateIndex = sortedDates.indexOf(targetDate)

      return NextResponse.json(
        {
          success: true,
          data: {
            entries: translatedEntries,
            pagination: {
              currentPage: page,
              totalPages: 1,
              totalDates: sortedDates.length,
              currentDate: targetDate,
              currentDateIndex,
              hasNext: currentDateIndex > 0,
              hasPrev: currentDateIndex < sortedDates.length - 1,
              nextDate:
                currentDateIndex > 0 ? sortedDates[currentDateIndex - 1] : null,
              prevDate:
                currentDateIndex < sortedDates.length - 1
                  ? sortedDates[currentDateIndex + 1]
                  : null,
            },
            metadata: {
              language: lang || 'en',
              generatedAt: new Date().toISOString(),
              cacheAge: Date.now() - cacheTimestamp,
            },
          },
        },
        {
          headers: {
            'Cache-Control':
              'public, max-age=1800, stale-while-revalidate=3600',
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      )
    }

    // 페이지별 날짜 목록 반환 (날짜만)
    const itemsPerPage = 10
    const startIndex = page * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedDates = sortedDates.slice(startIndex, endIndex)

    const totalPages = Math.ceil(sortedDates.length / itemsPerPage)

    return NextResponse.json(
      {
        success: true,
        data: {
          dates: paginatedDates.map((date) => ({
            date,
            count: groupedByDate[date].length,
          })),
          pagination: {
            currentPage: page,
            totalPages,
            totalDates: sortedDates.length,
            hasNext: page < totalPages - 1,
            hasPrev: page > 0,
          },
          metadata: {
            language: lang || 'en',
            generatedAt: new Date().toISOString(),
            cacheAge: Date.now() - cacheTimestamp,
          },
        },
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
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
