'use client'

import { useState } from 'react'

export default function LinkImage ({ url, name }: { url: string, name: string }) {
  const [showFallback, setShowFallback] = useState(false)

  if (showFallback) {
    return <span className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200">★</span>
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={(new URL(url)).origin + '/favicon.ico'}
      alt={name}
      className='w-10 h-10 rounded-full'
      onError={() => { setShowFallback(true) }}
    />
  )
}
