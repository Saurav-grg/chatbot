import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Conversation } from '@/types';

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      return response.json() as Promise<Conversation>;
    },
    onSuccess: (newConversation) => {
      queryClient.setQueryData<Conversation[]>(
        ['conversations'],
        (oldData) =>
          oldData ? [newConversation, ...oldData] : [newConversation]
      );
    },
  });
}
