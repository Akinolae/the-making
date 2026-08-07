/**
 * Admin registry: maps each registered admin account to the WhatsApp
 * contact that should receive RSVP replies for the guests they invite.
 *
 * Routing is based on WHO invited the guest (the owning admin), NOT the
 * guest's gender. Glory has male friends, but replies to guests she invites
 * must still go to Glory.
 *
 * NOTE: makindeakinola22@gmail.com and olamideakinola540@gmail.com are the
 * same person (Akin), so both map to the same Akin WhatsApp number.
 */
export interface AdminProfile {
  email: string;
  key: "glory" | "akin";
  name: string;
  /** Digits only, including country code, no '+' (e.g. 2348111219577). */
  whatsapp: string;
}

export const ADMINS: AdminProfile[] = [
  {
    email: "gloryadugbo@gmail.com",
    key: "glory",
    name: "Glory",
    whatsapp: import.meta.env.VITE_GLORY,
  },
  {
    email: "makindeakinola22@gmail.com",
    key: "akin",
    name: "Akinola",
    whatsapp: import.meta.env.VITE_AKIN,
  },
  {
    email: "olamideakinola540@gmail.com",
    key: "akin",
    name: "Akinola",
    whatsapp: import.meta.env.VITE_AKIN,
  },
];

/**
 * Find the admin profile matching an account email (case-insensitive).
 * Both of Akin's accounts resolve to the same "akin" profile.
 */
export function getAdminByEmail(
  email?: string | null,
): AdminProfile | undefined {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  return ADMINS.find((admin) => admin.email.toLowerCase() === normalized);
}

/**
 * Fallback for legacy guests created before owner-tagging existed.
 * Preserves the old gender heuristic so behaviour is unchanged for them
 * until they are backfilled.
 */
export function getFallbackWhatsapp(gender: string): string {
  return gender === "female"
    ? import.meta.env.VITE_GLORY
    : import.meta.env.VITE_AKIN;
}

/**
 * Format a digits-only international number for display, e.g.
 * 2348111219577 → "+234 811 121 9577".
 */
export function formatWhatsapp(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.length !== 13 || !digits.startsWith("234")) {
    return `+${digits}`;
  }
  const cc = digits.slice(0, 3); // 234
  const rest = digits.slice(3); // 10 digits → 3-3-4
  return `+${cc} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
}
