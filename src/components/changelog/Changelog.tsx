'use client'

import { useState, useMemo, useEffect } from 'react'
import { type ChangelogEntry as APIChangelogEntry } from '@/lib/utils/cursor-changelog-parser'
import { type ChangelogEntry } from '@/lib/types'
import { ChangelogEntry as ChangelogEntryComponent } from './ChangelogEntry'
import { ChangelogHeader } from './ChangelogHeader'
import { ChangelogFilters } from './ChangelogFilters'
import { ChangelogSearch } from './ChangelogSearch'
import { EmptyState } from './EmptyState'

// 날짜를 언어에 맞게 포맷하는 함수
function formatDateForLanguage(dateStr: string, language: string): string {
  try {
    const date = new Date(dateStr)

    switch (language) {
      case 'ko':
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      case 'ja':
        return date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      case 'zh':
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      case 'es':
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      default:
        return dateStr
    }
  } catch {
    return dateStr
  }
}

// API 응답을 UI 타입으로 변환하는 함수
function convertAPIEntryToUIEntry(
  apiEntry: APIChangelogEntry,
  language: string
): ChangelogEntry {
  return {
    id: apiEntry.id,
    version: apiEntry.version,
    date: formatDateForLanguage(apiEntry.date, language),
    title: apiEntry.title,
    content: apiEntry.content,
    image: apiEntry.images?.[0]?.src,
    video: apiEntry.videos?.[0]?.src,
    category: 'feature', // 기본값, 필요시 API에서 카테고리 정보 추가 가능
    highlights:
      apiEntry.sections
        ?.slice(0, 4)
        .map((s) => s.title)
        .filter(Boolean) || [],
  }
}

// 날짜별로 changelog를 그룹화하는 함수
function groupChangelogByDate(
  entries: ChangelogEntry[]
): Record<string, ChangelogEntry[]> {
  return entries.reduce((acc, entry) => {
    const date = entry.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(entry)
    return acc
  }, {} as Record<string, ChangelogEntry[]>)
}

export function Changelog() {
  const [activeFilters, setActiveFilters] = useState<string[]>(['all'])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentLanguage, setCurrentLanguage] = useState('ko')
  const [changelogData, setChangelogData] = useState<ChangelogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API에서 changelog 데이터를 가져오는 함수
  const fetchChangelogData = async (language: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const url = `/api/changelog?lang=${language}&limit=50`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `API 호출 실패: ${response.status} ${response.statusText}`
        )
      }

      const apiData: APIChangelogEntry[] = await response.json()

      // API 응답을 UI 타입으로 변환
      const uiData = apiData.map((entry) =>
        convertAPIEntryToUIEntry(entry, language)
      )

      setChangelogData(uiData)
    } catch (err) {
      console.error('Changelog 데이터 로딩 실패:', err)
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // 언어 변경 시 데이터 다시 로드
  useEffect(() => {
    fetchChangelogData(currentLanguage)
  }, [currentLanguage])

  const filteredData = useMemo(() => {
    let data = changelogData

    // 카테고리 필터링
    if (!activeFilters.includes('all')) {
      data = data.filter(
        (entry) => entry.category && activeFilters.includes(entry.category)
      )
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      data = data.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query) ||
          entry.version.toLowerCase().includes(query)
      )
    }

    return data
  }, [activeFilters, searchQuery, changelogData])

  const groupedChangelog = groupChangelogByDate(filteredData)
  const sortedDates = Object.keys(groupedChangelog).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  // 로딩 상태
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <ChangelogHeader
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
        <main className='max-w-4xl mx-auto px-6 py-12'>
          <div className='flex items-center justify-center py-20'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
            <span className='ml-4 text-gray-600'>
              변경 로그를 불러오는 중...
            </span>
          </div>
        </main>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <ChangelogHeader
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
        <main className='max-w-4xl mx-auto px-6 py-12'>
          <div className='text-center py-20'>
            <div className='text-red-600 text-lg font-semibold mb-4'>
              데이터를 불러오는데 실패했습니다
            </div>
            <div className='text-gray-600 mb-6'>{error}</div>
            <button
              onClick={() => fetchChangelogData(currentLanguage)}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              다시 시도
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <ChangelogHeader
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      <main className='max-w-4xl mx-auto px-6 py-12'>
        <ChangelogSearch onSearchChange={setSearchQuery} />
        <ChangelogFilters onFilterChange={setActiveFilters} />

        {sortedDates.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            hasFilters={!activeFilters.includes('all')}
          />
        ) : (
          <div className='space-y-12'>
            {sortedDates.map((date) => (
              <section
                key={date}
                className='space-y-6'
              >
                {/* 날짜별 그룹 헤더 */}
                <div className='flex items-center'>
                  <div className='h-px bg-gray-300 flex-1' />
                  <h2 className='px-6 text-lg font-semibold text-gray-700 bg-gray-50'>
                    {date}
                  </h2>
                  <div className='h-px bg-gray-300 flex-1' />
                </div>

                {/* 해당 날짜의 항목들 */}
                <div className='space-y-8'>
                  {groupedChangelog[date].map((entry) => (
                    <ChangelogEntryComponent
                      key={entry.id}
                      entry={entry}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
