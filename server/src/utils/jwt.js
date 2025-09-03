import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY;

/**
 * Signs a new JWT.
 * @param {object} payload - The data you want to store in the token.
 * @returns {string} The signed JWT.
 */
export function signToken(payload) {
  if (!SECRET_KEY || !TOKEN_EXPIRY) {
    throw new Error(
      "SECRET_KEY or TOKEN_EXPIRY is not defined in the environment variables."
    );
  }
  return jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {object|null} The decoded payload if the token is valid, otherwise null.
 */
export function verifyToken(token) {
  if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined in the environment variables.");
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
}
