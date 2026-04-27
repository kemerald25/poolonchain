'use client';

import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { supabase } from '@/lib/supabase/client';

export function WalletConnectButton() {
  const { address, connect, disconnect, setUserProfile } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);

  // In a full production setup with Xumm SDK, this would open the Xumm modal
  // or redirect to the Xaman app using a created payload from the backend.
  // For immediate integration, we simulate the address return.
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // TODO: Connect via Xumm SDK payload. Mocking address for dev.
      const mockAddress = 'rP9jD...MockXRPAddress'; 
      
      // Upsert user into Supabase
      const { data, error } = await supabase
        .from('users')
        .upsert({ id: mockAddress }, { onConflict: 'id' })
        .select()
        .single();
        
      if (!error && data) {
         connect(mockAddress);
         setUserProfile(data.username, data.cp_total);
      } else if (error) {
         console.error("Failed to upsert user profile:", error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (address) {
    return (
      <button 
        onClick={handleDisconnect}
        className="px-4 py-2 bg-pool-panel border border-pool-gold/30 text-pool-gold rounded-md text-sm font-medium hover:bg-pool-panel/50 transition-colors"
      >
        {address.slice(0, 5)}...{address.slice(-4)}
      </button>
    );
  }

  return (
    <button 
      onClick={handleConnect}
      disabled={isLoading}
      className="px-4 py-2 bg-pool-gold text-pool-dark rounded-md text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
    >
      {isLoading ? 'Connecting...' : 'Connect Xaman'}
    </button>
  );
}
