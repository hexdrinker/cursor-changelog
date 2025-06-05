# Changelog Cache 비교 시스템

캐시에 저장된 changelog 데이터와 새로 크롤링한 데이터를 비교하여 변경된 항목만 효율적으로 필터링하는 고급 유틸리티입니다.

## 🚀 핵심 기능

- **Hash ID 기반 비교**: 각 changelog 항목의 고유한 해시 ID를 사용한 정확한 비교
- **세밀한 변경 감지**: 콘텐츠, 미디어, 섹션별 변경사항을 개별적으로 추적
- **유연한 옵션**: 비교 범위와 세부 사항을 커스터마이징 가능
- **포괄적인 결과**: 신규, 업데이트, 삭제, 변경없음 항목을 모두 분류
- **성능 최적화**: Map 기반 인덱싱으로 O(n) 시간 복잡도 달성

## 📦 설치 및 설정

```typescript
// 필요한 모듈 import
import {
  compareChangelogCache,
  getChangedEntries,
  hasChanges,
  printCacheComparisonSummary,
  exportCacheComparison,
  type CacheCompareOptions,
} from './lib/utils/changelog-cache-compare'

import {
  parseCursorChangelog,
  type ChangelogEntry,
} from './lib/utils/cursor-changelog-parser'
```

## 🎯 기본 사용법

### 1. 간단한 변경사항 확인

```typescript
async function checkForUpdates() {
  // 캐시된 데이터 (예: 데이터베이스에서 로드)
  const cachedEntries = await loadCachedChangelog()

  // 새로운 데이터 크롤링
  const newEntries = await parseCursorChangelog()

  // 변경사항이 있는지 확인
  if (hasChanges(cachedEntries, newEntries)) {
    console.log('🔔 새로운 업데이트가 있습니다!')

    // 변경된 항목들만 가져오기
    const changedItems = getChangedEntries(cachedEntries, newEntries)
    console.log(`📝 ${changedItems.length}개의 항목이 변경되었습니다.`)

    return changedItems
  } else {
    console.log('✅ 변경사항이 없습니다.')
    return []
  }
}
```

### 2. 상세한 비교 분석

```typescript
async function performDetailedComparison() {
  const cachedEntries = await loadCachedChangelog()
  const newEntries = await parseCursorChangelog()

  // 상세 비교 실행
  const comparison = compareChangelogCache(cachedEntries, newEntries, {
    includeContentChanges: true, // 콘텐츠 변경 포함
    includeMediaChanges: true, // 미디어 변경 포함
    prioritizeVersionOrder: true, // 버전 순으로 정렬
    debugMode: true, // 디버그 로그 출력
  })

  // 결과를 사람이 읽기 쉬운 형태로 출력
  printCacheComparisonSummary(comparison)

  // 각 카테고리별 처리
  if (comparison.newEntries.length > 0) {
    console.log('🆕 새로운 항목들:')
    comparison.newEntries.forEach((entry) => {
      console.log(`  - ${entry.version}: ${entry.title}`)
    })
  }

  if (comparison.updatedEntries.length > 0) {
    console.log('🔄 업데이트된 항목들:')
    comparison.updatedEntries.forEach((update) => {
      console.log(`  - ${update.newEntry.version}: ${update.newEntry.title}`)
      console.log(`    이전: ${update.oldEntry.title}`)
    })
  }

  return comparison
}
```

## ⚙️ 고급 설정 옵션

### CacheCompareOptions 인터페이스

```typescript
interface CacheCompareOptions {
  includeContentChanges?: boolean // 콘텐츠 변경 감지 (기본값: true)
  includeMediaChanges?: boolean // 미디어 변경 감지 (기본값: true)
  prioritizeVersionOrder?: boolean // 버전 순 정렬 (기본값: false)
  debugMode?: boolean // 디버그 로그 (기본값: false)
}
```

### 옵션별 사용 예시

```typescript
// 1. 빠른 체크 (콘텐츠 변경 무시)
const quickCheck = compareChangelogCache(cached, new, {
  includeContentChanges: false,
  includeMediaChanges: false,
})

// 2. 미디어 변경만 감지
const mediaOnlyCheck = compareChangelogCache(cached, new, {
  includeContentChanges: false,
  includeMediaChanges: true,
})

// 3. 완전한 분석 (모든 변경사항 + 디버그)
const fullAnalysis = compareChangelogCache(cached, new, {
  includeContentChanges: true,
  includeMediaChanges: true,
  prioritizeVersionOrder: true,
  debugMode: true,
})
```

## 📊 결과 데이터 구조

### CacheComparisonResult

```typescript
interface CacheComparisonResult {
  newEntries: ChangelogEntry[] // 새로 추가된 항목들
  updatedEntries: Array<{
    // 수정된 항목들
    oldEntry: ChangelogEntry
    newEntry: ChangelogEntry
  }>
  deletedEntries: ChangelogEntry[] // 삭제된 항목들
  unchangedEntries: ChangelogEntry[] // 변경되지 않은 항목들
  summary: {
    // 전체 변경사항 요약
    totalCached: number
    totalNew: number
    newCount: number
    updatedCount: number
    deletedCount: number
    unchangedCount: number
  }
}
```

## 🛠️ 유틸리티 함수들

### 1. 변경된 항목만 추출

```typescript
const changedEntries = getChangedEntries(cachedEntries, newEntries)
// 신규 항목 + 업데이트된 항목의 새 버전을 반환
```

### 2. 특정 버전의 상태 확인

```typescript
const versionStatus = getChangesForVersion(comparisonResult, '1.2')

if (versionStatus.isNew) {
  console.log('새로운 버전입니다!')
} else if (versionStatus.isUpdated) {
  console.log('기존 버전이 업데이트되었습니다!')
  console.log('이전:', versionStatus.oldEntry?.title)
  console.log('현재:', versionStatus.entry?.title)
} else if (versionStatus.isDeleted) {
  console.log('이 버전이 삭제되었습니다!')
}
```

### 3. JSON 형태로 내보내기

```typescript
// 기본 내보내기 (변경사항만)
const basicExport = exportCacheComparison(comparisonResult)

// 변경되지 않은 항목도 포함
const fullExport = exportCacheComparison(comparisonResult, true)

// 파일로 저장
await fs.writeFile('changelog-changes.json', basicExport)
```

## 🎬 실제 사용 시나리오

### 1. 주기적인 모니터링 시스템

```typescript
import cron from 'node-cron'

// 매시간 실행
cron.schedule('0 * * * *', async () => {
  try {
    const cached = await database.getCachedChangelog()
    const fresh = await parseCursorChangelog()

    if (hasChanges(cached, fresh)) {
      const changes = getChangedEntries(cached, fresh)

      // 알림 발송
      await sendNotification({
        title: '📝 Cursor 업데이트 알림',
        message: `${changes.length}개의 새로운 변경사항이 있습니다.`,
        changes: changes,
      })

      // 캐시 업데이트
      await database.updateCachedChangelog(fresh)

      // 변경 로그 저장
      const comparison = compareChangelogCache(cached, fresh)
      await database.saveChangeLog(exportCacheComparison(comparison))
    }
  } catch (error) {
    console.error('모니터링 실패:', error)
  }
})
```

### 2. 웹훅 기반 알림 시스템

```typescript
async function handleWebhookTrigger() {
  const cached = await getCachedData()
  const fresh = await parseCursorChangelog()

  const comparison = compareChangelogCache(cached, fresh, {
    debugMode: process.env.NODE_ENV === 'development',
  })

  if (comparison.summary.newCount > 0 || comparison.summary.updatedCount > 0) {
    // Discord/Slack 알림
    await sendDiscordNotification({
      embeds: [
        {
          title: '🚀 Cursor Changelog 업데이트',
          color: 0x00ff00,
          fields: [
            {
              name: '새로운 기능',
              value: `${comparison.summary.newCount}개`,
              inline: true,
            },
            {
              name: '업데이트',
              value: `${comparison.summary.updatedCount}개`,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    })

    // 이메일 알림
    await sendEmailDigest(comparison)
  }
}
```

### 3. CI/CD 파이프라인 통합

```typescript
// GitHub Actions 또는 다른 CI/CD에서 사용
async function ciChangelogCheck() {
  const cached = JSON.parse(process.env.CACHED_CHANGELOG || '[]')
  const fresh = await parseCursorChangelog()

  const comparison = compareChangelogCache(cached, fresh)

  if (comparison.summary.newCount > 0) {
    // GitHub Release 자동 생성
    const releaseNotes = comparison.newEntries
      .map((entry) => `## ${entry.version}\n\n${entry.content}`)
      .join('\n\n')

    await createGitHubRelease({
      tag: `cursor-${Date.now()}`,
      name: 'Cursor Changelog Update',
      body: releaseNotes,
    })

    // 환경 변수 업데이트
    console.log(`::set-output name=cached_changelog::${JSON.stringify(fresh)}`)
  }
}
```

## 🔧 성능 최적화 팁

### 1. 캐시 전략

```typescript
class ChangelogCacheManager {
  private cache = new Map<string, ChangelogEntry>()
  private lastUpdate = 0
  private CACHE_TTL = 30 * 60 * 1000 // 30분

  async getEntries(): Promise<ChangelogEntry[]> {
    const now = Date.now()

    if (now - this.lastUpdate < this.CACHE_TTL && this.cache.size > 0) {
      return Array.from(this.cache.values())
    }

    const fresh = await parseCursorChangelog()
    this.cache.clear()
    fresh.forEach((entry) => this.cache.set(entry.id, entry))
    this.lastUpdate = now

    return fresh
  }
}
```

### 2. 병렬 처리

```typescript
async function parallelComparison() {
  const [cached, fresh] = await Promise.all([
    loadCachedChangelog(),
    parseCursorChangelog(),
  ])

  return compareChangelogCache(cached, fresh)
}
```

### 3. 부분 업데이트

```typescript
async function incrementalUpdate(lastCheckTime: Date) {
  const cached = await loadCachedChangelog()
  const fresh = await parseCursorChangelog()

  // 최근 변경사항만 확인
  const recentEntries = fresh.filter(
    (entry) => new Date(entry.date) > lastCheckTime
  )

  if (recentEntries.length === 0) {
    return { hasChanges: false, changes: [] }
  }

  const comparison = compareChangelogCache(cached, fresh)
  return { hasChanges: true, changes: comparison }
}
```

## ⚠️ 주의사항

1. **메모리 사용량**: 대량의 changelog 데이터를 처리할 때는 메모리 사용량을 모니터링하세요.
2. **API 제한**: Cursor 사이트에 과도한 요청을 보내지 않도록 적절한 간격을 두세요.
3. **에러 핸들링**: 네트워크 오류나 파싱 실패에 대한 적절한 예외 처리를 구현하세요.
4. **데이터 검증**: 크롤링된 데이터의 유효성을 검증하는 로직을 추가하는 것을 권장합니다.

## 🧪 테스트

```bash
# 캐시 비교 로직 테스트 실행
pnpm run test:cache-compare

# 또는 직접 실행
npx tsx src/lib/utils/test-cache-compare.ts
```

## 📝 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.
