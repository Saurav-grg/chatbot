// import ChatLayout from '@/components/chat-layout';
import ChatWindow from '@/components/chat-window';
import { SidebarTrigger } from '@/components/ui/sidebar';
// import { useSidebar } from '@/components/ui/sidebar';
// import Sidebar from '@/components/sidebar';

export default function Home() {
  // const { open, toggleSidebar } = useSidebar();
  return (
    <div className="h-screen relative">
      <SidebarTrigger className="absolute top-[20px] left-2" />
      {/* <Sidebar /> */}
      <ChatWindow />
    </div>
  );
}
