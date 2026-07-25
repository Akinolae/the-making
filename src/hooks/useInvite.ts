import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Guest } from '../types/guest';

export function useInvite(slug: string | null) {
  const { data: guest, isLoading, error } = useQuery<Guest | null>({
    queryKey: ['invite', slug],
    queryFn: async () => {
      if (!slug) return null;
      const q = query(
        collection(db, 'guests'),
        where('slug', '==', slug.toLowerCase()),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error('Invitation not found');
      }
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        inviteUrl: `/invite?invite=${data.slug}`,
      } as Guest;
    },
    enabled: !!slug,
    retry: false,
  });

  return { guest, isLoading, error };
}
