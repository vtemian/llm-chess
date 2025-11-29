"use client";

import { useState } from "react";
import { Leaderboard } from "@/components/leaderboard";
import { GameGrid } from "@/components/game-grid";
import { GameDetail } from "@/components/game-detail";

export default function Home() {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto p-4">
        <GameGrid onSelectGame={setSelectedGameId} />
      </div>

      <div className="w-80 border-l-2 border-black p-4">
        <Leaderboard />
      </div>

      <GameDetail
        gameId={selectedGameId}
        onClose={() => setSelectedGameId(null)}
      />
    </div>
  );
}
