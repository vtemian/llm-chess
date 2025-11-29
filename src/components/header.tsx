"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const [status, setStatus] = useState<"stopped" | "running">("stopped");
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    await fetch("/api/tournament/start", { method: "POST" });
    setStatus("running");
    setLoading(false);
  }

  async function handleStop() {
    setLoading(true);
    await fetch("/api/tournament/stop", { method: "POST" });
    setStatus("stopped");
    setLoading(false);
  }

  async function handleReset() {
    if (!confirm("Reset all games and ratings?")) return;
    setLoading(true);
    await fetch("/api/tournament/reset", { method: "POST" });
    setStatus("stopped");
    setLoading(false);
  }

  return (
    <header className="border-b-2 border-black bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        <h1 className="text-xl font-bold tracking-tight">LLM CHESS ARENA</h1>

        <nav className="flex items-center gap-4">
          <span className="text-sm">LIVE</span>
          <span className="text-gray-400">|</span>
          <span className="text-sm">LEADERBOARD</span>
        </nav>

        <div className="flex items-center gap-2">
          {status === "stopped" ? (
            <Button
              onClick={handleStart}
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800 rounded-none"
            >
              START
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              disabled={loading}
              variant="outline"
              className="border-2 border-black rounded-none"
            >
              STOP
            </Button>
          )}
          <Button
            onClick={handleReset}
            disabled={loading}
            variant="outline"
            className="border-2 border-black rounded-none"
          >
            RESET
          </Button>
        </div>
      </div>
    </header>
  );
}
