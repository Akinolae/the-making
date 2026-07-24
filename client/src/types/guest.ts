export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export type GuestRole =
  | 'Bridesmaid'
  | 'Groomsman'
  | 'Asoebi Lady'
  | 'Asoebi Gentleman'
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
