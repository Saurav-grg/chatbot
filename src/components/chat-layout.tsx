'use client';
import {
  MessageSquare,
  MoreVertical,
  Plus,
  Settings,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ChatWindow from '@/components/chat-window';
import { useChatStore } from '@/lib/store';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
// import { deleteConversation } from '@/lib/actions';
export default function ChatLayout() {
  const {
    conversations,
    selectedConversation,
    // createNewConversation,
    selectConversation,
    loadUserConversations,
    deleteUserConversation,
  } = useChatStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | number | null
  >(null);
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const handleNewChat = () => {
    useChatStore.setState({ selectedConversation: null });
  };

  const handleDeleteClick = (
    conversationId: string | number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      deleteUserConversation(conversationToDelete.toString());
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };
  const toggleMenu = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
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
              <div key={chat.id} className="flex items-center group relative">
                <button
                  className={`w-full flex items-center text-left px-3 py-2 text-sm rounded-md ${
                    selectedConversation?.id === chat.id
                      ? 'bg-gray-200 dark:bg-gray-800'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  } transition-colors`}
                  onClick={() => selectConversation(chat)}
                >
                  <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </button>
                <button
                  onClick={(e) => toggleMenu(chat.id, e)}
                  className="absolute right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {openMenuId === chat.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10"
                  >
                    <div className="py-1">
                      <button
                        onClick={(e) => handleDeleteClick(chat.id, e)}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Delete Conversation
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Are you sure you want to delete this conversation? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
