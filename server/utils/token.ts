import jwt from 'jsonwebtoken';
import env from '../config/env';

export function signAccessToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY as string | number | undefined,
  });
}

export function signRefreshToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as string | number | undefined,
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & { userId?: string; email?: string; role?: string };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload & { userId?: string; email?: string; role?: string };
}

