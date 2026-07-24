import db from '../config/db';
import { NotFoundError } from '../utils/errors';
import { FieldPath } from 'firebase-admin/firestore';

const mapAttendeeDoc = (doc: any) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  };
};

export async function listAttendees(filters: any = {}) {
  const snapshot = await db.collection('attendees').get();
  let results = snapshot.docs.map(mapAttendeeDoc);

  // Filter in memory for maximum robustness & zero composite index requirements
  if (filters.rsvpStatus) {
    results = results.filter((a: any) => a.rsvpStatus === filters.rsvpStatus);
  }
  if (filters.gender) {
    results = results.filter((a: any) => a.gender === filters.gender);
  }
  if (filters.category) {
    results = results.filter((a: any) => a.category === filters.category);
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    results = results.filter((a: any) => a.name?.toLowerCase().includes(term));
  }

  // Populate guestRef details manually if guestRef exists
  const guestIds = results
    .map((a: any) => a.guestRef)
    .filter((ref): ref is string => !!ref);

  if (guestIds.length > 0) {
    const uniqueGuestIds = Array.from(new Set(guestIds));
    const guestDocs: any[] = [];
    const chunkSize = 30;

    for (let i = 0; i < uniqueGuestIds.length; i += chunkSize) {
      const chunk = uniqueGuestIds.slice(i, i + chunkSize);
      const guestSnap = await db.collection('guests').where(FieldPath.documentId(), 'in', chunk).get();
      guestDocs.push(...guestSnap.docs);
    }

    const guestMap = new Map(guestDocs.map(g => [g.id, { id: g.id, ...g.data() }]));
    results = results.map((a: any) => {
      if (a.guestRef) {
        const g: any = guestMap.get(a.guestRef);
        if (g) {
          a.guestRef = { id: g.id, slug: g.slug, name: g.name, role: g.role };
        } else {
          a.guestRef = null;
        }
      }
      return a;
    });
  }

  // Sort by createdAt desc in memory
  results.sort((a: any, b: any) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  // Handle pagination in memory
  if (filters.page && filters.limit) {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 50;
    const skip = (page - 1) * limit;
    results = results.slice(skip, skip + limit);
  }

  return results;
}

export async function getAttendeeById(id: string) {
  const doc = await db.collection('attendees').doc(id).get();
  if (!doc.exists) {
    throw new NotFoundError('Attendee');
  }
  
  const attendeeData = { id: doc.id, ...doc.data()! } as any;
  if (attendeeData.guestRef) {
    const guestDoc = await db.collection('guests').doc(attendeeData.guestRef).get();
    if (guestDoc.exists) {
      const g = guestDoc.data()!;
      attendeeData.guestRef = { id: guestDoc.id, slug: g.slug, name: g.name, role: g.role };
    } else {
      attendeeData.guestRef = null;
    }
  }
  return attendeeData;
}

export async function createAttendee(data: any, userId: string) {
  // Resolve guestRef if guestSlug is provided
  if (data.guestSlug) {
    const guestSnap = await db.collection('guests').where('slug', '==', data.guestSlug.toLowerCase()).limit(1).get();
    if (!guestSnap.empty) {
      data.guestRef = guestSnap.docs[0].id;
    }
    delete data.guestSlug;
  }

  const newAttendee = {
    ...data,
    addedBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await db.collection('attendees').add(newAttendee);
  return getAttendeeById(docRef.id);
}

export async function bulkCreateAttendees(attendeesList: any[], userId: string) {
  // 1. Gather all unique slugs
  const slugs = attendeesList
    .map((a: any) => a.guestSlug)
    .filter((slug): slug is string => !!slug);

  const guestMap = new Map<string, string>();
  if (slugs.length > 0) {
    const uniqueSlugs = Array.from(new Set(slugs.map(s => s.toLowerCase())));
    const guestDocs: any[] = [];
    const chunkSize = 30;

    for (let i = 0; i < uniqueSlugs.length; i += chunkSize) {
      const chunk = uniqueSlugs.slice(i, i + chunkSize);
      const guestSnap = await db.collection('guests').where('slug', 'in', chunk).get();
      guestDocs.push(...guestSnap.docs);
    }
    guestDocs.forEach(g => {
      guestMap.set(g.data().slug.toLowerCase(), g.id);
    });
  }

  // 2. Perform Firestore batch writes
  const batch = db.batch();
  const createdAttendeeIds: string[] = [];

  attendeesList.forEach((data: any) => {
    const payload = {
      ...data,
      addedBy: userId,
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

    const docRef = db.collection('attendees').doc();
    batch.set(docRef, payload);
    createdAttendeeIds.push(docRef.id);
  });

  await batch.commit();

  // 3. Fetch and return created populated documents
  return Promise.all(createdAttendeeIds.map(id => getAttendeeById(id)));
}

export async function updateAttendee(id: string, data: any) {
  const doc = await db.collection('attendees').doc(id).get();
  if (!doc.exists) {
    throw new NotFoundError('Attendee');
  }

  if (data.guestSlug) {
    const guestSnap = await db.collection('guests').where('slug', '==', data.guestSlug.toLowerCase()).limit(1).get();
    if (!guestSnap.empty) {
      data.guestRef = guestSnap.docs[0].id;
    }
    delete data.guestSlug;
  }

  const updatePayload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await doc.ref.update(updatePayload);
  return getAttendeeById(id);
}

export async function deleteAttendee(id: string) {
  const doc = await db.collection('attendees').doc(id).get();
  if (!doc.exists) {
    throw new NotFoundError('Attendee');
  }
  const attendeeData = { id: doc.id, ...doc.data()! };
  await doc.ref.delete();
  return attendeeData;
}

export async function getAttendeeStats() {
  const snapshot = await db.collection('attendees').get();
  const docs = snapshot.docs.map(doc => doc.data());

  const total = docs.length;
  let confirmed = 0;
  let declined = 0;
  let pending = 0;
  let maybe = 0;

  const genderCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  docs.forEach((data: any) => {
    const status = data.rsvpStatus;
    if (status === 'confirmed') confirmed++;
    else if (status === 'declined') declined++;
    else if (status === 'pending') pending++;
    else if (status === 'maybe') maybe++;

    const gender = data.gender || 'other';
    genderCounts[gender] = (genderCounts[gender] || 0) + 1;

    const category = data.category || 'friend';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const byGender = Object.entries(genderCounts).map(([gender, count]) => ({ gender, count }));
  const byCategory = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));

  return {
    total,
    confirmed,
    declined,
    pending,
    maybe,
    byGender,
    byCategory,
  };
}
