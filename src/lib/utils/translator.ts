import OpenAI from 'openai'

// 지원하는 언어 목록
export const SUPPORTED_LANGUAGES = {
  ko: '한국어',
  ja: '일본어',
  zh: '중국어',
  es: '스페인어',
} as const

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES

// 번역 결과 타입
export interface TranslationResult {
  [key: string]: {
    [K in SupportedLanguage]: string
  }
}

// 변경사항 감지를 위한 타입
export interface ChangeDetectionOptions {
  previousData?: Record<string, any>
  currentData: Record<string, any>
  keyPath?: string
}

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * 객체의 변경된 항목을 재귀적으로 감지
 */
export function detectChanges(
  options: ChangeDetectionOptions
): Record<string, any> {
  const { previousData = {}, currentData, keyPath = '' } = options
  const changes: Record<string, any> = {}

  // 현재 데이터의 모든 키를 순회
  for (const [key, currentValue] of Object.entries(currentData)) {
    const fullKey = keyPath ? `${keyPath}.${key}` : key
    const previousValue = previousData[key]

    // 값이 객체인 경우 재귀적으로 확인
    if (
      typeof currentValue === 'object' &&
      currentValue !== null &&
      !Array.isArray(currentValue)
    ) {
      const nestedChanges = detectChanges({
        previousData: previousValue || {},
        currentData: currentValue,
        keyPath: fullKey,
      })

      if (Object.keys(nestedChanges).length > 0) {
        changes[fullKey] = nestedChanges
      }
    }
    // 배열의 경우
    else if (Array.isArray(currentValue)) {
      if (
        !Array.isArray(previousValue) ||
        JSON.stringify(currentValue) !== JSON.stringify(previousValue)
      ) {
        changes[fullKey] = currentValue
      }
    }
    // 원시값의 경우
    else if (currentValue !== previousValue) {
      changes[fullKey] = currentValue
    }
  }

  return changes
}

/**
 * 문자열이 번역이 필요한지 확인 (한글, 영어 등 포함 여부)
 */
function needsTranslation(text: string): boolean {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return false
  }

  // URL, 이메일, 숫자만 있는 경우는 번역하지 않음
  const urlRegex = /^https?:\/\//
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const numberOnlyRegex = /^\d+(\.\d+)?$/

  if (
    urlRegex.test(text) ||
    emailRegex.test(text) ||
    numberOnlyRegex.test(text)
  ) {
    return false
  }

  // 의미있는 텍스트가 포함된 경우 번역 필요
  return text.length > 2
}

/**
 * OpenAI API를 사용하여 단일 텍스트를 다국어로 번역
 */
async function translateText(
  text: string,
  targetLanguages: SupportedLanguage[]
): Promise<Record<SupportedLanguage, string>> {
  if (!needsTranslation(text)) {
    return targetLanguages.reduce((acc, lang) => {
      acc[lang] = text
      return acc
    }, {} as Record<SupportedLanguage, string>)
  }

  const languageNames = targetLanguages
    .map((lang) => SUPPORTED_LANGUAGES[lang])
    .join(', ')

  const prompt = `다음 텍스트를 ${languageNames}로 번역해주세요. 
각 언어별로 정확하고 자연스러운 번역을 제공하고, JSON 형태로 응답해주세요.

번역할 텍스트: "${text}"

응답 형식:
{
  "ko": "한국어 번역",
  "ja": "일본어 번역", 
  "zh": "中文翻译",
  "es": "Traducción en español"
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '당신은 전문 번역가입니다. 정확하고 자연스러운 번역을 제공하며, 반드시 JSON 형태로만 응답합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('OpenAI API 응답이 비어있습니다.')
    }

    const translations = JSON.parse(content)

    // 요청한 언어들만 필터링하여 반환
    const result: Record<SupportedLanguage, string> = {} as Record<
      SupportedLanguage,
      string
    >
    for (const lang of targetLanguages) {
      result[lang] = translations[lang] || text
    }

    return result
  } catch (error) {
    console.error('번역 중 오류 발생:', error)

    // 오류 발생 시 원본 텍스트를 모든 언어에 대해 반환
    return targetLanguages.reduce((acc, lang) => {
      acc[lang] = text
      return acc
    }, {} as Record<SupportedLanguage, string>)
  }
}

/**
 * 변경된 항목들을 배치 번역
 */
async function batchTranslate(
  texts: string[],
  targetLanguages: SupportedLanguage[]
): Promise<Record<SupportedLanguage, string>[]> {
  const BATCH_SIZE = 5 // API 요청 제한을 고려한 배치 크기
  const results: Record<SupportedLanguage, string>[] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const batchPromises = batch.map((text) =>
      translateText(text, targetLanguages)
    )

    try {
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // API 요청 제한을 위한 지연
      if (i + BATCH_SIZE < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`배치 번역 오류 (${i}-${i + BATCH_SIZE}):`, error)
      // 오류 발생 시 원본 텍스트로 채움
      for (const text of batch) {
        const fallback = targetLanguages.reduce((acc, lang) => {
          acc[lang] = text
          return acc
        }, {} as Record<SupportedLanguage, string>)
        results.push(fallback)
      }
    }
  }

  return results
}

/**
 * 변경된 항목들을 재귀적으로 추출하여 번역 가능한 텍스트 목록을 생성
 */
function extractTranslatableTexts(
  changes: Record<string, any>
): Array<{ key: string; text: string }> {
  const texts: Array<{ key: string; text: string }> = []

  function traverse(obj: any, keyPath: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = keyPath ? `${keyPath}.${key}` : key

      if (typeof value === 'string' && needsTranslation(value)) {
        texts.push({ key: fullKey, text: value })
      } else if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        traverse(value, fullKey)
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string' && needsTranslation(item)) {
            texts.push({ key: `${fullKey}[${index}]`, text: item })
          } else if (typeof item === 'object' && item !== null) {
            traverse(item, `${fullKey}[${index}]`)
          }
        })
      }
    }
  }

  traverse(changes)
  return texts
}

/**
 * 메인 번역 함수: 변경된 항목만 번역하여 언어별로 구조화된 결과 반환
 */
export async function translateChanges(
  options: ChangeDetectionOptions,
  targetLanguages: SupportedLanguage[] = ['ko', 'ja', 'zh', 'es']
): Promise<TranslationResult> {
  try {
    // 1. 변경사항 감지
    const changes = detectChanges(options)

    if (Object.keys(changes).length === 0) {
      console.log('변경된 항목이 없습니다.')
      return {}
    }

    console.log(`${Object.keys(changes).length}개의 변경사항을 감지했습니다.`)

    // 2. 번역 가능한 텍스트 추출
    const translatableTexts = extractTranslatableTexts(changes)

    if (translatableTexts.length === 0) {
      console.log('번역이 필요한 텍스트가 없습니다.')
      return {}
    }

    console.log(`${translatableTexts.length}개의 텍스트를 번역합니다.`)

    // 3. 배치 번역 실행
    const texts = translatableTexts.map((item) => item.text)
    const translations = await batchTranslate(texts, targetLanguages)

    // 4. 결과를 구조화된 형태로 변환
    const result: TranslationResult = {}

    translatableTexts.forEach((item, index) => {
      result[item.key] = translations[index]
    })

    console.log(`번역 완료: ${Object.keys(result).length}개 항목`)
    return result
  } catch (error) {
    console.error('번역 프로세스 중 오류 발생:', error)
    throw error
  }
}

/**
 * 간단한 사용법을 위한 헬퍼 함수
 */
export async function translateObject(
  previousData: Record<string, any> | undefined,
  currentData: Record<string, any>,
  languages?: SupportedLanguage[]
): Promise<TranslationResult> {
  return translateChanges({ previousData, currentData }, languages)
}
