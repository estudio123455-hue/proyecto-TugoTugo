// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock de Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock de NextAuth
jest.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: null,
      status: 'unauthenticated',
    }
  },
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock de hooks personalizados
jest.mock('@/hooks/useCleanSession', () => ({
  useCleanSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}))

// Mock de user-utils
jest.mock('@/lib/user-utils', () => ({
  getFirstName: jest.fn((name) => name?.split(' ')[0] || ''),
  getUserInitials: jest.fn((name) => name?.split(' ').map(n => n[0]).join('') || ''),
}))

// Mock de ThemeToggle
jest.mock('@/components/ThemeToggle', () => {
  return function ThemeToggle() {
    return <button aria-label="toggle theme">Toggle Theme</button>
  }
})
