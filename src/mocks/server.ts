import { setupServer } from 'msw'
import { handlers } from './handlers'

// Setup MSW server with our request handlers
export const server = setupServer(...handlers)