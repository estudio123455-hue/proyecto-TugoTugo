import { useSession } from 'next-auth/react'
import { getCleanUserName } from '@/lib/user-utils'

export function useCleanSession() {
  const { data: session, status, update } = useSession()
  
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
