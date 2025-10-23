import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'server',
      app: 'tugotugo'
    }
  },
  
  // Server-specific integrations
  integrations: [
    // Add server-specific integrations here
  ],
  
  // Error filtering for server
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    
    // Add server-specific error filtering
    if (event.exception) {
      const error = hint.originalException
      if (error && error.message) {
        // Ignore specific server errors
        if (error.message.includes('ECONNRESET')) {
          return null
        }
      }
    }
    
    return event
  }
})
