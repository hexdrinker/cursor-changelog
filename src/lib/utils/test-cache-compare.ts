/**
 * 캐시 비교 로직 테스트 스크립트
 * 실제 사용 예시와 함께 동작을 확인합니다.
 */

import {
  parseCursorChangelog,
  type ChangelogEntry,
} from './cursor-changelog-parser'
import {
  compareChangelogCache,
  getChangedEntries,
  hasChanges,
  printCacheComparisonSummary,
  exportCacheComparison,
  getChangesForVersion,
  type CacheCompareOptions,
} from './changelog-cache-compare'

/**
 * 기본 캐시 비교 테스트
 */
async function testBasicCacheComparison() {
  console.log('🔍 기본 캐시 비교 테스트를 시작합니다...\n')

  try {
    // 첫 번째 크롤링 (캐시된 데이터라고 가정)
    console.log('📥 첫 번째 크롤링 중...')
    const cachedEntries = await parseCursorChangelog()
    console.log(`✅ 캐시된 데이터: ${cachedEntries.length}개 항목`)

    // 잠깐 대기 (실제로는 시간이 지난 후 재크롤링)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 두 번째 크롤링 (새로운 데이터)
    console.log('📥 두 번째 크롤링 중...')
    const newEntries = await parseCursorChangelog()
    console.log(`✅ 새로운 데이터: ${newEntries.length}개 항목`)

    // 캐시 비교 실행
    console.log('\n🔄 캐시 비교를 시작합니다...')
    const comparison = compareChangelogCache(cachedEntries, newEntries, {
      debugMode: true,
    })

    // 결과 출력
    printCacheComparisonSummary(comparison)

    return comparison
  } catch (error) {
    console.error('❌ 기본 캐시 비교 테스트 실패:', error)
    throw error
  }
}

/**
 * 모의 데이터를 사용한 상세 테스트
 */
async function testWithMockData() {
  console.log('\n\n🧪 모의 데이터를 사용한 상세 테스트를 시작합니다...\n')

  // 모의 캐시 데이터 생성
  const cachedEntries: ChangelogEntry[] = [
    {
      id: 'hash1234567890abcdef',
      version: '1.0',
      date: '2025-01-01',
      title: '첫 번째 릴리즈',
      content: '기본 기능을 구현했습니다.',
      htmlContent: '<p>기본 기능을 구현했습니다.</p>',
      images: [
        {
          src: 'https://example.com/image1.jpg',
          alt: '스크린샷',
          type: 'image',
        },
      ],
      videos: [],
      sections: [{ title: '새로운 기능', content: '기본 기능 구현', level: 2 }],
      rawHtml: '<div><p>기본 기능을 구현했습니다.</p></div>',
    },
    {
      id: 'hash2345678901bcdefg',
      version: '1.1',
      date: '2025-01-15',
      title: '버그 수정',
      content: '몇 가지 버그를 수정했습니다.',
      htmlContent: '<p>몇 가지 버그를 수정했습니다.</p>',
      images: [],
      videos: [],
      sections: [{ title: '버그 수정', content: '안정성 개선', level: 2 }],
      rawHtml: '<div><p>몇 가지 버그를 수정했습니다.</p></div>',
    },
  ]

  // 모의 새 데이터 생성 (일부 변경, 일부 추가, 일부 삭제)
  const newEntries: ChangelogEntry[] = [
    // 기존 항목 - 변경 없음
    {
      id: 'hash1234567890abcdef',
      version: '1.0',
      date: '2025-01-01',
      title: '첫 번째 릴리즈',
      content: '기본 기능을 구현했습니다.',
      htmlContent: '<p>기본 기능을 구현했습니다.</p>',
      images: [
        {
          src: 'https://example.com/image1.jpg',
          alt: '스크린샷',
          type: 'image',
        },
      ],
      videos: [],
      sections: [{ title: '새로운 기능', content: '기본 기능 구현', level: 2 }],
      rawHtml: '<div><p>기본 기능을 구현했습니다.</p></div>',
    },
    // 기존 항목 - 내용 변경됨
    {
      id: 'hash2345678901bcdefg',
      version: '1.1',
      date: '2025-01-15',
      title: '버그 수정 및 개선', // 제목 변경
      content: '여러 버그를 수정하고 성능을 개선했습니다.', // 내용 변경
      htmlContent: '<p>여러 버그를 수정하고 성능을 개선했습니다.</p>',
      images: [
        {
          src: 'https://example.com/new-image.jpg',
          alt: '개선된 UI',
          type: 'image',
        },
      ], // 이미지 추가
      videos: [],
      sections: [
        { title: '버그 수정', content: '안정성 대폭 개선', level: 2 }, // 섹션 내용 변경
        { title: '성능 개선', content: '처리 속도 향상', level: 2 }, // 새 섹션 추가
      ],
      rawHtml: '<div><p>여러 버그를 수정하고 성능을 개선했습니다.</p></div>',
    },
    // 새로운 항목
    {
      id: 'hash3456789012cdefgh',
      version: '1.2',
      date: '2025-02-01',
      title: '새로운 기능 추가',
      content: '사용자가 요청한 새로운 기능들을 추가했습니다.',
      htmlContent: '<p>사용자가 요청한 새로운 기능들을 추가했습니다.</p>',
      images: [],
      videos: [
        {
          src: 'https://example.com/demo.mp4',
          alt: '데모 비디오',
          type: 'video',
        },
      ],
      sections: [{ title: '새 기능', content: '고급 검색 기능', level: 2 }],
      rawHtml:
        '<div><p>사용자가 요청한 새로운 기능들을 추가했습니다.</p></div>',
    },
  ]
  // 참고: hash1234567890abcdef (1.0)은 삭제됨 (새 데이터에 없음)

  console.log(`📊 모의 데이터 준비:`)
  console.log(`   캐시된 항목: ${cachedEntries.length}개`)
  console.log(`   새로운 항목: ${newEntries.length}개`)

  // 다양한 옵션으로 비교 테스트
  console.log('\n🔍 옵션별 비교 테스트:')

  // 1. 전체 비교 (기본 설정)
  console.log('\n1️⃣ 전체 비교 (기본 설정):')
  const fullComparison = compareChangelogCache(cachedEntries, newEntries, {
    debugMode: true,
  })
  printCacheComparisonSummary(fullComparison)

  // 2. 콘텐츠 변경 무시
  console.log('\n2️⃣ 콘텐츠 변경 무시:')
  const contentIgnoreComparison = compareChangelogCache(
    cachedEntries,
    newEntries,
    {
      includeContentChanges: false,
      debugMode: false,
    }
  )
  console.log(
    `결과: 신규 ${contentIgnoreComparison.summary.newCount}, 업데이트 ${contentIgnoreComparison.summary.updatedCount}, 삭제 ${contentIgnoreComparison.summary.deletedCount}`
  )

  // 3. 미디어 변경 무시
  console.log('\n3️⃣ 미디어 변경 무시:')
  const mediaIgnoreComparison = compareChangelogCache(
    cachedEntries,
    newEntries,
    {
      includeMediaChanges: false,
      debugMode: false,
    }
  )
  console.log(
    `결과: 신규 ${mediaIgnoreComparison.summary.newCount}, 업데이트 ${mediaIgnoreComparison.summary.updatedCount}, 삭제 ${mediaIgnoreComparison.summary.deletedCount}`
  )

  return fullComparison
}

/**
 * 유틸리티 함수들 테스트
 */
async function testUtilityFunctions(comparison: any) {
  console.log('\n\n🛠️ 유틸리티 함수들을 테스트합니다...\n')

  // 1. 변경된 항목들만 가져오기
  console.log('1️⃣ 변경된 항목들만 가져오기:')
  const changedEntries = getChangedEntries(
    comparison.newEntries.concat(comparison.unchangedEntries), // 모의 캐시
    comparison.newEntries
      .concat(comparison.updatedEntries.map((u: any) => u.newEntry))
      .concat(comparison.unchangedEntries) // 모의 새 데이터
  )
  console.log(`   변경된 항목: ${changedEntries.length}개`)
  changedEntries.forEach((entry, index) => {
    console.log(`   ${index + 1}. ${entry.version} - ${entry.title}`)
  })

  // 2. 변경사항 존재 여부 확인
  console.log('\n2️⃣ 변경사항 존재 여부 확인:')
  const hasAnyChanges = hasChanges(
    comparison.newEntries.concat(comparison.unchangedEntries),
    comparison.newEntries
      .concat(comparison.updatedEntries.map((u: any) => u.newEntry))
      .concat(comparison.unchangedEntries)
  )
  console.log(`   변경사항 존재: ${hasAnyChanges ? '✅ 예' : '❌ 아니오'}`)

  // 3. 특정 버전의 변경사항 확인
  console.log('\n3️⃣ 특정 버전의 변경사항 확인:')
  const versions = ['1.0', '1.1', '1.2', '0.9']
  versions.forEach((version) => {
    const versionChange = getChangesForVersion(comparison, version)
    let status = '변경 없음'
    if (versionChange.isNew) status = '✨ 새 항목'
    else if (versionChange.isUpdated) status = '🔄 업데이트됨'
    else if (versionChange.isDeleted) status = '❌ 삭제됨'

    console.log(`   버전 ${version}: ${status}`)
  })

  // 4. JSON 내보내기
  console.log('\n4️⃣ JSON 내보내기 테스트:')
  const exportJson = exportCacheComparison(comparison, true)
  console.log(`   JSON 크기: ${exportJson.length} 문자`)
  console.log('   JSON 구조:')
  const parsed = JSON.parse(exportJson)
  console.log(`   - 타임스탬프: ${parsed.timestamp}`)
  console.log(`   - 신규: ${parsed.changes.new.length}개`)
  console.log(`   - 업데이트: ${parsed.changes.updated.length}개`)
  console.log(`   - 삭제: ${parsed.changes.deleted.length}개`)
  console.log(`   - 변경없음: ${parsed.changes.unchanged?.length || 0}개`)

  return exportJson
}

/**
 * 실제 시나리오 시뮬레이션
 */
async function simulateRealScenario() {
  console.log('\n\n🎬 실제 시나리오 시뮬레이션을 시작합니다...\n')

  console.log('시나리오: 정기적인 changelog 업데이트 체크')
  console.log('='.repeat(50))

  try {
    // 1. 첫 번째 크롤링 (초기 캐시)
    console.log('\n📅 Day 1: 초기 캐시 생성')
    const initialCache = await parseCursorChangelog()
    console.log(`   초기 캐시: ${initialCache.length}개 항목 저장됨`)

    // 2. 두 번째 크롤링 (변경사항 확인)
    console.log('\n📅 Day 2: 변경사항 확인')
    const dayTwoData = await parseCursorChangelog()

    const dayTwoComparison = compareChangelogCache(initialCache, dayTwoData)
    console.log(
      `   비교 결과: 신규 ${dayTwoComparison.summary.newCount}, 업데이트 ${dayTwoComparison.summary.updatedCount}, 삭제 ${dayTwoComparison.summary.deletedCount}`
    )

    if (hasChanges(initialCache, dayTwoData)) {
      console.log('   🔔 변경사항이 감지되었습니다!')

      // 변경된 항목들만 처리
      const changedItems = getChangedEntries(initialCache, dayTwoData)
      console.log(`   📝 처리할 항목: ${changedItems.length}개`)

      changedItems.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.version} - ${item.title}`)
      })

      // 변경사항을 JSON으로 저장 (예시)
      const changeLog = exportCacheComparison(dayTwoComparison)
      console.log(`   💾 변경사항 로그 저장됨 (${changeLog.length} 문자)`)
    } else {
      console.log('   ✅ 변경사항이 없습니다.')
    }

    console.log('\n🎯 시뮬레이션 완료!')
    console.log(
      '실제 사용 시에는 이 로직을 cron job이나 주기적인 스케줄러에서 실행하면 됩니다.'
    )
  } catch (error) {
    console.error('❌ 시나리오 시뮬레이션 실패:', error)
  }
}

/**
 * 메인 테스트 실행 함수
 */
export async function runCacheCompareTests() {
  console.log('🚀 캐시 비교 로직 테스트를 시작합니다!\n')
  console.log('='.repeat(60))

  try {
    // 1. 기본 캐시 비교 테스트
    const basicComparison = await testBasicCacheComparison()

    // 2. 모의 데이터 상세 테스트
    const mockComparison = await testWithMockData()

    // 3. 유틸리티 함수들 테스트
    await testUtilityFunctions(mockComparison)

    // 4. 실제 시나리오 시뮬레이션
    await simulateRealScenario()

    console.log('\n' + '='.repeat(60))
    console.log('🎉 모든 캐시 비교 테스트가 완료되었습니다!')
    console.log('💡 이제 실제 프로젝트에서 이 로직들을 활용해보세요.')
  } catch (error) {
    console.log('\n' + '='.repeat(60))
    console.error('❌ 테스트 실행 중 오류가 발생했습니다:', error)
    throw error
  }
}

// 직접 실행 시 테스트 자동 시작
if (require.main === module) {
  runCacheCompareTests().catch(console.error)
}
