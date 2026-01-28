"use client"

export type GameStatus = "idle" | "playing" | "paused" | "gameover"

export interface Position {
  x: number
  y: number
}

interface SnakeBoardProps {
  snake: Position[]
  food: Position | null
  gameStatus: GameStatus
}

const BOARD_SIZE = 20

export function SnakeBoard({ snake, food, gameStatus }: SnakeBoardProps) {
  // 计算单元格大小（响应式）
  const cellSize = Math.min(
    Math.floor((typeof window !== "undefined" ? window.innerWidth : 1024) / BOARD_SIZE / 1.5),
    28
  )

  // 创建游戏板
  const board = Array(BOARD_SIZE)
    .fill(0)
    .map(() => Array(BOARD_SIZE).fill(0))

  // 标记蛇的位置
  snake.forEach((segment, index) => {
    if (segment.x >= 0 && segment.x < BOARD_SIZE && segment.y >= 0 && segment.y < BOARD_SIZE) {
      // 头部用2标记，身体用1标记
      board[segment.y][segment.x] = index === 0 ? 2 : 1
    }
  })

  // 标记食物的位置
  if (food && food.x >= 0 && food.x < BOARD_SIZE && food.y >= 0 && food.y < BOARD_SIZE) {
    board[food.y][food.x] = 3
  }

  return (
    <div className="flex justify-center">
      <div className="rounded-lg border-4 border-gray-600 bg-gray-900 p-2 shadow-lg">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            width: `${cellSize * BOARD_SIZE}px`,
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              let cellClass = "bg-gray-800"
              let cellContent = null

              if (cell === 2) {
                // 蛇头
                cellClass = "bg-green-500"
              } else if (cell === 1) {
                // 蛇身
                cellClass = "bg-green-600"
              } else if (cell === 3) {
                // 食物
                cellClass = "bg-red-500"
                cellContent = (
                  <div className="h-full w-full rounded-full bg-red-500"></div>
                )
              }

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`border border-gray-700 ${cellClass} flex items-center justify-center`}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    minWidth: `${cellSize}px`,
                    minHeight: `${cellSize}px`,
                  }}
                >
                  {cellContent}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

