import { ChangelogEntry, GroupedChangelog } from './types'

export function groupChangelogByDate(
  changelog: ChangelogEntry[]
): GroupedChangelog {
  return changelog.reduce((acc, entry) => {
    const dateKey = entry.date
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(entry)
    return acc
  }, {} as GroupedChangelog)
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function getCategoryColor(category?: string): string {
  switch (category) {
    case 'feature':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'improvement':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'bugfix':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'breaking':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
