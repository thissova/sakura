import React from 'react';
import { motion } from 'framer-motion';

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-sakura-cream flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6">
        {/* Petal spinner */}
        <div className="relative w-16 h-16">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <motion.div
              key={deg}
              className="absolute w-3 h-3 rounded-full bg-sakura-pink"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '-16px 0',
                transform: `rotate(${deg}deg) translateX(20px)`,
              }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <p className="font-serif text-sakura-green text-lg font-medium tracking-wide">Sakura</p>
      </motion.div>
    </div>
  );
}
