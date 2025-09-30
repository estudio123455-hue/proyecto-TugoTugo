import { useSession } from 'next-auth/react'
import { getCleanUserName } from '@/lib/user-utils'
import { useEffect } from 'react'

export function useCleanSession() {
  const { data: session, status, update } = useSession()
  
  // Auto-clean names in background when session loads
  useEffect(() => {
    if (session?.user?.name?.startsWith('VERIFY:')) {
      // Trigger background cleaning
      fetch('/api/auth/auto-clean-names', { method: 'GET' })
        .then(() => {
          // Update session after cleaning
          update()
        })
        .catch(error => {
          console.log('Background cleaning failed:', error)
        })
    }
  }, [session?.user?.name, update])
  
  if (!session?.user) {
    return { data: session, status, update }
  }

  // Clean the user name if it contains verification data
  const cleanSession = {
    ...session,
    user: {
      ...session.user,
      name: getCleanUserName(session.user.name)
    }
  }

  return { 
    data: cleanSession, 
    status, 
    update 
  }
}
