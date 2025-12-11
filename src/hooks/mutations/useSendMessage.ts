import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Message } from '@/types';

interface SendMessageParams {
  conversationId: string;
  text: string;
  model: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, text, model }: SendMessageParams) => {
      const userMessageResponse = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sender: 'user' }),
        }
      );

      if (!userMessageResponse.ok) {
        throw new Error('Failed to send message');
      }

      const userMessage = (await userMessageResponse.json()) as Message;

      const streamResponse = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedModel: model,
          conversationId,
        }),
      });

      if (!streamResponse.body) {
        throw new Error('No response body from stream');
      }

      let aiMessageText = '';
      const reader = streamResponse.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        aiMessageText += chunk;
      }

      const aiMessageResponse = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: aiMessageText, sender: 'bot' }),
        }
      );

      if (!aiMessageResponse.ok) {
        throw new Error('Failed to save AI message');
      }

      const aiMessage = (await aiMessageResponse.json()) as Message;

      return { userMessage, aiMessage };
    },
    onSuccess: (data, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['conversations', conversationId],
      });
    },
  });
}
