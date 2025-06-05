import OpenAI from 'openai'
import {
  type SupportedLanguage,
  SUPPORTED_LANGUAGES,
  type TranslationResult,
  type ChangeDetectionOptions,
  detectChanges,
} from './translator'
import {
  type CacheConfig,
  type TranslationCacheEntry,
  getCachedTranslation,
  setCachedTranslation,
  getBatchCachedTranslations,
  setBatchCachedTranslations,
  getCacheStats,
  cleanExpiredCache,
} from './translation-cache'

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * 캐시된 번역 결과 타입
 */
export interface CachedTranslationResult {
  translations: TranslationResult
  cacheStats: {
    totalRequested: number
    cacheHits: number
    cacheMisses: number
    cacheHitRate: string
  }
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
  "ja": "일본語翻訳", 
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
 * 캐시를 활용한 배치 번역
 */
async function batchTranslateWithCache(
  texts: string[],
  targetLanguages: SupportedLanguage[],
  cacheConfig: CacheConfig = {}
): Promise<{
  translations: Record<SupportedLanguage, string>[]
  stats: { cacheHits: number; cacheMisses: number }
}> {
  const BATCH_SIZE = 5 // API 요청 제한을 고려한 배치 크기

  // 1. 캐시에서 번역 결과 조회
  const cacheResults = getBatchCachedTranslations(texts, cacheConfig)

  const translations: Record<SupportedLanguage, string>[] = new Array(
    texts.length
  )
  const textsToTranslate: Array<{ text: string; index: number }> = []

  let cacheHits = 0
  let cacheMisses = 0

  // 2. 캐시 히트/미스 분류
  for (const result of cacheResults) {
    if (result.cached) {
      translations[result.index] = result.cached.translations
      cacheHits++
      console.log(`캐시 히트: "${result.text.substring(0, 30)}..."`)
    } else {
      textsToTranslate.push({ text: result.text, index: result.index })
      cacheMisses++
    }
  }

  // 3. 캐시되지 않은 텍스트들을 배치 번역
  if (textsToTranslate.length > 0) {
    console.log(`${textsToTranslate.length}개의 새로운 텍스트를 번역합니다.`)

    const translationsToCache: Array<{
      originalText: string
      translations: Record<SupportedLanguage, string>
    }> = []

    for (let i = 0; i < textsToTranslate.length; i += BATCH_SIZE) {
      const batch = textsToTranslate.slice(i, i + BATCH_SIZE)
      const batchPromises = batch.map(({ text }) =>
        translateText(text, targetLanguages)
      )

      try {
        const batchResults = await Promise.all(batchPromises)

        // 결과를 원래 위치에 배치하고 캐시용 데이터 준비
        batch.forEach((item, batchIndex) => {
          const translation = batchResults[batchIndex]
          translations[item.index] = translation

          translationsToCache.push({
            originalText: item.text,
            translations: translation,
          })
        })

        // API 요청 제한을 위한 지연
        if (i + BATCH_SIZE < textsToTranslate.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`배치 번역 오류 (${i}-${i + BATCH_SIZE}):`, error)

        // 오류 발생 시 원본 텍스트로 채움
        batch.forEach((item) => {
          const fallback = targetLanguages.reduce((acc, lang) => {
            acc[lang] = item.text
            return acc
          }, {} as Record<SupportedLanguage, string>)

          translations[item.index] = fallback
          translationsToCache.push({
            originalText: item.text,
            translations: fallback,
          })
        })
      }
    }

    // 4. 새로 번역된 결과들을 캐시에 저장
    if (translationsToCache.length > 0) {
      setBatchCachedTranslations(translationsToCache, cacheConfig)
      console.log(
        `${translationsToCache.length}개의 번역 결과를 캐시에 저장했습니다.`
      )
    }
  }

  return {
    translations,
    stats: { cacheHits, cacheMisses },
  }
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
 * 캐시를 활용한 메인 번역 함수: 변경된 항목만 번역하여 언어별로 구조화된 결과 반환
 */
export async function translateChangesWithCache(
  options: ChangeDetectionOptions,
  targetLanguages: SupportedLanguage[] = ['ko', 'ja', 'zh', 'es'],
  cacheConfig: CacheConfig = {}
): Promise<CachedTranslationResult> {
  try {
    // 캐시 정리 (선택적)
    cleanExpiredCache(cacheConfig)

    // 1. 변경사항 감지
    const changes = detectChanges(options)

    if (Object.keys(changes).length === 0) {
      console.log('변경된 항목이 없습니다.')
      return {
        translations: {},
        cacheStats: {
          totalRequested: 0,
          cacheHits: 0,
          cacheMisses: 0,
          cacheHitRate: '0%',
        },
      }
    }

    console.log(`${Object.keys(changes).length}개의 변경사항을 감지했습니다.`)

    // 2. 번역 가능한 텍스트 추출
    const translatableTexts = extractTranslatableTexts(changes)

    if (translatableTexts.length === 0) {
      console.log('번역이 필요한 텍스트가 없습니다.')
      return {
        translations: {},
        cacheStats: {
          totalRequested: 0,
          cacheHits: 0,
          cacheMisses: 0,
          cacheHitRate: '0%',
        },
      }
    }

    console.log(`${translatableTexts.length}개의 텍스트를 번역합니다.`)

    // 3. 캐시를 활용한 배치 번역 실행
    const texts = translatableTexts.map((item) => item.text)
    const { translations, stats } = await batchTranslateWithCache(
      texts,
      targetLanguages,
      cacheConfig
    )

    // 4. 결과를 구조화된 형태로 변환
    const result: TranslationResult = {}

    translatableTexts.forEach((item, index) => {
      result[item.key] = translations[index]
    })

    const cacheHitRate =
      stats.cacheHits + stats.cacheMisses > 0
        ? (
            (stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) *
            100
          ).toFixed(1) + '%'
        : '0%'

    console.log(`번역 완료: ${Object.keys(result).length}개 항목`)
    console.log(
      `캐시 통계 - 히트: ${stats.cacheHits}, 미스: ${stats.cacheMisses}, 히트율: ${cacheHitRate}`
    )

    return {
      translations: result,
      cacheStats: {
        totalRequested: stats.cacheHits + stats.cacheMisses,
        cacheHits: stats.cacheHits,
        cacheMisses: stats.cacheMisses,
        cacheHitRate,
      },
    }
  } catch (error) {
    console.error('캐시된 번역 프로세스 중 오류 발생:', error)
    throw error
  }
}

/**
 * 간단한 사용법을 위한 헬퍼 함수
 */
export async function translateObjectWithCache(
  previousData: Record<string, any> | undefined,
  currentData: Record<string, any>,
  languages?: SupportedLanguage[],
  cacheConfig?: CacheConfig
): Promise<CachedTranslationResult> {
  return translateChangesWithCache(
    { previousData, currentData },
    languages,
    cacheConfig
  )
}

/**
 * 단일 텍스트를 캐시를 활용하여 번역
 */
export async function translateSingleTextWithCache(
  text: string,
  targetLanguages: SupportedLanguage[] = ['ko', 'ja', 'zh', 'es'],
  cacheConfig: CacheConfig = {}
): Promise<{
  originalText: string
  translations: Record<SupportedLanguage, string>
  cached: boolean
}> {
  // 캐시에서 조회
  const cachedResult = getCachedTranslation(text, cacheConfig)

  if (cachedResult) {
    console.log(
      `캐시에서 번역 결과를 찾았습니다: "${text.substring(0, 30)}..."`
    )
    return {
      originalText: text,
      translations: cachedResult.translations,
      cached: true,
    }
  }

  // 캐시에 없으면 새로 번역
  console.log(`새로운 텍스트를 번역합니다: "${text.substring(0, 30)}..."`)
  const translations = await translateText(text, targetLanguages)

  // 캐시에 저장
  setCachedTranslation(text, translations, cacheConfig)

  return {
    originalText: text,
    translations,
    cached: false,
  }
}

/**
 * 캐시 상태 정보를 조회
 */
export function getTranslationCacheInfo(cacheConfig: CacheConfig = {}) {
  const stats = getCacheStats(cacheConfig)

  return {
    ...stats,
    config: {
      cacheDir: cacheConfig.cacheDir || '.translation-cache',
      cacheFileName: cacheConfig.cacheFileName || 'translations.json',
      maxAge: cacheConfig.maxAge || 7 * 24 * 60 * 60 * 1000,
      maxAgeDisplay: cacheConfig.maxAge
        ? `${Math.floor((cacheConfig.maxAge || 0) / (24 * 60 * 60 * 1000))}일`
        : '7일',
    },
  }
}
