'use client';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { Avatar } from '@/components/ui/Avatar';
import { useWalletStore } from '@/store/walletStore';
import Link from 'next/link';

export function Header() {
  const { address, username, cpTotal } = useWalletStore();

  return (
    <header className="w-full flex items-center justify-between p-4 border-b border-white/10 bg-pool-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center space-x-6">
         <Link href="/lobby">
             <h1 className="text-xl font-black italic tracking-tighter text-white">
                 POOL<span className="text-pool-gold">ONCHAIN</span>
             </h1>
         </Link>
      </div>

      <div className="flex items-center space-x-4">
        {address && <Avatar username={username} cpTotal={cpTotal} />}
        <WalletConnectButton />
      </div>
    </header>
  );
}
