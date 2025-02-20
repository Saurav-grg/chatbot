'use client';

import { MessageSquare, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ChatWindow from '@/components/chat-window';
import { useChatStore } from '@/lib/store';
import Link from 'next/link';

export default function ChatLayout() {
  // const { chats, selectedChat, addChat, setSelectedChat } = useChatStore();

  const handleNewChat = () => {
    // addChat('New Chat');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-background border-r flex flex-col">
        <div className="p-4">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-4">
            {/* {chats.map((chat) => (
              <Button
                key={chat.id}
                variant={selectedChat?.id === chat.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedChat(chat)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {chat.title}
              </Button>
            ))} */}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-4">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            <Link href="/auth"> Auth</Link>
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      {/* {selectedChat && <ChatWindow />} */}
    </div>
  );
}
