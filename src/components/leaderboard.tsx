"use client";

import { useEffect, useState } from "react";
import type { Model } from "@/db/schema";

export function Leaderboard() {
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    async function fetchLeaderboard() {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setModels(data.models);
    }

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-2 border-black bg-white">
      <div className="border-b-2 border-black px-3 py-2">
        <h2 className="text-sm font-bold">LEADERBOARD</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {models.map((model, index) => (
          <div
            key={model.id}
            className="flex items-center justify-between px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 text-gray-500">{index + 1}.</span>
              <span className="font-medium">{model.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">{model.elo}</span>
              <span className="text-xs text-gray-500">
                {model.wins}W {model.losses}L {model.draws}D
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
