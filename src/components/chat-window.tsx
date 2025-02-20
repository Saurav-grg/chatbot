'use client';

import { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/lib/store';
import { googleAiResponse } from '@/lib/actions';

export default function ChatWindow() {
  const { selectedConversation } = useChatStore();
  const [input, setInput] = useState('');

  // const handleSend = async () => {
  //   if (!input.trim() || !selectedConversation) return;

  //   // Add user message
  //   addMessage(input, 'user', selectedConversation.id);

  //   // Simulate AI response
  //   setTimeout(() => {
  //     addMessage(
  //       "This is a placeholder response. In a real implementation, this would be the AI's response.",
  //       'assistant',
  //       selectedConversation.id
  //     );
  //   }, 1000);

  //   setInput('');
  // };
  const handleSubmit = async () => {
    if (!input.trim() || !selectedConversation) return;

    // Add user message
    // addMessage(input, 'user', selectedConversation.id);

    // Generate AI response
    try {
      const response = await googleAiResponse(input);
      // addMessage(response, 'assistant', selectedConversation.id);
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      // addMessage(
      //   'Failed to generate AI response',
      //   'assistant',
      //   selectedConversation.id
      // );
    }

    setInput('');
  };
  if (!selectedConversation) return null;

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">{selectedConversation.title}</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* {messages[selectedConversation.id]?.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))} */}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // handleSend();
              }
            }}
          />
          <Button onClick={handleSubmit}>
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
