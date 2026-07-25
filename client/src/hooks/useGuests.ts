import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { slugify } from '../lib/utils';
import type { Guest, GuestInput } from '../types/guest';
import { sileo } from 'sileo';

export function useGuests() {
  const queryClient = useQueryClient();

  const { data: guests, isLoading, error } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: async () => {
      const q = query(collection(db, 'guests'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          inviteUrl: `/invite?invite=${data.slug}`,
        } as Guest;
      });
    },
  });

  const createGuest = useMutation({
    mutationFn: async (input: GuestInput) => {
      const slug = input.slug || slugify(input.name);
      
      // Check slug uniqueness
      const q = query(collection(db, 'guests'), where('slug', '==', slug.toLowerCase()), limit(1));
      const existing = await getDocs(q);
      if (!existing.empty) {
        throw new Error(`A guest with slug "${slug}" already exists`);
      }

      const newGuest = {
        ...input,
        slug: slug.toLowerCase(),
        createdBy: auth.currentUser?.uid || 'anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'guests'), newGuest);
      return {
        id: docRef.id,
        ...newGuest,
        inviteUrl: `/invite?invite=${newGuest.slug}`,
      } as Guest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      sileo.success({
        title: 'Guest Created',
        description: `${data.name} has been added successfully.`,
      });
    },
    onError: (err: any) => {
      sileo.error({
        title: 'Failed to Create Guest',
        description: err.message,
      });
    },
  });

  const updateGuest = useMutation({
    mutationFn: async ({ slug, input }: { slug: string; input: Partial<GuestInput> }) => {
      // Find guest document by current slug
      const q = query(collection(db, 'guests'), where('slug', '==', slug.toLowerCase()), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error('Guest not found');
      }
      const docRef = snapshot.docs[0].ref;
      const currentData = snapshot.docs[0].data();

      // If slug is changing, check uniqueness
      let newSlug = slug;
      if (input.slug && input.slug.toLowerCase() !== slug.toLowerCase()) {
        newSlug = input.slug.toLowerCase();
        const dupQ = query(collection(db, 'guests'), where('slug', '==', newSlug), limit(1));
        const dupSnap = await getDocs(dupQ);
        if (!dupSnap.empty) {
          throw new Error(`A guest with slug "${newSlug}" already exists`);
        }
      }

      const updatePayload = {
        ...input,
        slug: newSlug,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, updatePayload);
      return {
        id: docRef.id,
        ...currentData,
        ...updatePayload,
        inviteUrl: `/invite?invite=${newSlug}`,
      } as Guest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      sileo.success({
        title: 'Guest Updated',
        description: `${data.name} has been updated successfully.`,
      });
    },
    onError: (err: any) => {
      sileo.error({
        title: 'Failed to Update Guest',
        description: err.message,
      });
    },
  });

  const deleteGuest = useMutation({
    mutationFn: async (slug: string) => {
      const q = query(collection(db, 'guests'), where('slug', '==', slug.toLowerCase()), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error('Guest not found');
      }
      const docRef = snapshot.docs[0].ref;
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      sileo.success({
        title: 'Guest Deleted',
        description: `Guest has been deleted successfully.`,
      });
    },
    onError: (err: any) => {
      sileo.error({
        title: 'Failed to Delete Guest',
        description: err.message,
      });
    },
  });

  return { guests, isLoading, error, createGuest, updateGuest, deleteGuest };
}
