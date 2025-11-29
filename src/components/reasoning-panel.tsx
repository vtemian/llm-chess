import type { Move, Model } from "@/db/schema";

interface ReasoningPanelProps {
  model: Model;
  moves: Move[];
  color: "white" | "black";
}

export function ReasoningPanel({ model, moves, color }: ReasoningPanelProps) {
  const modelMoves = moves.filter((m) => m.modelId === model.id);
  const latestMove = modelMoves[modelMoves.length - 1];

  return (
    <div className="flex h-full flex-col border-2 border-black bg-white">
      <div className="border-b-2 border-black px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="font-bold">{model.name}</span>
          <span className="text-xs text-gray-500">({color})</span>
        </div>
        <div className="text-sm">ELO: {model.elo}</div>
      </div>

      {latestMove && (
        <div className="border-b border-gray-200 px-3 py-2">
          <div className="text-sm font-medium">
            Move {latestMove.moveNumber}: {latestMove.moveSan}
          </div>
          <p className="mt-1 text-xs text-gray-600">{latestMove.reasoning}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="text-xs font-bold text-gray-500 mb-2">MOVE HISTORY</div>
        <div className="space-y-1">
          {modelMoves
            .slice()
            .reverse()
            .map((move) => (
              <div key={move.id} className="text-xs">
                <span className="font-medium">{move.moveNumber}.</span>{" "}
                {move.moveSan}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
