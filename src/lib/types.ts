export interface ChangelogEntry {
  id: string
  version: string
  date: string
  title: string
  content: string
  image?: string
  video?: string
  category?: 'feature' | 'improvement' | 'bugfix' | 'breaking'
  highlights?: string[]
}

export interface GroupedChangelog {
  [key: string]: ChangelogEntry[]
}

export interface Language {
  code: string
  name: string
  flag: string
}

export interface MultiLanguageChangelogData {
  [languageCode: string]: ChangelogEntry[]
}
