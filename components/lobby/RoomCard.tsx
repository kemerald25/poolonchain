'use client';

import { motion } from 'framer-motion';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';

type Room = Database['public']['Tables']['rooms']['Row'];

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const router = useRouter();
  const address = useWalletStore(state => state.address);
  const isWager = room.mode === 'wager';

  const handleJoin = async () => {
     if (!address && isWager) {
         alert("Please connect Xaman wallet to join wager rooms.");
         return;
     }

     if (isWager && room.wager_amount_drops) {
         try {
             // In a real app, we update the DB here first to reserve the spot
             const res = await fetch('/api/xaman/payload', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ 
                    amountXrp: room.wager_amount_drops / 1000000, 
                    matchId: room.id 
                 })
             });
             const payload = await res.json();
             
             if (payload.next?.always) {
                 window.open(payload.next.always, '_blank');
             }
         } catch (e) {
             console.error("Join wager payload failed", e);
         }
     }

     router.push(`/game/${room.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-pool-panel border border-white/10 rounded-xl p-5 flex items-center justify-between shadow-lg"
    >
      <div className="flex flex-col">
        <div className="flex items-center space-x-3 mb-2">
          {isWager ? (
            <span className="px-2 py-0.5 text-xs font-bold bg-pool-gold text-pool-dark rounded-md">
              WAGER
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs font-bold bg-white/20 text-white rounded-md">
              FREE
            </span>
          )}
          <span className="text-sm text-white/50">{room.status.toUpperCase()}</span>
        </div>
        <h3 className="text-lg font-bold text-white">{room.name}</h3>
        {isWager && room.wager_amount_drops && (
           <p className="text-pool-gold font-bold text-sm">
             {(room.wager_amount_drops / 1000000).toFixed(2)} XRP
           </p>
        )}
      </div>

      <div className="flex flex-col items-end">
         <button 
           onClick={handleJoin}
           disabled={room.status !== 'waiting'}
           className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-white/10"
         >
           {room.status === 'waiting' ? 'Join Game' : 'Full'}
         </button>
      </div>
    </motion.div>
  );
}
