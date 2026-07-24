import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useGuests } from '../../hooks/useGuests';
import { signOut } from '../../lib/auth';
import { LogOut, Plus, Users, UserPlus } from 'lucide-react';
import GuestCard from '../../components/admin/GuestCard';
import GuestForm from '../../components/admin/GuestForm';
import type { Guest, GuestInput } from '../../types/guest';

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { guests, isLoading, error, createGuest, updateGuest, deleteGuest } = useGuests();
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/auth' });
  };

  const handleSave = async (input: GuestInput) => {
    if (editingGuest) {
      await updateGuest.mutateAsync({ slug: editingGuest.slug, input });
      setEditingGuest(null);
    } else {
      await createGuest.mutateAsync(input);
      setShowAddForm(false);
    }
  };

  const handleCopyLink = async (slug: string) => {
    const url = `${window.location.origin}/invite?invite=${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1600);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1600);
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        {(error as any)?.response?.data?.error?.message === 'Forbidden'
          ? 'This account is not an admin. Ask the site owner for access.'
          : 'An error occurred. Please try again.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blush px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl text-burgundy sm:text-4xl">
              Guest list
            </h1>
            <p className="text-sm text-ink/60">
              Personalized invitations. Share the link per guest.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/attendees"
              className="inline-flex items-center gap-2 rounded-full border border-burgundy/20 bg-cream px-4 py-2 text-sm text-burgundy"
            >
              <Users size={14} />
              <span className="hidden sm:inline">Guest List</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-burgundy/20 bg-cream px-4 py-2 text-sm text-burgundy"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Add Guest Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-burgundy px-5 py-2.5 text-sm text-cream"
        >
          <Plus size={14} />
          Add guest
        </button>

        {/* Guest List */}
        {isLoading ? (
          <p className="text-ink/50">Loading...</p>
        ) : !guests || guests.length === 0 ? (
          <p className="text-ink/50">No guests yet. Add your first one above.</p>
        ) : (
          <div className="space-y-3">
            {guests.map((guest) => (
              <GuestCard
                key={guest.slug}
                guest={guest}
                copiedSlug={copiedSlug}
                onCopyLink={handleCopyLink}
                onEdit={setEditingGuest}
                onDelete={() => deleteGuest.mutate(guest.slug)}
              />
            ))}
          </div>
        )}

        {/* Add / Edit Guest Form Modal */}
        {(showAddForm || editingGuest) && (
          <GuestForm
            guest={editingGuest || null}
            saving={createGuest.isPending || updateGuest.isPending}
            onSave={handleSave}
            onCancel={() => {
              setShowAddForm(false);
              setEditingGuest(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
