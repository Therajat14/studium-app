import '@testing-library/jest-dom'
import { server } from './mocks/server.js'
import { afterAll, afterEach, beforeAll } from 'vitest'

// Start MSW request interceptor before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset handler overrides between tests
afterEach(() => server.resetHandlers())

// Clean up after all tests in this file
afterAll(() => server.close())

// Suppress noisy console.error calls from React in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('ReactDOM.render'))
    ) {
      return
    }
    originalError(...args)
  }
})
afterAll(() => { console.error = originalError })
