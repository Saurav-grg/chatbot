'use client';
import { useCreateConversation } from '@/hooks/mutations/useCreateConversation';
import { useUIStore } from '@/lib/ui-store';
import { generateChatTitle } from '@/lib/chat-helpers';
import { ChangeEvent, useCallback, useRef } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini Flash', provider: 'Google' },
  { id: 'groq/compound', name: 'Groq Compound' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
  { id: 'openai/gpt-oss-120b', name: 'OpenAI GPT-OSS 120B' },
  { id: 'qwen/qwen3-32b', name: 'Qwen 3.32B' },
  { id: 'whisper-large-v3', name: 'Whisper Large V3' },
];

export default function Home() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { model, setModel } = useUIStore();
  const { mutate: createConversation, isPending } = useCreateConversation();

  const handleSendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const title = generateChatTitle(text);
      createConversation(title, {
        onSuccess: (conversation) => {
          router.push(`/chat/${conversation.id}`);
        },
      });
    },
    [createConversation, router]
  );

  const handleModelChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setModel(e.target.value);
    },
    [setModel]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (textareaRef.current) {
          handleSendMessage(textareaRef.current.value);
          textareaRef.current.value = '';
        }
      }
    },
    [handleSendMessage]
  );

  const handleButtonClick = useCallback(() => {
    if (textareaRef.current) {
      handleSendMessage(textareaRef.current.value);
      textareaRef.current.value = '';
    }
  }, [handleSendMessage]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 370)}px`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full text-white text-center px-4">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4">Welcome to the Chat</h2>
      <p className="text-base sm:text-lg text-muted-foreground mb-8 font-mono">
        Select a conversation or create a new one.
      </p>
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl">
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 opacity-50"></div>
          <textarea
            disabled={isPending}
            ref={textareaRef}
            onChange={adjustHeight}
            placeholder="Type your message..."
            className="min-h-[120px] w-full focus:outline-none p-2 resize-none bg-transparent text-white placeholder:text-gray-400"
            onKeyDown={handleKeyDown}
          />
          <select
            value={model}
            onChange={handleModelChange}
            disabled={isPending}
            className="absolute left-1 bottom-1 rounded-xl bg-gray-800 text-sm text-white/80 p-1 disabled:opacity-50"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleButtonClick}
          disabled={isPending}
          className="w-full rounded-xl text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-colors mt-2 p-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendHorizontal className="h-5 w-5 mr-2" />
          {isPending ? 'Creating...' : 'Start New Conversation'}
        </button>
      </div>
    </div>
  );
}
