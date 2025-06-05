import {
  translateChangesWithCache,
  translateSingleTextWithCache,
  getTranslationCacheInfo,
} from './cached-translator'
import {
  loadCache,
  getCacheStats,
  cleanExpiredCache,
  clearCache,
} from './translation-cache'

/**
 * 캐시된 번역기 테스트 예제
 */
async function testCachedTranslator() {
  console.log('=== 캐시된 번역기 테스트 시작 ===\n')

  // 1. 캐시 정보 확인
  console.log('1. 캐시 정보 확인:')
  const cacheInfo = getTranslationCacheInfo()
  console.log('캐시 설정:', cacheInfo.config)
  console.log('캐시 통계:', {
    totalEntries: cacheInfo.totalEntries,
    cacheSize: cacheInfo.cacheSize,
  })
  console.log()

  // 2. 단일 텍스트 번역 테스트 (첫 번째 요청)
  console.log('2. 단일 텍스트 번역 테스트 (첫 번째):')
  const testText1 = 'Hello, this is a test message for translation caching.'
  const result1 = await translateSingleTextWithCache(testText1, ['ko', 'ja'])
  console.log('원문:', result1.originalText)
  console.log('캐시 여부:', result1.cached ? '캐시 히트' : '새로 번역')
  console.log('번역 결과:', result1.translations)
  console.log()

  // 3. 같은 텍스트 다시 번역 (캐시 히트 테스트)
  console.log('3. 같은 텍스트 재번역 테스트 (캐시 히트):')
  const result2 = await translateSingleTextWithCache(testText1, ['ko', 'ja'])
  console.log('캐시 여부:', result2.cached ? '캐시 히트' : '새로 번역')
  console.log('번역 결과:', result2.translations)
  console.log()

  // 4. 객체 변경사항 번역 테스트
  console.log('4. 객체 변경사항 번역 테스트:')
  const previousData = {
    title: 'Old Title',
    description: 'This is an old description.',
    features: ['Feature 1', 'Feature 2'],
  }

  const currentData = {
    title: 'New Amazing Title',
    description: 'This is a brand new description with more details.',
    features: ['Feature 1', 'Feature 2', 'Feature 3 - Advanced'],
    newField: 'This is a completely new field.',
  }

  const result3 = await translateChangesWithCache(
    { previousData, currentData },
    ['ko', 'ja'],
    { cacheDir: '.translation-cache' }
  )

  console.log('번역 결과:', result3.translations)
  console.log('캐시 통계:', result3.cacheStats)
  console.log()

  // 5. 캐시 상태 재확인
  console.log('5. 번역 후 캐시 상태:')
  const updatedCacheInfo = getTranslationCacheInfo()
  console.log('캐시 통계:', {
    totalEntries: updatedCacheInfo.totalEntries,
    cacheSize: updatedCacheInfo.cacheSize,
    oldestEntry: updatedCacheInfo.oldestEntry,
    newestEntry: updatedCacheInfo.newestEntry,
  })
  console.log()

  // 6. 캐시 내용 샘플 확인
  console.log('6. 캐시 내용 샘플:')
  const cache = loadCache()
  const entries = Object.values(cache.entries).slice(0, 3) // 처음 3개만
  entries.forEach((entry, index) => {
    console.log(`Entry ${index + 1}:`)
    console.log('- 원문:', entry.originalText)
    console.log('- 해시:', entry.hash)
    console.log('- 번역:', entry.translations)
    console.log('- 생성일:', entry.createdAt)
    console.log()
  })

  console.log('=== 테스트 완료 ===')
}

/**
 * 캐시 관리 기능 테스트
 */
async function testCacheManagement() {
  console.log('=== 캐시 관리 기능 테스트 ===\n')

  // 1. 현재 캐시 상태
  console.log('1. 현재 캐시 상태:')
  const stats = getCacheStats()
  console.log('총 항목 수:', stats.totalEntries)
  console.log('캐시 크기:', stats.cacheSize)
  console.log()

  // 2. 만료된 캐시 정리 (테스트용으로 짧은 시간 설정)
  console.log('2. 만료된 캐시 정리 테스트:')
  const removedCount = cleanExpiredCache({ maxAge: 1000 }) // 1초로 설정
  console.log('정리된 항목 수:', removedCount)
  console.log()

  // 3. 캐시 정리 후 상태
  console.log('3. 정리 후 캐시 상태:')
  const statsAfterClean = getCacheStats()
  console.log('총 항목 수:', statsAfterClean.totalEntries)
  console.log('캐시 크기:', statsAfterClean.cacheSize)
  console.log()

  // 4. 전체 캐시 초기화 (주의: 실제 운영환경에서는 사용 주의)
  console.log('4. 전체 캐시 초기화 (테스트용):')
  // clearCache() // 주석 처리 - 실제로는 실행하지 않음
  console.log('초기화는 주석 처리됨 (실제로는 clearCache() 호출)')
  console.log()

  console.log('=== 캐시 관리 테스트 완료 ===')
}

/**
 * 성능 비교 테스트
 */
async function performanceTest() {
  console.log('=== 성능 비교 테스트 ===\n')

  const testTexts = [
    'Welcome to our application',
    'Please enter your username and password',
    'Your account has been successfully created',
    'Error: Invalid credentials provided',
    'Thank you for using our service',
  ]

  // 첫 번째 실행 (캐시 미스)
  console.log('1. 첫 번째 실행 (캐시 미스):')
  const startTime1 = Date.now()

  for (const text of testTexts) {
    await translateSingleTextWithCache(text, ['ko', 'ja'])
  }

  const endTime1 = Date.now()
  console.log(`실행 시간: ${endTime1 - startTime1}ms`)
  console.log()

  // 두 번째 실행 (캐시 히트)
  console.log('2. 두 번째 실행 (캐시 히트):')
  const startTime2 = Date.now()

  for (const text of testTexts) {
    await translateSingleTextWithCache(text, ['ko', 'ja'])
  }

  const endTime2 = Date.now()
  console.log(`실행 시간: ${endTime2 - startTime2}ms`)
  console.log(
    `성능 향상: ${(((endTime1 - endTime2) / endTime1) * 100).toFixed(1)}%`
  )
  console.log()

  console.log('=== 성능 테스트 완료 ===')
}

// 실행 예제
export async function runCachedTranslatorTests() {
  try {
    await testCachedTranslator()
    console.log('\n' + '='.repeat(50) + '\n')

    await testCacheManagement()
    console.log('\n' + '='.repeat(50) + '\n')

    await performanceTest()
  } catch (error) {
    console.error('테스트 중 오류 발생:', error)
  }
}

// 개별 함수들도 export
export { testCachedTranslator, testCacheManagement, performanceTest }

// Node.js에서 직접 실행 시
if (require.main === module) {
  runCachedTranslatorTests()
}
