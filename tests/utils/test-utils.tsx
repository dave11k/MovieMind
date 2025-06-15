import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Movie } from '@/types/Movie'

// Mock AuthContext
const AuthContext = React.createContext({
  user: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
})

// Mock AuthContext Provider
interface MockAuthProviderProps {
  children: React.ReactNode
  user?: any
  loading?: boolean
}

const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ 
  children, 
  user = null, 
  loading = false 
}) => {
  const authValue = {
    user,
    loading,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  }

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom render function
interface CustomRenderOptions extends RenderOptions {
  user?: any
  loading?: boolean
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, loading, ...renderOptions } = options

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MockAuthProvider user={user} loading={loading}>
      {children}
    </MockAuthProvider>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Test data factories
export const createMockMovie = (overrides: Partial<Movie> = {}): Movie => ({
  id: 123,
  title: 'Test Movie',
  overview: 'A test movie description',
  poster_path: '/test-poster.jpg',
  backdrop_path: '/test-backdrop.jpg',
  release_date: '2024-01-01',
  vote_average: 7.5,
  genre_ids: [28, 12],
  genres: ['Action', 'Adventure'],
  ...overrides,
})

export const createMockUser = (overrides: any = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

export const createMockMovieList = (count: number = 3): Movie[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockMovie({
      id: 100 + index,
      title: `Test Movie ${index + 1}`,
      vote_average: 7 + (index * 0.5),
    })
  )
}

// Common test helpers
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
  
  return localStorageMock
}

export const mockSupabaseClient = () => {
  return {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    }),
  }
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render }