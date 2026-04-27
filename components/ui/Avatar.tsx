'use client';

export function Avatar({ username, cpTotal }: { username: string | null, cpTotal: number }) {
  return (
    <div className="flex items-center space-x-3 bg-pool-panel p-2 rounded-full pr-4 border border-white/5">
      <div className="w-8 h-8 rounded-full bg-pool-felt flex items-center justify-center text-white border border-pool-gold/30">
        {(username?.[0] || 'A').toUpperCase()}
      </div>
      <div className="flex flex-col">
         <span className="text-xs font-medium text-white">{username || 'Anonymous'}</span>
         <span className="text-[10px] font-bold text-pool-cp">{cpTotal} CP</span>
      </div>
    </div>
  );
}
