import { Users, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import type { AttendeeStats as Stats } from '../../types/attendee';

interface Props {
  stats: Stats;
}

export default function AttendeeStats({ stats }: Props) {
  const cards = [
    { label: 'Total', value: stats.total, icon: Users, color: 'text-burgundy' },
    { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Declined', value: stats.declined, icon: XCircle, color: 'text-destructive' },
    { label: 'Pending', value: stats.pending, icon: HelpCircle, color: 'text-amber-600' },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-burgundy/10 bg-cream p-4 shadow-soft">
          <div className="flex items-center gap-2">
            <card.icon size={16} className={card.color} />
            <span className="text-xs text-ink/60">{card.label}</span>
          </div>
          <p className={`mt-1 font-display text-2xl ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
