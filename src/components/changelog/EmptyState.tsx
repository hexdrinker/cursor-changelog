interface EmptyStateProps {
  searchQuery?: string
  hasFilters?: boolean
}

export function EmptyState({ searchQuery, hasFilters }: EmptyStateProps) {
  return (
    <div className='text-center py-16'>
      <div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
        <svg
          className='w-12 h-12 text-gray-400'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
      </div>

      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
        {searchQuery ? '검색 결과가 없습니다' : '표시할 항목이 없습니다'}
      </h3>

      <p className='text-gray-600 max-w-md mx-auto'>
        {searchQuery
          ? `"${searchQuery}"에 대한 검색 결과를 찾을 수 없습니다. 다른 키워드로 검색해보세요.`
          : hasFilters
          ? '선택한 필터에 해당하는 항목이 없습니다. 필터를 조정해보세요.'
          : '아직 changelog 항목이 없습니다.'}
      </p>
    </div>
  )
}
