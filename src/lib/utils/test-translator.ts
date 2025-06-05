#!/usr/bin/env tsx

import { translateObject, detectChanges } from './translator'

async function testTranslation() {
  console.log('=== 번역 함수 테스트 시작 ===\n')

  // OpenAI API 키 확인
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY 환경변수가 설정되지 않았습니다.')
    console.log('다음 명령어로 환경변수를 설정해주세요:')
    console.log('export OPENAI_API_KEY="your_api_key_here"')
    process.exit(1)
  }

  const previousData = {
    title: 'Hello World',
    description: 'This is a test',
    version: '1.0.0',
  }

  const currentData = {
    title: 'Welcome to Our Amazing App',
    description: 'This is a revolutionary new application',
    version: '1.0.0',
    newFeature: 'AI-powered translation',
  }

  try {
    console.log('🔍 변경사항 감지 중...')
    const changes = detectChanges({ previousData, currentData })
    console.log('감지된 변경사항:', JSON.stringify(changes, null, 2))
    console.log('')

    console.log('🌐 번역 시작...')
    const startTime = Date.now()

    const result = await translateObject(previousData, currentData, [
      'ko',
      'ja',
    ])

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    console.log('✅ 번역 완료! (소요시간:', duration.toFixed(2), '초)')
    console.log('\n번역 결과:')
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('❌ 번역 실패:', error)
    process.exit(1)
  }
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  testTranslation().catch(console.error)
}

export { testTranslation }
