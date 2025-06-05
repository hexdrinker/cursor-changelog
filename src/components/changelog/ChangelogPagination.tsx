'use client'

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

interface ChangelogPaginationProps {
  pagination: PaginationInfo
  onDateChange: (date: string) => void
  onPageChange: (page: number) => void
  isLoadingDate?: boolean
  mode: 'dates' | 'entries' // dates: 날짜 목록, entries: 특정 날짜의 항목들
}

export function ChangelogPagination({
  pagination,
  onDateChange,
  onPageChange,
  isLoadingDate = false,
  mode,
}: ChangelogPaginationProps) {
  if (mode === 'entries') {
    // 특정 날짜의 항목들을 보고 있을 때 - 날짜 간 네비게이션
    return (
      <div className='flex items-center justify-between py-6 border-t border-gray-200'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() =>
              pagination.prevDate && onDateChange(pagination.prevDate)
            }
            disabled={!pagination.hasPrev || isLoadingDate}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
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
            이전 날짜
          </button>

          <span className='text-sm text-gray-600'>
            {pagination.currentDateIndex !== undefined && (
              <>
                {pagination.currentDateIndex + 1} / {pagination.totalDates}
              </>
            )}
          </span>
        </div>

        <div className='text-center'>
          <h3 className='text-lg font-semibold text-gray-900'>
            {pagination.currentDate}
          </h3>
          {isLoadingDate && (
            <div className='flex items-center justify-center mt-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
              <span className='ml-2 text-sm text-gray-600'>번역 중...</span>
            </div>
          )}
        </div>

        <div className='flex items-center gap-4'>
          <button
            onClick={() =>
              pagination.nextDate && onDateChange(pagination.nextDate)
            }
            disabled={!pagination.hasNext || isLoadingDate}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            다음 날짜
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
                d='M9 5l7 7-7 7'
              />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // 날짜 목록을 보고 있을 때 - 일반적인 페이지 네비게이션
  return (
    <div className='flex items-center justify-between py-6'>
      <div className='text-sm text-gray-600'>
        총 {pagination.totalDates}개의 날짜
      </div>

      <div className='flex items-center gap-2'>
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrev}
          className='flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
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
          이전
        </button>

        <div className='flex items-center gap-1'>
          {Array.from(
            { length: Math.min(5, pagination.totalPages) },
            (_, i) => {
              let pageNum
              if (pagination.totalPages <= 5) {
                pageNum = i
              } else if (pagination.currentPage <= 2) {
                pageNum = i
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 5 + i
              } else {
                pageNum = pagination.currentPage - 2 + i
              }

              const isActive = pageNum === pagination.currentPage

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum + 1}
                </button>
              )
            }
          )}
        </div>

        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNext}
          className='flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          다음
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
              d='M9 5l7 7-7 7'
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
