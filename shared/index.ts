import { z } from 'zod';

export const GenderEnum = z.enum(['male', 'female', 'other', 'prefer-not-to-say']);
export type Gender = z.infer<typeof GenderEnum>;

export const GuestRoleEnum = z.enum([
  'Bridesmaid',
  'Groomsman',
  'Asoebi Lady',
  'Asoebi Gentleman',
  'Guest',
  'Family',
  'VIP',
]);
export type GuestRole = z.infer<typeof GuestRoleEnum>;

export const GuestInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: GenderEnum.optional().default('other'),
  slug: z.string().optional(),
  title: z.string().optional().default(''),
  role: GuestRoleEnum.default('Guest'),
  message: z.string().min(1, 'Message is required'),
});

export const AttendeeCategoryEnum = z.enum([
  'family',
  'friend',
  'colleague',
  'plus-one',
  'vendor',
  'other',
]);
export type AttendeeCategory = z.infer<typeof AttendeeCategoryEnum>;

export const RsvpStatusEnum = z.enum(['pending', 'confirmed', 'declined', 'maybe']);
export type RsvpStatus = z.infer<typeof RsvpStatusEnum>;

export const AttendeeInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: GenderEnum,
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  category: AttendeeCategoryEnum.optional().default('friend'),
  guestSlug: z.string().optional(),
  rsvpStatus: RsvpStatusEnum.optional().default('pending'),
  plusOnes: z.number().int().min(0).optional().default(0),
  dietaryNotes: z.string().optional().default(''),
  tableNumber: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const SignUpSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const SignInSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});
