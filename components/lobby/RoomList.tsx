'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { RoomCard } from './RoomCard';
import { CreateRoomModal } from './CreateRoomModal';

type Room = Database['public']['Tables']['rooms']['Row'];

export function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filter, setFilter] = useState<'all' | 'free' | 'wager'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      // Mocking fetch gracefully since there's no DB connected yet
      try {
          const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .order('created_at', { ascending: false });
          if (data && !error) setRooms(data);
      } catch (e) {
          console.log("Supabase fetch failed silently during dev mode mode: ", e);
          setRooms([{
              id: 'mock-1',
              name: "Diamond High Rollers",
              host_user_id: "rX...",
              guest_user_id: null,
              mode: 'wager',
              wager_amount_drops: 50 * 1000000,
              status: 'waiting',
              escrow_condition: null,
              escrow_sequence_guest: null,
              escrow_sequence_host: null,
              winner_user_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
          } as Room]);
      }
    };
    
    fetchRooms();

    const channel = supabase.channel('public:rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
          fetchRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = rooms.filter(r => filter === 'all' || r.mode === filter);

  return (
    <div className="w-full flex flex-col space-y-6 relative">
       <div className="flex justify-between items-end border-b border-white/10 pb-4">
       <div className="flex space-x-4">
         {(['all', 'free', 'wager'] as const).map(tab => (
           <button
             key={tab}
             onClick={() => setFilter(tab)}
             className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${
               filter === tab 
                 ? 'bg-pool-cp text-pool-dark' 
                 : 'bg-white/5 text-white hover:bg-white/10'
             }`}
           >
             {tab.toUpperCase()}
           </button>
         ))}
       </div>
       <div className="absolute top-0 right-0">
           <button 
             onClick={() => setIsCreateOpen(true)}
             className="px-6 py-2 bg-pool-gold text-pool-dark font-black rounded-lg hover:brightness-110 transition-colors shadow-lg"
           >
             + CREATE ROOM
           </button>
       </div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(r => <RoomCard key={r.id} room={r} />)}
          {filtered.length === 0 && (
             <div className="col-span-full py-12 text-center text-white/40 italic">
               No open rooms right now. Create one!
             </div>
          )}
       </div>
       <CreateRoomModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
