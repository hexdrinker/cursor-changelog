interface ChangelogMediaProps {
  image?: string
  video?: string
}

export function ChangelogMedia({ image, video }: ChangelogMediaProps) {
  return (
    <div className='space-y-4'>
      {image && (
        <div className='rounded-xl overflow-hidden border border-gray-200'>
          <img
            src={image}
            alt='Release screenshot'
            className='w-full h-auto object-cover'
            loading='lazy'
          />
        </div>
      )}

      {video && (
        <div className='rounded-xl overflow-hidden border border-gray-200 bg-black'>
          <video
            src={video}
            controls
            className='w-full h-auto'
            poster='/api/placeholder/800/400'
          >
            <p className='text-gray-500 text-center py-8'>
              브라우저가 비디오를 지원하지 않습니다.
            </p>
          </video>
        </div>
      )}
    </div>
  )
}
