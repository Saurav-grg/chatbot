"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import { ChangeEvent, useCallback, useEffect, useRef } from "react";
import MarkdownRenderer from "@/components/mdRenderer";
import { SendHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Message, Session } from "@/types";
import { useConversation } from "@/hooks/queries/useConversation";
import { useSendMessage } from "@/hooks/mutations/useSendMessage";
import { useUIStore } from "@/lib/ui-store";

const MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini Flash", provider: "Google" },
  { id: "groq/compound", name: "Groq Compound" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B" },
  { id: "openai/gpt-oss-120b", name: "OpenAI GPT-OSS 120B" },
  { id: "qwen/qwen3-32b", name: "Qwen 3.32B" },
  { id: "whisper-large-v3", name: "Whisper Large V3" },
];

const MAX_TEXTAREA_HEIGHT = 370;

export default function Chats() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = params.chatId as string;

  const { data: conversation, isLoading: isLoadingConversation } =
    useConversation(chatId);
  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage();
  const { model, setModel, setIsStreaming } = useUIStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const hasProcessedQuery = useRef(false);
  useEffect(() => {
    if (
      !isLoadingConversation &&
      conversation &&
      conversation.messages.length === 0 &&
      !hasProcessedQuery.current
    ) {
      const text = searchParams?.get("query");
      if (text && !isSendingMessage) {
        hasProcessedQuery.current = true;
        setIsStreaming(true);
        sendMessage(
          { conversationId: conversation.id, text, model },
          {
            onSuccess: () => {
              setIsStreaming(false);
            },
            onError: () => {
              setIsStreaming(false);
            },
          }
        );
        // Clear the query param from URL
        const newUrl = window.location.pathname;
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [
    conversation,
    isLoadingConversation,
    searchParams,
    isSendingMessage,
    model,
    sendMessage,
    setIsStreaming,
    router,
  ]);
  useEffect(() => {
    if (!isLoadingConversation && !conversation) {
      router.replace("/");
    }
  }, [conversation, isLoadingConversation, router]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (scrollAreaRef.current) {
      requestAnimationFrame(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      });
    }
  }, [conversation?.messages]);

  const handleSendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isSendingMessage || !conversation) return;

      setIsStreaming(true);
      sendMessage(
        { conversationId: conversation.id, text, model },
        {
          onSuccess: () => {
            setIsStreaming(false);
            if (textareaRef.current) {
              textareaRef.current.value = "";
              textareaRef.current.style.height = "auto";
            }
          },
          onError: () => {
            setIsStreaming(false);
          },
        }
      );
    },
    [conversation, isSendingMessage, model, sendMessage, setIsStreaming]
  );
  // if (conversation?.messages.length === 0) {
  //   const text = searchParams.get("query");
  //   if (text) {
  //     handleSendMessage(text);
  //   }
  // }
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
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
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(
        textarea.scrollHeight,
        MAX_TEXTAREA_HEIGHT
      )}px`;
    }
  }, []);

  if (isLoadingConversation || !conversation) {
    return (
      <div className="flex items-center justify-center h-screen w-full text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="border-b border-white/20 p-4 text-center">
        <h2 className="text-lg font-semibold text-white">
          {conversation.title}
        </h2>
      </div>

      <ScrollArea
        className="p-4 w-full sm:w-3/4 mx-auto flex-1"
        ref={scrollAreaRef}
      >
        <div className="space-y-8">
          {conversation.messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              session={session}
              isLast={index === conversation.messages.length - 1}
              isStreaming={isSendingMessage}
              lastMessageRef={lastMessageRef}
            />
          ))}
        </div>
      </ScrollArea>

      <ChatInput
        textareaRef={textareaRef}
        isLoading={isSendingMessage}
        model={model}
        onKeyDown={handleKeyDown}
        onTextareaChange={adjustTextareaHeight}
        onModelChange={handleModelChange}
        onSendClick={handleSendClick}
      />
    </div>
  );
}

// Separated Components (only 2 main ones)

interface MessageBubbleProps {
  message: Message;
  session: Session | null;
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
  const isUser = message.sender === "user";
  const isPlaceholder = message.id.toString().startsWith("temp-");
  const showLoading =
    isLast &&
    !isUser &&
    isPlaceholder &&
    isStreaming &&
    message.text.length < 1;
  return (
    <div
      ref={isLast ? lastMessageRef : null}
      className={`${isUser ? "w-full sm:w-3/4 ml-auto" : "w-full"}`}
    >
      <div
        className={`max-w-[95%] mx-auto ${
          isUser
            ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-primary-foreground px-3 py-2 rounded-3xl"
            : "ring-1 ring-white/10 p-2 rounded-xl"
        }`}
      >
        {isUser ? (
          <div className="flex gap-2 items-start font-mono">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={40}
                height={40}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-700 font-bold flex-shrink-0">
                {session?.user?.name?.[0] ?? "U"}
              </div>
            )}
            <p className="break-words">{message.text}</p>
          </div>
        ) : showLoading ? (
          <div>
            <div className="flex items-center justify-center w-full h-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
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
    <div className="px-2 py-2 w-full sm:w-3/4 mx-auto relative rounded-2xl ring-1 bg-transparent ring-white/20">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r -z-10 from-blue-500/10 via-cyan-500/10 to-teal-500/10 opacity-50" />

      <Textarea
        ref={textareaRef}
        disabled={isLoading}
        onChange={onTextareaChange}
        onKeyDown={onKeyDown}
        placeholder="Type your message..."
        className="min-h-[100px] resize-none border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base"
      />

      <div className="flex items-center justify-between gap-2 px-2 py-1 rounded-xl flex-wrap sm:flex-nowrap">
        <select
          value={model}
          onChange={onModelChange}
          disabled={isLoading}
          className="bg-gray-800 text-xs sm:text-sm rounded-xl text-white/80 p-1 disabled:opacity-50 flex-shrink-0"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <button
          onClick={onSendClick}
          disabled={isLoading}
          className="disabled:opacity-50 p-2 hover:text-cyan-400 transition-colors flex-shrink-0"
        >
          <SendHorizontal className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}
