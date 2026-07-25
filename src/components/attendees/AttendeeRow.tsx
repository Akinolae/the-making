import { Edit3, Trash2 } from 'lucide-react';
import type { Attendee } from '../../types/attendee';

interface Props {
  attendee: Attendee;
  onEdit: (attendee: Attendee) => void;
  onDelete: () => void;
}

const rsvpColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  maybe: 'bg-blue-100 text-blue-700',
};

export default function AttendeeRow({ attendee, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b border-burgundy/5 last:border-0 hover:bg-blush/50">
      <td className="px-4 py-3 font-medium text-ink">{attendee.name}</td>
      <td className="px-4 py-3 text-sm capitalize text-ink/70">{attendee.gender}</td>
      <td className="px-4 py-3 text-sm capitalize text-ink/70">{attendee.category}</td>
      <td className="px-4 py-3">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${rsvpColors[attendee.rsvpStatus] || ''}`}>
          {attendee.rsvpStatus}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-ink/70">{attendee.plusOnes}</td>
      <td className="px-4 py-3 text-sm text-ink/70">{attendee.tableNumber || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(attendee)} className="text-burgundy/60 hover:text-burgundy" title="Edit">
            <Edit3 size={14} />
          </button>
          <button onClick={() => { if (confirm(`Delete ${attendee.name}?`)) onDelete(); }} className="text-destructive/60 hover:text-destructive" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
