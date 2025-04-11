'use client';
import { useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  SendHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/lib/store';
// import Markdown from 'react-markdown';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { ChatWindowProps } from '@/types';
import { useSession } from 'next-auth/react';
import MarkdownRenderer from './mdRenderer';
import { SidebarTrigger } from './ui/sidebar';

export default function ChatWindow() {
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
  const { data: session } = useSession();
  // console.log(session);
  const {
    selectedConversation,
    sendMessage,
    isLoading,
    model,
    setModel,
    error,
  } = useChatStore();
  const [input, setInput] = useState('');
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    try {
      await sendMessage(text);
      setInput(''); // Clear input after sending
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to adjust textarea height
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
      // console.log(textarea.scrollHeight);
    }
  };
  // useEffect(() => {
  //   adjustHeight();
  // }, [input]);
  if (!selectedConversation)
    return (
      <>
        {/* <button
          className={`absolute top-[12px] ${
            isSidebarOpen ? 'left-[265px]' : 'left-4'
          } p-2 border rounded-full bg-background shadow-sm transition-all duration-300 z-10 hover:bg-accent`}
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </button> */}
        <div className="flex flex-col items-center justify-center h-full w-full text-center">
          {/* <SidebarTrigger /> */}

          <h2 className="text-3xl font-bold mb-4">Welcome to the Chat</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Select a conversation to start chatting or create a new one.
          </p>
          <div className="w-full max-w-md">
            <Textarea
              disabled={isLoading}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustHeight(); // Adjust height on every change
              }}
              placeholder="Type your message to start a new conversation..."
              className="min-h-[100px] max-h-[400px] mb-4 pb-12 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
            />
            <Button onClick={() => handleSendMessage(input)} className="w-full">
              <SendHorizontal className="h-5 w-5 mr-2" />
              Start New Conversation
            </Button>
          </div>
        </div>
      </>
    );

  return (
    <>
      {/* {isMobile && !isSidebarOpen ? (
        <button
          className={`absolute top-[12px] ${
            isSidebarOpen ? 'left-[265px]' : 'left-4'
          } p-2 border rounded-full bg-background shadow-sm transition-all duration-300 z-10 hover:bg-accent`}
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </button>
      ) : null}
      {!isMobile && (
        <button
          className={`absolute top-[12px] ${
            isSidebarOpen ? 'left-[265px]' : 'left-4'
          } p-2 border rounded-full bg-background shadow-sm transition-all duration-300 z-10 hover:bg-accent`}
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </button>
      )} */}
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-10">
          {error}
        </div>
      )}
      <div className="flex flex-1 flex-col h-screen ">
        <div className="border-b p-4 text-center ">
          {/* <SidebarTrigger /> */}
          <h2 className="text-lg font-semibold">
            {selectedConversation.title}
          </h2>
        </div>

        <ScrollArea className="flex-1 p-4 w-3/4 mx-auto">
          <div className="space-y-8">
            {selectedConversation.messages.map((message) => (
              <div
                key={message.id}
                className={` ${
                  message.sender === 'user' ? 'w-3/4 ml-auto' : 'w-full'
                }`}
                // className="flex"
              >
                <div
                  className={`max-w-[95%] mx-auto ${
                    message.sender === 'user'
                      ? 'bg-primary/90 text-primary-foreground px-2 py-4 rounded-3xl'
                      : 'ring-1 p-1 rounded-xl'
                  }`}
                >
                  {message.sender === 'user' ? (
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
                          {session?.user?.name
                            ? session.user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                            : 'U'}
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

        <div className="p-2 w-3/4 mx-auto bg-gray-100 rounded-2xl">
          <div className="">
            <textarea
              disabled={isLoading}
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustHeight(); // Adjust height on every change
              }}
              placeholder="Type your message..."
              // style={{ border: 'none !important', outline: 'none !important' }}
              className="min-h-[100px] w-full focus:outline-0 rounded-xl p-2 pr-6 bg-gray-100 resize-none overflow-y-auto"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
            />
          </div>
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded-xl">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex ring-1 ring-gray-400 items-center gap-1 text-xs p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                <span>{models.find((m) => m.id === model)?.name}</span>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[180px]">
                {models.map((m) => (
                  <DropdownMenuItem
                    key={m.id}
                    className={`flex items-center justify-between ${
                      model === m.id && 'font-medium'
                    } `}
                    // ',model === m.id && 'font-medium'}
                    onClick={() => setModel(m.id)}
                  >
                    {m.name}
                    {model === m.id && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button>
              <SendHorizontal
                onClick={() => handleSendMessage(input)}
                className="h-5 w-5 mr-2"
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
{
  /* <Button
            className="absolute right-2 "
            onClick={() => handleSendMessage(input)}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <SendHorizontal />
            )}
          </Button> */
}
