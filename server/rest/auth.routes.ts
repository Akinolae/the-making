import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as authService from '../services/auth.service';
import { validateBody } from '../middleware/validation.middleware';
import { SignUpSchema, SignInSchema } from '../../shared';

const router = Router();

// ─── Firebase Auth Session (new) ───
// The client authenticates with Firebase Auth SDK then exchanges
// the ID token for a server-issued JWT session.

router.post('/session', async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: { message: 'Firebase ID token is required' } });
    }
    const result = await authService.createSession(idToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ─── Legacy email/password auth (kept for backward compatibility) ───

router.post('/signup', validateBody(SignUpSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.signUp(email, password);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/signin', validateBody(SignInSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.signIn(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: { message: 'Refresh token is required' } });
    }
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
