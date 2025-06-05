'use client'

import { useState } from 'react'
import { getCategoryColor, cn } from '@/lib/utils'

interface ChangelogFiltersProps {
  onFilterChange: (filters: string[]) => void
}

const filterOptions = [
  { value: 'all', label: '전체', count: 0 },
  { value: 'feature', label: '신기능', count: 0 },
  { value: 'improvement', label: '개선', count: 0 },
  { value: 'bugfix', label: '버그수정', count: 0 },
  { value: 'breaking', label: '주요변경', count: 0 },
]

export function ChangelogFilters({ onFilterChange }: ChangelogFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(['all'])

  const handleFilterClick = (filterValue: string) => {
    let newFilters: string[]

    if (filterValue === 'all') {
      newFilters = ['all']
    } else {
      const currentFilters = activeFilters.filter((f) => f !== 'all')
      if (currentFilters.includes(filterValue)) {
        newFilters = currentFilters.filter((f) => f !== filterValue)
        if (newFilters.length === 0) {
          newFilters = ['all']
        }
      } else {
        newFilters = [...currentFilters, filterValue]
      }
    }

    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className='bg-white border border-gray-200 rounded-xl p-6 mb-8'>
      <h3 className='text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide'>
        카테고리별 필터
      </h3>
      <div className='flex flex-wrap gap-2'>
        {filterOptions.map((filter) => {
          const isActive = activeFilters.includes(filter.value)
          const isAllFilter = filter.value === 'all'

          return (
            <button
              key={filter.value}
              onClick={() => handleFilterClick(filter.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                isActive
                  ? isAllFilter
                    ? 'bg-gray-900 text-white border-gray-900'
                    : cn('border', getCategoryColor(filter.value))
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
              )}
            >
              {filter.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
