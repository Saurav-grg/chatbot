// 'use client';
// import { useEffect, useRef, useState } from 'react';
// import { Check, ChevronDown, SendHorizontal } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import Image from 'next/image';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Textarea } from '@/components/ui/textarea';
// import { useChatStore } from '@/lib/store';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { useSession } from 'next-auth/react';
// import MarkdownRenderer from './mdRenderer';
// import { motion } from 'framer-motion';
// export default function ChatWindow() {
//   const models = [
//     { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
//     { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
//     {
//       id: 'open-codestral-mamba',
//       name: 'Codestral Mamba',
//       provider: 'Mistral',
//     },
//     { id: 'mistral-small-latest', name: 'Mistral Small', provider: 'Mistral' },
//     { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
//   ];
//   const { data: session } = useSession();
//   // console.log(session);
//   const {
//     selectedConversation,
//     sendMessage,
//     isLoading,
//     model,
//     setModel,
//     error,
//   } = useChatStore();
//   const [input, setInput] = useState('');
//   const handleSendMessage = async (text: string) => {
//     if (!text.trim()) return;
//     try {
//       await sendMessage(text);
//       setInput(''); // Clear input after sending
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const scrollAreaRef = useRef<HTMLDivElement>(null);
//   const lastMessageRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (lastMessageRef.current) {
//       lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
//     } else if (scrollAreaRef.current) {
//       requestAnimationFrame(() => {
//         if (scrollAreaRef.current) {
//           scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
//         }
//       });
//     }
//   }, [selectedConversation?.messages]);
//   // Function to adjust textarea height
//   const adjustHeight = () => {
//     const textarea = textareaRef.current;
//     if (textarea) {
//       textarea.style.height = 'auto'; // Reset height
//       textarea.style.height = `${Math.min(textarea.scrollHeight, 370)}px`;
//     }
//   };
//   // useEffect(() => {
//   //   adjustHeight();
//   // }, [input]);

//   if (!selectedConversation)
//     return (
//       <>
//         <div className="flex flex-col items-center justify-center h-full w-full text-center">
//           {/* <SidebarTrigger /> */}
//           <h2 className="text-3xl font-bold mb-4 text-white">
//             Welcome to the Chat
//           </h2>
//           <p className="text-lg text-muted-foreground mb-8">
//             Select a conversation to start chatting or create a new one.
//           </p>
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5, delay: 0.3 }}
//             className="w-full max-w-md"
//           >
//             <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-xl">
//               <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-50"></div>
//               <div className="absolute inset-0 -z-10 rounded-xl bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0)_70%)]"></div>
//               <Textarea
//                 disabled={isLoading}
//                 value={input}
//                 onChange={(e) => {
//                   setInput(e.target.value);
//                   adjustHeight(); // Adjust height on every change
//                 }}
//                 placeholder="Type your message to start a new conversation..."
//                 className="min-h-[120px] bg-red-200 resize-none border-0 bg-transparent text-white placeholder:text-gray-400
//               focus-visible:ring-0 focus-visible:ring-offset-0"
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault();
//                     handleSendMessage(input);
//                   }
//                 }}
//               />
//             </div>
//             <Button onClick={() => handleSendMessage(input)} className="w-full">
//               <SendHorizontal className="h-5 w-5 mr-2" />
//               Start New Conversation
//             </Button>
//           </motion.div>
//         </div>
//       </>
//     );

//   return (
//     <>
//       {error && (
//         <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-10">
//           {error}
//         </div>
//       )}
//       <div className="flex flex-1 flex-col h-screen ">
//         <div className="border-b border-white/20  p-4 text-center ">
//           {/* <SidebarTrigger /> */}
//           <h2 className="text-lg font-semibold text-white">
//             {selectedConversation.title}
//           </h2>
//         </div>

//         <ScrollArea className="flex-1 p-4 w-3/4 mx-auto" ref={scrollAreaRef}>
//           <div className="space-y-8">
//             {selectedConversation.messages.map((message, index) => (
//               <div
//                 key={message.id}
//                 ref={
//                   index === selectedConversation.messages.length - 1
//                     ? lastMessageRef
//                     : null
//                 }
//                 className={` ${
//                   message.sender === 'user' ? 'w-3/4 ml-auto' : 'w-full'
//                 }`}
//               >
//                 <div
//                   className={`max-w-[95%] mx-auto ${
//                     message.sender === 'user'
//                       ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-primary-foreground px-2 py-4 rounded-3xl'
//                       : 'ring-1 ring-white/10  p-1 rounded-xl'
//                   }`}
//                 >
//                   {message.sender === 'user' ? (
//                     <div className="flex gap-2 items-start">
//                       {session?.user.image ? (
//                         <Image
//                           src={session.user.image}
//                           alt={session.user.name ?? 'User'}
//                           width={40}
//                           height={40}
//                           className="rounded-full"
//                         />
//                       ) : (
//                         <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 text-gray-700 font-bold">
//                           X
//                         </div>
//                       )}
//                       {message.text}
//                     </div>
//                   ) : (
//                     <MarkdownRenderer content={message.text} />
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </ScrollArea>

//         <div className="px-2 py-1 w-3/4 mx-auto relative rounded-2xl ring-1 bg-transparent ring-white/20">
//           <div className="absolute inset-0 rounded-2xl bg-gradient-to-r -z-10 from-purple-500/10 via-blue-500/10 to-pink-500/10 opacity-50"></div>
//           <Textarea
//             disabled={isLoading}
//             ref={textareaRef}
//             value={input}
//             onChange={(e) => {
//               setInput(e.target.value);
//               adjustHeight(); // Adjust height on every change
//             }}
//             placeholder="Type your message..."
//             className="min-h-[100px] bg-red-200 resize-none border-0 bg-transparent text-white placeholder:text-gray-400
//               focus-visible:ring-0 focus-visible:ring-offset-0"
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' && !e.shiftKey) {
//                 e.preventDefault();
//                 handleSendMessage(input);
//               }
//             }}
//           />
//           <div className="flex items-center justify-between px-2 py-1 rounded-xl">
//             <DropdownMenu>
//               <DropdownMenuTrigger className="flex ring-1 ring-gray-400 items-center gap-1 text-xs p-2 rounded-md text-white transition-colors">
//                 <span>{models.find((m) => m.id === model)?.name}</span>
//                 <ChevronDown className="h-3 w-3" />
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="start" className="w-[180px]">
//                 {models.map((m) => (
//                   <DropdownMenuItem
//                     key={m.id}
//                     className={`flex items-center justify-between ${
//                       model === m.id && 'font-medium'
//                     } `}
//                     // ',model === m.id && 'font-medium'}
//                     onClick={() => setModel(m.id)}
//                   >
//                     {m.name}
//                     {model === m.id && <Check className="h-4 w-4" />}
//                   </DropdownMenuItem>
//                 ))}
//               </DropdownMenuContent>
//             </DropdownMenu>
//             <button>
//               <SendHorizontal
//                 onClick={() => handleSendMessage(input)}
//                 className="h-5 w-5 mr-2 text-white"
//               />
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
