import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import { SidebarTrigger } from '@/components/ui/sidebar';
import ParticleField from '@/components/particleField';
import { AppSidebar } from '@/components/appSidebar';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});
export const metadata: Metadata = {
  title: 'chat-dex',
  description: 'A chat app',
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
            {/* <div className="absolute inset-0 -z-10">
                  <div className="absolute top-1/4 -left-20 h-[300px] w-[300px] rounded-full bg-purple-500/30 blur-[100px]" />
                  <div className="absolute bottom-1/4 -right-20 h-[400px] w-[400px] rounded-full bg-cyan-500/30 blur-[100px]" />
                  <div className="absolute top-1/2 left-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/20 blur-[80px]" />
                  {/* <ParticleField />
                </div> */}
            {children}
          </main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
