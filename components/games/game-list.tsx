import { games } from "@/lib/games"
import { GameCard } from "./game-card"

export function GameList() {
  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">游戏中心</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}

