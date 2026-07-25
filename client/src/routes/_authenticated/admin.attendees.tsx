import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAttendees } from '../../hooks/useAttendees';
import { signOut } from '../../lib/auth';
import { LogOut, ArrowLeft, Plus } from 'lucide-react';
import AttendeeStats from '../../components/attendees/AttendeeStats';
import AttendeeFilters from '../../components/attendees/AttendeeFilters';
import AttendeeRow from '../../components/attendees/AttendeeRow';
import AttendeeForm from '../../components/attendees/AttendeeForm';
import AttendeeBulkAdd from '../../components/attendees/AttendeeBulkAdd';
import type { Attendee, AttendeeInput, AttendeeFilter as Filter } from '../../types/attendee';

export const Route = createFileRoute('/_authenticated/admin/attendees')({
  component: AttendeesPage,
});

function AttendeesPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filter>({});
  const { attendees, stats, isLoading, error, createAttendee, bulkCreateAttendees, updateAttendee, deleteAttendee } = useAttendees(filters);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/auth' });
  };

  const handleSave = async (input: AttendeeInput) => {
    if (editingAttendee) {
      await updateAttendee.mutateAsync({ id: editingAttendee.id, input });
      setEditingAttendee(null);
    } else {
      await createAttendee.mutateAsync(input);
      setShowAddForm(false);
    }
  };

  const handleBulkAdd = async (attendeesList: AttendeeInput[]) => {
    await bulkCreateAttendees.mutateAsync(attendeesList);
    setShowBulkAdd(false);
  };

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p className="font-semibold text-lg text-burgundy">Failed to load attendees</p>
        <p className="text-sm mt-2 text-ink/80">{(error as Error).message || String(error)}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blush px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-burgundy/70 hover:text-burgundy">
                <ArrowLeft size={14} />
                Invitations
              </Link>
            </div>
            <h1 className="mt-1 truncate font-display text-3xl text-burgundy sm:text-4xl">Wedding Guest List</h1>
            <p className="text-sm text-ink/60">Track attendees, RSVPs, and seating.</p>
          </div>
          <button onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-full border border-burgundy/20 bg-cream px-4 py-2 text-sm text-burgundy">
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </header>

        {stats && <AttendeeStats stats={stats} />}
        <AttendeeFilters filters={filters} onChange={setFilters} />

        <div className="mb-6 flex gap-3">
          <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-2.5 text-sm text-cream">
            <Plus size={14} /> Add attendee
          </button>
          <button onClick={() => setShowBulkAdd(true)} className="inline-flex items-center gap-2 rounded-full border border-burgundy/20 bg-cream px-5 py-2.5 text-sm text-burgundy">
            <Plus size={14} /> Bulk add
          </button>
        </div>

        {isLoading ? (
          <p className="text-ink/50">Loading...</p>
        ) : !attendees || attendees.length === 0 ? (
          <div className="rounded-xl border border-burgundy/10 bg-cream p-8 text-center">
            <p className="text-ink/50">No attendees yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-burgundy/10 bg-cream shadow-soft">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-burgundy/10">
                  <th className="px-4 py-3 font-body font-medium text-ink/60">Name</th>
                  <th className="px-4 py-3 font-body font-medium text-ink/60">Gender</th>
                  <th className="px-4 py-3 font-body font-medium text-ink/60">Category</th>
                  <th className="px-4 py-3 font-body font-medium text-ink/60">RSVP</th>
                  <th className="px-4 py-3 font-body font-medium text-ink/60">+Ones</th>
                  <th className="px-4 py-3 font-body font-medium text-ink/60">Table</th>
                  <th className="px-4 py-3 font-body font-medium text-ink/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => (
                  <AttendeeRow
                    key={attendee.id}
                    attendee={attendee}
                    onEdit={setEditingAttendee}
                    onDelete={() => deleteAttendee.mutate(attendee.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(showAddForm || editingAttendee) && (
          <AttendeeForm
            attendee={editingAttendee}
            saving={createAttendee.isPending || updateAttendee.isPending}
            onSave={handleSave}
            onCancel={() => { setShowAddForm(false); setEditingAttendee(null); }}
          />
        )}

        {showBulkAdd && (
          <AttendeeBulkAdd
            saving={bulkCreateAttendees.isPending}
            onSave={handleBulkAdd}
            onCancel={() => setShowBulkAdd(false)}
          />
        )}
      </div>
    </div>
  );
}
