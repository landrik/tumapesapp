import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface AuthTokenPayload extends JwtPayload {
  id: string;
  email?: string;
}

/**
 * Sign a payload into a JWT.
 */
export const sign = (payload: object, options?: SignOptions): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d',
    ...options,
  });
};

/**
 * Verify a JWT and return its decoded payload.
 * Throws if the token is invalid or expired.
 */
export const verify = (token: string): AuthTokenPayload => {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
};
