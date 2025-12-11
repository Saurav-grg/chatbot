import { useQuery } from '@tanstack/react-query';
import { Conversation } from '@/types';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      return response.json() as Promise<Conversation[]>;
    },
  });
}
