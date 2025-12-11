import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Conversation } from '@/types';

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      return response.json();
    },
    onSuccess: (data, conversationId) => {
      queryClient.setQueryData<Conversation[]>(
        ['conversations'],
        (oldData) =>
          oldData
            ? oldData.filter((conv) => conv.id !== conversationId)
            : []
      );
      queryClient.removeQueries({
        queryKey: ['conversations', conversationId],
      });
    },
  });
}
