import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api.client';
import type { Guest } from '../types/guest';

export function useInvite(slug: string | null) {
  const { data: guest, isLoading, error } = useQuery<Guest>({
    queryKey: ['invite', slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/invites/${slug}`);
      return data;
    },
    enabled: !!slug,
    retry: false,
  });

  return { guest, isLoading, error };
}
