"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, PenTool, HelpCircle } from "lucide-react";

export type TabType = "chat" | "writing" | "quiz";

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const TABS: Tab[] = [
  {
    id: "chat",
    label: "Chat",
    icon: <MessageCircle className="w-4 h-4" />,
    href: "/",
  },
  {
    id: "writing",
    label: "Writing Assistant",
    icon: <PenTool className="w-4 h-4" />,
    href: "/writing",
  },
  {
    id: "quiz",
    label: "Quiz Generator",
    icon: <HelpCircle className="w-4 h-4" />,
    href: "/quiz",
  },
];

function getActiveTab(pathname: string): TabType {
  if (pathname.startsWith("/chat")) return "chat";
  if (pathname.startsWith("/writing")) return "writing";
  if (pathname.startsWith("/quiz")) return "quiz";
  return "chat";
}

export function ChatTabs() {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  return (
    <div className="border-b border-white/20 px-4 py-2  ">
      <div className="flex gap-8 w-full justify-center">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
