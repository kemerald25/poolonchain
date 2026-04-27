import { supabase } from '@/lib/supabase/client';
import { CPBadge } from '@/components/profile/CPBadge';

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  
  // Try finding by username or wallet address
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .or(`username.eq.${username},xrp_wallet_address.eq.${username}`)
    .single();

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center pt-24 text-white/50">
         Profile not found.
      </div>
    );
  }

  // Fetch recent match history
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or(`player_one_id.eq.${user.xrp_wallet_address},player_two_id.eq.${user.xrp_wallet_address}`)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="w-full h-full max-w-4xl mx-auto p-6 md:p-10 pt-12">
        <div className="bg-pool-panel border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
            <div className="w-32 h-32 bg-white/5 rounded-full border-4 border-pool-gold/30 flex items-center justify-center overflow-hidden">
                <span className="text-5xl font-black text-pool-gold">
                   {user.username?.charAt(0).toUpperCase() || 'P'}
                </span>
            </div>
            
            <div className="flex flex-col items-center md:items-start flex-1">
                <h1 className="text-3xl font-black text-white mb-2">{user.username || 'Anonymous Player'}</h1>
                {user.xrp_wallet_address && (
                    <div className="bg-pool-dark text-white/50 px-3 py-1 rounded-full text-xs font-mono mb-4">
                        XRPL: {user.xrp_wallet_address}
                    </div>
                )}
                
                <CPBadge amount={user.cp_total || 0} />
            </div>
        </div>

        <div className="bg-pool-panel border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Recent Matches</h2>
            <div className="flex flex-col space-y-3">
               {matches?.map((match) => {
                   const isWinner = match.winner_id === user.xrp_wallet_address;
                   return (
                       <div key={match.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                           <div className="flex items-center space-x-4">
                               <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black ${isWinner ? 'bg-pool-gold text-pool-dark' : 'bg-red-500/20 text-red-500'}`}>
                                   {isWinner ? 'WIN' : 'LOSS'}
                               </div>
                               <div className="flex flex-col">
                                   <span className="text-white font-bold">{match.mode.toUpperCase()} MODE</span>
                                   <span className="text-xs text-white/50">
                                      {new Date(match.created_at).toLocaleDateString()}
                                   </span>
                               </div>
                           </div>
                           
                           {isWinner && (
                               <div className="flex flex-col items-end">
                                   <span className="text-pool-cp font-black">+50 CP</span>
                                   {match.mode === 'wager' && (
                                       <span className="text-pool-gold text-xs font-bold">Wager Won</span>
                                   )}
                               </div>
                           )}
                       </div>
                   );
               })}

               {(!matches || matches.length === 0) && (
                   <div className="py-8 text-center text-white/30 italic">No matches played yet.</div>
               )}
            </div>
        </div>
    </div>
  );
}
