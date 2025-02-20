import { create } from 'zustand';
import { ChatStoreState, Conversation, Message } from '@/types';
import {
  createConversation,
  addMessageToConversation,
  fetchUserConversations,
  fetchConversationMessages,
  googleAiResponse,
} from './actions';

interface ChatStore extends ChatStoreState {
  // Conversation actions
  selectConversation: (conversation: Conversation) => void;
  createNewConversation: (title: string) => Promise<void>;
  loadUserConversations: () => Promise<void>;
  // Message actions
  sendMessage: (content: string) => Promise<void>;
  loadConversationMessages: (conversationId: string) => Promise<void>;
  // Error handling
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversations: [],
  selectedConversation: null,
  isLoading: false,
  error: null,

  // Basic actions
  setError: (error) => set({ error }),

  // Conversation actions
  selectConversation: (conversation) =>
    set({ selectedConversation: conversation }),

  createNewConversation: async (title) => {
    set({ isLoading: true, error: null });

    const response = await createConversation(title);

    if (response.error) {
      set({ error: response.error, isLoading: false });
      return;
    }

    if (response.data) {
      set((state) => ({
        conversations: [...state.conversations, response.data!],
        selectedConversation: response.data,
        isLoading: false,
      }));
    }
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

  // Message actions
  sendMessage: async (content) => {
    const { selectedConversation } = get();
    if (!selectedConversation) {
      set({ error: 'No conversation selected' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Send user message
      const userMessageResponse = await addMessageToConversation(
        selectedConversation.id,
        content,
        'user'
      );

      if (userMessageResponse.error) {
        set({ error: userMessageResponse.error });
        return;
      }

      // Update local state with user message
      const updatedMessages = [...selectedConversation.messages];
      if (userMessageResponse.data) {
        updatedMessages.push(userMessageResponse.data);
      }

      // TODO: Integrate with your AI service here
      const aiResponse = await googleAiResponse(content);
      if (!aiResponse) {
        set({ error: 'response denied!!!' });
        return;
      }
      // Save AI response
      const assistantMessageResponse = await addMessageToConversation(
        selectedConversation.id,
        aiResponse,
        'assistant'
      );
      if (assistantMessageResponse.data) {
        updatedMessages.push(assistantMessageResponse.data);
      }
      // Update conversation with new messages
      set((state) => ({
        selectedConversation: state.selectedConversation
          ? {
              ...state.selectedConversation,
              messages: updatedMessages,
            }
          : null,
      }));
    } catch (error) {
      set({ error: 'Failed to send message' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadConversationMessages: async (conversationId) => {
    set({ isLoading: true, error: null });

    const response = await fetchConversationMessages(conversationId);

    if (response.error) {
      set({ error: response.error, isLoading: false });
      return;
    }

    if (response.data) {
      set((state) => ({
        selectedConversation: state.selectedConversation
          ? {
              ...state.selectedConversation,
              messages: response.data,
            }
          : null,
        isLoading: false,
      }));
    }
  },
}));
