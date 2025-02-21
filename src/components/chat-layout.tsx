'use client';

import { MessageSquare, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ChatWindow from '@/components/chat-window';
import { useChatStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
export default function ChatLayout() {
  const {
    conversations,
    selectedConversation,
    createNewConversation,
    selectConversation,
    loadUserConversations,
  } = useChatStore();

  const handleNewChat = () => {
    createNewConversation();
  };
  useEffect(() => {
    try {
      loadUserConversations();
      toast.success('Conversations loaded successfully');
    } catch (e) {
      toast.error('Failed to load conversations');
    }
  }, []);
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
            {conversations.map((chat) => (
              <Button
                key={chat.id}
                variant={
                  selectedConversation?.id === chat.id ? 'secondary' : 'ghost'
                }
                className="w-full justify-start"
                onClick={() => selectConversation(chat)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {chat.title}
              </Button>
            ))}
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
      <ChatWindow />
    </div>
  );
}
