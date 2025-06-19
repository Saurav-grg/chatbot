//app/page.tsx
'use client';
import { useChatStore } from '@/lib/store';
import { useCallback, useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const {
    getConversationById,
    sendMessage,
    isLoading,
    model,
    // setModel,
    error,
  } = useChatStore();
  const router = useRouter();
  // const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      try {
        const conversationId = await sendMessage(text);
        if (conversationId) {
          router.push(`/chat/${conversationId}`);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    [sendMessage, router]
  );
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (textareaRef.current) {
          handleSendMessage(textareaRef.current.value);
        }
      }
    },
    [handleSendMessage]
  );
  const handleButtonClick = useCallback(() => {
    if (textareaRef.current) {
      handleSendMessage(textareaRef.current.value);
    }
  }, [handleSendMessage]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${Math.min(textarea.scrollHeight, 370)}px`;
    }
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen w-full text-white text-center">
        <h2 className="text-3xl font-bold mb-4 ">Welcome to the Chat</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Select a conversation to start chatting or create a new one.
        </p>
        <div
          // initial={{ opacity: 0, scale: 0.9 }}
          // animate={{ opacity: 1, scale: 1 }}
          // transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl">
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-50"></div>
            <div className="absolute inset-0 -z-10 rounded-xl bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0)_70%)]"></div>
            <textarea
              disabled={isLoading}
              ref={textareaRef}
              onChange={adjustHeight}
              placeholder="Type your message to start a new conversation..."
              className="min-h-[120px] w-full focus:outline-none p-2 resize-none bg-transparent text-white"
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            onClick={handleButtonClick}
            disabled={isLoading}
            className="w-full rounded-xl text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 
            transition-colors mt-1 p-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendHorizontal className="h-5 w-5 mr-2" />
            {isLoading ? 'Creating...' : 'Start New Conversation'}
          </button>
        </div>
      </div>
    </>
  );
}
