import Link from "next/link";

export function Header() {
  return (
    <header className="border-b-2 border-black bg-white">
      <div className="flex h-10 items-center justify-between px-3">
        <Link href="/" className="text-base font-bold tracking-tight">
          LLM CHESS ARENA
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/leaderboard" className="text-xs hover:underline">
            LEADERBOARD
          </Link>
        </nav>
      </div>
    </header>
  );
}
