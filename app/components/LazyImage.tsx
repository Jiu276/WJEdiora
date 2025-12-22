'use client'

import { useState, useEffect, useRef } from 'react'
import { Skeleton } from 'antd'

interface LazyImageProps {
  src: string
  alt: string
  style?: React.CSSProperties
  className?: string
  placeholder?: React.ReactNode
  onLoad?: () => void
}

export default function LazyImage({
  src,
  alt,
  style,
  className,
  placeholder,
  onLoad,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '100px', // 提前100px开始加载，优化移动端体验
        threshold: 0.01,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
      observer.disconnect()
    }
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  return (
    <div 
      ref={imgRef} 
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
      }} 
      className={className}
    >
      {!isLoaded && isInView && (
        <Skeleton.Image
          active
          style={{
            width: '100%',
            height: style?.height || 200,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={() => {
            setIsLoaded(true) // 即使加载失败也隐藏骨架屏
          }}
          style={{
            ...style,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            width: '100%',
            height: style?.height || 'auto',
            objectFit: style?.objectFit || 'cover',
            position: isLoaded ? 'relative' : 'absolute',
            zIndex: isLoaded ? 2 : 0,
          }}
          loading="lazy"
          decoding="async"
        />
      )}
      {!isInView && placeholder}
    </div>
  )
}

