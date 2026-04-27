import { create } from 'zustand';

interface WalletState {
  address: string | null;
  username: string | null;
  cpTotal: number;
  connect: (address: string) => void;
  disconnect: () => void;
  setUserProfile: (username: string | null, cpTotal: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  username: null,
  cpTotal: 0,
  connect: (address) => set({ address }),
  disconnect: () => set({ address: null, username: null, cpTotal: 0 }),
  setUserProfile: (username, cpTotal) => set({ username, cpTotal }),
}));
