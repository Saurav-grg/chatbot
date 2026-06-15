"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarManager() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  useEffect(() => {
    // Collapse sidebar on writing and quiz pages
    if (pathname === "/writing" || pathname === "/quiz") {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [pathname, setOpen]);

  return null;
}
