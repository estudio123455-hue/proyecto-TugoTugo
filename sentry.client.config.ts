import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Basic integrations
  integrations: [
    // Additional integrations can be added here
  ],
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'client',
      app: 'tugotugo'
    }
  },
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    
    // Filter out specific errors
    if (event.exception) {
      const error = hint.originalException
      if (error && error.message) {
        // Ignore network errors
        if (error.message.includes('Network Error')) {
          return null
        }
        // Ignore ResizeObserver errors
        if (error.message.includes('ResizeObserver')) {
          return null
        }
      }
    }
    
    return event
  }
})
