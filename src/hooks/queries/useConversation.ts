import { useQuery } from '@tanstack/react-query';
import { Conversation } from '@/types';

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ['conversations', id],
    queryFn: async () => {
      if (!id) throw new Error('Conversation ID is required');
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }
      return response.json() as Promise<Conversation>;
    },
    enabled: !!id,
  });
}
