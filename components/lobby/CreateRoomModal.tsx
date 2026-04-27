'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useWalletStore } from '@/store/walletStore';
import { useRouter } from 'next/navigation';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const [mode, setMode] = useState<'free' | 'wager'>('free');
  const [name, setName] = useState('');
  const [wagerDrops, setWagerDrops] = useState(10); // in whole XRP for UI
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const address = useWalletStore(state => state.address);

  const handleCreate = async () => {
    if (!address) {
       alert("Connect your wallet first!");
       return;
    }
    setIsLoading(true);
    
    const roomPayload = {
      name: name || `${address.slice(0, 4)}'s Room`,
      host_user_id: address,
      mode,
      wager_amount_drops: mode === 'wager' ? wagerDrops * 1000000 : null,
      status: 'waiting' as const
    };

    const { data, error } = await supabase.from('rooms').insert(roomPayload).select().single();
    
    if (!error && data) {
       if (mode === 'wager') {
           try {
               const res = await fetch('/api/xaman/payload', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ amountXrp: wagerDrops, matchId: data.id })
               });
               const payload = await res.json();
               
               if (payload.next?.always) {
                   // Open Xaman transaction signing link
                   window.open(payload.next.always, '_blank');
               }
           } catch (e) {
               console.error("Wager payload creation failed", e);
           }
       }
       setIsLoading(false);
       onClose();
       router.push(`/game/${data.id}`);
    } else {
       setIsLoading(false);
       console.error("Failed to create room", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-pool-dark border border-white/20 rounded-2xl p-6 shadow-2xl relative"
          >
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
            >✕</button>
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Create New Room</h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Room Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. High Stakes Pool"
                        className="w-full bg-pool-panel border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-pool-cp"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Game Mode</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setMode('free')}
                            className={`flex-1 py-2 rounded-md font-bold transition-colors ${mode === 'free' ? 'bg-white text-pool-dark' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            FREE
                        </button>
                        <button 
                            onClick={() => setMode('wager')}
                            className={`flex-1 py-2 rounded-md font-bold transition-colors ${mode === 'wager' ? 'bg-pool-gold text-pool-dark' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            WAGER (XRP)
                        </button>
                    </div>
                </div>

                {mode === 'wager' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                        <label className="block text-sm font-medium text-white/70 mb-1 mt-4">Wager Amount (XRP)</label>
                        <input 
                            type="number" 
                            min="1"
                            value={wagerDrops}
                            onChange={(e) => setWagerDrops(parseInt(e.target.value) || 0)}
                            className="w-full bg-pool-panel border border-pool-gold/50 rounded-md px-4 py-2 text-pool-gold font-bold focus:outline-none focus:border-pool-gold"
                        />
                    </motion.div>
                )}

                <button 
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="w-full mt-6 py-3 bg-pool-cp text-pool-dark font-black rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50"
                >
                    {isLoading ? 'CREATING...' : 'CREATE & JOIN'}
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
