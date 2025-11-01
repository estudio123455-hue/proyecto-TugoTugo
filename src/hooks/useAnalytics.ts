'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
}

export function useAnalytics() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const sessionIdRef = useRef<string>()

  // Generate session ID on mount
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }, [])

  // Track page views automatically
  useEffect(() => {
    trackEvent('page_view', {
      page: pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    })
  }, [pathname])

  // Main tracking function
  const trackEvent = useCallback(async (event: string, properties: Record<string, any> = {}) => {
    try {
      const eventData: AnalyticsEvent = {
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          page: pathname,
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        userId: session?.user?.id,
        sessionId: sessionIdRef.current
      }

      // Send to analytics API
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })

      // Also send to external analytics if configured
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event, {
          custom_parameter_1: properties.category,
          custom_parameter_2: properties.action,
          value: properties.value
        })
      }

    } catch (error) {
      console.error('Error tracking analytics event:', error)
    }
  }, [session?.user?.id, pathname])

  // Specific tracking functions
  const trackPackView = useCallback((packId: string, packTitle: string, establishmentName: string) => {
    trackEvent('pack_view', {
      packId,
      packTitle,
      establishmentName,
      category: 'engagement'
    })
  }, [trackEvent])

  const trackPackPurchase = useCallback((packId: string, price: number, quantity: number) => {
    trackEvent('pack_purchase', {
      packId,
      price,
      quantity,
      totalValue: price * quantity,
      category: 'conversion'
    })
  }, [trackEvent])

  const trackSearch = useCallback((query: string, resultsCount: number, filters?: any) => {
    trackEvent('search', {
      query,
      resultsCount,
      filters,
      category: 'engagement'
    })
  }, [trackEvent])

  const trackMapInteraction = useCallback((action: string, location?: any) => {
    trackEvent('map_interaction', {
      action,
      location,
      category: 'engagement'
    })
  }, [trackEvent])

  const trackFilterUsage = useCallback((filterType: string, filterValue: any) => {
    trackEvent('filter_usage', {
      filterType,
      filterValue,
      category: 'engagement'
    })
  }, [trackEvent])

  const trackUserAction = useCallback((action: string, target: string, value?: any) => {
    trackEvent('user_action', {
      action,
      target,
      value,
      category: 'interaction'
    })
  }, [trackEvent])

  const trackError = useCallback((errorType: string, errorMessage: string, context?: any) => {
    trackEvent('error', {
      errorType,
      errorMessage,
      context,
      category: 'error'
    })
  }, [trackEvent])

  const trackPerformance = useCallback((metric: string, value: number, context?: any) => {
    trackEvent('performance', {
      metric,
      value,
      context,
      category: 'performance'
    })
  }, [trackEvent])

  // Track time spent on page
  const trackTimeOnPage = useCallback(() => {
    const startTime = Date.now()
    
    return () => {
      const timeSpent = Date.now() - startTime
      trackEvent('time_on_page', {
        timeSpent,
        page: pathname,
        category: 'engagement'
      })
    }
  }, [trackEvent, pathname])

  // Track scroll depth
  const trackScrollDepth = useCallback(() => {
    let maxScrollDepth = 0
    let scrollTimer: NodeJS.Timeout

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollDepth = Math.round((scrollTop / documentHeight) * 100)
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
      }

      // Debounce scroll tracking
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        if (maxScrollDepth > 0 && maxScrollDepth % 25 === 0) {
          trackEvent('scroll_depth', {
            depth: maxScrollDepth,
            page: pathname,
            category: 'engagement'
          })
        }
      }, 1000)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimer)
      
      // Track final scroll depth
      if (maxScrollDepth > 0) {
        trackEvent('final_scroll_depth', {
          depth: maxScrollDepth,
          page: pathname,
          category: 'engagement'
        })
      }
    }
  }, [trackEvent, pathname])

  return {
    trackEvent,
    trackPackView,
    trackPackPurchase,
    trackSearch,
    trackMapInteraction,
    trackFilterUsage,
    trackUserAction,
    trackError,
    trackPerformance,
    trackTimeOnPage,
    trackScrollDepth,
    sessionId: sessionIdRef.current
  }
}

// Hook for analytics dashboard
export function useAnalyticsDashboard(timeframe: '1d' | '7d' | '30d' = '7d') {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics?timeframe=${timeframe}`)
        if (response.ok) {
          const result = await response.json()
          setData(result.data)
        } else {
          throw new Error('Failed to fetch analytics')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeframe])

  return { data, loading, error }
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
