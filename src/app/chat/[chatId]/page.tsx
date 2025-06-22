// //chat[chatId]/page.tsx
// 'use client';
// import Image from 'next/image';
// import { useChatStore } from '@/lib/store';
// import { useSession } from 'next-auth/react';
// import { Textarea } from '@/components/ui/textarea';
// import { ChangeEvent, useCallback, useEffect, useRef } from 'react';
// import MarkdownRenderer from '@/components/mdRenderer';
// import { SendHorizontal } from 'lucide-react';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { useParams, useRouter } from 'next/navigation';

// // Move models outside component to prevent recreation
// const models = [
//   { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
//   { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
//   {
//     id: 'open-codestral-mamba',
//     name: 'Codestral Mamba',
//     provider: 'Mistral',
//   },
//   { id: 'mistral-small-latest', name: 'Mistral Small', provider: 'Mistral' },
//   { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
// ];
// export default function Chats() {
//   const { data: session } = useSession();
//   const params = useParams();
//   const router = useRouter();
//   const { sendMessage, isLoading, model, setModel, error, conversations } =
//     useChatStore();
//   const chatId = params.chatId as string;
//   const currentConversation = conversations.find((c) => c.id === chatId);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const scrollAreaRef = useRef<HTMLDivElement>(null);
//   const lastMessageRef = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     if (!currentConversation) {
//       router.replace('/');
//     }
//   }, [currentConversation, router]);

//   if (!currentConversation) {
//     return null;
//   }
//   const handleSendMessage = useCallback(
//     async (text: string) => {
//       if (!text.trim()) return;
//       try {
//         await sendMessage(text, chatId);
//         if (textareaRef.current) {
//           textareaRef.current.value = '';
//         }
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     },
//     [sendMessage]
//   );
//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//       if (e.key === 'Enter' && !e.shiftKey) {
//         e.preventDefault();
//         if (textareaRef.current) {
//           handleSendMessage(textareaRef.current.value);
//         }
//       }
//     },
//     [handleSendMessage]
//   );
//   const handleButtonClick = useCallback(() => {
//     if (textareaRef.current) {
//       handleSendMessage(textareaRef.current.value);
//     }
//   }, [handleSendMessage]);

//   // Function to adjust textarea height
//   const adjustHeight = useCallback(() => {
//     const textarea = textareaRef.current;
//     if (textarea) {
//       textarea.style.height = 'auto';
//       textarea.style.height = `${Math.min(textarea.scrollHeight, 370)}px`;
//     }
//   }, []);
//   const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
//     setModel(e.target.value);
//   };
//   useEffect(() => {
//     if (lastMessageRef.current) {
//       lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
//     } else if (scrollAreaRef.current) {
//       requestAnimationFrame(() => {
//         if (scrollAreaRef.current) {
//           scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
//         }
//       });
//     }
//   }, [currentConversation?.messages]);
//   return (
//     <>
//       {error && (
//         <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-10">
//           {error}
//         </div>
//       )}
//       <div className="flex flex-col h-screen w-full">
//         <div className="border-b border-white/20 p-4 text-center">
//           <h2 className="text-lg font-semibold text-white">
//             {currentConversation.title}
//           </h2>
//         </div>

//         <ScrollArea className="p-4 w-3/4 mx-auto flex-1" ref={scrollAreaRef}>
//           <div className="space-y-8">
//             {currentConversation.messages.map((message, index) => (
//               <div
//                 key={message.id}
//                 ref={
//                   index === currentConversation.messages.length - 1
//                     ? lastMessageRef
//                     : null
//                 }
//                 className={`${
//                   message.sender === 'user' ? 'w-3/4 ml-auto' : 'w-full'
//                 }`}
//               >
//                 <div
//                   className={`max-w-[95%] mx-auto ${
//                     message.sender === 'user'
//                       ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-primary-foreground px-2 py-4 rounded-3xl'
//                       : 'ring-1 ring-white/10 p-1 rounded-xl'
//                   }`}
//                 >
//                   {message.sender === 'user' ? (
//                     <div className="flex gap-2 items-start">
//                       {session?.user.image ? (
//                         <Image
//                           src={session.user.image}
//                           alt={session.user.name ?? 'User'}
//                           width={40}
//                           height={40}
//                           className="rounded-full"
//                         />
//                       ) : (
//                         <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-700 font-bold">
//                           X
//                         </div>
//                       )}
//                       {message.text}
//                     </div>
//                   ) : (
//                     <MarkdownRenderer content={message.text} />
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </ScrollArea>

//         <div className="px-2 py-1 w-3/4 mx-auto relative rounded-2xl ring-1 bg-transparent ring-white/20">
//           <div className="absolute inset-0 rounded-2xl bg-gradient-to-r -z-10 from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-50"></div>
//           <Textarea
//             name="textarea"
//             disabled={isLoading}
//             ref={textareaRef}
//             onChange={adjustHeight}
//             placeholder="Type your message..."
//             className="min-h-[100px] resize-none border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
//             onKeyDown={handleKeyDown}
//           />
//           <div className="flex items-center justify-between px-2 py-1 rounded-xl">
//             <select
//               name="models"
//               className="bg-gray-800/40 text-sm text-white/80 p-1 "
//               id="models"
//               value={model}
//               onChange={(e) => handleModelChange(e)}
//             >
//               {models.map((m) => (
//                 <option
//                   key={m.id}
//                   id="models"
//                   value={m.id}
//                   className="text-green-600"
//                 >
//                   {m.name}
//                 </option>
//               ))}
//             </select>
//             <button onClick={handleButtonClick} disabled={isLoading}>
//               <SendHorizontal className="h-5 w-5 mr-2 text-white" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
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

// Constants
const MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'open-codestral-mamba', name: 'Codestral Mamba', provider: 'Mistral' },
  { id: 'mistral-small-latest', name: 'Mistral Small', provider: 'Mistral' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
];

const MAX_TEXTAREA_HEIGHT = 370;

export default function Chats() {
  // Hooks and state
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const {
    sendMessage,
    isLoading,
    isStreaming,
    model,
    setModel,
    error,
    conversations,
  } = useChatStore();

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Derived values
  const chatId = params.chatId as string;
  const currentConversation = conversations.find((c) => c.id === chatId);

  // Effects
  useEffect(() => {
    if (!currentConversation) {
      router.replace('/');
    }
  }, [currentConversation, router]);

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

  // Event handlers
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      try {
        await sendMessage(text, chatId);
        if (textareaRef.current) {
          textareaRef.current.value = '';
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [sendMessage, chatId, isLoading]
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

  const handleSendClick = useCallback(() => {
    if (textareaRef.current) {
      handleSendMessage(textareaRef.current.value);
    }
  }, [handleSendMessage]);

  const handleModelChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setModel(e.target.value);
    },
    [setModel]
  );

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(
        textarea.scrollHeight,
        MAX_TEXTAREA_HEIGHT
      )}px`;
    }
  }, []);

  // Early return
  if (!currentConversation) {
    return null;
  }

  return (
    <>
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-10">
          {error}
        </div>
      )}

      <div className="flex flex-col h-screen w-full">
        {/* Header */}
        <div className="border-b border-white/20 p-4 text-center">
          <h2 className="text-lg font-semibold text-white">
            {currentConversation.title}
          </h2>
        </div>

        {/* Messages */}
        <ScrollArea className="p-4 w-3/4 mx-auto flex-1" ref={scrollAreaRef}>
          <div className="space-y-8">
            {currentConversation.messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                session={session}
                isLast={index === currentConversation.messages.length - 1}
                isStreaming={isStreaming}
                lastMessageRef={lastMessageRef}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <ChatInput
          textareaRef={textareaRef}
          isLoading={isLoading}
          model={model}
          onKeyDown={handleKeyDown}
          onTextareaChange={adjustTextareaHeight}
          onModelChange={handleModelChange}
          onSendClick={handleSendClick}
        />
      </div>
    </>
  );
}

// Separated Components (only 2 main ones)

interface MessageBubbleProps {
  message: any;
  session: any;
  isLast: boolean;
  isStreaming: boolean;
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
}

function MessageBubble({
  message,
  session,
  isLast,
  isStreaming,
  lastMessageRef,
}: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const lastLoading = isStreaming && isLast;
  return (
    <div
      ref={isLast ? lastMessageRef : null}
      className={`${isUser ? 'w-3/4 ml-auto' : 'w-full'}`}
    >
      <div
        className={`max-w-[95%] mx-auto ${
          isUser
            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-primary-foreground px-2 py-4 rounded-3xl'
            : 'ring-1 ring-white/10 p-1 rounded-xl'
        }`}
      >
        {isUser ? (
          <div className="flex gap-2 items-start">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? 'User'}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-700 font-bold">
                {session?.user?.name?.[0] ?? 'U'}
              </div>
            )}
            {message.text}
          </div>
        ) : lastLoading ? (
          <div>
            <div className="flex items-center justify-center w-full h-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-gray-400 text-sm text-center">Thinking...</p>
          </div>
        ) : (
          <MarkdownRenderer content={message.text} />
        )}
      </div>
    </div>
  );
}

interface ChatInputProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  isLoading: boolean;
  model: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onTextareaChange: () => void;
  onModelChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  onSendClick: () => void;
}

function ChatInput({
  textareaRef,
  isLoading,
  model,
  onKeyDown,
  onTextareaChange,
  onModelChange,
  onSendClick,
}: ChatInputProps) {
  return (
    <div className="px-2 py-1 w-3/4 mx-auto relative rounded-2xl ring-1 bg-transparent ring-white/20">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r -z-10 from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-50" />

      <Textarea
        ref={textareaRef}
        disabled={isLoading}
        onChange={onTextareaChange}
        onKeyDown={onKeyDown}
        placeholder="Type your message..."
        className="min-h-[100px] resize-none border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      <div className="flex items-center justify-between px-2 py-1 rounded-xl">
        <select
          value={model}
          onChange={onModelChange}
          disabled={isLoading}
          className="bg-gray-800/40 text-sm text-white/80 p-1 disabled:opacity-50"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id} className="text-green-600">
              {m.name}
            </option>
          ))}
        </select>

        <button
          onClick={onSendClick}
          disabled={isLoading}
          className="disabled:opacity-50"
        >
          <SendHorizontal className="h-5 w-5 mr-2 text-white" />
        </button>
      </div>
    </div>
  );
}
