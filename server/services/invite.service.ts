import db from '../config/db';
import { NotFoundError } from '../utils/errors';

export async function getPublicInvite(slug: string) {
  const snapshot = await db.collection('guests').where('slug', '==', slug.toLowerCase()).limit(1).get();
  if (snapshot.empty) {
    throw new NotFoundError('Invitation');
  }
  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    id: doc.id,
    slug: data.slug,
    name: data.name,
    gender: data.gender,
    title: data.title,
    role: data.role,
    message: data.message,
    createdAt: data.createdAt,
    inviteUrl: `/invite?invite=${data.slug}`,
  };
}
