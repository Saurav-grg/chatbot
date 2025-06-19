import { create } from 'zustand';
import { ChatStoreState, Conversation, Message } from '@/types';
import {
  createConversation,
  addMessageToConversation,
  fetchUserConversations,
  fetchConversationMessages,
  deleteConversation,
} from './actions';

interface ChatStore extends ChatStoreState {
  selectConversation: (conversationId: Conversation['id']) => void;
  loadUserConversations: () => Promise<void>;
  generateChatTitle: (text: string) => string;
  // sendMessage: (content: string) => Promise<void>;
  sendMessage: (
    content: string,
    conversationId?: String
  ) => Promise<string | null>;
  deleteUserConversation: (conversationId: Conversation['id']) => Promise<void>;
  setModel: (model: string) => void;
  // Helper to get selected conversation
  getConversationById: (id: string) => Conversation | null;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversations: [],
  // selectedConversationId: null,
  isLoading: false,
  error: null,
  model: 'gemini-1.5-flash',

  // Helper to get the currently selected conversation
  // getSelectedConversation: () => {
  //   const state = get();
  //   if (!state.selectedConversationId) return null;
  //   return (
  //     state.conversations.find((c) => c.id === state.selectedConversationId) ||
  //     null
  //   );
  // },
  getConversationById: (id: string) => {
    const state = get();
    return state.conversations.find((c) => c.id === id) || null;
  },
  // actions
  setModel: (model) => {
    set({ model });
    // console.log(get().model);
  },

  selectConversation: async (conversationId: Conversation['id']) => {
    // set({ selectedConversationId: conversationId });

    // Check if we need to load messages for this conversation
    const conversation = get().conversations.find(
      (c) => c.id === conversationId
    );
    if (!conversation || conversation.messages.length === 0) {
      set({ isLoading: true, error: null });
      const response = await fetchConversationMessages(conversationId);
      if (response.error) {
        set({ error: response.error, isLoading: false });
        return;
      }
      // Update the conversation with loaded messages
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, messages: response.data || [] } : c
        ),
        isLoading: false,
      }));
    }
  },

  generateChatTitle: (text: string) => {
    // Handle empty messages
    if (!text || text.trim() === '') {
      return 'New Conversation';
    }
    // Truncate long messages for processing
    const truncatedMessage =
      text.length > 100 ? text.substring(0, 100) + '...' : text;

    // Extract key topics
    let title = '';
    // Method 1: Use the first sentence if it's short enough
    const firstSentence = truncatedMessage.split(/[.!?]/)[0].trim();
    if (firstSentence.length <= 50 && firstSentence.length >= 10) {
      title = firstSentence;
    }
    // Method 2: Extract first N words (for messages without clear sentences)
    else {
      const words = truncatedMessage.split(/\s+/);
      const keyWords = words.slice(0, Math.min(6, words.length));
      title = keyWords.join(' ');

      // Add ellipsis if we truncated
      if (words.length > 6) {
        title += '...';
      }
    }

    // Remove common filler words at the beginning
    title = title.replace(
      /^(hey|hi|hello|um|so|basically|just|i was|i am|i'm)\s+/i,
      ''
    );

    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // Ensure title isn't too long for display
    if (title.length > 60) {
      title = title.substring(0, 60) + '...';
    }

    return title;
  },

  loadUserConversations: async () => {
    set({ isLoading: true, error: null });

    const response = await fetchUserConversations();

    if (response.error) {
      set({ error: response.error, isLoading: false });
      return;
    }

    if (response.data) {
      set({
        conversations: response.data,
        isLoading: false,
      });
    }
  },

  deleteUserConversation: async (conversationId: Conversation['id']) => {
    set({ isLoading: true, error: null });

    const response = await deleteConversation(conversationId);

    if (response.error) {
      set({ error: response.error, isLoading: false });
      return;
    }
    if (response.data) {
      set((state) => ({
        conversations: state.conversations.filter(
          (chat) => chat.id !== conversationId
        ),
        // If the deleted conversation was selected, clear the selection
        // selectedConversationId:
        //   state.selectedConversationId === conversationId
        //     ? null
        //     : state.selectedConversationId,
        isLoading: false,
      }));
    }
  },

  sendMessage: async (text, conversationId) => {
    set({ isLoading: true, error: null });
    try {
      // Helper: Ensure a conversation exists
      const ensureConversationExists = async (): Promise<Conversation> => {
        const state = get();
        if (conversationId) {
          const found = state.conversations.find(
            (c) => c.id === conversationId
          );
          if (!found) throw new Error('Selected conversation not found');
          return found;
        }
        const title = state.generateChatTitle(text);
        const response = await createConversation(title);
        if (response.error) throw new Error(response.error);
        const newConversation = response.data!;
        set((state) => ({
          conversations: [...state.conversations, newConversation],
          selectedConversationId: newConversation.id,
        }));
        return newConversation;
      };

      // Helper: Send user message
      const sendUserMessage = async (conversation: Conversation) => {
        const response = await addMessageToConversation(
          conversation.id,
          text,
          'user'
        );
        if (response.error) throw new Error(response.error);
        const userMessage = response.data!;

        // Update the conversation in the conversations array
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversation.id
              ? { ...c, messages: [...c.messages, userMessage] }
              : c
          ),
        }));
      };

      // Helper: Stream AI response
      const streamAIResponse = async (conversationId: string) => {
        const modelResponse = await fetch('/api/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: text,
            selectedModel: get().model,
            conversationId,
          }),
        });

        if (!modelResponse || !modelResponse.body) {
          const errorMessage: Message = {
            id: `error-${Date.now()}`,
            conversationId,
            text: "Sorry, I couldn't respond right now.",
            sender: 'bot',
            createdAt: new Date(),
          };

          // Add error message to the conversation
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, messages: [...c.messages, errorMessage] }
                : c
            ),
          }));
          throw new Error('No response body');
        }

        const reader = modelResponse.body.getReader();
        let aiMessageText = '';
        const tempMessageId = `temp-${Date.now()}`;

        // Add temporary message for streaming
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      id: tempMessageId,
                      conversationId,
                      text: '',
                      sender: 'bot',
                      createdAt: new Date(),
                    },
                  ],
                }
              : c
          ),
        }));

        // Stream the response
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          aiMessageText += chunk;

          // Update the temporary message with streamed content
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map((msg) =>
                      msg.id === tempMessageId
                        ? { ...msg, text: aiMessageText }
                        : msg
                    ),
                  }
                : c
            ),
          }));
        }
        return { aiMessageText, tempMessageId };
      };

      // Helper: Save AI message
      const saveAIMessage = async (
        conversationId: string,
        aiMessageText: string,
        tempMessageId: string
      ) => {
        const response = await addMessageToConversation(
          conversationId,
          aiMessageText,
          'bot'
        );
        if (response.error) throw new Error(response.error);
        const aiMessage = response.data!;

        // Replace temporary message with the saved message
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((msg) =>
                    msg.id === tempMessageId ? aiMessage : msg
                  ),
                }
              : c
          ),
        }));
      };

      // Execute the steps
      const conversation = await ensureConversationExists();
      await sendUserMessage(conversation);
      const { aiMessageText, tempMessageId } = await streamAIResponse(
        conversation.id
      );
      await saveAIMessage(conversation.id, aiMessageText, tempMessageId);

      return conversation.id; // Return the conversation ID for navigation
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));
