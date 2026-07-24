import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { signIn, signUp, getStoredUser, getErrorMessage } from '../lib/auth';
import { sileo } from 'sileo';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to admin
    if (getStoredUser()) {
      navigate({ to: '/admin' });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      navigate({ to: '/admin' });
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err);
      setError(errMsg);
      sileo.error({
        title: 'Authentication Error',
        description: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-blush px-6">
      <div className="w-full max-w-sm rounded-2xl bg-cream p-8 shadow-paper">
        <h1 className="font-display text-3xl text-burgundy">Admin</h1>
        <p className="mt-1 text-sm text-ink/60">
          {mode === 'signin' ? 'Sign in to manage guests.' : 'Create your admin account.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-burgundy py-3 font-medium text-cream disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
          }}
          className="mt-4 w-full text-center text-xs text-burgundy/70 underline"
        >
          {mode === 'signin'
            ? 'Need to create the admin account?'
            : 'Already have an account?'}
        </button>
      </div>
    </div>
  );
}
