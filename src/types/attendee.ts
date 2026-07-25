import type { Gender } from './guest';

export type AttendeeCategory = 'family' | 'friend' | 'colleague' | 'plus-one' | 'vendor' | 'other';
export type RsvpStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

export interface Attendee {
  id: string;
  name: string;
  gender: Gender;
  email: string;
  phone: string;
  category: AttendeeCategory;
  guestRef?: { id: string; slug: string; name: string } | null;
  rsvpStatus: RsvpStatus;
  plusOnes: number;
  dietaryNotes: string;
  tableNumber: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendeeInput {
  name: string;
  gender: Gender;
  email?: string;
  phone?: string;
  category?: AttendeeCategory;
  guestSlug?: string;
  rsvpStatus?: RsvpStatus;
  plusOnes?: number;
  dietaryNotes?: string;
  tableNumber?: string;
  notes?: string;
}

export interface AttendeeStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  maybe: number;
  byGender: { gender: string; count: number }[];
  byCategory: { category: string; count: number }[];
}

export interface AttendeeFilter {
  rsvpStatus?: RsvpStatus;
  gender?: Gender;
  category?: AttendeeCategory;
  search?: string;
}
