"use client";

import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReasoningPanel } from "./reasoning-panel";
import type { Game, Move, Model } from "@/db/schema";

interface GameDetailProps {
  gameId: string | null;
  onClose: () => void;
}

interface GameData {
  game: Game;
  moves: Move[];
  white: Model;
  black: Model;
}

export function GameDetail({ gameId, onClose }: GameDetailProps) {
  const [data, setData] = useState<GameData | null>(null);

  useEffect(() => {
    if (!gameId) {
      setData(null);
      return;
    }

    async function fetchGame() {
      const res = await fetch(`/api/games/${gameId}`);
      const gameData = await res.json();
      setData(gameData);
    }

    fetchGame();
    const interval = setInterval(fetchGame, 5000);
    return () => clearInterval(interval);
  }, [gameId]);

  if (!gameId || !data) return null;

  return (
    <Dialog open={!!gameId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl p-0 rounded-none border-2 border-black">
        <div className="border-b-2 border-black px-4 py-3">
          <h2 className="font-bold">
            {data.white.name} vs {data.black.name}
          </h2>
          {data.game.result && (
            <span className="text-sm text-gray-500">
              Result: {data.game.result}
            </span>
          )}
        </div>

        <div className="grid grid-cols-[1fr_400px_1fr] gap-0">
          <ReasoningPanel model={data.white} moves={data.moves} color="white" />

          <div className="border-x-2 border-black p-4">
            <Chessboard
              position={data.game.fen}
              boardWidth={368}
              arePiecesDraggable={false}
              customBoardStyle={{ borderRadius: "0" }}
            />
          </div>

          <ReasoningPanel model={data.black} moves={data.moves} color="black" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
