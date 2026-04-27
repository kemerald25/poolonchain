'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CPBadgeProps {
  amount: number;
  animateGain?: number; // e.g. +50 causes it to pop
}

export function CPBadge({ amount, animateGain }: CPBadgeProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const controls = useAnimation();

  useEffect(() => {
    if (animateGain) {
      // Animate the counter ticking up
      let current = amount;
      const target = amount + animateGain;
      const interval = setInterval(() => {
         if (current < target) {
             current += 1;
             setDisplayAmount(current);
         } else {
             clearInterval(interval);
         }
      }, 20);

      // Trigger pop animation
      controls.start({
         scale: [1, 1.4, 1],
         color: ['#00E5FF', '#FFF', '#00E5FF'],
         transition: { duration: 0.5 }
      });

      return () => clearInterval(interval);
    } else {
      setDisplayAmount(amount);
    }
  }, [amount, animateGain, controls]);

  return (
    <div className="relative inline-flex items-center">
       <motion.div 
         animate={controls}
         className="bg-white/10 border border-pool-cp/30 px-3 py-1 rounded-full flex items-center space-x-2 shadow-[0_0_10px_rgba(0,229,255,0.1)]"
       >
         <span className="text-xl">🏆</span>
         <span className="font-black text-pool-cp tracking-widest">{displayAmount} CP</span>
       </motion.div>

       {animateGain && (
           <motion.div 
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], y: -40, scale: 1.5 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute -top-4 right-0 font-black text-pool-cp drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] z-50 pointer-events-none"
           >
              +{animateGain}
           </motion.div>
       )}
    </div>
  );
}
