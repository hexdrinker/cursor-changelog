# 캐시된 번역 시스템

번역 결과를 JSON으로 로컬에 캐시하여 이미 번역된 항목은 다시 번역하지 않는 효율적인 번역 시스템입니다.

## 주요 특징

### 🚀 성능 최적화

- 이미 번역된 텍스트는 캐시에서 즉시 조회
- OpenAI API 호출 횟수 최소화로 비용 절약
- 대용량 데이터 처리 시 대폭적인 성능 향상

### 💾 지능적인 캐시 관리

- SHA256 해시 기반의 중복 감지
- 자동 만료 시간 관리 (기본 7일)
- 캐시 크기 및 통계 정보 제공

### 🔄 변경사항 감지

- 객체 간 차이점 자동 감지
- 변경된 부분만 선택적 번역
- 재귀적 객체 구조 지원

## 파일 구조

```
src/lib/utils/
├── translation-cache.ts      # 캐시 시스템 핵심 로직
├── cached-translator.ts      # 캐시 통합 번역기
└── test-cached-translator.ts # 테스트 및 예제 코드
```

## 사용법

### 1. 단일 텍스트 번역

```typescript
import { translateSingleTextWithCache } from './cached-translator'

// 첫 번째 호출 - API 요청
const result1 = await translateSingleTextWithCache('Hello, World!', [
  'ko',
  'ja',
  'zh',
  'es',
])
console.log(result1.cached) // false
console.log(result1.translations) // { ko: '안녕, 세계!', ja: 'こんにちは、世界！', ... }

// 두 번째 호출 - 캐시에서 조회
const result2 = await translateSingleTextWithCache('Hello, World!', [
  'ko',
  'ja',
  'zh',
  'es',
])
console.log(result2.cached) // true
```

### 2. 객체 변경사항 번역

```typescript
import { translateChangesWithCache } from './cached-translator'

const previousData = {
  title: '기존 제목',
  description: '기존 설명입니다.',
}

const currentData = {
  title: '새로운 제목',
  description: '기존 설명입니다.',
  newField: '새로 추가된 필드입니다.',
}

const result = await translateChangesWithCache({ previousData, currentData }, [
  'ko',
  'ja',
  'zh',
  'es',
])

console.log(result.translations) // 변경된 부분만 번역
console.log(result.cacheStats) // 캐시 히트/미스 통계
```

### 3. 캐시 설정 사용자 정의

```typescript
const cacheConfig = {
  cacheDir: '.my-translation-cache', // 캐시 디렉토리
  cacheFileName: 'my-translations.json', // 캐시 파일명
  maxAge: 14 * 24 * 60 * 60 * 1000, // 14일 (밀리초)
}

const result = await translateSingleTextWithCache(
  'Custom cache example',
  ['ko', 'ja'],
  cacheConfig
)
```

## 캐시 관리

### 캐시 정보 조회

```typescript
import { getTranslationCacheInfo } from './cached-translator'

const info = getTranslationCacheInfo()
console.log(info)
// {
//   totalEntries: 125,
//   cacheSize: "2.3 MB",
//   oldestEntry: "2024-01-15T10:30:00.000Z",
//   newestEntry: "2024-01-20T15:45:00.000Z",
//   config: {
//     cacheDir: ".translation-cache",
//     cacheFileName: "translations.json",
//     maxAge: 604800000,
//     maxAgeDisplay: "7일"
//   }
// }
```

### 만료된 캐시 정리

```typescript
import { cleanExpiredCache } from './translation-cache'

// 기본 설정으로 정리
const removedCount = cleanExpiredCache()
console.log(`${removedCount}개 항목이 정리되었습니다.`)

// 사용자 정의 만료 시간으로 정리
const removedCount2 = cleanExpiredCache({ maxAge: 3 * 24 * 60 * 60 * 1000 }) // 3일
```

### 캐시 완전 초기화

```typescript
import { clearCache } from './translation-cache'

// 주의: 모든 캐시가 삭제됩니다
clearCache()
```

## 캐시 데이터 구조

```json
{
  "version": "1.0",
  "entries": {
    "a1b2c3d4e5f6g7h8": {
      "originalText": "Hello, World!",
      "hash": "a1b2c3d4e5f6g7h8",
      "translations": {
        "ko": "안녕, 세계!",
        "ja": "こんにちは、世界！",
        "zh": "你好，世界！",
        "es": "¡Hola, Mundo!"
      },
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  },
  "metadata": {
    "totalEntries": 1,
    "lastUpdated": "2024-01-20T10:30:00.000Z"
  }
}
```

## 성능 최적화 팁

### 1. 배치 처리 활용

```typescript
// 여러 텍스트를 한 번에 처리하면 캐시 효율성이 높아집니다
const texts = ['Text 1', 'Text 2', 'Text 3']
const results = await Promise.all(
  texts.map((text) => translateSingleTextWithCache(text, ['ko', 'ja']))
)
```

### 2. 적절한 캐시 만료 시간 설정

```typescript
// 자주 변경되는 콘텐츠: 짧은 만료 시간
const shortTermConfig = { maxAge: 1 * 24 * 60 * 60 * 1000 } // 1일

// 정적 콘텐츠: 긴 만료 시간
const longTermConfig = { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30일
```

### 3. 정기적인 캐시 정리

```typescript
// 애플리케이션 시작 시 만료된 캐시 정리
cleanExpiredCache()
```

## 모니터링 및 디버깅

### 캐시 히트율 모니터링

```typescript
const result = await translateChangesWithCache(data, languages)
console.log(`캐시 히트율: ${result.cacheStats.cacheHitRate}`)
console.log(`총 요청: ${result.cacheStats.totalRequested}`)
console.log(`캐시 히트: ${result.cacheStats.cacheHits}`)
console.log(`캐시 미스: ${result.cacheStats.cacheMisses}`)
```

### 로그 확인

시스템은 다음과 같은 유용한 로그를 제공합니다:

- 캐시 히트/미스 정보
- 번역 진행 상황
- 캐시 저장/로드 상태
- 오류 발생 시 상세 정보

## 테스트 실행

```bash
# TypeScript 컴파일 및 실행
npx tsx src/lib/utils/test-cached-translator.ts

# 또는 Node.js 환경에서
import { runCachedTranslatorTests } from './test-cached-translator'
await runCachedTranslatorTests()
```

## 환경 변수 설정

```bash
# .env 파일에 OpenAI API 키 설정
OPENAI_API_KEY=your_openai_api_key_here
```

## 주의사항

1. **API 키 보안**: OpenAI API 키는 환경 변수로 관리하세요.
2. **캐시 크기**: 대용량 프로젝트에서는 캐시 크기를 주기적으로 확인하세요.
3. **동시성**: 여러 프로세스에서 동시에 캐시에 접근할 때는 파일 잠금을 고려하세요.
4. **백업**: 중요한 번역 캐시는 정기적으로 백업하세요.

## 문제 해결

### 캐시 파일이 손상된 경우

```typescript
import { clearCache } from './translation-cache'
clearCache() // 캐시를 초기화하고 다시 시작
```

### 메모리 사용량이 높은 경우

```typescript
// 만료 시간을 줄여서 캐시 크기 제한
cleanExpiredCache({ maxAge: 1 * 24 * 60 * 60 * 1000 }) // 1일로 단축
```

### API 요청 한도 초과

시스템은 자동으로 배치 크기(기본 5개)와 요청 간 지연(1초)을 관리하여 API 한도를 준수합니다.

## 확장 가능성

- 다른 번역 API 지원 (Google Translate, DeepL 등)
- Redis 등 외부 캐시 스토리지 연동
- 번역 품질 평가 및 개선 기능
- 다국어 프로젝트 통합 관리 도구
