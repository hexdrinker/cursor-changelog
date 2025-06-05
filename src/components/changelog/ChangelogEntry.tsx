import { ChangelogEntry as ChangelogEntryType } from '@/lib/types'
import { getCategoryColor, cn } from '@/lib/utils'
import { ChangelogContent } from './ChangelogContent'
import { ChangelogMedia } from './ChangelogMedia'
import { ChangelogHighlights } from './ChangelogHighlights'

interface ChangelogEntryProps {
  entry: ChangelogEntryType
}

export function ChangelogEntry({ entry }: ChangelogEntryProps) {
  return (
    <article className='border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group'>
      {/* Header */}
      <div className='px-8 py-6 border-b border-gray-100'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-3'>
              <span className='text-3xl font-bold text-gray-900'>
                {entry.version}
              </span>
              {entry.category && (
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium border',
                    getCategoryColor(entry.category)
                  )}
                >
                  {entry.category}
                </span>
              )}
            </div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2 leading-tight'>
              {entry.title}
            </h2>
            <time className='text-sm text-gray-500 font-medium'>
              {entry.date}
            </time>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='px-8 py-6'>
        <ChangelogContent content={entry.content} />

        {entry.highlights && entry.highlights.length > 0 && (
          <div className='mt-6'>
            <ChangelogHighlights highlights={entry.highlights} />
          </div>
        )}

        {(entry.image || entry.video) && (
          <div className='mt-6'>
            <ChangelogMedia
              image={entry.image}
              video={entry.video}
            />
          </div>
        )}
      </div>
    </article>
  )
}
