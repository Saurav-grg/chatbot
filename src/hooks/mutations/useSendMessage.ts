import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Message, Conversation } from "@/types";
import { PerformanceMonitor } from "@/lib/performance-monitor";
interface SendMessageParams {
  conversationId: string;
  text: string;
  model: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, text, model }: SendMessageParams) => {
      const perf = new PerformanceMonitor(
        `SendMessage-${conversationId.slice(0, 8)}`
      );
      // 1. Send user message to backend
      const userMessageResponse = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, sender: "user" }),
        }
      );
      perf.checkpoint(" fetch complete save user message");
      if (!userMessageResponse.ok) {
        throw new Error("Failed to send message");
      }
      const userMessage = (await userMessageResponse.json()) as Message;
      // 2. Immediately update the conversation with user message
      queryClient.setQueryData<Conversation>(
        ["conversations", conversationId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [...old.messages, userMessage],
          };
        }
      );
      perf.checkpoint("User message added to UI");
      // 3. Create placeholder for AI message
      const placeholderAiMessage: Message = {
        id: "temp-" + Date.now(),
        text: "",
        sender: "bot",
        conversationId,
        createdAt: new Date(),
      };
      queryClient.setQueryData<Conversation>(
        ["conversations", conversationId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [...old.messages, placeholderAiMessage],
          };
        }
      );
      perf.checkpoint("AI placeholder created");
      // 4. Start streaming
      const streamResponse = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedModel: model,
          conversationId,
        }),
      });
      if (!streamResponse.body) {
        throw new Error("No response body from stream");
      }
      let aiMessageText = "";
      const reader = streamResponse.body.getReader();
      // 5. Stream and update UI in real-time
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        aiMessageText += chunk;

        // Update the placeholder message with streaming text
        queryClient.setQueryData<Conversation>(
          ["conversations", conversationId],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              messages: old.messages.map((msg) =>
                msg.id === placeholderAiMessage.id
                  ? { ...msg, text: aiMessageText }
                  : msg
              ),
            };
          }
        );
      }
      perf.checkpoint(`Stream complete chunks, ${aiMessageText.length} chars)`);
      // 6. Save final AI message to backend
      const aiMessageResponse = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: aiMessageText, sender: "bot" }),
        }
      );
      if (!aiMessageResponse.ok) {
        throw new Error("Failed to save AI message");
      }
      const aiMessage = (await aiMessageResponse.json()) as Message;
      // 7. Replace placeholder with real message
      queryClient.setQueryData<Conversation>(
        ["conversations", conversationId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.map((msg) =>
              msg.id === placeholderAiMessage.id ? aiMessage : msg
            ),
          };
        }
      );
      perf.checkpoint("Placeholder replaced with real message");

      // Show summary and warn if slow
      perf.summary();
      perf.warnIfSlow(3000);
      return { userMessage, aiMessage };
    },
    onError: (error, { conversationId }) => {
      // Rollback on error
      queryClient.invalidateQueries({
        queryKey: ["conversations", conversationId],
      });
    },
  });
}
