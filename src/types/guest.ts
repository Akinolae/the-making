export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export type GuestRole =
  | 'Bridesmaid'
  | 'Groomsman'
  | 'Asoebi Lady'
  | 'Agbada Gentleman'
  | 'Guest'
  | 'Family'
  | 'VIP';

export interface Guest {
  id: string;
  slug: string;
  name: string;
  gender: Gender;
  title: string;
  role: string;
  message: string;
  /**
   * WhatsApp number (digits only, incl. country code) that should receive
   * this guest's RSVP replies. Set to the number of the admin who invited
   * the guest. Optional so legacy guests fall back to gender-based routing.
   */
  whatsapp?: string;
  inviteUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestInput {
  name: string;
  gender?: Gender;
  slug?: string;
  title?: string;
  role: GuestRole;
  message: string;
}
