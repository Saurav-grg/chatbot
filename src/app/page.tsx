'use client';
import { useChatStore } from '@/lib/store';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const {
    selectedConversation,
    sendMessage,
    isLoading,
    model,
    setModel,
    error,
  } = useChatStore();
  const router = useRouter();
  const [input, setInput] = useState('');
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    try {
      await sendMessage(text);
      setInput(''); // Clear input after sending
      if (selectedConversation?.id) {
        router.push(`/chat/${selectedConversation.id}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${Math.min(textarea.scrollHeight, 370)}px`;
    }
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen w-full text-center">
        {/* <SidebarTrigger /> */}
        <h2 className="text-3xl font-bold mb-4 text-white">
          Welcome to the Chat
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Select a conversation to start chatting or create a new one.
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl">
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-50"></div>
            <div className="absolute inset-0 -z-10 rounded-xl bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0)_70%)]"></div>
            <Textarea
              disabled={isLoading}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustHeight(); // Adjust height on every change
              }}
              placeholder="Type your message to start a new conversation..."
              className="min-h-[120px] bg-red-200 resize-none border-0 bg-transparent text-white placeholder:text-gray-400 
              focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
            />
          </div>
          <Button onClick={() => handleSendMessage(input)} className="w-full">
            <SendHorizontal className="h-5 w-5 mr-2" />
            Start New Conversation
          </Button>
        </motion.div>
      </div>
    </>
  );
}
