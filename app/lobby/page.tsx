import { RoomList } from '@/components/lobby/RoomList';

export default function LobbyPage() {
  return (
    <div className="w-full h-full max-w-5xl mx-auto p-6 md:p-10 flex flex-col">
      <div className="mb-8">
         <h2 className="text-3xl font-bold text-white tracking-tight">Game Lobby</h2>
         <p className="text-white/60 mt-2">Join an open table or create your own.</p>
      </div>
      <RoomList />
    </div>
  );
}
