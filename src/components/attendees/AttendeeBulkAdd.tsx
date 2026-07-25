import { useState } from 'react';
import type { AttendeeInput } from '../../types/attendee';

interface Props {
  saving: boolean;
  onSave: (attendees: AttendeeInput[]) => void;
  onCancel: () => void;
}

export default function AttendeeBulkAdd({ saving, onSave, onCancel }: Props) {
  const [text, setText] = useState('');

  const parseAttendees = (input: string): AttendeeInput[] => {
    return input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Format: "Name, gender" or just "Name"
        const parts = line.split(',').map((p) => p.trim());
        const name = parts[0];
        const gender = parts[1]?.toLowerCase();
        const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
        return {
          name,
          gender: (gender && validGenders.includes(gender) ? gender : 'other') as any,
        };
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const attendees = parseAttendees(text);
    if (attendees.length > 0) {
      onSave(attendees);
    }
  };

  const attendees = parseAttendees(text);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-burgundy/30 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl bg-cream p-6 shadow-paper">
        <h2 className="font-display text-2xl text-burgundy">Bulk add attendees</h2>
        <p className="mt-1 text-sm text-ink/60">
          Paste one attendee per line. Format: <code className="rounded bg-burgundy/5 px-1">Name, gender</code>
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <textarea
            className="input min-h-[200px] font-mono text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Aisha Mohammed, female\nChidi Okonkwo, male\nTunde Bakare, male\nFunmi Adeleke, female`}
          />

          {attendees.length > 0 && (
            <div className="rounded-lg bg-blush p-3">
              <p className="text-xs text-ink/60">
                {attendees.length} attendee{attendees.length !== 1 ? 's' : ''} parsed:
              </p>
              <div className="mt-1 max-h-[120px] overflow-y-auto space-y-0.5">
                {attendees.map((a, i) => (
                  <p key={i} className="text-xs text-ink/70">
                    {a.name} <span className="text-ink/40">({a.gender})</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-ink/60">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || attendees.length === 0}
              className="rounded-full bg-burgundy px-5 py-2 text-sm text-cream disabled:opacity-50"
            >
              {saving ? 'Adding...' : `Add ${attendees.length} attendee${attendees.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
