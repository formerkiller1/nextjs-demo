import { Game } from "@/types/game"

export const games: Game[] = [
  {
    id: "minesweeper",
    name: "扫雷",
    description: "经典的扫雷游戏，挑战你的逻辑推理能力",
    icon: "Bomb",
    status: "available",
    route: "/dashboard/games/minesweeper",
  },
  {
    id: "tetris",
    name: "俄罗斯方块",
    description: "经典的方块消除游戏",
    icon: "Box",
    status: "available",
    route: "/dashboard/games/tetris",
  },
  {
    id: "snake",
    name: "贪吃蛇",
    description: "控制小蛇吃食物，不断成长",
    icon: "Gamepad2",
    status: "available",
    route: "/dashboard/games/snake",
  },
]

