'use client'

import { useState, useEffect } from 'react'
import { type ChangelogEntry as APIChangelogEntry } from '@/lib/utils/cursor-changelog-parser'
import { type ChangelogEntry } from '@/lib/types'
import { ChangelogEntry as ChangelogEntryComponent } from './ChangelogEntry'
import { ChangelogHeader } from './ChangelogHeader'
import { ChangelogFilters } from './ChangelogFilters'
import { ChangelogSearch } from './ChangelogSearch'
import { ChangelogDateList } from './ChangelogDateList'
import { ChangelogPagination } from './ChangelogPagination'
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
    category: 'feature',
    highlights:
      apiEntry.sections
        ?.slice(0, 4)
        .map((s) => s.title)
        .filter(Boolean) || [],
  }
}

interface DateInfo {
  date: string
  count: number
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalDates: number
  currentDate?: string
  currentDateIndex?: number
  hasNext: boolean
  hasPrev: boolean
  nextDate?: string | null
  prevDate?: string | null
}

export function PaginatedChangelog() {
  const [currentLanguage, setCurrentLanguage] = useState('ko')
  const [currentView, setCurrentView] = useState<'dates' | 'entries'>('dates')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 날짜 목록 관련 상태
  const [datesList, setDatesList] = useState<DateInfo[]>([])
  const [datesPage, setDatesPage] = useState(0)
  const [datesPagination, setDatesPagination] = useState<PaginationInfo | null>(
    null
  )
  const [isLoadingDates, setIsLoadingDates] = useState(true)

  // 특정 날짜의 항목들 관련 상태
  const [entriesData, setEntriesData] = useState<ChangelogEntry[]>([])
  const [entriesPagination, setEntriesPagination] =
    useState<PaginationInfo | null>(null)
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)

  // 필터링 상태
  const [activeFilters, setActiveFilters] = useState<string[]>(['all'])
  const [searchQuery, setSearchQuery] = useState('')

  const [error, setError] = useState<string | null>(null)

  // 날짜 목록을 가져오는 함수
  const fetchDatesList = async (language: string, page: number = 0) => {
    try {
      setIsLoadingDates(true)
      setError(null)

      const url = `/api/changelog/paginated?lang=${language}&page=${page}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `API 호출 실패: ${response.status} ${response.statusText}`
        )
      }

      const result = await response.json()

      if (result.success) {
        setDatesList(result.data.dates)
        setDatesPagination(result.data.pagination)
      } else {
        throw new Error(result.message || '데이터를 가져오는데 실패했습니다')
      }
    } catch (err) {
      console.error('날짜 목록 로딩 실패:', err)
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      )
    } finally {
      setIsLoadingDates(false)
    }
  }

  // 특정 날짜의 항목들을 가져오는 함수
  const fetchEntriesForDate = async (language: string, date: string) => {
    try {
      setIsLoadingEntries(true)
      setError(null)

      const url = `/api/changelog/paginated?lang=${language}&date=${encodeURIComponent(
        date
      )}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `API 호출 실패: ${response.status} ${response.statusText}`
        )
      }

      const result = await response.json()

      if (result.success) {
        const uiData = result.data.entries.map((entry: APIChangelogEntry) =>
          convertAPIEntryToUIEntry(entry, language)
        )
        setEntriesData(uiData)
        setEntriesPagination(result.data.pagination)
      } else {
        throw new Error(result.message || '데이터를 가져오는데 실패했습니다')
      }
    } catch (err) {
      console.error('항목 데이터 로딩 실패:', err)
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      )
    } finally {
      setIsLoadingEntries(false)
    }
  }

  // 언어 변경 시 날짜 목록 다시 로드
  useEffect(() => {
    setCurrentView('dates')
    setSelectedDate(null)
    setDatesPage(0)
    fetchDatesList(currentLanguage, 0)
  }, [currentLanguage])

  // 날짜 페이지 변경 시
  useEffect(() => {
    if (currentView === 'dates') {
      fetchDatesList(currentLanguage, datesPage)
    }
  }, [datesPage, currentLanguage, currentView])

  // 날짜 선택 핸들러
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setCurrentView('entries')
    fetchEntriesForDate(currentLanguage, date)
  }

  // 날짜 변경 핸들러 (페이지네이션에서)
  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    fetchEntriesForDate(currentLanguage, date)
  }

  // 날짜 목록으로 돌아가기
  const handleBackToDates = () => {
    setCurrentView('dates')
    setSelectedDate(null)
    setEntriesData([])
    setEntriesPagination(null)
  }

  // 필터링된 데이터 (항목 보기에서만 사용)
  const filteredEntries = entriesData.filter((entry) => {
    // 카테고리 필터링
    if (
      !activeFilters.includes('all') &&
      entry.category &&
      !activeFilters.includes(entry.category)
    ) {
      return false
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return (
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.version.toLowerCase().includes(query)
      )
    }

    return true
  })

  // 로딩 상태
  if (isLoadingDates && currentView === 'dates') {
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
              변경 로그 목록을 불러오는 중...
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
              onClick={() => {
                if (currentView === 'dates') {
                  fetchDatesList(currentLanguage, datesPage)
                } else if (selectedDate) {
                  fetchEntriesForDate(currentLanguage, selectedDate)
                }
              }}
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
        {currentView === 'dates' ? (
          // 날짜 목록 보기
          <>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Cursor 변경 로그
              </h1>
              <p className='text-gray-600'>
                날짜를 선택하여 해당 날짜의 업데이트 내용을 확인하세요.
              </p>
            </div>

            <ChangelogDateList
              dates={datesList}
              onDateSelect={handleDateSelect}
              currentLanguage={currentLanguage}
            />

            {datesPagination && (
              <ChangelogPagination
                pagination={datesPagination}
                onDateChange={() => {}}
                onPageChange={setDatesPage}
                mode='dates'
              />
            )}
          </>
        ) : (
          // 특정 날짜의 항목들 보기
          <>
            <div className='mb-6'>
              <button
                onClick={handleBackToDates}
                className='flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 19l-7-7 7-7'
                  />
                </svg>
                날짜 목록으로 돌아가기
              </button>
            </div>

            <ChangelogSearch onSearchChange={setSearchQuery} />
            <ChangelogFilters onFilterChange={setActiveFilters} />

            {isLoadingEntries ? (
              <div className='flex items-center justify-center py-20'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                <span className='ml-4 text-gray-600'>번역 중...</span>
              </div>
            ) : filteredEntries.length === 0 ? (
              <EmptyState
                searchQuery={searchQuery}
                hasFilters={!activeFilters.includes('all')}
              />
            ) : (
              <div className='space-y-8'>
                {filteredEntries.map((entry) => (
                  <ChangelogEntryComponent
                    key={entry.id}
                    entry={entry}
                  />
                ))}
              </div>
            )}

            {entriesPagination && (
              <ChangelogPagination
                pagination={entriesPagination}
                onDateChange={handleDateChange}
                onPageChange={() => {}}
                isLoadingDate={isLoadingEntries}
                mode='entries'
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
