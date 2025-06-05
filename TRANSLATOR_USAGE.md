# 다국어 번역 유틸리티 사용 가이드

OpenAI API를 사용하여 변경된 항목만을 효율적으로 다국어 번역하는 유틸리티입니다.

## 🚀 주요 기능

- **변경 감지**: 이전 데이터와 현재 데이터를 비교하여 변경된 항목만 감지
- **지능적 번역**: OpenAI GPT-4o-mini 모델을 사용한 고품질 번역
- **다국어 지원**: 한국어(ko), 일본어(ja), 중국어(zh), 스페인어(es)
- **배치 처리**: API 효율성을 위한 배치 번역
- **에러 처리**: 번역 실패 시 원본 텍스트 유지
- **구조화된 결과**: 언어별로 체계적으로 정리된 번역 결과

## 📋 설정

### 1. 환경변수 설정

```bash
export OPENAI_API_KEY="your_openai_api_key_here"
```

### 2. OpenAI API 키 발급

[OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키를 발급받으세요.

## 💻 사용법

### 기본 사용법

```typescript
import { translateObject } from '@/lib/utils/translator'

const previousData = {
  title: 'Hello World',
  description: 'This is a sample app',
}

const currentData = {
  title: 'Welcome to Our App',
  description: 'This is an amazing new application',
  newFeature: 'AI-powered translation',
}

const result = await translateObject(previousData, currentData)

// 결과 예시:
// {
//   "title": {
//     "ko": "우리 앱에 오신 것을 환영합니다",
//     "ja": "私たちのアプリへようこそ",
//     "zh": "欢迎使用我们的应用",
//     "es": "Bienvenido a nuestra aplicación"
//   },
//   "description": {
//     "ko": "이것은 놀라운 새로운 애플리케이션입니다",
//     "ja": "これは素晴らしい新しいアプリケーションです",
//     "zh": "这是一个令人惊叹的新应用程序",
//     "es": "Esta es una nueva aplicación increíble"
//   },
//   "newFeature": {
//     "ko": "AI 기반 번역",
//     "ja": "AI搭載翻訳",
//     "zh": "AI驱动的翻译",
//     "es": "Traducción impulsada por IA"
//   }
// }
```

### 특정 언어만 번역

```typescript
import {
  translateChanges,
  type SupportedLanguage,
} from '@/lib/utils/translator'

const targetLanguages: SupportedLanguage[] = ['ko', 'ja'] // 한국어, 일본어만

const result = await translateChanges(
  {
    previousData,
    currentData,
  },
  targetLanguages
)
```

### 복잡한 중첩 객체 처리

```typescript
const complexData = {
  app: {
    name: 'New App Name',
    settings: {
      notifications: 'enabled',
    },
  },
  features: ['login', 'dashboard', 'ai-translation'],
  changelog: ['Added new feature', 'Fixed bugs', 'Improved performance'],
}

const result = await translateObject(undefined, complexData)
```

## 🔧 API 레퍼런스

### translateObject

간단한 객체 번역을 위한 헬퍼 함수

```typescript
function translateObject(
  previousData: Record<string, any> | undefined,
  currentData: Record<string, any>,
  languages?: SupportedLanguage[]
): Promise<TranslationResult>
```

### translateChanges

메인 번역 함수

```typescript
function translateChanges(
  options: ChangeDetectionOptions,
  targetLanguages?: SupportedLanguage[]
): Promise<TranslationResult>
```

### detectChanges

변경사항만 감지하는 함수

```typescript
function detectChanges(options: ChangeDetectionOptions): Record<string, any>
```

## 🧪 테스트

```bash
# 번역 함수 테스트
pnpm test:translator

# 또는 직접 실행
npx tsx src/lib/utils/test-translator.ts
```

## ⚠️ 주의사항

1. **API 비용**: OpenAI API 사용료가 발생합니다
2. **요청 제한**: 배치 크기(5개)와 지연(1초)으로 API 제한을 관리합니다
3. **번역 대상**: URL, 이메일, 숫자만 있는 텍스트는 번역하지 않습니다
4. **에러 처리**: 번역 실패 시 원본 텍스트를 반환합니다

## 🔄 최적화 기능

- **변경 감지**: 실제로 변경된 항목만 번역하여 API 비용 절약
- **배치 처리**: 여러 텍스트를 효율적으로 묶어서 처리
- **지능적 필터링**: 번역이 불필요한 텍스트 자동 제외
- **재시도 메커니즘**: 실패한 번역에 대한 폴백 처리

## 📝 사용 예시

더 자세한 사용 예시는 `src/lib/utils/translator-example.ts` 파일을 참고하세요.

```typescript
import { runAllExamples } from '@/lib/utils/translator-example'

// 모든 예시 실행
await runAllExamples()
```
