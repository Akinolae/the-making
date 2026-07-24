import { firebaseAuth } from '../config/db';
import { UnauthorizedError } from '../utils/errors';

/**
 * Middleware that verifies a Firebase ID token from the Authorization header.
 * On success, attaches the decoded token to req.user.
 */
export async function authenticateFirebase(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const idToken = authHeader.split(' ')[1];
    const decoded = await firebaseAuth.verifyIdToken(idToken);

    req.user = {
      uid: decoded.uid,
      userId: decoded.uid,
      email: decoded.email || '',
      role: decoded.role || 'admin',
      firebaseAuth: true,
    };

    next();
  } catch (error: any) {
    if (error.name === 'UnauthorizedError' || error.statusCode === 401) {
      next(error);
    } else {
      // Firebase token verification failed (expired, invalid, etc.)
      next(new UnauthorizedError('Invalid or expired Firebase token'));
    }
  }
}

/**
 * Optional middleware — attaches user if a valid Firebase token is present,
 * but does not block the request if missing.
 */
export async function optionalAuthFirebase(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split(' ')[1];
      const decoded = await firebaseAuth.verifyIdToken(idToken);
      req.user = {
        uid: decoded.uid,
        userId: decoded.uid,
        email: decoded.email || '',
        role: decoded.role || 'admin',
        firebaseAuth: true,
      };
    }
    next();
  } catch {
    // Invalid token — just continue without user
    next();
  }
}

