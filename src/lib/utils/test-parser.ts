/**
 * Cursor Changelog Parser 테스트 스크립트
 * 실제 동작을 확인하고 결과를 출력합니다.
 */

import {
  parseCursorChangelog,
  findChangelogEntry,
  sortChangelogEntries,
  serializeChangelogEntry,
  type ChangelogEntry,
  type ParseOptions,
} from './cursor-changelog-parser'

/**
 * 기본 파싱 테스트
 */
async function testBasicParsing() {
  console.log('🔍 기본 파싱 테스트를 시작합니다...\n')

  try {
    const entries = await parseCursorChangelog()

    console.log(`✅ 성공: ${entries.length}개의 changelog 항목을 찾았습니다.`)

    if (entries.length > 0) {
      const latest = entries[0]
      console.log(`\n📋 최신 항목 정보:`)
      console.log(`   ID: ${latest.id}`)
      console.log(`   버전: ${latest.version}`)
      console.log(`   날짜: ${latest.date}`)
      console.log(`   제목: ${latest.title}`)
      console.log(`   콘텐츠 길이: ${latest.content.length}자`)
      console.log(`   이미지 개수: ${latest.images.length}`)
      console.log(`   비디오 개수: ${latest.videos.length}`)
      console.log(`   섹션 개수: ${latest.sections.length}`)

      // 콘텐츠 일부 출력
      const contentPreview = latest.content.substring(0, 200)
      console.log(`\n📝 콘텐츠 미리보기:`)
      console.log(
        `   ${contentPreview}${latest.content.length > 200 ? '...' : ''}`
      )

      // 미디어 정보 출력
      if (latest.images.length > 0) {
        console.log(`\n🖼️  이미지 목록:`)
        latest.images.slice(0, 3).forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.src}`)
          if (img.alt) console.log(`      Alt: ${img.alt}`)
        })
        if (latest.images.length > 3) {
          console.log(`   ... 및 ${latest.images.length - 3}개 더`)
        }
      }

      if (latest.videos.length > 0) {
        console.log(`\n🎥 비디오 목록:`)
        latest.videos.slice(0, 3).forEach((video, index) => {
          console.log(`   ${index + 1}. ${video.src}`)
          if (video.alt) console.log(`      Title: ${video.alt}`)
        })
        if (latest.videos.length > 3) {
          console.log(`   ... 및 ${latest.videos.length - 3}개 더`)
        }
      }

      // 섹션 정보 출력
      if (latest.sections.length > 0) {
        console.log(`\n📑 섹션 목록:`)
        latest.sections.slice(0, 5).forEach((section, index) => {
          console.log(`   ${index + 1}. [H${section.level}] ${section.title}`)
          const sectionPreview = section.content.substring(0, 100)
          console.log(
            `      ${sectionPreview}${
              section.content.length > 100 ? '...' : ''
            }`
          )
        })
        if (latest.sections.length > 5) {
          console.log(`   ... 및 ${latest.sections.length - 5}개 더`)
        }
      }
    }

    return entries
  } catch (error) {
    console.error(`❌ 파싱 실패:`, error)
    throw error
  }
}

/**
 * 옵션을 사용한 파싱 테스트
 */
async function testOptionsBasedParsing() {
  console.log('\n\n🔧 옵션 기반 파싱 테스트를 시작합니다...\n')

  const options: ParseOptions = {
    includeImages: false,
    includeVideos: false,
    generateDetailedSections: false,
    customHashSalt: 'test-salt',
  }

  try {
    const entries = await parseCursorChangelog(options)

    console.log(
      `✅ 성공: ${entries.length}개의 changelog 항목을 찾았습니다. (미디어 제외)`
    )

    if (entries.length > 0) {
      const first = entries[0]
      console.log(`\n📋 첫 번째 항목 (미디어 제외):`)
      console.log(`   ID: ${first.id}`)
      console.log(`   버전: ${first.version}`)
      console.log(`   이미지 개수: ${first.images.length} (제외됨)`)
      console.log(`   비디오 개수: ${first.videos.length} (제외됨)`)
      console.log(`   섹션 개수: ${first.sections.length} (제외됨)`)
    }

    return entries
  } catch (error) {
    console.error(`❌ 옵션 기반 파싱 실패:`, error)
    throw error
  }
}

/**
 * 검색 및 정렬 테스트
 */
async function testSearchAndSort(entries: ChangelogEntry[]) {
  console.log('\n\n🔍 검색 및 정렬 테스트를 시작합니다...\n')

  // 특정 버전 찾기
  const version1_0 = findChangelogEntry(entries, '1.0')
  if (version1_0) {
    console.log(`✅ 버전 1.0 찾음:`)
    console.log(`   제목: ${version1_0.title}`)
    console.log(`   날짜: ${version1_0.date}`)
  } else {
    console.log(`❌ 버전 1.0을 찾을 수 없습니다.`)
  }

  // 최신순 정렬
  const sortedDesc = sortChangelogEntries(entries, false)
  console.log(`\n📅 최신 5개 버전 (최신순):`)
  sortedDesc.slice(0, 5).forEach((entry, index) => {
    console.log(
      `   ${index + 1}. ${entry.version} - ${entry.title} (${entry.date})`
    )
  })

  // 오래된순 정렬
  const sortedAsc = sortChangelogEntries(entries, true)
  console.log(`\n📅 오래된 5개 버전 (오래된순):`)
  sortedAsc.slice(0, 5).forEach((entry, index) => {
    console.log(
      `   ${index + 1}. ${entry.version} - ${entry.title} (${entry.date})`
    )
  })

  // 버전별 통계
  const versionStats = entries.reduce(
    (stats, entry) => {
      stats.totalImages += entry.images.length
      stats.totalVideos += entry.videos.length
      stats.totalSections += entry.sections.length
      if (entry.images.length > 0) stats.entriesWithImages++
      if (entry.videos.length > 0) stats.entriesWithVideos++
      if (entry.sections.length > 0) stats.entriesWithSections++
      return stats
    },
    {
      totalImages: 0,
      totalVideos: 0,
      totalSections: 0,
      entriesWithImages: 0,
      entriesWithVideos: 0,
      entriesWithSections: 0,
    }
  )

  console.log(`\n📊 전체 통계:`)
  console.log(`   총 항목: ${entries.length}`)
  console.log(
    `   총 이미지: ${versionStats.totalImages} (${versionStats.entriesWithImages}개 항목)`
  )
  console.log(
    `   총 비디오: ${versionStats.totalVideos} (${versionStats.entriesWithVideos}개 항목)`
  )
  console.log(
    `   총 섹션: ${versionStats.totalSections} (${versionStats.entriesWithSections}개 항목)`
  )
}

/**
 * JSON 직렬화 테스트
 */
async function testSerialization(entries: ChangelogEntry[]) {
  console.log('\n\n💾 JSON 직렬화 테스트를 시작합니다...\n')

  if (entries.length > 0) {
    try {
      // 첫 번째 항목을 JSON으로 직렬화
      const firstEntryJson = serializeChangelogEntry(entries[0])
      const jsonSize = new Blob([firstEntryJson]).size

      console.log(`✅ 첫 번째 항목 JSON 직렬화 성공`)
      console.log(`   JSON 크기: ${jsonSize} bytes`)
      console.log(`   JSON 문자 수: ${firstEntryJson.length}`)

      // JSON 구조 간단히 확인
      const parsed = JSON.parse(firstEntryJson)
      console.log(`   파싱된 객체 키: ${Object.keys(parsed).join(', ')}`)

      // 일부 내용 미리보기
      console.log(`\n📄 JSON 미리보기 (첫 200자):`)
      console.log(`   ${firstEntryJson.substring(0, 200)}...`)

      return true
    } catch (error) {
      console.error(`❌ JSON 직렬화 실패:`, error)
      return false
    }
  } else {
    console.log(`❌ 직렬화할 항목이 없습니다.`)
    return false
  }
}

/**
 * 에러 처리 테스트
 */
async function testErrorHandling() {
  console.log('\n\n🛠️  에러 처리 테스트를 시작합니다...\n')

  try {
    // 잘못된 옵션으로 테스트 (실제로는 에러가 발생하지 않지만 로직 확인용)
    const entriesWithInvalidSalt = await parseCursorChangelog({
      customHashSalt: '', // 빈 솔트
    })

    console.log(
      `✅ 빈 솔트로도 정상 동작: ${entriesWithInvalidSalt.length}개 항목`
    )

    // 존재하지 않는 버전 검색
    const nonExistentVersion = findChangelogEntry(
      entriesWithInvalidSalt,
      '999.999'
    )
    if (!nonExistentVersion) {
      console.log(`✅ 존재하지 않는 버전 처리 정상: undefined 반환`)
    }

    return true
  } catch (error) {
    console.error(`❌ 에러 처리 테스트 실패:`, error)
    return false
  }
}

/**
 * 메인 테스트 실행 함수
 */
export async function runParserTests() {
  console.log('🚀 Cursor Changelog Parser 테스트를 시작합니다!\n')
  console.log('='.repeat(60))

  try {
    // 1. 기본 파싱 테스트
    const entries = await testBasicParsing()

    // 2. 옵션 기반 파싱 테스트
    await testOptionsBasedParsing()

    // 3. 검색 및 정렬 테스트
    await testSearchAndSort(entries)

    // 4. JSON 직렬화 테스트
    await testSerialization(entries)

    // 5. 에러 처리 테스트
    await testErrorHandling()

    console.log('\n' + '='.repeat(60))
    console.log('🎉 모든 테스트가 완료되었습니다!')
    console.log(
      `✅ 총 ${entries.length}개의 changelog 항목을 성공적으로 파싱했습니다.`
    )

    return entries
  } catch (error) {
    console.log('\n' + '='.repeat(60))
    console.error('❌ 테스트 실행 중 오류가 발생했습니다:', error)
    throw error
  }
}

// 직접 실행 시 테스트 실행
if (require.main === module) {
  runParserTests()
    .then(() => {
      console.log('\n🏁 테스트 완료!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 테스트 실패:', error)
      process.exit(1)
    })
}
