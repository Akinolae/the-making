import { useState } from 'react';
import type { Attendee, AttendeeInput } from '../../types/attendee';

interface Props {
  attendee: Attendee | null;
  saving: boolean;
  onSave: (input: AttendeeInput) => void;
  onCancel: () => void;
}

export default function AttendeeForm({ attendee, saving, onSave, onCancel }: Props) {
  const [name, setName] = useState(attendee?.name || '');
  const [gender, setGender] = useState(attendee?.gender || 'female');
  const [email, setEmail] = useState(attendee?.email || '');
  const [phone, setPhone] = useState(attendee?.phone || '');
  const [category, setCategory] = useState(attendee?.category || 'friend');
  const [rsvpStatus, setRsvpStatus] = useState(attendee?.rsvpStatus || 'pending');
  const [plusOnes, setPlusOnes] = useState(attendee?.plusOnes || 0);
  const [dietaryNotes, setDietaryNotes] = useState(attendee?.dietaryNotes || '');
  const [tableNumber, setTableNumber] = useState(attendee?.tableNumber || '');
  const [notes, setNotes] = useState(attendee?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name, gender: gender as any, email, phone,
      category: category as any, rsvpStatus: rsvpStatus as any,
      plusOnes, dietaryNotes, tableNumber, notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-burgundy/30 p-4 backdrop-blur">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-cream p-6 shadow-paper">
        <h2 className="font-display text-2xl text-burgundy">
          {attendee ? 'Edit attendee' : 'Add attendee'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Name *</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Gender *</span>
            <select className="input" value={gender} onChange={(e) => setGender(e.target.value as any)} required>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Email</span>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Phone</span>
              <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Category</span>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value as any)}>
                <option value="family">Family</option>
                <option value="friend">Friend</option>
                <option value="colleague">Colleague</option>
                <option value="plus-one">Plus One</option>
                <option value="vendor">Vendor</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">RSVP Status</span>
              <select className="input" value={rsvpStatus} onChange={(e) => setRsvpStatus(e.target.value as any)}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
                <option value="maybe">Maybe</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Plus Ones</span>
              <input className="input" type="number" min="0" value={plusOnes} onChange={(e) => setPlusOnes(parseInt(e.target.value) || 0)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Table #</span>
              <input className="input" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Dietary Notes</span>
            <textarea className="input min-h-[60px]" value={dietaryNotes} onChange={(e) => setDietaryNotes(e.target.value)} />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Admin Notes</span>
            <textarea className="input min-h-[60px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>

          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-ink/60">Cancel</button>
            <button type="submit" disabled={saving || !name} className="rounded-full bg-burgundy px-5 py-2 text-sm text-cream disabled:opacity-50">
              {saving ? 'Saving...' : attendee ? 'Save changes' : 'Add attendee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
