import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  onAuthChange,
  getErrorMessage,
} from '../lib/auth';
import type { User } from '../types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthChange((fbUser) => {
      setUser(fbUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiSignIn(email, password);
      setUser(payload.user);
      navigate({ to: '/admin' });
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiSignUp(email, password);
      setUser(payload.user);
      navigate({ to: '/admin' });
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setUser(null);
    navigate({ to: '/auth' });
  }, [navigate]);

  return { user, loading, error, signIn, signUp, signOut, isAuthenticated: !!user };
}

