import { create } from 'zustand';
import { ChatStoreState, Conversation, Message } from '@/types';
import {
  createConversation,
  addMessageToConversation,
  fetchUserConversations,
  fetchConversationMessages,
  // aiResponse,
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
    if (conversation.messages.length > 0) {
      return;
    }
    set({ isLoading: true, error: null });
    const response = await fetchConversationMessages(conversation.id);
    if (response.error) {
      set({ error: response.error, isLoading: false });
      return;
    }
    // set((state) => ({
    //   conversations: [...state.conversations, state.conversations.map((chat)=>
    //   chat.id === conversation.id ? { ...chat, messages: response.data || [] } : chat
    //   ) ]
    //   isLoading: false,
    // }));
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
      // console.log(response.data);
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
  sendMessage: async (text: string) => {
    set({ isLoading: true, error: null });
    try {
      // Helper: Ensure a conversation exists
      const ensureConversationExists = async (): Promise<Conversation> => {
        const state = get();
        if (state.selectedConversation) return state.selectedConversation;
        const title = state.generateChatTitle(text);
        const response = await createConversation(title);
        if (response.error) throw new Error(response.error);
        const newConversation = response.data!;
        set((state) => ({
          conversations: [...state.conversations, newConversation],
          selectedConversation: newConversation,
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
        set((state) => ({
          selectedConversation: state.selectedConversation
            ? {
                ...state.selectedConversation,
                messages: [...state.selectedConversation.messages, userMessage],
              }
            : null,
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
            text: 'Sorry, I couldn’t respond right now.',
            sender: 'bot',
            createdAt: new Date(),
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
          throw new Error('No response body');
        }
        // console.log(modelResponse.body);
        const reader = modelResponse.body.getReader();
        let aiMessageText = '';
        const tempMessageId = `temp-${Date.now()}`;
        set((state) => ({
          selectedConversation: state.selectedConversation
            ? {
                ...state.selectedConversation,
                messages: [
                  ...state.selectedConversation.messages,
                  {
                    id: tempMessageId,
                    conversationId,
                    text: '',
                    sender: 'bot',
                    createdAt: new Date(),
                  },
                ],
              }
            : null,
        }));
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          aiMessageText += chunk;
          set((state) => {
            if (!state.selectedConversation) return state;
            const messages = state.selectedConversation.messages.map((msg) =>
              msg.id === tempMessageId ? { ...msg, text: aiMessageText } : msg
            );
            return {
              selectedConversation: { ...state.selectedConversation, messages },
            };
          });
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
        set((state) => ({
          selectedConversation: state.selectedConversation
            ? {
                ...state.selectedConversation,
                messages: state.selectedConversation.messages.map((msg) =>
                  msg.id === tempMessageId ? aiMessage : msg
                ),
              }
            : null,
        }));
      };

      // Execute the steps
      const conversation = await ensureConversationExists();
      await sendUserMessage(conversation);
      const { aiMessageText, tempMessageId } = await streamAIResponse(
        conversation.id
      );
      await saveAIMessage(conversation.id, aiMessageText, tempMessageId);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      set({ isLoading: false });
    }
  },
}));
