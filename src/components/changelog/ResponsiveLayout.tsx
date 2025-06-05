interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>{children}</div>
    </div>
  )
}
