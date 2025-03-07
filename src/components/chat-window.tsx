'use client';

import { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/lib/store';
import Markdown from 'react-markdown';
import { CodeProps } from '@/types';

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
    { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral' },
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message to start a new conversation..."
            className="min-h-[100px] mb-4"
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
                  // components={{
                  //   code({ node, className, children, ...props }) {
                  //     // const isInline = inline || false;
                  //     const isInline = !props.node?.tagName?.includes('pre');
                  //     return isInline ? (
                  //       <code className="bg-gray-200 px-1 rounded" {...props}>
                  //         {children}
                  //       </code>
                  //     ) : (
                  //       <div className="my-4">
                  //         <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto">
                  //           <code>{children}</code>
                  //         </pre>
                  //       </div>
                  //     );
                  //   },
                  // }}
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
        <div className="flex gap-2 ">
          <Textarea
            disabled={isLoading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[100px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(input);
              }
            }}
          />
          <Button onClick={() => handleSendMessage(input)}>
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
