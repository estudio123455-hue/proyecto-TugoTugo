'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseImageOptimizationProps {
  src: string
  alt: string
  placeholder?: string
  quality?: number
  sizes?: string
  priority?: boolean
}

export function useImageOptimization({
  src,
  alt,
  placeholder = '/images/placeholder.jpg',
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false
}: UseImageOptimizationProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return // Skip lazy loading for priority images

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
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    )

    observerRef.current = observer

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [priority])

  // Generate optimized image URL
  const getOptimizedImageUrl = useCallback((originalSrc: string, width?: number) => {
    if (!originalSrc || originalSrc.startsWith('data:')) return originalSrc

    // For external URLs, return as-is (in production, you might use a service like Cloudinary)
    if (originalSrc.startsWith('http')) {
      return originalSrc
    }

    // For local images, add optimization parameters
    const params = new URLSearchParams({
      q: quality.toString(),
      ...(width && { w: width.toString() })
    })

    return `/api/images/optimize?src=${encodeURIComponent(originalSrc)}&${params}`
  }, [quality])

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setError(false)
  }, [])

  // Handle image error
  const handleError = useCallback(() => {
    setError(true)
    setIsLoaded(false)
  }, [])

  // Generate srcSet for responsive images
  const generateSrcSet = useCallback((originalSrc: string) => {
    const breakpoints = [320, 640, 768, 1024, 1280, 1920]
    return breakpoints
      .map(width => `${getOptimizedImageUrl(originalSrc, width)} ${width}w`)
      .join(', ')
  }, [getOptimizedImageUrl])

  return {
    imgRef,
    src: isInView ? (error ? placeholder : getOptimizedImageUrl(src)) : placeholder,
    srcSet: isInView && !error ? generateSrcSet(src) : undefined,
    alt,
    sizes,
    isLoaded,
    isInView,
    error,
    onLoad: handleLoad,
    onError: handleError,
    style: {
      opacity: isLoaded ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }
  }
}

// Hook for preloading critical images
export function useImagePreloader(imageSrcs: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    const preloadImage = (src: string) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(src)
        img.onerror = reject
        img.src = src
      })
    }

    const preloadImages = async () => {
      try {
        const promises = imageSrcs.map(preloadImage)
        const loaded = await Promise.allSettled(promises)
        
        const successful = loaded
          .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
          .map(result => result.value)

        setLoadedImages(new Set(successful))
      } catch (error) {
        console.error('Error preloading images:', error)
      }
    }

    if (imageSrcs.length > 0) {
      preloadImages()
    }
  }, [imageSrcs])

  return loadedImages
}

// Hook for image compression
export function useImageCompression() {
  const compressImage = useCallback(async (
    file: File, 
    maxWidth: number = 1920, 
    maxHeight: number = 1080, 
    quality: number = 0.8
  ): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }, [])

  return { compressImage }
}
