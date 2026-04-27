import { useCallback, useRef, useEffect } from 'react';

// Pool sound effect names expected in /public/sounds/
export type PoolSound = 'clack' | 'cushion' | 'pocket' | 'cue_hit' | 'chalk';

export function useAudio() {
  const audioContext = useRef<AudioContext | null>(null);
  const buffers = useRef<Record<string, AudioBuffer>>({});

  useEffect(() => {
    // Initialize AudioContext only after user interaction in modern browsers
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        loadSounds();
      }
    };

    window.addEventListener('pointerdown', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  const loadSounds = async () => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;

    const files: PoolSound[] = ['clack', 'cushion', 'pocket', 'cue_hit', 'chalk'];
    
    for (const file of files) {
      try {
        const response = await fetch(`/sounds/${file}.mp3`);
        if (!response.ok) continue; // Fail silently if user hasn't added sounds yet
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        buffers.current[file] = audioBuffer;
      } catch (e) {
        console.warn(`Could not load sound ${file}.mp3`);
      }
    }
  };

  const playSound = useCallback((sound: PoolSound, volume = 1.0, pan = 0) => {
    if (!audioContext.current || !buffers.current[sound]) return;
    
    const ctx = audioContext.current;
    if (ctx.state === 'suspended') ctx.resume();

    const source = ctx.createBufferSource();
    source.buffer = buffers.current[sound];

    // Basic volume and panning 
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;

    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan)); // -1 (left) to 1 (right)

    source.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(ctx.destination);

    source.start(0);
  }, []);

  return { playSound };
}
