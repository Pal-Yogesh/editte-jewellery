'use client'

import Image from 'next/image'

const CuratedCollection = () => {
  const logos = Array.from({ length: 8 }).map((_, i) => (
    <span key={i} className="inline-flex items-center gap-3 mx-10 shrink-0">
      <Image
        src="/logo/start-letter-logo-transparent.png"
        className="w-10 h-6 mt-1"
        alt="logo"
        width={1000}
        height={1000}
      />
      <Image
        src="/logo/full-name-logo-removebg-preview.png"
        className="w-20 h-8 object-cover"
        alt="logo"
        width={1000}
        height={1000}
      />
    </span>
  ))

  return (
    <div className="relative w-full bg-sage overflow-hidden py-1">
      <div className="flex w-max animate-marquee">
        <div className="flex shrink-0">{logos}</div>
        <div className="flex shrink-0">{logos}</div>
      </div>
    </div>
  )
}

export default CuratedCollection
