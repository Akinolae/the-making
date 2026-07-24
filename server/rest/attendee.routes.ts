import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import * as attendeeService from '../services/attendee.service';
import { validateBody } from '../middleware/validation.middleware';
import { AttendeeInputSchema } from '../../shared';
import { z } from 'zod';

const router = Router();

// All attendee routes require authentication + admin role
router.use(authenticate, requireAdmin);

const BulkAttendeeSchema = z.object({
  attendees: z.array(AttendeeInputSchema).min(1, 'At least one attendee is required'),
});

router.get('/', async (req, res, next) => {
  try {
    const filters = {
      rsvpStatus: req.query.rsvp,
      gender: req.query.gender,
      category: req.query.category,
      search: req.query.search,
    };
    // Remove undefined keys
    Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

    const attendees = await attendeeService.listAttendees(filters);
    res.json(attendees);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const stats = await attendeeService.getAttendeeStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBody(AttendeeInputSchema), async (req, res, next) => {
  try {
    const { name, gender, email, phone, category, guestSlug, rsvpStatus, plusOnes, dietaryNotes, tableNumber, notes } = req.body;
    const attendee = await attendeeService.createAttendee(
      { name, gender, email, phone, category, guestSlug, rsvpStatus, plusOnes, dietaryNotes, tableNumber, notes },
      req.user.userId
    );
    res.status(201).json(attendee);
  } catch (error) {
    next(error);
  }
});

router.post('/bulk', validateBody(BulkAttendeeSchema), async (req, res, next) => {
  try {
    const { attendees } = req.body;
    const created = await attendeeService.bulkCreateAttendees(attendees, req.user.userId);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateBody(AttendeeInputSchema.partial()), async (req, res, next) => {
  try {
    const attendee = await attendeeService.updateAttendee(req.params.id, req.body);
    res.json(attendee);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await attendeeService.deleteAttendee(req.params.id);
    res.json({ message: 'Attendee deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
