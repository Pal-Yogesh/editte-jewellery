'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

const texts = ['Festive', 'Wedding', 'Bride & Groom', 'Traditional', 'Haldi']

const CuratedCollection = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [textColors, setTextColors] = useState<string[]>([])

  const updateTextColors = useCallback(() => {
    if (!containerRef.current || !scrollRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const midPoint = containerRect.left + containerRect.width / 2

    const colors = textRefs.current.map((ref) => {
      if (!ref) return '#ffffff'
      const rect = ref.getBoundingClientRect()
      const textCenter = rect.left + rect.width / 2
      // Text on the right side (light bg) = dark color, left side (dark bg) = white
      return textCenter > midPoint ? '#4a2c17' : '#ffffff'
    })

    setTextColors(colors)
  }, [])

  // Auto scroll animation
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let animationId: number
    let scrollPos = 0
    let paused = false

    const animate = () => {
      if (!paused && container) {
        scrollPos += 0.5
        if (scrollPos >= container.scrollWidth / 2) {
          scrollPos = 0
        }
        container.scrollLeft = scrollPos
      }
      updateTextColors()
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    const handleEnter = () => { paused = true }
    const handleLeave = () => {
      paused = false
      scrollPos = container.scrollLeft
    }

    container.addEventListener('mouseenter', handleEnter)
    container.addEventListener('mouseleave', handleLeave)

    return () => {
      cancelAnimationFrame(animationId)
      container.removeEventListener('mouseenter', handleEnter)
      container.removeEventListener('mouseleave', handleLeave)
    }
  }, [updateTextColors])

  // Manual drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0))
    setScrollLeft(scrollRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - (scrollRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
    updateTextColors()
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0))
    setScrollLeft(scrollRef.current?.scrollLeft || 0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return
    const x = e.touches[0].pageX - (scrollRef.current.offsetLeft || 0)
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
    updateTextColors()
  }

  const allTexts = [...texts, ...texts]

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden"
      style={{
        backgroundImage: `url('/curated-collection-bg.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient overlay - dark left fading to light right */}
      <div className="absolute inset-0 bg-linear-to-r from-black/40 via-black/20 to-white/50" />

      {/* Scrollable text row - centered vertically */}
      <div className="absolute inset-0 flex items-center">
        <div
          ref={scrollRef}
          className={`w-full overflow-x-auto flex items-baseline gap-12 md:gap-20 lg:gap-28 px-8 md:px-16 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {allTexts.map((text, index) => (
            <span
              key={index}
              ref={(el) => { textRefs.current[index] = el }}
              className="whitespace-nowrap select-none transition-all duration-300"
              style={{
                fontFamily: 'var(--font-heading-serif), "Playfair Display", serif',
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                color: 'transparent',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                WebkitTextStroke: `1.5px ${textColors[index] || '#ffffff'}`,
                fontWeight: 400,
              }}
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CuratedCollection