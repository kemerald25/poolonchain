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
      // 1. Request Sign-In payload from our backend
      const res = await fetch('/api/xaman/signin', { method: 'POST' });
      const { uuid, next, error } = await res.json();
      
      if (error) throw new Error(error);

      // 2. Open Xaman (next.always link)
      // On mobile, this will deep-link into the Xaman app.
      // On desktop, it opens a page with a QR code.
      window.open(next, '_blank');

      // 3. Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/xaman/status?uuid=${uuid}`);
          const status = await statusRes.json();

          if (status.signed && status.address) {
            clearInterval(pollInterval);
            
            // 4. Upsert user into Supabase with the REAL address
            const { data, error: upsertError } = await supabase
              .from('users')
              .upsert({ id: status.address }, { onConflict: 'id' })
              .select()
              .single();
              
            if (!upsertError && data) {
               connect(status.address);
               setUserProfile(data.username, data.cp_total);
            } else if (upsertError) {
               console.error("Failed to upsert user profile:", upsertError);
            }
            setIsLoading(false);
          } else if (status.cancelled || status.expired) {
            clearInterval(pollInterval);
            setIsLoading(false);
            console.log("Sign-in was cancelled or expired.");
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 2000); // Poll every 2 seconds

    } catch (err: any) {
      console.error(err);
      alert("Connection failed: " + (err.message || "Unknown error"));
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
