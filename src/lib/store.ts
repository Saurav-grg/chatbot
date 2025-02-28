import { create } from 'zustand';
import { ChatStoreState, Conversation, Message } from '@/types';
import {
  createConversation,
  addMessageToConversation,
  fetchUserConversations,
  fetchConversationMessages,
  googleAiResponse,
  deleteConversation,
} from './actions';

interface ChatStore extends ChatStoreState {
  // Conversation actions
  selectConversation: (conversation: Conversation) => void;
  createNewConversation: () => Promise<void>;
  loadUserConversations: () => Promise<void>;
  // Message actions
  sendMessage: (content: string) => Promise<void>;
  deleteUserConversation: (conversationId: Conversation['id']) => Promise<void>;
  // Error handling
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversations: [],
  selectedConversation: null,
  isLoading: false,
  error: null,
  model: 'gemini-1.5-flash',
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
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? null
            : state.selectedConversation,
        isLoading: false,
      }));
    }
  },
  // Message actions
  sendMessage: async (text: string) => {
    set({ isLoading: true, error: null });
    try {
      let { selectedConversation } = get();
      if (!selectedConversation) {
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
        }
        selectedConversation = get().selectedConversation;
        if (!selectedConversation) {
          set({ error: 'Failed to select new conversation', isLoading: false });
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
      set((state) => ({
        selectedConversation: state.selectedConversation
          ? {
              ...state.selectedConversation,
              messages: [...state.selectedConversation.messages, userMessage],
            }
          : null,
      }));
      // const updatedMessages = [...selectedConversation.messages, userMessage];

      // TODO: Integrate with your AI service here
      const aiResponse = await googleAiResponse(text, get().model);
      if (!aiResponse) {
        // Add an error message to the chat instead of deleting the user message
        const errorMessage: Message = {
          id: `error-${Date.now()}`, // Temporary ID
          conversationId: selectedConversation.id,
          text: 'Sorry, I couldn’t respond right now.',
          sender: 'bot',
          createdAt: new Date(), // Assuming Message type has timestamp
        };
        set((state) => ({
          selectedConversation: state.selectedConversation
            ? {
                ...state.selectedConversation,
                messages: [
                  ...state.selectedConversation.messages,
                  errorMessage,
                ],
              }
            : null,
        }));
        return;
      }
      // Save AI response
      const assistantMessageResponse = await addMessageToConversation(
        selectedConversation.id,
        aiResponse,
        'bot'
      );
      if (assistantMessageResponse.error) {
        set({ error: assistantMessageResponse.error });
        return;
      }
      const aiMessage = assistantMessageResponse.data!;
      if (assistantMessageResponse.data) {
        set((state) => ({
          selectedConversation: state.selectedConversation
            ? {
                ...state.selectedConversation,
                messages: [...state.selectedConversation.messages, aiMessage],
              }
            : null,
        }));
      }
    } catch (error) {
      set({ error: 'Failed to send message' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
