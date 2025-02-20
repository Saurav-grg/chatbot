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
  createNewConversation: () => Promise<void>;
  loadUserConversations: () => Promise<void>;
  // Message actions
  sendMessage: (content: string) => Promise<void>;
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
  selectConversation: async (conversation: Conversation) => {
    set({ isLoading: true, error: null });
    const response = await fetchConversationMessages(conversation.id);
    if (response.error) {
      set({ error: response.error, isLoading: false });
      return;
    }
    set({
      selectedConversation: { ...conversation, messages: response.data || [] },
      isLoading: false,
    });
  },

  createNewConversation: async () => {
    set({ isLoading: true, error: null });
    const title = `Conversation ${get().conversations.length + 1}`;
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
  sendMessage: async (text: string) => {
    let { selectedConversation } = get();

    set({ isLoading: true, error: null });

    try {
      if (selectedConversation == null) {
        const title = `Conversation ${get().conversations.length + 1}`;
        const response = await createConversation(title);

        if (response.error) {
          set({ error: response.error, isLoading: false });
          return;
        }

        if (response.data) {
          set((state) => ({
            conversations: [...state.conversations, response.data!],
            selectedConversation: response.data,
          }));
          // selectedConversation = get().selectedConversation!;
        }
        if (!selectedConversation) {
          return;
        }
      }
      // Send user message
      const userMessageResponse = await addMessageToConversation(
        selectedConversation.id,
        text,
        'user'
      );

      if (userMessageResponse.error) {
        set({ error: userMessageResponse.error });
        return;
      }

      // Update local state with user message
      const userMessage = userMessageResponse.data!;
      const updatedMessages = [...selectedConversation.messages, userMessage];

      // TODO: Integrate with your AI service here
      const aiResponse = await googleAiResponse(text);
      if (!aiResponse) {
        set({ error: 'response denied!!!' });
        return;
      }
      // Save AI response
      const assistantMessageResponse = await addMessageToConversation(
        selectedConversation.id,
        aiResponse,
        'bot'
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
}));
