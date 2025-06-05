'use client'

import { useState, useRef, useEffect } from 'react'
import { supportedLanguages } from '@/lib/data/languages'
import { Language } from '@/lib/types'

interface LanguageSelectorProps {
  currentLanguage: string
  onLanguageChange: (languageCode: string) => void
}

export function LanguageSelector({
  currentLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang =
    supportedLanguages.find((lang) => lang.code === currentLanguage) ||
    supportedLanguages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  const handleLanguageSelect = (lang: Language) => {
    onLanguageChange(lang.code)
    setIsOpen(false)
  }

  return (
    <div
      className='relative'
      ref={dropdownRef}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className='flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200'
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        aria-label='언어 선택'
      >
        <span
          className='text-lg'
          role='img'
          aria-label={`${currentLang.name} 국기`}
        >
          {currentLang.flag}
        </span>
        <span className='text-sm font-medium text-gray-700 min-w-0'>
          {currentLang.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className='absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-all duration-200 ease-out transform scale-100 opacity-100'
          role='listbox'
          aria-label='언어 선택 목록'
        >
          <div className='py-1'>
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 ${
                  lang.code === currentLanguage
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700'
                }`}
                role='option'
                aria-selected={lang.code === currentLanguage}
              >
                <span
                  className='text-lg'
                  role='img'
                  aria-label={`${lang.name} 국기`}
                >
                  {lang.flag}
                </span>
                <span className='text-sm font-medium truncate'>
                  {lang.name}
                </span>
                {lang.code === currentLanguage && (
                  <svg
                    className='w-4 h-4 text-blue-600 ml-auto'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
