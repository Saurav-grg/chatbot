// src/types/index.ts

// Base types that match Prisma schema
export interface Message {
  id: string;
  conversationId: string;
  text: string;
  sender: 'user' | 'bot';
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Store state types
export interface ChatStoreState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  model: string;
  isLoading: boolean;
  error: string | null;
}

// Action types for better type safety
export type ServerActionResponse<T> = Promise<{
  data?: T;
  error?: string;
}>;
