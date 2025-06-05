interface ChangelogHighlightsProps {
  highlights: string[]
}

export function ChangelogHighlights({ highlights }: ChangelogHighlightsProps) {
  return (
    <div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
      <h4 className='text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide'>
        주요 변경사항
      </h4>
      <ul className='space-y-2'>
        {highlights.map((highlight, index) => (
          <li
            key={index}
            className='flex items-start'
          >
            <div className='flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3' />
            <span className='text-sm text-gray-700 leading-relaxed'>
              {highlight}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
