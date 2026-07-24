import { Router } from 'express';
import * as inviteService from '../services/invite.service';

const router = Router();

router.get('/:slug', async (req, res, next) => {
  try {
    const invite = await inviteService.getPublicInvite(req.params.slug);
    res.json(invite);
  } catch (error) {
    next(error);
  }
});

export default router;
