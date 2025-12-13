import { create } from "zustand";

interface UIStore {
  model: string;
  isStreaming: boolean;
  setModel: (model: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  model: "gemini-2.5-flash",
  isStreaming: false,
  setModel: (model) => set({ model }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
}));
