import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import type {
  Attendee,
  AttendeeInput,
  AttendeeFilter,
  AttendeeStats,
} from "../types/attendee";

// Helper to resolve guestRef details from a guest map
const resolveGuestRef = (
  guestRefId: string | undefined | null,
  guestMap: Map<string, any>,
) => {
  if (!guestRefId) return null;
  const guest = guestMap.get(guestRefId);
  return guest
    ? { id: guest.id, slug: guest.slug, name: guest.name, role: guest.role }
    : null;
};

export function useAttendees(filters?: AttendeeFilter) {
  const queryClient = useQueryClient();

  const {
    data: attendees,
    isLoading,
    error,
  } = useQuery<Attendee[]>({
    queryKey: ["attendees", filters],
    queryFn: async () => {
      // 1. Fetch all guests to build a lookup Map
      const guestsSnap = await getDocs(collection(db, "guests"));
      const guestMap = new Map(
        guestsSnap.docs.map((g) => [g.id, { id: g.id, ...g.data() }]),
      );

      // 2. Fetch all attendees
      const attendeesSnap = await getDocs(collection(db, "attendees"));
      let results = attendeesSnap.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          guestRef: resolveGuestRef(data.guestRef, guestMap),
        } as Attendee;
      });

      // 3. Filter in memory for maximum robustness & zero composite index requirements
      if (filters?.rsvpStatus) {
        results = results.filter((a) => a.rsvpStatus === filters.rsvpStatus);
      }
      if (filters?.gender) {
        results = results.filter((a) => a.gender === filters.gender);
      }
      if (filters?.category) {
        results = results.filter((a) => a.category === filters.category);
      }
      if (filters?.search) {
        const term = filters.search.toLowerCase();
        results = results.filter((a) => a.name?.toLowerCase().includes(term));
      }

      // Sort by createdAt desc in memory
      results.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      return results;
    },
  });

  const { data: stats } = useQuery<AttendeeStats>({
    queryKey: ["attendee-stats"],
    queryFn: async () => {
      const attendeesSnap = await getDocs(collection(db, "attendees"));
      const docs = attendeesSnap.docs.map((d) => d.data());

      const total = docs.length;
      let confirmed = 0;
      let declined = 0;
      let pending = 0;
      let maybe = 0;

      const genderCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};

      docs.forEach((data: any) => {
        const status = data.rsvpStatus;
        if (status === "confirmed") confirmed++;
        else if (status === "declined") declined++;
        else if (status === "pending") pending++;
        else if (status === "maybe") maybe++;

        const gender = data.gender || "other";
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;

        const category = data.category || "friend";
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      const byGender = Object.entries(genderCounts).map(([gender, count]) => ({
        gender,
        count,
      }));
      const byCategory = Object.entries(categoryCounts).map(
        ([category, count]) => ({ category, count }),
      );

      return {
        total,
        confirmed,
        declined,
        pending,
        maybe,
        byGender,
        byCategory,
      };
    },
  });

  const createAttendee = useMutation({
    mutationFn: async (input: AttendeeInput) => {
      const payload: any = {
        ...input,
        addedBy: auth.currentUser?.uid || "anonymous",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Resolve guestRef if guestSlug is provided
      if (input.guestSlug) {
        const guestQ = query(
          collection(db, "guests"),
          where("slug", "==", input.guestSlug.toLowerCase()),
          limit(1),
        );
        const guestSnap = await getDocs(guestQ);
        if (!guestSnap.empty) {
          payload.guestRef = guestSnap.docs[0].id;
        }
        delete payload.guestSlug;
      }

      const docRef = await addDoc(collection(db, "attendees"), payload);
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() } as Attendee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
      queryClient.invalidateQueries({ queryKey: ["attendee-stats"] });
    },
  });

  const bulkCreateAttendees = useMutation({
    mutationFn: async (attendeesList: AttendeeInput[]) => {
      // 1. Gather all unique slugs
      const slugs = attendeesList
        .map((a) => a.guestSlug)
        .filter((slug): slug is string => !!slug);

      const guestMap = new Map<string, string>();
      if (slugs.length > 0) {
        const uniqueSlugs = Array.from(
          new Set(slugs.map((s) => s.toLowerCase())),
        );
        const guestQ = query(
          collection(db, "guests"),
          where("slug", "in", uniqueSlugs),
        );
        const guestSnap = await getDocs(guestQ);
        guestSnap.docs.forEach((g) => {
          guestMap.set(g.data().slug.toLowerCase(), g.id);
        });
      }

      // 2. Perform Firestore batch writes
      const batch = writeBatch(db);
      const createdAttendeeRefs: any[] = [];

      attendeesList.forEach((data) => {
        const payload: any = {
          ...data,
          addedBy: auth.currentUser?.uid || "anonymous",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (payload.guestSlug) {
          const guestId = guestMap.get(payload.guestSlug.toLowerCase());
          if (guestId) {
            payload.guestRef = guestId;
          }
          delete payload.guestSlug;
        }

        const docRef = doc(collection(db, "attendees"));
        batch.set(docRef, payload);
        createdAttendeeRefs.push(docRef);
      });

      await batch.commit();

      // Return a basic success confirmation array
      return createdAttendeeRefs.map((ref) => ({ id: ref.id }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
      queryClient.invalidateQueries({ queryKey: ["attendee-stats"] });
    },
  });

  const updateAttendee = useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<AttendeeInput>;
    }) => {
      const payload: any = {
        ...input,
        updatedAt: new Date().toISOString(),
      };

      if (payload.guestSlug) {
        const guestQ = query(
          collection(db, "guests"),
          where("slug", "==", payload.guestSlug.toLowerCase()),
          limit(1),
        );
        const guestSnap = await getDocs(guestQ);
        if (!guestSnap.empty) {
          payload.guestRef = guestSnap.docs[0].id;
        }
        delete payload.guestSlug;
      }

      const docRef = doc(db, "attendees", id);
      await updateDoc(docRef, payload);
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() } as Attendee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
      queryClient.invalidateQueries({ queryKey: ["attendee-stats"] });
    },
  });

  const deleteAttendee = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "attendees", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
      queryClient.invalidateQueries({ queryKey: ["attendee-stats"] });
    },
  });

  return {
    attendees,
    stats,
    isLoading,
    error,
    createAttendee,
    bulkCreateAttendees,
    updateAttendee,
    deleteAttendee,
  };
}
