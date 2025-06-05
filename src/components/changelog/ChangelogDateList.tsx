'use client'

interface DateInfo {
  date: string
  count: number
}

interface ChangelogDateListProps {
  dates: DateInfo[]
  onDateSelect: (date: string) => void
  currentLanguage: string
}

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
          weekday: 'short',
        })
      case 'ja':
        return date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })
      case 'zh':
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })
      case 'es':
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })
      default:
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        })
    }
  } catch {
    return dateStr
  }
}

// 상대적 시간 표시 (예: "3일 전")
function getRelativeTime(dateStr: string, language: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffInDays === 0) {
      switch (language) {
        case 'ko':
          return '오늘'
        case 'ja':
          return '今日'
        case 'zh':
          return '今天'
        case 'es':
          return 'Hoy'
        default:
          return 'Today'
      }
    } else if (diffInDays === 1) {
      switch (language) {
        case 'ko':
          return '어제'
        case 'ja':
          return '昨日'
        case 'zh':
          return '昨天'
        case 'es':
          return 'Ayer'
        default:
          return 'Yesterday'
      }
    } else if (diffInDays < 7) {
      switch (language) {
        case 'ko':
          return `${diffInDays}일 전`
        case 'ja':
          return `${diffInDays}日前`
        case 'zh':
          return `${diffInDays}天前`
        case 'es':
          return `Hace ${diffInDays} días`
        default:
          return `${diffInDays} days ago`
      }
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      switch (language) {
        case 'ko':
          return `${weeks}주 전`
        case 'ja':
          return `${weeks}週間前`
        case 'zh':
          return `${weeks}周前`
        case 'es':
          return `Hace ${weeks} semanas`
        default:
          return `${weeks} weeks ago`
      }
    } else {
      const months = Math.floor(diffInDays / 30)
      switch (language) {
        case 'ko':
          return `${months}개월 전`
        case 'ja':
          return `${months}ヶ月前`
        case 'zh':
          return `${months}个月前`
        case 'es':
          return `Hace ${months} meses`
        default:
          return `${months} months ago`
      }
    }
  } catch {
    return ''
  }
}

export function ChangelogDateList({
  dates,
  onDateSelect,
  currentLanguage,
}: ChangelogDateListProps) {
  if (dates.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-gray-500 text-lg mb-2'>변경 로그가 없습니다</div>
        <div className='text-gray-400 text-sm'>
          새로운 업데이트가 있을 때 다시 확인해주세요.
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='grid gap-4'>
        {dates.map(({ date, count }) => {
          const formattedDate = formatDateForLanguage(date, currentLanguage)
          const relativeTime = getRelativeTime(date, currentLanguage)

          return (
            <button
              key={date}
              onClick={() => onDateSelect(date)}
              className='group w-full text-left p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200'
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                      {formattedDate}
                    </h3>
                    {relativeTime && (
                      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
                        {relativeTime}
                      </span>
                    )}
                  </div>

                  <div className='flex items-center gap-2 text-sm text-gray-600'>
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
                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                      />
                    </svg>
                    <span>{count}개의 업데이트</span>
                  </div>
                </div>

                <div className='ml-4 flex items-center text-gray-400 group-hover:text-blue-500 transition-colors'>
                  <svg
                    className='w-5 h-5'
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
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
