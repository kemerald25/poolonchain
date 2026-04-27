import { GameScene } from '@/components/game/GameScene';
import { HUD } from '@/components/game/HUD';

export default function MatchPage({ params }: { params: { id: string } }) {
  return (
    <main className="w-full h-[calc(100vh-72px)] overflow-hidden relative">
      <HUD />
      <GameScene />
    </main>
  );
}
