import db from '../config/db';
import { slugify } from '../utils/slugify';
import { NotFoundError, AppError } from '../utils/errors';

const mapGuestDoc = (doc: any) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    inviteUrl: `/invite?invite=${data.slug}`,
  };
};

export async function listGuests() {
  const snapshot = await db.collection('guests').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(mapGuestDoc);
}

export async function getGuestBySlug(slug: string) {
  const snapshot = await db.collection('guests').where('slug', '==', slug.toLowerCase()).limit(1).get();
  if (snapshot.empty) {
    throw new NotFoundError('Guest');
  }
  return mapGuestDoc(snapshot.docs[0]);
}

export async function createGuest(data: any, userId: string) {
  const slug = data.slug || slugify(data.name);

  const snapshot = await db.collection('guests').where('slug', '==', slug.toLowerCase()).limit(1).get();
  if (!snapshot.empty) {
    throw new AppError(`A guest with slug "${slug}" already exists`, 409);
  }

  const newGuest = {
    ...data,
    slug: slug.toLowerCase(),
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await db.collection('guests').add(newGuest);
  const doc = await docRef.get();
  return mapGuestDoc(doc);
}

export async function updateGuest(slug: string, data: any) {
  const snapshot = await db.collection('guests').where('slug', '==', slug.toLowerCase()).limit(1).get();
  if (snapshot.empty) {
    throw new NotFoundError('Guest');
  }

  const doc = snapshot.docs[0];

  // If changing slug, check for uniqueness
  if (data.slug && data.slug.toLowerCase() !== slug.toLowerCase()) {
    const existingSnapshot = await db.collection('guests').where('slug', '==', data.slug.toLowerCase()).limit(1).get();
    if (!existingSnapshot.empty) {
      throw new AppError(`A guest with slug "${data.slug}" already exists`, 409);
    }
  }

  const updatePayload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  if (updatePayload.slug) {
    updatePayload.slug = updatePayload.slug.toLowerCase();
  }

  await doc.ref.update(updatePayload);
  const updatedDoc = await doc.ref.get();
  return mapGuestDoc(updatedDoc);
}

export async function deleteGuest(slug: string) {
  const snapshot = await db.collection('guests').where('slug', '==', slug.toLowerCase()).limit(1).get();
  if (snapshot.empty) {
    throw new NotFoundError('Guest');
  }
  const doc = snapshot.docs[0];
  const guestData = mapGuestDoc(doc);
  await doc.ref.delete();
  return guestData;
}
