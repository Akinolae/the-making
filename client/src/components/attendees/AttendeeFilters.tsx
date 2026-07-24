import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import type { AttendeeFilter } from '../../types/attendee';

interface Props {
  filters: AttendeeFilter;
  onChange: (filters: AttendeeFilter) => void;
}

export default function AttendeeFilters({ filters, onChange }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const filtersRef = useRef(filters);
  
  // Update filters ref on every render
  filtersRef.current = filters;

  // Sync external search changes to local state
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== (filtersRef.current.search || '')) {
        onChange({ ...filtersRef.current, search: searchTerm || undefined });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onChange]);

  const update = (key: keyof AttendeeFilter, value: string | undefined) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* RSVP Filter */}
      <select
        value={filters.rsvpStatus || ''}
        onChange={(e) => update('rsvpStatus', e.target.value || undefined)}
        className="input w-auto"
      >
        <option value="">All RSVPs</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="declined">Declined</option>
        <option value="maybe">Maybe</option>
      </select>

      {/* Gender Filter */}
      <select
        value={filters.gender || ''}
        onChange={(e) => update('gender', e.target.value || undefined)}
        className="input w-auto"
      >
        <option value="">All Genders</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      {/* Category Filter */}
      <select
        value={filters.category || ''}
        onChange={(e) => update('category', e.target.value || undefined)}
        className="input w-auto"
      >
        <option value="">All Categories</option>
        <option value="family">Family</option>
        <option value="friend">Friend</option>
        <option value="colleague">Colleague</option>
        <option value="plus-one">Plus One</option>
        <option value="vendor">Vendor</option>
        <option value="other">Other</option>
      </select>
    </div>
  );
}
