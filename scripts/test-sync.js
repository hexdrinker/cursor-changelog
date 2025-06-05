#!/usr/bin/env node

/**
 * Sync API 테스트 스크립트
 *
 * 사용법:
 *   node scripts/test-sync.js [command] [options]
 *
 * 예시:
 *   node scripts/test-sync.js status
 *   node scripts/test-sync.js sync --languages ko,ja
 *   node scripts/test-sync.js sync --force
 */

const BASE_URL = process.env.APP_URL || 'http://localhost:3001'
const SYNC_TOKEN = process.env.SYNC_TOKEN

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (SYNC_TOKEN) {
    headers['Authorization'] = `Bearer ${SYNC_TOKEN}`
  }

  try {
    console.log(`🔄 ${options.method || 'GET'} ${url}`)

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const data = await response.json()

    console.log(`📊 Status: ${response.status}`)
    console.log('📄 Response:')
    console.log(JSON.stringify(data, null, 2))

    return data
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

async function getStatus() {
  console.log('📊 동기화 상태 조회...\n')
  return await makeRequest('/api/sync')
}

async function runSync(options = {}) {
  console.log('🚀 동기화 실행...\n')

  const body = {}

  if (options.languages) {
    body.languages = options.languages.split(',').map((lang) => lang.trim())
  }

  if (options.force) {
    body.force = true
  }

  return await makeRequest('/api/sync', {
    method: 'POST',
    body: Object.keys(body).length > 0 ? body : undefined,
  })
}

async function showHelp() {
  console.log(`
📚 Sync API 테스트 도구

사용법:
  node scripts/test-sync.js <command> [options]

명령어:
  status              동기화 상태 조회
  sync                동기화 실행
  help                이 도움말 표시

옵션:
  --languages <list>  번역할 언어 (쉼표로 구분, 예: ko,ja,zh)
  --force             최근 동기화 무시하고 강제 실행

예시:
  node scripts/test-sync.js status
  node scripts/test-sync.js sync
  node scripts/test-sync.js sync --languages ko,ja
  node scripts/test-sync.js sync --force

환경변수:
  APP_URL             API 서버 URL (기본값: http://localhost:3001)
  SYNC_TOKEN          인증 토큰 (설정되어 있으면 자동으로 사용)

현재 설정:
  APP_URL: ${BASE_URL}
  SYNC_TOKEN: ${SYNC_TOKEN ? '설정됨' : '설정되지 않음'}
`)
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const options = {}
  for (let i = 1; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--force') {
      options.force = true
    } else if (arg === '--languages' && i + 1 < args.length) {
      options.languages = args[++i]
    }
  }

  switch (command) {
    case 'status':
      await getStatus()
      break

    case 'sync':
      await runSync(options)
      break

    case 'help':
    case '--help':
    case '-h':
      await showHelp()
      break

    default:
      console.log('❌ 알 수 없는 명령어:', command)
      console.log('💡 도움말을 보려면: node scripts/test-sync.js help')
      process.exit(1)
  }
}

// Node.js 18+ fetch polyfill
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((error) => {
  console.error('❌ 예상치 못한 오류:', error)
  process.exit(1)
})
