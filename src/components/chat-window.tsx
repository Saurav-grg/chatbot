'use client';
import { useState } from 'react';
import { Check, ChevronDown, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/lib/store';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { googleAiResponse } from '@/lib/actions';

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
  const { selectedConversation, sendMessage, isLoading, model, setModel } =
    useChatStore();
  const [input, setInput] = useState('');
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    await sendMessage(text);
    setInput(''); // Clear input after sending
  };

  if (!selectedConversation)
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome to the Chat</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Select a conversation to start chatting or create a new one.
        </p>
        <div className="w-full max-w-md">
          <Textarea
            disabled={isLoading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message to start a new conversation..."
            className="min-h-[100px] mb-4 pb-12"
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
    );

  return (
    <div className="flex flex-1 flex-col ">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">{selectedConversation.title}</h2>
      </div>

      <ScrollArea className="flex-1 p-4 w-3/4 mx-auto ">
        <div className="space-y-10">
          {selectedConversation.messages.map((message) => (
            <div
              key={message.id}
              className={` ${
                message.sender === 'user' ? 'w-3/4 ml-auto' : 'w-full'
              }`}
              // className="flex"
            >
              <div
                className={`max-w-[95%] mx-auto rounded-3xl p-6 ${
                  message.sender === 'user'
                    ? 'bg-primary/90 text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.sender === 'user' ? (
                  message.text
                ) : (
                  <Markdown
                    // className="prose" // Tailwind "prose" class for nice typography
                    components={{
                      code({ node, className, children, ...props }) {
                        // const isInline = false;
                        // const isInline = !node?.tagName?.includes('pre');
                        // console.log(className);
                        // console.log(node?.tagName);
                        // if (node?.tagName == 'pre') {
                        console.log(children);
                        // }
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          // <div className=" my-2 rounded-lg overflow-auto">
                          <SyntaxHighlighter
                            language={match[1]}
                            PreTag="div"
                            {...props}
                            style={dark}
                          >
                            {children}
                          </SyntaxHighlighter>
                        ) : (
                          // </div>
                          <code className="bg-gray-200 px-1 rounded" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.text}
                  </Markdown>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 w-3/4 mx-auto">
        <div className="relative">
          <Textarea
            disabled={isLoading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[100px] w-full border rounded-xl p-2 bg-gray-100"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
          />
          <div className="absolute bottom-3 left-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors">
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
          </div>
        </div>
      </div>
    </div>
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
