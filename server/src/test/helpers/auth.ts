import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-must-be-at-least-32-chars!!'

export interface TestTokenPayload {
  sub: string
  email: string
  role: string
}

/** Create a short-lived JWT that Fastify JWT plugin will accept in test requests. */
export const signTestToken = (payload: TestTokenPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: '1h' })

export const TEST_USER: TestTokenPayload = {
  sub: 'cltest0000000000000user001',
  email: 'testuser@college.edu',
  role: 'STUDENT',
}
