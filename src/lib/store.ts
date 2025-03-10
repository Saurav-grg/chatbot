import { create } from 'zustand';
import { ChatStoreState, Conversation, Message } from '@/types';
import {
  createConversation,
  addMessageToConversation,
  fetchUserConversations,
  fetchConversationMessages,
  aiResponse,
  deleteConversation,
} from './actions';

interface ChatStore extends ChatStoreState {
  // Conversation actions
  selectConversation: (conversation: Conversation) => void;
  // createNewConversation: () => Promise<void>;
  loadUserConversations: () => Promise<void>;
  generateChatTitle: (text: string) => string;
  // Message actions
  sendMessage: (content: string) => Promise<void>;
  deleteUserConversation: (conversationId: Conversation['id']) => Promise<void>;
  // Error handling
  setError: (error: string | null) => void;
  //model
  setModel: (model: string) => void;
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
  setModel: (model) => set({ model }),
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

  // createNewConversation: async () => {
  //   set({ isLoading: true, error: null });
  //   const title = `Conversation ${get().conversations.length + 1}`;
  //   const response = await createConversation(title);

  //   if (response.error) {
  //     set({ error: response.error, isLoading: false });
  //     return;
  //   }

  //   if (response.data) {
  //     set((state) => ({
  //       conversations: [...state.conversations, response.data!],
  //       selectedConversation: response.data,
  //       isLoading: false,
  //     }));
  //   }
  // },

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
        const title = get().generateChatTitle(text);
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
      const modelResponse = await aiResponse(text, get().model);
      if (!modelResponse) {
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
        modelResponse,
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
