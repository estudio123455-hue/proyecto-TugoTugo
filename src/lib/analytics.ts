interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  timestamp: Date
  userId?: string
  sessionId?: string
}

class AnalyticsManager {
  private events: AnalyticsEvent[] = []
  private isEnabled = process.env.NODE_ENV === 'production'

  track(event: string, properties: Record<string, any> = {}, userId?: string) {
    if (!this.isEnabled) return

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      },
      timestamp: new Date(),
      userId,
      sessionId: this.getSessionId(),
    }

    this.events.push(analyticsEvent)
    this.flushEvents()
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return ''
    
    let sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  }

  private async flushEvents() {
    if (this.events.length === 0) return

    try {
      // In a real implementation, you'd send to your analytics service
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: this.events,
        }),
      })

      this.events = []
    } catch (error) {
      console.error('Failed to send analytics events:', error)
    }
  }

  // Performance metrics
  trackPageLoad(page: string, loadTime: number) {
    this.track('page_load', {
      page,
      load_time: loadTime,
      performance: {
        navigation: typeof window !== 'undefined' ? performance.getEntriesByType('navigation')[0] : null,
      },
    })
  }

  trackPackView(packId: string, establishmentId: string) {
    this.track('pack_view', {
      pack_id: packId,
      establishment_id: establishmentId,
    })
  }

  trackPackReservation(packId: string, establishmentId: string, quantity: number) {
    this.track('pack_reservation', {
      pack_id: packId,
      establishment_id: establishmentId,
      quantity,
    })
  }

  trackRestaurantView(restaurantId: string, category: string) {
    this.track('restaurant_view', {
      restaurant_id: restaurantId,
      category,
    })
  }

  trackSearch(query: string, results: number, filters: Record<string, any>) {
    this.track('search', {
      query,
      results_count: results,
      filters,
    })
  }

  trackError(error: string, context: string, userId?: string) {
    this.track('error', {
      error_message: error,
      context,
      severity: 'error',
    }, userId)
  }

  trackPerformance(metric: string, value: number, context?: string) {
    this.track('performance', {
      metric,
      value,
      context,
    })
  }
}

export const analytics = new AnalyticsManager()

// React hook for analytics
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    trackPageLoad: analytics.trackPageLoad.bind(analytics),
    trackPackView: analytics.trackPackView.bind(analytics),
    trackPackReservation: analytics.trackPackReservation.bind(analytics),
    trackRestaurantView: analytics.trackRestaurantView.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
  }
}
