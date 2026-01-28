export type GameStatus = "available" | "coming_soon"

export type GameDifficulty = "beginner" | "intermediate" | "expert"

export interface Game {
  id: string
  name: string
  description: string
  icon: string // lucide-react icon name
  status: GameStatus
  route?: string // 游戏路由路径
}

export interface GameRecord {
  id: string
  userId: string
  userName: string | null
  userEmail: string
  gameType: string
  difficulty: GameDifficulty
  time: number // 游戏用时（秒）
  createdAt: Date
}

