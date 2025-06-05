import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { type SupportedLanguage } from './translator'

// 캐시 데이터 구조
export interface TranslationCacheEntry {
  originalText: string
  hash: string
  translations: Record<SupportedLanguage, string>
  createdAt: string
  updatedAt: string
}

export interface TranslationCache {
  version: string
  entries: Record<string, TranslationCacheEntry>
  metadata: {
    totalEntries: number
    lastUpdated: string
  }
}

// 캐시 설정
export interface CacheConfig {
  cacheDir?: string
  cacheFileName?: string
  maxAge?: number // 캐시 유효 기간 (밀리초)
}

// 기본 설정
const DEFAULT_CONFIG: Required<CacheConfig> = {
  cacheDir: '.translation-cache',
  cacheFileName: 'translations.json',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
}

/**
 * 텍스트의 해시값을 생성
 */
function generateTextHash(text: string): string {
  return createHash('sha256').update(text.trim()).digest('hex').substring(0, 16)
}

/**
 * 캐시 파일 경로를 반환
 */
function getCacheFilePath(config: CacheConfig = {}): string {
  const { cacheDir, cacheFileName } = { ...DEFAULT_CONFIG, ...config }
  return path.join(process.cwd(), cacheDir, cacheFileName)
}

/**
 * 캐시 디렉토리를 생성
 */
function ensureCacheDirectory(config: CacheConfig = {}): void {
  const { cacheDir } = { ...DEFAULT_CONFIG, ...config }
  const cacheDirPath = path.join(process.cwd(), cacheDir)

  if (!fs.existsSync(cacheDirPath)) {
    fs.mkdirSync(cacheDirPath, { recursive: true })
  }
}

/**
 * 캐시를 로드
 */
export function loadCache(config: CacheConfig = {}): TranslationCache {
  const cacheFilePath = getCacheFilePath(config)

  try {
    if (fs.existsSync(cacheFilePath)) {
      const cacheData = fs.readFileSync(cacheFilePath, 'utf-8')
      const cache: TranslationCache = JSON.parse(cacheData)

      // 캐시 버전 확인 및 마이그레이션
      if (cache.version !== '1.0') {
        console.log('캐시 버전이 다릅니다. 새로운 캐시를 생성합니다.')
        return createEmptyCache()
      }

      return cache
    }
  } catch (error) {
    console.error('캐시 로드 중 오류 발생:', error)
  }

  return createEmptyCache()
}

/**
 * 빈 캐시 객체를 생성
 */
function createEmptyCache(): TranslationCache {
  return {
    version: '1.0',
    entries: {},
    metadata: {
      totalEntries: 0,
      lastUpdated: new Date().toISOString(),
    },
  }
}

/**
 * 캐시를 저장
 */
export function saveCache(
  cache: TranslationCache,
  config: CacheConfig = {}
): void {
  const cacheFilePath = getCacheFilePath(config)

  try {
    ensureCacheDirectory(config)

    // 메타데이터 업데이트
    cache.metadata.totalEntries = Object.keys(cache.entries).length
    cache.metadata.lastUpdated = new Date().toISOString()

    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), 'utf-8')
    console.log(`캐시가 저장되었습니다: ${cacheFilePath}`)
  } catch (error) {
    console.error('캐시 저장 중 오류 발생:', error)
    throw error
  }
}

/**
 * 캐시에서 번역 결과를 조회
 */
export function getCachedTranslation(
  originalText: string,
  config: CacheConfig = {}
): TranslationCacheEntry | null {
  const cache = loadCache(config)
  const hash = generateTextHash(originalText)
  const entry = cache.entries[hash]

  if (!entry) {
    return null
  }

  // 캐시 유효성 검사
  if (entry.originalText !== originalText.trim()) {
    console.warn(`해시 충돌 감지: ${hash}`)
    return null
  }

  // 만료 시간 검사
  const { maxAge } = { ...DEFAULT_CONFIG, ...config }
  const createdAt = new Date(entry.createdAt).getTime()
  const now = Date.now()

  if (now - createdAt > maxAge) {
    console.log(`캐시 만료: ${hash}`)
    return null
  }

  return entry
}

/**
 * 번역 결과를 캐시에 저장
 */
export function setCachedTranslation(
  originalText: string,
  translations: Record<SupportedLanguage, string>,
  config: CacheConfig = {}
): void {
  const cache = loadCache(config)
  const hash = generateTextHash(originalText)
  const now = new Date().toISOString()

  const entry: TranslationCacheEntry = {
    originalText: originalText.trim(),
    hash,
    translations,
    createdAt: cache.entries[hash]?.createdAt || now,
    updatedAt: now,
  }

  cache.entries[hash] = entry
  saveCache(cache, config)
}

/**
 * 여러 텍스트에 대한 캐시된 번역 결과를 조회
 */
export function getBatchCachedTranslations(
  texts: string[],
  config: CacheConfig = {}
): Array<{
  text: string
  cached: TranslationCacheEntry | null
  index: number
}> {
  return texts.map((text, index) => ({
    text,
    cached: getCachedTranslation(text, config),
    index,
  }))
}

/**
 * 여러 번역 결과를 배치로 캐시에 저장
 */
export function setBatchCachedTranslations(
  translationResults: Array<{
    originalText: string
    translations: Record<SupportedLanguage, string>
  }>,
  config: CacheConfig = {}
): void {
  const cache = loadCache(config)
  const now = new Date().toISOString()

  for (const result of translationResults) {
    const hash = generateTextHash(result.originalText)

    const entry: TranslationCacheEntry = {
      originalText: result.originalText.trim(),
      hash,
      translations: result.translations,
      createdAt: cache.entries[hash]?.createdAt || now,
      updatedAt: now,
    }

    cache.entries[hash] = entry
  }

  saveCache(cache, config)
}

/**
 * 캐시 통계 정보를 반환
 */
export function getCacheStats(config: CacheConfig = {}): {
  totalEntries: number
  cacheSize: string
  oldestEntry: string | null
  newestEntry: string | null
} {
  const cache = loadCache(config)
  const entries = Object.values(cache.entries)

  let oldestEntry: string | null = null
  let newestEntry: string | null = null

  if (entries.length > 0) {
    const dates = entries.map((entry) => new Date(entry.createdAt).getTime())
    oldestEntry = new Date(Math.min(...dates)).toISOString()
    newestEntry = new Date(Math.max(...dates)).toISOString()
  }

  const cacheFilePath = getCacheFilePath(config)
  let cacheSize = '0 B'

  try {
    if (fs.existsSync(cacheFilePath)) {
      const stats = fs.statSync(cacheFilePath)
      const bytes = stats.size

      if (bytes < 1024) {
        cacheSize = `${bytes} B`
      } else if (bytes < 1024 * 1024) {
        cacheSize = `${(bytes / 1024).toFixed(1)} KB`
      } else {
        cacheSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      }
    }
  } catch (error) {
    console.error('캐시 파일 크기 조회 오류:', error)
  }

  return {
    totalEntries: entries.length,
    cacheSize,
    oldestEntry,
    newestEntry,
  }
}

/**
 * 만료된 캐시 항목을 정리
 */
export function cleanExpiredCache(config: CacheConfig = {}): number {
  const cache = loadCache(config)
  const { maxAge } = { ...DEFAULT_CONFIG, ...config }
  const now = Date.now()

  let removedCount = 0

  for (const [hash, entry] of Object.entries(cache.entries)) {
    const createdAt = new Date(entry.createdAt).getTime()

    if (now - createdAt > maxAge) {
      delete cache.entries[hash]
      removedCount++
    }
  }

  if (removedCount > 0) {
    saveCache(cache, config)
    console.log(`${removedCount}개의 만료된 캐시 항목을 정리했습니다.`)
  }

  return removedCount
}

/**
 * 캐시를 완전히 초기화
 */
export function clearCache(config: CacheConfig = {}): void {
  const cacheFilePath = getCacheFilePath(config)

  try {
    if (fs.existsSync(cacheFilePath)) {
      fs.unlinkSync(cacheFilePath)
      console.log('캐시가 완전히 삭제되었습니다.')
    }
  } catch (error) {
    console.error('캐시 삭제 중 오류 발생:', error)
    throw error
  }
}

/**
 * 특정 원문에 대한 캐시 항목을 삭제
 */
export function removeCachedTranslation(
  originalText: string,
  config: CacheConfig = {}
): boolean {
  const cache = loadCache(config)
  const hash = generateTextHash(originalText)

  if (cache.entries[hash]) {
    delete cache.entries[hash]
    saveCache(cache, config)
    console.log(`캐시 항목이 삭제되었습니다: ${hash}`)
    return true
  }

  return false
}
