'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ParticleField() {
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
