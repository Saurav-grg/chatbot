// 'use client';
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarHeader,
// } from '@/components/ui/sidebar';
// import { useChatStore } from '@/lib/store';
// import { useEffect, useRef, useState } from 'react';
// import toast from 'react-hot-toast';
// import { Button } from './ui/button';
// import {
//   MessageSquare,
//   MoreVertical,
//   Plus,
//   Settings,
//   Trash,
// } from 'lucide-react';
// import { Separator } from './ui/separator';
// import Link from 'next/link';

// export function AppSidebar() {
//   const {
//     conversations,
//     selectedConversationId,
//     // createNewConversation,
//     selectConversation,
//     loadUserConversations,
//     deleteUserConversation,
//   } = useChatStore();
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [conversationToDelete, setConversationToDelete] = useState<
//     string | number | null
//   >(null);
//   const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
//   const menuRef = useRef<HTMLDivElement>(null);
//   const handleNewChat = () => {
//     useChatStore.setState({ selectedConversationId: null });
//   };

//   const handleDeleteClick = (
//     conversationId: string | number,
//     e: React.MouseEvent
//   ) => {
//     e.stopPropagation();
//     setConversationToDelete(conversationId);
//     setDeleteDialogOpen(true);
//     setOpenMenuId(null);
//   };

//   const confirmDelete = () => {
//     if (conversationToDelete) {
//       deleteUserConversation(conversationToDelete.toString());
//       setDeleteDialogOpen(false);
//       setConversationToDelete(null);
//     }
//   };
//   const toggleMenu = (id: string | number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setOpenMenuId(openMenuId === id ? null : id);
//   };
//   // Close menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setOpenMenuId(null);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);
//   useEffect(() => {
//     try {
//       loadUserConversations();
//       toast.success('Conversations loaded successfully');
//     } catch (e) {
//       toast.error('Failed to load conversations');
//     }
//   }, []);
//   return (
//     <Sidebar className="border-white/20 bg-black backdrop-blur-md text-white z-10">
//       <SidebarHeader>
//         <div className="px-2 pt-2 flex items-center gap-2 ">
//           <Button
//             onClick={handleNewChat}
//             className="w-full justify-start bg-gradient-to-br from-purple-600 to-blue-600"
//             // variant="outline"
//           >
//             <Plus className="mr-2 h-4 w-4" />
//             New Chat
//           </Button>
//         </div>
//       </SidebarHeader>
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel className="text-xs font-semibold text-gray-400">
//             YOUR CHATS
//           </SidebarGroupLabel>
//           <div className="space-y-2 pl-1 pt-1 pb-4">
//             {conversations.map((chat) => (
//               <div
//                 key={chat.id}
//                 className={`flex items-center group relative text-white rounded-lg pl-1 ${
//                   selectedConversationId?.id === chat.id
//                     ? 'bg-gray-800/80'
//                     : 'hover:bg-gray-700/80 '
//                 } `}
//               >
//                 <Link
//                   href={`/chat/${chat.id}`}
//                   className={`w-full overflow-hidden flex items-center text-left px-1 py-2 text-sm rounded-md
//                 transition-colors`}
//                   onClick={() => selectConversation(chat)}
//                 >
//                   <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
//                   <span className="truncate">{chat.title}</span>
//                 </Link>
//                 <button
//                   onClick={(e) => toggleMenu(chat.id, e)}
//                   className={`p-1 rounded-md opacity-0 group-hover:opacity-100
//                     ${
//                       selectedConversationId?.id === chat.id
//                         ? 'hover:bg-gray-800'
//                         : 'hover:bg-gray-700'
//                     }
//                       transition-opacity`}
//                 >
//                   <MoreVertical className="h-4 w-4" />
//                 </button>

//                 {openMenuId === chat.id && (
//                   <div
//                     ref={menuRef}
//                     className="absolute z-10 right-[-80px] top-0 mt-1 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
//                   >
//                     <div className="py-1">
//                       <button
//                         onClick={(e) => handleDeleteClick(chat.id, e)}
//                         className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
//                       >
//                         <Trash className="mr-2 h-4 w-4" />
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </SidebarGroup>
//       </SidebarContent>
//       {/* </div> */}
//       <SidebarFooter>
//         <Separator />
//         <div className="p-2">
//           <Button variant="ghost" className="w-full justify-start">
//             <Settings className="mr-2 h-4 w-4" />
//             <Link href="/auth"> Auth</Link>
//           </Button>
//         </div>
//       </SidebarFooter>
//       {/* Delete Confirmation Dialog */}
//       {deleteDialogOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
//             <div className="mb-4">
//               <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
//                 Delete Conversation
//               </h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 Are you sure you want to delete this conversation? This action
//                 cannot be undone.
//               </p>
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => setDeleteDialogOpen(false)}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </Sidebar>
//   );
// }

'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { useChatStore } from '@/lib/store';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import {
  MessageSquare,
  MoreVertical,
  Plus,
  Settings,
  Trash,
} from 'lucide-react';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export function AppSidebar() {
  const {
    loadUserConversations,
    conversations,
    selectConversation,
    deleteUserConversation,
  } = useChatStore();
  const router = useRouter();
  const { chatId } = useParams();
  const selectedConversationId = chatId ? chatId.toString() : null;
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  const handleNewChat = useCallback(() => {
    // useChatStore.setState({ selectedConversationId: null });
    router.push('/');
  }, []);

  const handleMenuToggle = useCallback(
    (id: string | number, e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenMenuId((prev) => (prev === id ? null : id));
    },
    []
  );

  const handleDeleteClick = useCallback(
    (id: string | number, e: React.MouseEvent) => {
      e.stopPropagation();
      setDeleteId(id);
      setOpenMenuId(null);
    },
    []
  );

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteUserConversation(deleteId.toString());
      setDeleteId(null);
    }
  }, [deleteId, deleteUserConversation]);

  const cancelDelete = useCallback(() => setDeleteId(null), []);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;

    const handleClick = () => setOpenMenuId(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [openMenuId]);

  // Load conversations once
  useEffect(() => {
    loadUserConversations()
      .then(() => toast.success('Conversations loaded successfully'))
      .catch(() => toast.error('Failed to load conversations'));
  }, [loadUserConversations]);

  return (
    <Sidebar className="border-white/20 bg-black backdrop-blur-md text-white z-10">
      <SidebarHeader>
        <div className="px-2 pt-2">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start bg-gradient-to-br from-purple-600 to-blue-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400">
            YOUR CHATS
          </SidebarGroupLabel>
          <div className="space-y-2 pl-1 pt-1 pb-4">
            {conversations.map((chat) => {
              const isSelected = selectedConversationId === chat.id;
              const isMenuOpen = openMenuId === chat.id;

              return (
                <div
                  key={chat.id}
                  className={`flex items-center group relative text-white rounded-lg pl-1 ${
                    isSelected ? 'bg-gray-800/80' : 'hover:bg-gray-700/80'
                  }`}
                >
                  <Link
                    href={`/chat/${chat.id}`}
                    className="w-full overflow-hidden flex items-center text-left px-1 py-2 text-sm rounded-md transition-colors"
                    onClick={() => selectConversation(chat.id)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </Link>

                  <button
                    onClick={(e) => handleMenuToggle(chat.id, e)}
                    className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                      isSelected ? 'hover:bg-gray-800' : 'hover:bg-gray-700'
                    }`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute z-10 right-[-80px] top-0 mt-1 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                      <button
                        onClick={(e) => handleDeleteClick(chat.id, e)}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator />
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            <Link href="/auth">Auth</Link>
          </Button>
        </div>
      </SidebarFooter>

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Delete Conversation
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
