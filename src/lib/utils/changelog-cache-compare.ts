import { ChangelogEntry } from './cursor-changelog-parser'

/**
 * 캐시 비교 결과 타입
 */
export interface CacheComparisonResult {
  /** 새로 추가된 항목들 */
  newEntries: ChangelogEntry[]
  /** 수정된 항목들 (기존 버전과 새 버전) */
  updatedEntries: Array<{
    oldEntry: ChangelogEntry
    newEntry: ChangelogEntry
  }>
  /** 삭제된 항목들 */
  deletedEntries: ChangelogEntry[]
  /** 변경되지 않은 항목들 */
  unchangedEntries: ChangelogEntry[]
  /** 전체 변경사항 요약 */
  summary: {
    totalCached: number
    totalNew: number
    newCount: number
    updatedCount: number
    deletedCount: number
    unchangedCount: number
  }
}

/**
 * 캐시 옵션
 */
export interface CacheCompareOptions {
  /** 콘텐츠 변경도 확인할지 여부 (기본값: true) */
  includeContentChanges?: boolean
  /** 미디어 변경도 확인할지 여부 (기본값: true) */
  includeMediaChanges?: boolean
  /** 버전별 정렬 우선순위 (기본값: false) */
  prioritizeVersionOrder?: boolean
  /** 디버그 모드 (상세 로그 출력, 기본값: false) */
  debugMode?: boolean
}

/**
 * 두 changelog 항목이 동일한지 확인 (ID 기준)
 */
function isSameEntry(entry1: ChangelogEntry, entry2: ChangelogEntry): boolean {
  return entry1.id === entry2.id
}

/**
 * 두 changelog 항목의 콘텐츠가 동일한지 확인
 */
function hasContentChanged(
  oldEntry: ChangelogEntry,
  newEntry: ChangelogEntry,
  options: CacheCompareOptions = {}
): boolean {
  const { includeContentChanges = true, includeMediaChanges = true } = options

  // 기본 메타데이터 비교
  if (
    oldEntry.version !== newEntry.version ||
    oldEntry.date !== newEntry.date ||
    oldEntry.title !== newEntry.title
  ) {
    return true
  }

  // 콘텐츠 변경 확인
  if (includeContentChanges) {
    if (
      oldEntry.content !== newEntry.content ||
      oldEntry.htmlContent !== newEntry.htmlContent ||
      oldEntry.rawHtml !== newEntry.rawHtml
    ) {
      return true
    }

    // 섹션 변경 확인
    if (oldEntry.sections.length !== newEntry.sections.length) {
      return true
    }

    // 각 섹션 내용 비교
    for (let i = 0; i < oldEntry.sections.length; i++) {
      const oldSection = oldEntry.sections[i]
      const newSection = newEntry.sections[i]

      if (
        oldSection.title !== newSection.title ||
        oldSection.content !== newSection.content ||
        oldSection.level !== newSection.level
      ) {
        return true
      }
    }
  }

  // 미디어 변경 확인
  if (includeMediaChanges) {
    // 이미지 변경 확인
    if (oldEntry.images.length !== newEntry.images.length) {
      return true
    }

    for (let i = 0; i < oldEntry.images.length; i++) {
      const oldImg = oldEntry.images[i]
      const newImg = newEntry.images[i]

      if (
        oldImg.src !== newImg.src ||
        oldImg.alt !== newImg.alt ||
        oldImg.caption !== newImg.caption
      ) {
        return true
      }
    }

    // 비디오 변경 확인
    if (oldEntry.videos.length !== newEntry.videos.length) {
      return true
    }

    for (let i = 0; i < oldEntry.videos.length; i++) {
      const oldVideo = oldEntry.videos[i]
      const newVideo = newEntry.videos[i]

      if (
        oldVideo.src !== newVideo.src ||
        oldVideo.alt !== newVideo.alt ||
        oldVideo.caption !== newVideo.caption
      ) {
        return true
      }
    }
  }

  return false
}

/**
 * 캐시된 changelog와 새로운 changelog를 비교하여 변경된 항목들을 필터링
 */
export function compareChangelogCache(
  cachedEntries: ChangelogEntry[],
  newEntries: ChangelogEntry[],
  options: CacheCompareOptions = {}
): CacheComparisonResult {
  const {
    includeContentChanges = true,
    includeMediaChanges = true,
    prioritizeVersionOrder = false,
    debugMode = false,
  } = options

  if (debugMode) {
    console.log(
      `🔍 캐시 비교 시작: 캐시 ${cachedEntries.length}개, 신규 ${newEntries.length}개`
    )
  }

  // 결과 초기화
  const result: CacheComparisonResult = {
    newEntries: [],
    updatedEntries: [],
    deletedEntries: [],
    unchangedEntries: [],
    summary: {
      totalCached: cachedEntries.length,
      totalNew: newEntries.length,
      newCount: 0,
      updatedCount: 0,
      deletedCount: 0,
      unchangedCount: 0,
    },
  }

  // 캐시된 항목들을 ID로 인덱싱
  const cachedMap = new Map<string, ChangelogEntry>()
  cachedEntries.forEach((entry) => {
    cachedMap.set(entry.id, entry)
  })

  // 새로운 항목들을 ID로 인덱싱
  const newMap = new Map<string, ChangelogEntry>()
  newEntries.forEach((entry) => {
    newMap.set(entry.id, entry)
  })

  if (debugMode) {
    console.log(
      `📊 인덱싱 완료: 캐시 맵 ${cachedMap.size}개, 신규 맵 ${newMap.size}개`
    )
  }

  // 1. 새로운 항목들과 업데이트된 항목들 찾기
  for (const newEntry of newEntries) {
    const cachedEntry = cachedMap.get(newEntry.id)

    if (!cachedEntry) {
      // 캐시에 없는 새로운 항목
      result.newEntries.push(newEntry)
      if (debugMode) {
        console.log(`✨ 새 항목 발견: ${newEntry.version} - ${newEntry.title}`)
      }
    } else {
      // 기존 항목 - 변경사항 확인
      if (hasContentChanged(cachedEntry, newEntry, options)) {
        result.updatedEntries.push({
          oldEntry: cachedEntry,
          newEntry: newEntry,
        })
        if (debugMode) {
          console.log(
            `🔄 업데이트된 항목: ${newEntry.version} - ${newEntry.title}`
          )
        }
      } else {
        result.unchangedEntries.push(newEntry)
        if (debugMode) {
          console.log(`✅ 변경 없음: ${newEntry.version} - ${newEntry.title}`)
        }
      }
    }
  }

  // 2. 삭제된 항목들 찾기
  for (const cachedEntry of cachedEntries) {
    if (!newMap.has(cachedEntry.id)) {
      result.deletedEntries.push(cachedEntry)
      if (debugMode) {
        console.log(
          `❌ 삭제된 항목: ${cachedEntry.version} - ${cachedEntry.title}`
        )
      }
    }
  }

  // 3. 통계 업데이트
  result.summary.newCount = result.newEntries.length
  result.summary.updatedCount = result.updatedEntries.length
  result.summary.deletedCount = result.deletedEntries.length
  result.summary.unchangedCount = result.unchangedEntries.length

  // 4. 버전 우선순위에 따른 정렬
  if (prioritizeVersionOrder) {
    result.newEntries.sort((a, b) => {
      // 버전 번호 기준 내림차순 정렬
      const versionA = parseFloat(a.version) || 0
      const versionB = parseFloat(b.version) || 0
      return versionB - versionA
    })

    result.updatedEntries.sort((a, b) => {
      const versionA = parseFloat(a.newEntry.version) || 0
      const versionB = parseFloat(b.newEntry.version) || 0
      return versionB - versionA
    })
  }

  if (debugMode) {
    console.log(
      `📈 비교 완료: 신규 ${result.summary.newCount}개, 업데이트 ${result.summary.updatedCount}개, 삭제 ${result.summary.deletedCount}개, 변경없음 ${result.summary.unchangedCount}개`
    )
  }

  return result
}

/**
 * 변경된 항목들만 반환 (새로운 항목 + 업데이트된 항목)
 */
export function getChangedEntries(
  cachedEntries: ChangelogEntry[],
  newEntries: ChangelogEntry[],
  options: CacheCompareOptions = {}
): ChangelogEntry[] {
  const comparison = compareChangelogCache(cachedEntries, newEntries, options)

  return [
    ...comparison.newEntries,
    ...comparison.updatedEntries.map((update) => update.newEntry),
  ]
}

/**
 * 비교 결과를 사람이 읽기 쉬운 형태로 출력
 */
export function printCacheComparisonSummary(
  result: CacheComparisonResult
): void {
  console.log('\n📊 Changelog 캐시 비교 결과:')
  console.log('='.repeat(50))

  console.log(`총 캐시된 항목: ${result.summary.totalCached}개`)
  console.log(`총 새로운 항목: ${result.summary.totalNew}개`)
  console.log('')

  console.log(`✨ 새로 추가된 항목: ${result.summary.newCount}개`)
  if (result.newEntries.length > 0) {
    result.newEntries.forEach((entry, index) => {
      console.log(
        `   ${index + 1}. ${entry.version} - ${entry.title} (${entry.date})`
      )
    })
  }

  console.log(`\n🔄 업데이트된 항목: ${result.summary.updatedCount}개`)
  if (result.updatedEntries.length > 0) {
    result.updatedEntries.forEach((update, index) => {
      console.log(
        `   ${index + 1}. ${update.newEntry.version} - ${update.newEntry.title}`
      )
    })
  }

  console.log(`\n❌ 삭제된 항목: ${result.summary.deletedCount}개`)
  if (result.deletedEntries.length > 0) {
    result.deletedEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.version} - ${entry.title}`)
    })
  }

  console.log(`\n✅ 변경 없는 항목: ${result.summary.unchangedCount}개`)

  console.log('\n' + '='.repeat(50))
}

/**
 * 변경사항을 JSON 형태로 내보내기
 */
export function exportCacheComparison(
  result: CacheComparisonResult,
  includeUnchanged: boolean = false
): string {
  const baseExportData = {
    timestamp: new Date().toISOString(),
    summary: result.summary,
    changes: {
      new: result.newEntries.map((entry) => ({
        id: entry.id,
        version: entry.version,
        title: entry.title,
        date: entry.date,
      })),
      updated: result.updatedEntries.map((update) => ({
        id: update.newEntry.id,
        version: update.newEntry.version,
        title: update.newEntry.title,
        date: update.newEntry.date,
        hasContentChange: update.oldEntry.content !== update.newEntry.content,
        hasMediaChange:
          update.oldEntry.images.length !== update.newEntry.images.length ||
          update.oldEntry.videos.length !== update.newEntry.videos.length,
      })),
      deleted: result.deletedEntries.map((entry) => ({
        id: entry.id,
        version: entry.version,
        title: entry.title,
        date: entry.date,
      })),
    },
  }

  const exportData = includeUnchanged
    ? {
        ...baseExportData,
        changes: {
          ...baseExportData.changes,
          unchanged: result.unchangedEntries.map((entry) => ({
            id: entry.id,
            version: entry.version,
            title: entry.title,
            date: entry.date,
          })),
        },
      }
    : baseExportData

  return JSON.stringify(exportData, null, 2)
}

/**
 * 간단한 캐시 헬퍼: 변경된 항목이 있는지 확인
 */
export function hasChanges(
  cachedEntries: ChangelogEntry[],
  newEntries: ChangelogEntry[],
  options: CacheCompareOptions = {}
): boolean {
  const comparison = compareChangelogCache(cachedEntries, newEntries, options)
  return (
    comparison.summary.newCount > 0 ||
    comparison.summary.updatedCount > 0 ||
    comparison.summary.deletedCount > 0
  )
}

/**
 * 특정 버전의 변경사항만 필터링
 */
export function getChangesForVersion(
  result: CacheComparisonResult,
  version: string
): {
  isNew: boolean
  isUpdated: boolean
  isDeleted: boolean
  entry?: ChangelogEntry
  oldEntry?: ChangelogEntry
} {
  // 새로운 항목 확인
  const newEntry = result.newEntries.find((entry) => entry.version === version)
  if (newEntry) {
    return { isNew: true, isUpdated: false, isDeleted: false, entry: newEntry }
  }

  // 업데이트된 항목 확인
  const updatedEntry = result.updatedEntries.find(
    (update) => update.newEntry.version === version
  )
  if (updatedEntry) {
    return {
      isNew: false,
      isUpdated: true,
      isDeleted: false,
      entry: updatedEntry.newEntry,
      oldEntry: updatedEntry.oldEntry,
    }
  }

  // 삭제된 항목 확인
  const deletedEntry = result.deletedEntries.find(
    (entry) => entry.version === version
  )
  if (deletedEntry) {
    return {
      isNew: false,
      isUpdated: false,
      isDeleted: true,
      entry: deletedEntry,
    }
  }

  // 변경사항 없음
  return { isNew: false, isUpdated: false, isDeleted: false }
}
