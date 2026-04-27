import { supabase } from '@/lib/supabase/client';
import { CPBadge } from '@/components/profile/CPBadge';
import Link from 'next/link';


export default async function LeaderboardPage() {
  // Fetch top players sorted by cp_total. We'd use a server client in prod, 
  // but for the sake of bypassing RLS, the generic client works here.
  const { data: players } = await supabase
    .from('users')
    .select('username, cp_total, xrp_wallet_address')
    .order('cp_total', { ascending: false })
    .limit(50);

  return (
    <div className="w-full h-full max-w-4xl mx-auto p-6 md:p-10 pt-12 flex flex-col items-center">
        <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-2 text-center drop-shadow-xl">
           Global Rankings
        </h1>
        <p className="text-white/50 mb-12">Compete in games to earn Championship Points.</p>

        <div className="w-full bg-pool-panel border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex w-full text-white/50 font-bold uppercase tracking-wider text-xs pb-4 border-b border-white/10 mb-4 px-4">
                <div className="w-16">Rank</div>
                <div className="flex-1">Player</div>
                <div className="w-32 text-right">Points</div>
            </div>

            <div className="flex flex-col space-y-2">
               {players?.map((p, idx) => (
                   <Link href={`/profile/${p.username || p.xrp_wallet_address}`} key={idx}>
                       <div className="flex items-center w-full bg-white/5 hover:bg-white/10 transition-colors rounded-xl px-4 py-3 cursor-pointer">
                           <div className="w-16 font-black text-xl text-white/40">#{idx + 1}</div>
                           <div className="flex-1 font-bold text-lg text-white">
                               {p.username || `${p.xrp_wallet_address?.slice(0, 6)}...${p.xrp_wallet_address?.slice(-4)}`}
                           </div>
                           <div className="w-32 flex justify-end">
                               <CPBadge amount={p.cp_total || 0} />
                           </div>
                       </div>
                   </Link>
               ))}

               {(!players || players.length === 0) && (
                   <div className="py-12 text-center text-white/40 italic">
                      No ranked players yet.
                   </div>
               )}
            </div>
        </div>
    </div>
  );
}
