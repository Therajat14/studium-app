import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/test/**',
        'src/**/__tests__/**',
        'src/server.ts',
        'src/workers/**',
        'src/config/socket.ts',
        'src/config/redis.ts',
        'src/config/queues/**',
      ],
      reporter: ['text', 'json', 'html'],
      thresholds: { lines: 50, functions: 50 },
    },
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:1234@localhost:5432/studium_test',
      JWT_SECRET: 'test-jwt-secret-must-be-at-least-32-chars!!',
      JWT_ACCESS_EXPIRY: '15m',
      JWT_REFRESH_EXPIRY: '7d',
      BCRYPT_SALT_ROUNDS: '10',
      REDIS_URL: 'redis://localhost:6379',
      CORS_ORIGIN: 'http://localhost:5173',
    },
  },
})
