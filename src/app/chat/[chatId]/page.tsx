//chat[chatId]/page.tsx
'use client';
import Image from 'next/image';
import { useChatStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { Textarea } from '@/components/ui/textarea';
import { ChangeEvent, useCallback, useEffect, useRef } from 'react';
import MarkdownRenderer from '@/components/mdRenderer';
import { SendHorizontal } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useParams, useRouter } from 'next/navigation';

// Move models outside component to prevent recreation
const models = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  {
    id: 'open-codestral-mamba',
    name: 'Codestral Mamba',
    provider: 'Mistral',
  },
  { id: 'mistral-small-latest', name: 'Mistral Small', provider: 'Mistral' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
];
export default function Chats() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { sendMessage, isLoading, model, setModel, error, conversations } =
    useChatStore();
  const chatId = params.chatId as string;
  const currentConversation = conversations.find((c) => c.id === chatId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!currentConversation) {
      router.replace('/');
    }
  }, [currentConversation, router]);

  if (!currentConversation) {
    return null;
  }
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      try {
        await sendMessage(text, chatId);
        // Clear textarea after sending
        if (textareaRef.current) {
          textareaRef.current.value = '';
          // adjustHeight();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    [sendMessage]
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

  // Function to adjust textarea height
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 370)}px`;
    }
  }, []);
  const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };
  // console.log('Model changed to:', model);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (scrollAreaRef.current) {
      requestAnimationFrame(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      });
    }
  }, [currentConversation?.messages]);

  return (
    <>
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-10">
          {error}
        </div>
      )}
      <div className="flex flex-col h-screen w-full">
        <div className="border-b border-white/20 p-4 text-center">
          <h2 className="text-lg font-semibold text-white">
            {currentConversation.title}
          </h2>
        </div>

        <ScrollArea className="p-4 w-3/4 mx-auto flex-1" ref={scrollAreaRef}>
          <div className="space-y-8">
            {currentConversation.messages.map((message, index) => (
              <div
                key={message.id}
                ref={
                  index === currentConversation.messages.length - 1
                    ? lastMessageRef
                    : null
                }
                className={`${
                  message.sender === 'user' ? 'w-3/4 ml-auto' : 'w-full'
                }`}
              >
                <div
                  className={`max-w-[95%] mx-auto ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-primary-foreground px-2 py-4 rounded-3xl'
                      : 'ring-1 ring-white/10 p-1 rounded-xl'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <div className="flex gap-2 items-start">
                      {session?.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name ?? 'User'}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-700 font-bold">
                          X
                        </div>
                      )}
                      {message.text}
                    </div>
                  ) : (
                    <MarkdownRenderer content={message.text} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="px-2 py-1 w-3/4 mx-auto relative rounded-2xl ring-1 bg-transparent ring-white/20">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r -z-10 from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-50"></div>
          <Textarea
            name="textarea"
            disabled={isLoading}
            ref={textareaRef}
            onChange={adjustHeight}
            placeholder="Type your message..."
            className="min-h-[100px] resize-none border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center justify-between px-2 py-1 rounded-xl">
            <select
              name="models"
              className="bg-gray-800/40 text-sm text-white/80 p-1 "
              id="models"
              value={model}
              onChange={(e) => handleModelChange(e)}
            >
              {models.map((m) => (
                <option
                  key={m.id}
                  id="models"
                  value={m.id}
                  className="text-green-600"
                >
                  {m.name}
                </option>
              ))}
            </select>
            <button onClick={handleButtonClick} disabled={isLoading}>
              <SendHorizontal className="h-5 w-5 mr-2 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
