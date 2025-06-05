import * as cheerio from 'cheerio'
import { createHash } from 'crypto'

/**
 * Cursor changelog 항목의 타입 정의
 */
export interface ChangelogEntry {
  id: string
  version: string
  date: string
  title: string
  content: string
  htmlContent: string
  images: MediaItem[]
  videos: MediaItem[]
  sections: Section[]
  rawHtml: string
}

/**
 * 미디어 아이템 타입 정의
 */
export interface MediaItem {
  src: string
  alt?: string
  type: 'image' | 'video'
  caption?: string
}

/**
 * 섹션 타입 정의
 */
export interface Section {
  title: string
  content: string
  level: number // h1=1, h2=2, h3=3, etc.
}

/**
 * 파싱 옵션
 */
export interface ParseOptions {
  includeImages?: boolean
  includeVideos?: boolean
  generateDetailedSections?: boolean
  customHashSalt?: string
}

/**
 * 문자열로부터 고유한 해시 ID를 생성합니다
 */
function generateHashId(content: string, salt: string = ''): string {
  const hash = createHash('sha256')
  hash.update(content + salt)
  return hash.digest('hex').substring(0, 16)
}

/**
 * HTML에서 텍스트 콘텐츠를 추출하고 정리합니다
 */
function extractCleanText(html: string): string {
  const $ = cheerio.load(html)

  // 불필요한 요소들 제거
  $('script, style, noscript').remove()

  // 텍스트 추출
  const text = $.text()
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()

  return text
}

/**
 * 미디어 아이템들을 추출합니다
 */
function extractMediaItems(
  $: cheerio.CheerioAPI,
  element: cheerio.Cheerio<any>
): {
  images: MediaItem[]
  videos: MediaItem[]
} {
  const images: MediaItem[] = []
  const videos: MediaItem[] = []

  // 이미지 추출
  element.find('img').each((_, img) => {
    const $img = $(img)
    const src = $img.attr('src')
    if (src) {
      images.push({
        src: src.startsWith('http') ? src : `https://www.cursor.com${src}`,
        alt: $img.attr('alt') || '',
        type: 'image',
        caption: $img.closest('figure').find('figcaption').text() || undefined,
      })
    }
  })

  // 비디오 추출
  element.find('video').each((_, video) => {
    const $video = $(video)
    const src = $video.attr('src') || $video.find('source').first().attr('src')
    if (src) {
      videos.push({
        src: src.startsWith('http') ? src : `https://www.cursor.com${src}`,
        alt: $video.attr('title') || '',
        type: 'video',
        caption:
          $video.closest('figure').find('figcaption').text() || undefined,
      })
    }
  })

  return { images, videos }
}

/**
 * 섹션들을 추출합니다
 */
function extractSections(
  $: cheerio.CheerioAPI,
  element: cheerio.Cheerio<any>
): Section[] {
  const sections: Section[] = []

  element.find('h1, h2, h3, h4, h5, h6').each((_, heading) => {
    const $heading = $(heading)
    const level = parseInt(heading.tagName.substring(1))
    const title = $heading.text().trim()

    // 해당 섹션의 콘텐츠를 수집
    let content = ''
    let $current = $heading.next()

    while ($current.length && !$current.is('h1, h2, h3, h4, h5, h6')) {
      content += $current.text() + ' '
      $current = $current.next()
    }

    if (title) {
      sections.push({
        title,
        content: content.trim(),
        level,
      })
    }
  })

  return sections
}

/**
 * 날짜 문자열을 파싱하여 ISO 형식으로 변환합니다
 */
function parseDate(dateStr: string): string {
  try {
    // "June 4, 2025" 형식을 파싱
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }

    // "Jun 4, 2025" 형식도 시도
    const shortDate = new Date(
      dateStr.replace(/(\w{3})\s+(\d+),\s+(\d{4})/, '$1 $2, $3')
    )
    if (!isNaN(shortDate.getTime())) {
      return shortDate.toISOString().split('T')[0]
    }

    return dateStr // 파싱 실패시 원본 반환
  } catch {
    return dateStr
  }
}

/**
 * Cursor changelog 페이지에서 HTML을 가져옵니다
 */
export async function fetchChangelogHtml(): Promise<string> {
  try {
    const response = await fetch('https://www.cursor.com/changelog', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.text()
  } catch (error) {
    throw new Error(
      `Failed to fetch changelog: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

/**
 * HTML을 파싱하여 changelog 항목들을 추출합니다
 */
export function parseChangelogHtml(
  html: string,
  options: ParseOptions = {}
): ChangelogEntry[] {
  const {
    includeImages = true,
    includeVideos = true,
    generateDetailedSections = true,
    customHashSalt = '',
  } = options

  const $ = cheerio.load(html)
  const entries: ChangelogEntry[] = []

  // 각 버전 블록을 찾아서 파싱
  // Cursor changelog는 특정 구조를 가지고 있으므로 이에 맞게 선택자를 조정
  $('[class*="changelog"], article, .version-block, section').each(
    (_, element) => {
      const $element = $(element)

      // 버전 정보 추출
      let version = ''
      let date = ''
      let title = ''

      // 버전 정보를 다양한 방법으로 찾기
      const versionElement = $element
        .find('h1, h2, .version, [class*="version"]')
        .first()
      if (versionElement.length) {
        const versionText = versionElement.text().trim()

        // "1.0" 같은 버전 패턴 추출
        const versionMatch = versionText.match(/(\d+\.\d+(?:\.\d+)?)/)
        if (versionMatch) {
          version = versionMatch[1]
        }
      }

      // 날짜 정보 추출
      const dateElement = $element.find('time, .date, [class*="date"]').first()
      if (dateElement.length) {
        date = parseDate(dateElement.text().trim())
      } else {
        // 텍스트에서 날짜 패턴 찾기
        const textContent = $element.text()
        const dateMatch = textContent.match(
          /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+,\s+\d{4}/i
        )
        if (dateMatch) {
          date = parseDate(dateMatch[0])
        }
      }

      // 제목 추출
      const titleElement = $element
        .find('h2, h3, .title, [class*="title"]')
        .first()
      if (titleElement.length) {
        title = titleElement.text().trim()
      } else if (version) {
        // 버전 다음 텍스트를 제목으로 사용
        const nextElement = versionElement.next()
        if (nextElement.length) {
          title = nextElement.text().trim().split('\n')[0]
        }
      }

      // 버전이나 제목이 없으면 스킵
      if (!version && !title) {
        return
      }

      // 콘텐츠 추출
      const rawHtml = $element.html() || ''
      const htmlContent = rawHtml
      const content = extractCleanText(rawHtml)

      // 미디어 아이템 추출
      let images: MediaItem[] = []
      let videos: MediaItem[] = []

      if (includeImages || includeVideos) {
        const media = extractMediaItems($, $element)
        if (includeImages) images = media.images
        if (includeVideos) videos = media.videos
      }

      // 섹션 추출
      let sections: Section[] = []
      if (generateDetailedSections) {
        sections = extractSections($, $element)
      }

      // 고유 ID 생성
      const idContent = `${version}-${date}-${title}-${content.substring(
        0,
        100
      )}`
      const id = generateHashId(idContent, customHashSalt)

      // 유효한 항목만 추가
      if (version || title || content.length > 50) {
        entries.push({
          id,
          version: version || 'unknown',
          date: date || new Date().toISOString().split('T')[0],
          title: title || `Version ${version}`,
          content,
          htmlContent,
          images,
          videos,
          sections,
          rawHtml,
        })
      }
    }
  )

  // 직접적인 버전 블록이 없는 경우, 다른 접근 방식 시도
  if (entries.length === 0) {
    // 페이지의 주요 콘텐츠 영역에서 버전별로 파싱
    $('main, .main, .content, [role="main"]')
      .first()
      .children()
      .each((_, element) => {
        const $element = $(element)
        const text = $element.text().trim()

        // 버전 패턴을 찾기
        if (
          text.match(/^\d+\.\d+/) ||
          text.match(
            /^(January|February|March|April|May|June|July|August|September|October|November|December)/i
          )
        ) {
          const rawHtml = $element.html() || ''
          const content = extractCleanText(rawHtml)

          if (content.length > 20) {
            const lines = content.split('\n').filter((line) => line.trim())
            const firstLine = lines[0] || ''

            let version = ''
            let date = ''
            let title = ''

            // 첫 줄에서 버전과 날짜 추출
            const versionMatch = firstLine.match(/(\d+\.\d+(?:\.\d+)?)/)
            const dateMatch = firstLine.match(
              /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+,\s+\d{4}/i
            )

            if (versionMatch) version = versionMatch[1]
            if (dateMatch) date = parseDate(dateMatch[0])

            // 제목은 두 번째 줄이나 첫 번째 헤딩에서
            if (lines.length > 1) {
              title = lines[1]
            }

            // 미디어 추출
            let images: MediaItem[] = []
            let videos: MediaItem[] = []

            if (includeImages || includeVideos) {
              const media = extractMediaItems($, $element)
              if (includeImages) images = media.images
              if (includeVideos) videos = media.videos
            }

            // 섹션 추출
            let sections: Section[] = []
            if (generateDetailedSections) {
              sections = extractSections($, $element)
            }

            const idContent = `${version}-${date}-${title}-${content.substring(
              0,
              100
            )}`
            const id = generateHashId(idContent, customHashSalt)

            entries.push({
              id,
              version: version || 'unknown',
              date: date || new Date().toISOString().split('T')[0],
              title: title || `Content ${id.substring(0, 8)}`,
              content,
              htmlContent: rawHtml,
              images,
              videos,
              sections,
              rawHtml,
            })
          }
        }
      })
  }

  return entries
}

/**
 * 메인 함수: Cursor changelog를 가져와서 파싱합니다
 */
export async function parseCursorChangelog(
  options: ParseOptions = {}
): Promise<ChangelogEntry[]> {
  try {
    const html = await fetchChangelogHtml()
    return parseChangelogHtml(html, options)
  } catch (error) {
    throw new Error(
      `Failed to parse Cursor changelog: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

/**
 * 특정 버전의 changelog 항목을 찾습니다
 */
export function findChangelogEntry(
  entries: ChangelogEntry[],
  version: string
): ChangelogEntry | undefined {
  return entries.find((entry) => entry.version === version)
}

/**
 * changelog 항목들을 날짜순으로 정렬합니다
 */
export function sortChangelogEntries(
  entries: ChangelogEntry[],
  ascending: boolean = false
): ChangelogEntry[] {
  return [...entries].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return ascending
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime()
  })
}

/**
 * changelog 항목을 JSON으로 직렬화합니다
 */
export function serializeChangelogEntry(entry: ChangelogEntry): string {
  return JSON.stringify(entry, null, 2)
}

/**
 * 여러 changelog 항목을 JSON으로 직렬화합니다
 */
export function serializeChangelogEntries(entries: ChangelogEntry[]): string {
  return JSON.stringify(entries, null, 2)
}
