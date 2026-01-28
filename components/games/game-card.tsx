"use client"

import Link from "next/link"
import { Game } from "@/types/game"
import { cn } from "@/lib/utils"
import { Bomb, Box, Gamepad2 } from "lucide-react"

interface GameCardProps {
  game: Game
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Bomb,
  Box,
  Gamepad2,
}

export function GameCard({ game }: GameCardProps) {
  const IconComponent = iconMap[game.icon] || Gamepad2

  const cardContent = (
    <div
      className={cn(
        "group relative rounded-lg border-2 p-6 transition-all duration-200",
        game.status === "available"
          ? "border-gray-200 bg-white hover:border-blue-500 hover:shadow-lg cursor-pointer"
          : "border-gray-200 bg-gray-50 opacity-75 cursor-not-allowed"
      )}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={cn(
            "rounded-full p-4 transition-colors",
            game.status === "available"
              ? "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
              : "bg-gray-200 text-gray-400"
          )}
        >
          <IconComponent className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
          <p className="text-sm text-gray-600">{game.description}</p>
        </div>
        {game.status === "coming_soon" && (
          <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
            即将推出
          </span>
        )}
      </div>
    </div>
  )

  if (game.status === "available" && game.route) {
    return <Link href={game.route}>{cardContent}</Link>
  }

  return cardContent
}

