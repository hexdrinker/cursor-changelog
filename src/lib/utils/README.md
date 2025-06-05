# Cursor Changelog Parser

Cursor의 공식 changelog 페이지(https://www.cursor.com/changelog)를 파싱하여 구조화된 데이터로 변환하는 유틸리티입니다.

## 기능

- **HTML 파싱**: Cheerio를 사용한 견고한 HTML 파싱
- **구조화된 데이터**: 버전, 날짜, 제목, 본문, 미디어 등을 체계적으로 추출
- **고유 ID 생성**: 각 changelog 항목에 대한 SHA-256 기반 고유 해시 ID
- **미디어 추출**: 이미지 및 비디오 URL과 메타데이터 수집
- **섹션 분석**: 헤딩 기반 콘텐츠 섹션화
- **유연한 옵션**: 필요에 따라 파싱 동작 커스터마이징

## 설치

```bash
pnpm add cheerio
```

## 기본 사용법

```typescript
import { parseCursorChangelog } from './lib/utils/cursor-changelog-parser'

// 기본 파싱
const entries = await parseCursorChangelog()
console.log(`${entries.length}개의 changelog 항목을 찾았습니다.`)

// 첫 번째 항목 출력
if (entries.length > 0) {
  const latest = entries[0]
  console.log(`최신 버전: ${latest.version}`)
  console.log(`릴리즈 날짜: ${latest.date}`)
  console.log(`제목: ${latest.title}`)
  console.log(`이미지 개수: ${latest.images.length}`)
  console.log(`비디오 개수: ${latest.videos.length}`)
}
```

## 고급 사용법

### 옵션을 사용한 파싱

```typescript
import {
  parseCursorChangelog,
  ParseOptions,
} from './lib/utils/cursor-changelog-parser'

const options: ParseOptions = {
  includeImages: true, // 이미지 URL 추출 (기본값: true)
  includeVideos: true, // 비디오 URL 추출 (기본값: true)
  generateDetailedSections: true, // 상세 섹션 분석 (기본값: true)
  customHashSalt: 'my-salt', // 해시 ID 생성용 커스텀 솔트
}

const entries = await parseCursorChangelog(options)
```

### HTML 직접 파싱

```typescript
import {
  parseChangelogHtml,
  fetchChangelogHtml,
} from './lib/utils/cursor-changelog-parser'

// HTML 수동 가져오기
const html = await fetchChangelogHtml()

// HTML 직접 파싱
const entries = parseChangelogHtml(html, {
  includeImages: false, // 이미지 제외
  includeVideos: false, // 비디오 제외
})
```

### 특정 버전 찾기

```typescript
import {
  findChangelogEntry,
  sortChangelogEntries,
} from './lib/utils/cursor-changelog-parser'

const entries = await parseCursorChangelog()

// 특정 버전 찾기
const version1_0 = findChangelogEntry(entries, '1.0')
if (version1_0) {
  console.log(`버전 1.0 찾음: ${version1_0.title}`)
}

// 날짜순 정렬 (최신순)
const sortedEntries = sortChangelogEntries(entries, false)
console.log('최신 5개 버전:')
sortedEntries.slice(0, 5).forEach((entry) => {
  console.log(`- ${entry.version}: ${entry.title} (${entry.date})`)
})
```

### JSON 직렬화

```typescript
import {
  serializeChangelogEntries,
  serializeChangelogEntry,
} from './lib/utils/cursor-changelog-parser'

const entries = await parseCursorChangelog()

// 전체 항목을 JSON으로 저장
const allEntriesJson = serializeChangelogEntries(entries)
await Bun.write('changelog-all.json', allEntriesJson)

// 개별 항목 JSON으로 저장
if (entries.length > 0) {
  const latestJson = serializeChangelogEntry(entries[0])
  await Bun.write('changelog-latest.json', latestJson)
}
```

## 데이터 구조

### ChangelogEntry

```typescript
interface ChangelogEntry {
  id: string // 고유 해시 ID (예: "a1b2c3d4e5f6g7h8")
  version: string // 버전 번호 (예: "1.0", "0.50")
  date: string // ISO 날짜 형식 (예: "2025-06-04")
  title: string // 제목 (예: "BugBot, Background Agent access to everyone")
  content: string // 정제된 텍스트 콘텐츠
  htmlContent: string // 원본 HTML 콘텐츠
  images: MediaItem[] // 이미지 목록
  videos: MediaItem[] // 비디오 목록
  sections: Section[] // 섹션 목록
  rawHtml: string // 원본 HTML
}
```

### MediaItem

```typescript
interface MediaItem {
  src: string // 미디어 URL
  alt?: string // 대체 텍스트
  type: 'image' | 'video' // 미디어 타입
  caption?: string // 캡션 (있는 경우)
}
```

### Section

```typescript
interface Section {
  title: string // 섹션 제목
  content: string // 섹션 내용
  level: number // 헤딩 레벨 (1-6)
}
```

## 실제 활용 예제

### Next.js API Route에서 사용

```typescript
// pages/api/changelog.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { parseCursorChangelog } from '../../lib/utils/cursor-changelog-parser'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const entries = await parseCursorChangelog({
      includeImages: true,
      includeVideos: true,
      generateDetailedSections: true,
    })

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
```

### 특정 버전의 미디어 다운로드

```typescript
import { parseCursorChangelog } from './lib/utils/cursor-changelog-parser'

async function downloadVersionMedia(version: string) {
  const entries = await parseCursorChangelog()
  const targetEntry = entries.find((entry) => entry.version === version)

  if (!targetEntry) {
    console.log(`버전 ${version}을 찾을 수 없습니다.`)
    return
  }

  console.log(`버전 ${version}의 미디어:`)
  console.log(`- 이미지 ${targetEntry.images.length}개`)
  console.log(`- 비디오 ${targetEntry.videos.length}개`)

  // 이미지 URL 목록
  targetEntry.images.forEach((img, index) => {
    console.log(`이미지 ${index + 1}: ${img.src}`)
  })

  // 비디오 URL 목록
  targetEntry.videos.forEach((video, index) => {
    console.log(`비디오 ${index + 1}: ${video.src}`)
  })
}

// 사용 예
await downloadVersionMedia('1.0')
```

### RSS 피드 생성

```typescript
import {
  parseCursorChangelog,
  sortChangelogEntries,
} from './lib/utils/cursor-changelog-parser'

async function generateRSSFeed() {
  const entries = await parseCursorChangelog()
  const sortedEntries = sortChangelogEntries(entries, false) // 최신순

  const rssItems = sortedEntries.slice(0, 10).map((entry) => ({
    title: `Cursor ${entry.version}: ${entry.title}`,
    description: entry.content.substring(0, 300) + '...',
    link: `https://www.cursor.com/changelog/${entry.version}`,
    pubDate: new Date(entry.date).toUTCString(),
    guid: entry.id,
  }))

  return rssItems
}
```

## 에러 처리

```typescript
import { parseCursorChangelog } from './lib/utils/cursor-changelog-parser'

try {
  const entries = await parseCursorChangelog()
  // 성공적으로 파싱된 경우
  console.log(`${entries.length}개 항목 파싱 완료`)
} catch (error) {
  if (error instanceof Error) {
    console.error('파싱 실패:', error.message)

    // 네트워크 에러 vs 파싱 에러 구분
    if (error.message.includes('fetch')) {
      console.error('네트워크 연결을 확인해주세요.')
    } else if (error.message.includes('parse')) {
      console.error('HTML 구조가 변경되었을 수 있습니다.')
    }
  }
}
```

## 성능 고려사항

- **캐싱**: 자주 호출하는 경우 결과를 캐싱하는 것을 권장합니다
- **속도 제한**: Cursor 서버에 과도한 요청을 보내지 않도록 주의하세요
- **메모리 사용량**: 대량의 이미지/비디오 URL을 처리할 때 메모리 사용량을 모니터링하세요

## 라이선스

MIT
