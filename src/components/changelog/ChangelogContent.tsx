interface ChangelogContentProps {
  content: string
}

export function ChangelogContent({ content }: ChangelogContentProps) {
  // 마크다운 스타일 텍스트를 HTML로 변환하는 간단한 처리
  const processContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      // 제목 처리 (### -> h3)
      if (line.startsWith('### ')) {
        return (
          <h3
            key={index}
            className='text-lg font-semibold text-gray-900 mt-6 mb-3 first:mt-0'
          >
            {line.slice(4)}
          </h3>
        )
      }

      // 리스트 아이템 처리 (* -> li)
      if (line.startsWith('* ')) {
        return (
          <li
            key={index}
            className='text-gray-700 leading-relaxed ml-4'
          >
            {line.slice(2)}
          </li>
        )
      }

      // 코드 블록 처리 (`code` -> <code>)
      if (line.includes('`')) {
        const parts = line.split('`')
        return (
          <p
            key={index}
            className='text-gray-700 leading-relaxed mb-3'
          >
            {parts.map((part, partIndex) =>
              partIndex % 2 === 1 ? (
                <code
                  key={partIndex}
                  className='bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800'
                >
                  {part}
                </code>
              ) : (
                part
              )
            )}
          </p>
        )
      }

      // 빈 줄 처리
      if (line.trim() === '') {
        return (
          <div
            key={index}
            className='h-2'
          />
        )
      }

      // 일반 텍스트
      return (
        <p
          key={index}
          className='text-gray-700 leading-relaxed mb-3'
        >
          {line}
        </p>
      )
    })
  }

  return (
    <div className='prose prose-gray max-w-none'>{processContent(content)}</div>
  )
}
