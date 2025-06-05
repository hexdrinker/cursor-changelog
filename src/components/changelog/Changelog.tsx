'use client'

import { useState, useMemo } from 'react'
import { changelogData } from '@/lib/data/changelog'
import { groupChangelogByDate } from '@/lib/utils'
import { ChangelogEntry } from './ChangelogEntry'
import { ChangelogHeader } from './ChangelogHeader'
import { ChangelogFilters } from './ChangelogFilters'
import { ChangelogSearch } from './ChangelogSearch'
import { EmptyState } from './EmptyState'

export function Changelog() {
  const [activeFilters, setActiveFilters] = useState<string[]>(['all'])
  const [searchQuery, setSearchQuery] = useState('')

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
  }, [activeFilters, searchQuery])

  const groupedChangelog = groupChangelogByDate(filteredData)
  const sortedDates = Object.keys(groupedChangelog).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className='min-h-screen bg-gray-50'>
      <ChangelogHeader />

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
                    <ChangelogEntry
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
