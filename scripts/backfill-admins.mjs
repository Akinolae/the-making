/**
 * One-off backfill: add a `whatsapp` field to existing guest documents whose
 * creator (createdBy UID) can be matched to a registered admin.
 *
 * New guests are tagged automatically at creation time in useGuests.ts, so
 * this is only needed to fix guests that were created BEFORE that change.
 *
 * Requires the Firebase Admin SDK and a service-account credential:
 *   npm i -D firebase-admin
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/backfill-admins.mjs
 */
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Same registry as src/lib/admins.ts (kept dependency-free for the script).
const ADMIN_EMAILS = new Set([
  'gloryadugbo@gmail.com',
  'makindeakinola22@gmail.com',
  'olamideakinola540@gmail.com',
]);

const WHATSAPP_BY_EMAIL = {
  'gloryadugbo@gmail.com': '2348111219577', // Glory (VITE_GLORY)
  'makindeakinola22@gmail.com': '2348106683185', // Akin (VITE_AKIN)
  'olamideakinola540@gmail.com': '2348106683185', // Akin (VITE_AKIN)
};

async function main() {
  let app;
  try {
    app = initializeApp({
      credential: applicationDefault(),
    });
  } catch {
    // Fall back to an explicit service account file if provided.
    const { GOOGLE_APPLICATION_CREDENTIALS } = process.env;
    if (GOOGLE_APPLICATION_CREDENTIALS) {
      app = initializeApp({ credential: cert(GOOGLE_APPLICATION_CREDENTIALS) });
    } else {
      throw new Error(
        'Provide a service account via GOOGLE_APPLICATION_CREDENTIALS or ADC.',
      );
    }
  }

  const db = getFirestore(app);
  const auth = getAuth(app);

  const guestsSnap = await db.collection('guests').get();

  // Cache UID → whatsapp lookups so we only hit the auth API once per admin.
  const uidWhatsappCache = new Map();

  let updated = 0;
  let skipped = 0;

  for (const doc of guestsSnap.docs) {
    const data = doc.data();
    if (data.whatsapp) {
      skipped++; // already tagged
      continue;
    }

    const uid = data.createdBy;
    if (!uid || uid === 'anonymous') {
      skipped++;
      continue;
    }

    // Resolve this creator UID's whatsapp (cached per UID).
    if (!uidWhatsappCache.has(uid)) {
      let email = null;
      try {
        const user = await auth.getUser(uid);
        email = user.email?.toLowerCase() ?? null;
      } catch {
        // Unknown/deleted user — cannot resolve.
      }
      const whatsapp =
        email && WHATSAPP_BY_EMAIL[email] ? WHATSAPP_BY_EMAIL[email] : null;
      uidWhatsappCache.set(uid, whatsapp);
    }

    const whatsapp = uidWhatsappCache.get(uid);
    if (!whatsapp) {
      skipped++;
      continue;
    }

    await doc.ref.set({ whatsapp }, { merge: true });
    updated++;
    console.log(`Tagged ${data.name ?? doc.id} → ${whatsapp}`);
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
