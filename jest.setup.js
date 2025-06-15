import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Polyfills for MSW
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// TODO: Enable MSW server later
// import { server } from './src/mocks/server'

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
})

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({
        error: null,
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
  })),
}))

// Mock TMDB API
jest.mock('@/lib/tmdb', () => ({
  tmdbAPI: {
    searchMovie: jest.fn().mockResolvedValue({
      results: [],
      total_pages: 0,
    }),
    getMovieDetails: jest.fn().mockResolvedValue({
      id: 123,
      title: 'Test Movie',
      external_ids: { imdb_id: 'tt1234567' },
    }),
  },
  genreMap: {
    28: 'Action',
    12: 'Adventure',
    35: 'Comedy',
  },
  getMovieDetails: jest.fn().mockResolvedValue({
    id: 123,
    title: 'Test Movie',
    external_ids: { imdb_id: 'tt1234567' },
  }),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const { fill, sizes, ...imgProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imgProps} />
  },
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  })),
  AuthProvider: ({ children }) => children,
}))

// Mock environment variables
process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test_tmdb_key'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test_supabase_anon_key'
process.env.OPENAI_API_KEY = 'test_openai_key'

// TODO: Enable MSW server later
// beforeAll(() => {
//   server.listen({
//     onUnhandledRequest: 'error',
//   })
// })

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  // server.resetHandlers()
  // Clean up any test state
  jest.clearAllMocks()
})

// TODO: Enable MSW server later
// afterAll(() => {
//   server.close()
// })

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  waitForAsync: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Helper to create mock movie data
  createMockMovie: (overrides = {}) => ({
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
  }),
  
  // Helper to create mock user data
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    email_confirmed_at: '2024-01-01T00:00:00.000Z',
    created_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }),
}