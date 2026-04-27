import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/store/gameStore';
import { ShotInput, Keyframe } from '@/lib/physics/types';

export function useMultiplayer(matchId: string) {
  const socketRef = useRef<Socket | null>(null);
  const setKeyframes = useGameStore(state => state.setKeyframes);
  // Optional: add opponent state, whose turn, etc.

  useEffect(() => {
    // Determine the socket URL based on the environment
    const isDev = process.env.NODE_ENV !== 'production';
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (isDev ? 'http://localhost:3000' : window.location.origin);

    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Multiplayer Server');
      socket.emit('join_match', matchId);
    });

    socket.on('player_joined', (id: string) => {
      console.log('Opponent joined:', id);
    });

    socket.on('shot_played', (payload: { shotInput: ShotInput, keyframes: Keyframe[] }) => {
      // Receive server-validated (or relayed) keyframes and play them locally
      setKeyframes(payload.keyframes);
    });

    return () => {
      socket.disconnect();
    };
  }, [matchId, setKeyframes]);

  const broadcastShot = useCallback((shotInput: ShotInput, generatedKeyframes: Keyframe[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('play_shot', {
        matchId,
        shotInput,
        keyframes: generatedKeyframes
      });
    }
  }, [matchId]);

  return { broadcastShot };
}
