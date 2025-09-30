// Utility functions for user data handling

// Clean user name from verification data
export function getCleanUserName(name?: string | null): string {
  if (!name) return 'Usuario'
  
  // Check if name contains verification data
  if (name.startsWith('VERIFY:')) {
    // Use regex to remove VERIFY:number:number: pattern
    const cleanName = name.replace(/^VERIFY:\d+:\d+:/, '')
    return cleanName || 'Usuario'
  }
  
  return name
}

// Get first name only
export function getFirstName(name?: string | null): string {
  const cleanName = getCleanUserName(name)
  return cleanName.split(' ')[0] || 'Usuario'
}

// Get user initials for avatar
export function getUserInitials(name?: string | null, email?: string | null): string {
  const cleanName = getCleanUserName(name)
  
  if (cleanName && cleanName !== 'Usuario') {
    return cleanName.charAt(0).toUpperCase()
  }
  
  if (email) {
    return email.charAt(0).toUpperCase()
  }
  
  return 'U'
}
