import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import * as guestService from '../services/guest.service';
import { validateBody } from '../middleware/validation.middleware';
import { GuestInputSchema } from '../../shared';

const router = Router();

// All guest routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const guests = await guestService.listGuests();
    res.json(guests);
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBody(GuestInputSchema), async (req, res, next) => {
  try {
    const { name, gender, title, role, message, slug } = req.body;
    const guest = await guestService.createGuest(
      { name, gender, title, role, message, slug },
      req.user.userId
    );
    res.status(201).json(guest);
  } catch (error) {
    next(error);
  }
});

router.put('/:slug', validateBody(GuestInputSchema.partial()), async (req, res, next) => {
  try {
    const guest = await guestService.updateGuest(req.params.slug, req.body);
    res.json(guest);
  } catch (error) {
    next(error);
  }
});

router.delete('/:slug', async (req, res, next) => {
  try {
    await guestService.deleteGuest(req.params.slug);
    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
