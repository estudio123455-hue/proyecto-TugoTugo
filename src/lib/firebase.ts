// TODO: Install firebase package and uncomment
// import { initializeApp, getApps } from 'firebase/app'
// import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
// import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// TODO: Initialize Firebase when package is installed
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
// const db = getFirestore(app)

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null
let app: any = null
let db: any = null

// TODO: Uncomment when Firebase is installed
// if (typeof window !== 'undefined') {
//   isSupported().then((supported: boolean) => {
//     if (supported) {
//       messaging = getMessaging(app)
//     }
//   })
// }

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.log('Firebase messaging not supported')
      return null
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      // TODO: Uncomment when Firebase is installed
      // const token = await getToken(messaging, {
      //   vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      // })
      // console.log('FCM Token:', token)
      // return token
      
      console.log('Firebase not configured - would get FCM token here')
      return 'mock-token-' + Date.now()
    } else {
      console.log('Notification permission denied')
      return null
    }
  } catch (error) {
    console.error('Error getting notification permission:', error)
    return null
  }
}

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return
    
    // TODO: Uncomment when Firebase is installed
    // onMessage(messaging, (payload: any) => {
    //   console.log('Message received in foreground:', payload)
    //   resolve(payload)
    // })
    
    console.log('Firebase not configured - would listen for messages here')
    // Mock resolve for now
    setTimeout(() => resolve({ notification: { title: 'Mock', body: 'Mock message' } }), 1000)
  })

// Save FCM token to user profile
export const saveFCMToken = async (userId: string, token: string) => {
  try {
    const response = await fetch('/api/user/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, token }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to save FCM token')
    }
    
    console.log('FCM token saved successfully')
  } catch (error) {
    console.error('Error saving FCM token:', error)
  }
}

export { app, db, messaging }
