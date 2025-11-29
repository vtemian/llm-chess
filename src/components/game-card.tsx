"use client";

import { Chessboard } from "react-chessboard";
import type { Game } from "@/db/schema";

interface GameCardProps {
  game: Game & { whiteName?: string; blackName?: string };
  onClick: () => void;
}

export function GameCard({ game, onClick }: GameCardProps) {
  return (
    <button
      onClick={onClick}
      className="border-2 border-black bg-white p-2 hover:bg-gray-50 transition-colors text-left"
    >
      <div className="aspect-square w-full">
        <Chessboard
          options={{
            position: game.fen,
            allowDragging: false,
            boardStyle: {
              borderRadius: "0",
            },
          }}
        />
      </div>
      <div className="mt-2 text-xs">
        <div className="flex justify-between">
          <span className="font-medium">{game.whiteName || game.whiteId}</span>
          <span className="text-gray-500">white</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">{game.blackName || game.blackId}</span>
          <span className="text-gray-500">black</span>
        </div>
      </div>
    </button>
  );
}
