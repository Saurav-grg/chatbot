import { create } from 'zustand';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  chatId: string;
}

interface Chat {
  id: string;
  title: string;
}

interface ChatStore {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Record<string, Message[]>;
  setSelectedChat: (chat: Chat) => void;
  addChat: (title: string) => void;
  addMessage: (
    content: string,
    role: 'user' | 'assistant',
    chatId: string
  ) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chats: [
    { id: '1', title: 'Getting started with React' },
    { id: '2', title: 'Learning TypeScript basics' },
    { id: '3', title: 'Next.js project structure' },
  ],
  selectedChat: { id: '1', title: 'Getting started with React' },
  messages: {
    '1': [
      {
        id: '1',
        content: 'Hello! How can I help you today?',
        role: 'assistant',
        chatId: '1',
      },
    ],
    '2': [],
    '3': [],
  },
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  addChat: (title) =>
    set((state) => {
      const newChat = {
        id: String(state.chats.length + 1),
        title,
      };
      return {
        chats: [...state.chats, newChat],
        selectedChat: newChat,
        messages: {
          ...state.messages,
          [newChat.id]: [],
        },
      };
    }),
  addMessage: (content, role, chatId) =>
    set((state) => {
      const newMessage = {
        id: String(Date.now()),
        content,
        role,
        chatId,
      };

      return {
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), newMessage],
        },
      };
    }),
}));
