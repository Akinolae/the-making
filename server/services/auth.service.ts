import db, { firebaseAuth } from '../config/db';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token';
import { AppError, UnauthorizedError, NotFoundError } from '../utils/errors';
import bcrypt from 'bcryptjs';

// ══════════════════════════════════════════════════════════════
// Firebase Auth Session (new flow)
// ══════════════════════════════════════════════════════════════

/**
 * Exchange a Firebase ID token for a server-issued JWT session.
 * Finds or creates a Firestore user document keyed by Firebase UID.
 */
export async function createSession(idToken: string) {
  try {
    // 1. Verify the Firebase ID token
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    const { uid, email } = decoded;

    // 2. Find or create the user document in Firestore
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    let user: { id: string; email: string; role: string };

    if (!userDoc.exists) {
      // First-time Firebase user — create Firestore record
      const newUser = {
        email: (email || '').toLowerCase(),
        role: 'admin',
        firebaseUid: uid,
        createdAt: new Date().toISOString(),
        lastSignIn: new Date().toISOString(),
      };
      await userRef.set(newUser);
      user = { id: uid, email: newUser.email, role: newUser.role };
    } else {
      const userData = userDoc.data()!;
      // Update last sign-in
      await userRef.update({ lastSignIn: new Date().toISOString() });
      user = {
        id: uid,
        email: userData.email,
        role: userData.role,
      };
    }

    // 3. Issue server-side JWT tokens
    const payload = { userId: user.id, email: user.email, role: user.role };

    return {
      user,
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  } catch (error: any) {
    // Firebase Auth errors (invalid token, expired, etc.)
    if (error.code?.startsWith('auth/') || error.code?.startsWith('firebase/')) {
      throw new UnauthorizedError(error.message || 'Invalid Firebase token');
    }
    // Re-throw operational errors as-is
    if (error.isOperational) throw error;
    // Wrap unexpected errors
    throw new AppError(error.message || 'Session creation failed', 500);
  }
}

// ══════════════════════════════════════════════════════════════
// Legacy email/password auth (kept for backward compatibility)
// ══════════════════════════════════════════════════════════════

export async function signUp(email: string, password: string) {
  const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
  if (!snapshot.empty) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const newUser = {
    email: email.toLowerCase(),
    passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection('users').add(newUser);
  const user = { id: docRef.id, email: newUser.email, role: newUser.role };

  const payload = { userId: user.id, email: user.email, role: user.role };

  return {
    user,
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function signIn(email: string, password: string) {
  const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
  if (snapshot.empty) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const doc = snapshot.docs[0];
  const userData = doc.data();

  const isMatch = await bcrypt.compare(password, userData.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const user = { id: doc.id, email: userData.email, role: userData.role };
  const payload = { userId: user.id, email: user.email, role: user.role };

  return {
    user,
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function refreshToken(token: string) {
  try {
    const decoded = verifyRefreshToken(token) as any;
    const doc = await db.collection('users').doc(decoded.userId).get();
    if (!doc.exists) {
      throw new UnauthorizedError('User not found');
    }

    const userData = doc.data()!;
    const user = { id: doc.id, email: userData.email, role: userData.role };
    const payload = { userId: user.id, email: user.email, role: user.role };

    return {
      user,
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    throw error;
  }
}

export async function getMe(userId: string) {
  const doc = await db.collection('users').doc(userId).get();
  if (!doc.exists) {
    throw new NotFoundError('User');
  }
  const userData = doc.data()!;
  return { id: doc.id, email: userData.email, role: userData.role };
}

