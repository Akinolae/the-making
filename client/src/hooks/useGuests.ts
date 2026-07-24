import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api.client';
import type { Guest, GuestInput } from '../types/guest';
import { sileo } from 'sileo';

export function useGuests() {
  const queryClient = useQueryClient();

  const { data: guests, isLoading, error } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data } = await apiClient.get('/guests');
      return data;
    },
  });

  const createGuest = useMutation({
    mutationFn: async (input: GuestInput) => {
      const { data } = await apiClient.post('/guests', input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      sileo.success({
        title: 'Guest Created',
        description: `${data.name} has been added successfully.`,
      });
    },
    onError: (err: any) => {
      sileo.error({
        title: 'Failed to Create Guest',
        description: err.response?.data?.error?.message || err.message,
      });
    },
  });

  const updateGuest = useMutation({
    mutationFn: async ({ slug, input }: { slug: string; input: Partial<GuestInput> }) => {
      const { data } = await apiClient.put(`/guests/${slug}`, input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      sileo.success({
        title: 'Guest Updated',
        description: `${data.name} has been updated successfully.`,
      });
    },
    onError: (err: any) => {
      sileo.error({
        title: 'Failed to Update Guest',
        description: err.response?.data?.error?.message || err.message,
      });
    },
  });

  const deleteGuest = useMutation({
    mutationFn: async (slug: string) => {
      await apiClient.delete(`/guests/${slug}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      sileo.success({
        title: 'Guest Deleted',
        description: `Guest has been deleted successfully.`,
      });
    },
    onError: (err: any) => {
      sileo.error({
        title: 'Failed to Delete Guest',
        description: err.response?.data?.error?.message || err.message,
      });
    },
  });

  return { guests, isLoading, error, createGuest, updateGuest, deleteGuest };
}
