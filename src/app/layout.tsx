import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ParticleField from "@/components/particleField";
import { AppSidebar } from "@/components/appSidebar";
import { queryClient } from "@/lib/query-client";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#000000",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "ChatDex - AI Chat Application",
  description:
    "A powerful multi-model AI chat application with support for Gemini, Mistral, Groq and more",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ChatDex",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chat-cablex.vercel.app",
    title: "ChatDex - AI Chat Application",
    description: "A powerful multi-model AI chat application",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "ChatDex Logo",
      },
    ],
  },
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await queryClient.prefetchQuery({
    queryKey: ["conversations"],
  });
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="APJ-ciVG74ohDzWiODirflql6JwSvRPRTRW5cYBit-M"
        />
        {/* <script
          defer
          crossOrigin="anonymous"
          src="https://unpkg.com/react-scan/dist/auto.global.js"
        /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AppSidebar />
          <main className="w-full relative overflow-hidden z-0">
            <SidebarTrigger className="absolute top-[20px] text-white/60 hover:scale-105 hover:text-white/90 left-2" />
            <div className="absolute inset-0 bg-black -z-20" />

            <ParticleField />
            {children}
          </main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
