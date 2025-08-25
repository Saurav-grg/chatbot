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
export type ModelProvider = 'google' | 'mistral' | 'groq';

export interface AIModelConfig {
  name: string;
  displayName: string;
  provider: ModelProvider;
}
// Store state types
export interface ChatStoreState {
  conversations: Conversation[];
  model: string;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
}
export interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}
export interface ChatWindowProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}
// Action types for better type safety
export type ServerActionResponse<T> = Promise<{
  data?: T;
  error?: string;
}>;
