import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';
import type { AuthPayload, User } from '../types/auth';

// ─── Error formatting ───

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/configuration-not-found':
    'Authentication is not configured. Please enable Email/Password in Firebase Console.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/internal-error': 'Something went wrong. Please try again.',
};

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const firebaseErr = err as { code: string; message?: string };
    return FIREBASE_ERROR_MESSAGES[firebaseErr.code] || firebaseErr.message || 'Authentication failed';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

// ─── Firebase user → our User type ───

function mapFirebaseUser(fbUser: FirebaseUser | null): User | null {
  if (!fbUser) return null;
  return {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    role: 'admin', // Any logged in user in this admin app has admin access
  };
}

// ─── State management ───

type AuthListener = (user: User | null) => void;
const listeners = new Set<AuthListener>();
let currentUser: User | null = mapFirebaseUser(auth.currentUser);

export function onAuthChange(listener: AuthListener): () => void {
  listeners.add(listener);
  const current = getStoredUser();
  if (current) listener(current);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(user: User | null) {
  currentUser = user;
  listeners.forEach((fn) => fn(user));
}

// Subscribe once to Firebase auth state
onAuthStateChanged(auth, async (fbUser) => {
  const user = mapFirebaseUser(fbUser);
  currentUser = user;
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
  notifyListeners(user);
});

// ─── Token management ───

export async function getAccessToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await getIdToken(user, false);
  } catch {
    return null;
  }
}

export function getStoredUser(): User | null {
  if (currentUser) return currentUser;
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
  return null;
}

// ─── Auth actions ───

export async function signIn(email: string, password: string): Promise<AuthPayload> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await getIdToken(userCredential.user);
  const user: User = {
    id: userCredential.user.uid,
    email: userCredential.user.email ?? '',
    role: 'admin',
  };
  const payload: AuthPayload = {
    user,
    accessToken: idToken,
    refreshToken: userCredential.user.refreshToken,
  };
  storeAuth(payload);
  notifyListeners(user);
  return payload;
}

export async function signUp(email: string, password: string): Promise<AuthPayload> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await getIdToken(userCredential.user);
  const user: User = {
    id: userCredential.user.uid,
    email: userCredential.user.email ?? '',
    role: 'admin',
  };
  const payload: AuthPayload = {
    user,
    accessToken: idToken,
    refreshToken: userCredential.user.refreshToken,
  };
  storeAuth(payload);
  notifyListeners(user);
  return payload;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  clearAuth();
  notifyListeners(null);
}

// ─── Storage helpers ───

let storedAccessToken: string | null = null;
let storedRefreshToken: string | null = null;

export function storeAuth(payload: AuthPayload) {
  storedAccessToken = payload.accessToken;
  storedRefreshToken = payload.refreshToken;
  localStorage.setItem('user', JSON.stringify(payload.user));
}

export function clearAuth() {
  storedAccessToken = null;
  storedRefreshToken = null;
  localStorage.removeItem('user');
}

export function getStoredAccessToken(): string | null {
  return storedAccessToken;
}

export function getStoredRefreshToken(): string | null {
  return storedRefreshToken;
}

export { getErrorMessage };
