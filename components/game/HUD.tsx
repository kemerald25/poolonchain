'use client';

import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export function HUD() {
  const gameState = useGameStore(state => state.gameState);

  return (
    <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none z-20 flex flex-col items-center">
        {/* Match State Banner */}
        <div className="bg-pool-dark/80 backdrop-blur-md border border-white/10 rounded-xl px-8 py-3 mb-4 shadow-xl flex items-center justify-between w-full max-w-2xl">
            <div className={`flex flex-col items-center ${gameState.turn === 'p1' ? 'text-pool-cp drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : 'text-white/40'}`}>
                <span className="font-black text-xl uppercase">Player 1</span>
                <span className="text-xs font-bold uppercase tracking-widest">{gameState.p1Group}</span>
            </div>

            <div className="flex flex-col items-center mx-8">
                <span className="text-xs text-white/50 tracking-widest mb-1">VS</span>
                {gameState.matchState === 'game_over' ? (
                   <span className="bg-pool-gold text-pool-dark font-black px-3 py-1 rounded">MATCH OVER</span>
                ) : (
                   <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center font-bold text-white relative overflow-hidden">
                       <span className="z-10">60</span>
                       <motion.div 
                          className="absolute bottom-0 left-0 right-0 bg-pool-gold/20"
                          initial={{ height: "100%" }}
                          animate={{ height: "0%" }}
                          transition={{ duration: 60, ease: "linear" }}
                       />
                   </div>
                )}
            </div>

            <div className={`flex flex-col items-center ${gameState.turn === 'p2' ? 'text-pool-cp drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : 'text-white/40'}`}>
                <span className="font-black text-xl uppercase">Player 2</span>
                <span className="text-xs font-bold uppercase tracking-widest">{gameState.p2Group}</span>
            </div>
        </div>

        {/* Global Messages */}
        <AnimatePresence>
            {gameState.message && (
               <motion.div 
                  key={gameState.message}
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="bg-white text-pool-dark font-black px-6 py-2 rounded-full shadow-2xl text-sm tracking-wide"
               >
                  {gameState.message}
               </motion.div>
            )}
        </AnimatePresence>

        {/* Foul Notices */}
        <div className="absolute top-32 right-6 flex flex-col space-y-2">
            <AnimatePresence>
                {gameState.fouls.map((foul, idx) => (
                   <motion.div 
                      key={`${foul}-${idx}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="bg-red-500/90 text-white font-bold px-4 py-2 rounded-lg shadow-lg text-sm border border-red-400"
                   >
                      ⚠️ {foul}
                   </motion.div>
                ))}
            </AnimatePresence>
        </div>
    </div>
  );
}
