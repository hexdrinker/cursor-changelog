'use client'

import { useState } from 'react'

interface ChangelogSearchProps {
  onSearchChange: (query: string) => void
}

export function ChangelogSearch({ onSearchChange }: ChangelogSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearchChange(query)
  }

  const clearSearch = () => {
    setSearchQuery('')
    onSearchChange('')
  }

  return (
    <div className='bg-white border border-gray-200 rounded-xl p-6 mb-8'>
      <h3 className='text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide'>
        검색
      </h3>
      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <svg
            className='h-5 w-5 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
        <input
          type='text'
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder='제목, 내용, 버전으로 검색...'
          className='block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm'
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className='absolute inset-y-0 right-0 pr-3 flex items-center'
          >
            <svg
              className='h-5 w-5 text-gray-400 hover:text-gray-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
