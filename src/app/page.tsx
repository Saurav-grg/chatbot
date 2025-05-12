'use client';
import ChatWindow from '@/components/chat-window';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="h-screen relative overflow-hidden">
      <SidebarTrigger className="absolute top-[20px] text-white/60 left-2" />
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-black -z-20" />
      <div className="absolute inset-0 -z-10">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-20 h-[300px] w-[300px] rounded-full bg-purple-500/30 blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 h-[400px] w-[400px] rounded-full bg-cyan-500/30 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/20 blur-[80px]" />
        <ParticleField />
      </div>
      {/* <Sidebar /> */}
      <ChatWindow />
    </div>
  );
}
// Animated particle field component
function ParticleField() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Set dimensions only on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Update dimensions on window resize
      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Don't render particles until dimensions are set
  if (dimensions.width === 0 || dimensions.height === 0) {
    return null;
  }

  return (
    <>
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.5 + 0.3,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
          style={{
            filter: `blur(${Math.random() > 0.8 ? '1px' : '0px'})`,
          }}
        />
      ))}
    </>
  );
}
