'use client';

import { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/lib/store';
// import { googleAiResponse } from '@/lib/actions';

export default function ChatWindow() {
  const { selectedConversation, sendMessage, isLoading } = useChatStore();
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
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">{selectedConversation.title}</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {selectedConversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            disabled={isLoading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[60px]"
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
