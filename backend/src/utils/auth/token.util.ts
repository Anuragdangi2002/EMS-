import crypto from 'crypto';

/**
 * Generates a cryptographically secure random token hex string.
 */
export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hashes a plaintext token string using SHA-256, returning a hex string of length 64.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
