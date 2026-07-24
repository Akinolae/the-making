import { useState } from 'react';
import { Copy, ExternalLink, Trash2 } from 'lucide-react';
import type { Guest } from '../../types/guest';

interface GuestCardProps {
  guest: Guest;
  copiedSlug: string | null;
  onCopyLink: (slug: string) => void;
  onEdit: (guest: Guest) => void;
  onDelete: () => void;
}

export default function GuestCard({ guest, copiedSlug, onCopyLink, onEdit, onDelete }: GuestCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const inviteUrl = `${window.location.origin}/invite?invite=${guest.slug}`;

  const handleDelete = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  return (
    <div className="rounded-xl border border-burgundy/10 bg-cream p-5 shadow-soft">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-xl text-burgundy">
            {guest.name}
            {guest.title && (
              <span className="ml-2 text-sm italic text-ink/60">
                — {guest.title}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs tracking-widest uppercase text-burgundy/60">
            {guest.role} {guest.gender !== 'other' && `· ${guest.gender}`}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-ink/70">
            {guest.message}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            onClick={() => onCopyLink(guest.slug)}
            className="inline-flex items-center gap-1.5 rounded-full border border-burgundy/20 px-3 py-1.5 text-xs text-burgundy"
          >
            <Copy size={12} />
            {copiedSlug === guest.slug ? 'Copied!' : 'Copy link'}
          </button>
          <a
            href={inviteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-burgundy/20 px-3 py-1.5 text-xs text-burgundy"
          >
            <ExternalLink size={12} />
            Preview
          </a>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => onEdit(guest)}
          className="text-xs text-burgundy/70 underline"
        >
          Edit
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in">
          {/* Modal Content */}
          <div className="bg-cream border border-burgundy/20 rounded-2xl max-w-sm w-full p-6 shadow-xl mx-4 text-center relative z-50">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="font-display text-xl text-burgundy font-semibold">
              Delete Guest
            </h3>
            
            <p className="mt-2 text-sm text-ink/75 font-body leading-relaxed">
              Are you sure you want to delete <span className="font-bold">{guest.name}</span>? This action cannot be undone.
            </p>
            
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-ink/75 hover:bg-blush/20 rounded-xl border border-burgundy/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
