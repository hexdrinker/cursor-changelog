import { LanguageSelector } from '../LanguageSelector'

interface ChangelogHeaderProps {
  currentLanguage: string
  onLanguageChange: (languageCode: string) => void
}

export function ChangelogHeader({
  currentLanguage,
  onLanguageChange,
}: ChangelogHeaderProps) {
  return (
    <header className='bg-white border-b border-gray-200'>
      <div className='max-w-4xl mx-auto px-6 py-12'>
        {/* 언어 선택 드롭다운 - 우측 상단 */}
        <div className='flex justify-end mb-8'>
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />
        </div>

        <div className='text-center'>
          <h1 className='text-5xl font-bold text-gray-900 mb-4'>Changelog</h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed'>
            최신 기능 업데이트, 개선사항, 그리고 버그 수정 내역을 확인하세요.
          </p>
        </div>

        {/* 네비게이션 */}
        <nav className='mt-8 flex justify-center'>
          <div className='flex space-x-8'>
            <a
              href='#latest'
              className='text-gray-600 hover:text-gray-900 font-medium transition-colors'
            >
              최신 업데이트
            </a>
            <a
              href='#features'
              className='text-gray-600 hover:text-gray-900 font-medium transition-colors'
            >
              신기능
            </a>
            <a
              href='#improvements'
              className='text-gray-600 hover:text-gray-900 font-medium transition-colors'
            >
              개선사항
            </a>
            <a
              href='#bugfixes'
              className='text-gray-600 hover:text-gray-900 font-medium transition-colors'
            >
              버그 수정
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
