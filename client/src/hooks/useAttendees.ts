import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api.client';
import type { Attendee, AttendeeInput, AttendeeFilter, AttendeeStats } from '../types/attendee';

export function useAttendees(filters?: AttendeeFilter) {
  const queryClient = useQueryClient();

  const buildParams = () => {
    const params = new URLSearchParams();
    if (filters?.rsvpStatus) params.set('rsvp', filters.rsvpStatus);
    if (filters?.gender) params.set('gender', filters.gender);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);
    return params.toString();
  };

  const { data: attendees, isLoading, error } = useQuery<Attendee[]>({
    queryKey: ['attendees', filters],
    queryFn: async () => {
      const qs = buildParams();
      const { data } = await apiClient.get(`/attendees${qs ? `?${qs}` : ''}`);
      return data;
    },
  });

  const { data: stats } = useQuery<AttendeeStats>({
    queryKey: ['attendee-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/attendees/stats');
      return data;
    },
  });

  const createAttendee = useMutation({
    mutationFn: async (input: AttendeeInput) => {
      const { data } = await apiClient.post('/attendees', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
      queryClient.invalidateQueries({ queryKey: ['attendee-stats'] });
    },
  });

  const bulkCreateAttendees = useMutation({
    mutationFn: async (attendees: AttendeeInput[]) => {
      const { data } = await apiClient.post('/attendees/bulk', { attendees });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
      queryClient.invalidateQueries({ queryKey: ['attendee-stats'] });
    },
  });

  const updateAttendee = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<AttendeeInput> }) => {
      const { data } = await apiClient.put(`/attendees/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
      queryClient.invalidateQueries({ queryKey: ['attendee-stats'] });
    },
  });

  const deleteAttendee = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/attendees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
      queryClient.invalidateQueries({ queryKey: ['attendee-stats'] });
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
