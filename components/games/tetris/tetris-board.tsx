"use client"

import { useEffect, useState } from "react"

export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L"
export type GameStatus = "idle" | "playing" | "paused" | "gameover"

export interface CurrentPiece {
  type: PieceType
  x: number
  y: number
  rotation: number
}

export interface TetrisBoardProps {
  board: number[][]
  currentPiece: CurrentPiece | null
  gameStatus: GameStatus
}

// 方块形状定义（与tetris-game.tsx保持一致）
const PIECES: Record<PieceType, number[][][]> = {
  I: [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    [
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
  ],
}

// 方块颜色（与tetris-game.tsx保持一致）
const PIECE_COLORS: Record<PieceType, string> = {
  I: "bg-cyan-500",
  O: "bg-yellow-500",
  T: "bg-purple-500",
  S: "bg-green-500",
  Z: "bg-red-500",
  J: "bg-blue-500",
  L: "bg-orange-500",
}

// 已放置方块的颜色映射（1-7对应I、O、T、S、Z、J、L）
const PLACED_COLORS = [
  "", // 0 - 空
  "bg-cyan-500", // 1 - I
  "bg-yellow-500", // 2 - O
  "bg-purple-500", // 3 - T
  "bg-green-500", // 4 - S
  "bg-red-500", // 5 - Z
  "bg-blue-500", // 6 - J
  "bg-orange-500", // 7 - L
]

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

export function TetrisBoard({ board, currentPiece, gameStatus }: TetrisBoardProps) {
  const [cellSize, setCellSize] = useState(24)

  // 计算单元格大小（响应式，支持旋转/resize）
  useEffect(() => {
    const updateCellSize = () => {
      const w = window.innerWidth
      // 留出边距/侧栏，移动端更保守
      const max = w < 640 ? 26 : 32
      const size = Math.floor((w * 0.92) / BOARD_WIDTH)
      setCellSize(Math.max(14, Math.min(size, max)))
    }

    updateCellSize()
    window.addEventListener("resize", updateCellSize)
    return () => window.removeEventListener("resize", updateCellSize)
  }, [])

  // 获取当前方块的形状
  const getPieceShape = (piece: CurrentPiece): number[][] => {
    return PIECES[piece.type][piece.rotation]
  }

  // 渲染游戏板
  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row])

    // 如果有当前方块，将其叠加到显示板上
    if (currentPiece && gameStatus !== "gameover") {
      const shape = getPieceShape(currentPiece)
      const colorIndex = ["I", "O", "T", "S", "Z", "J", "L"].indexOf(currentPiece.type) + 1

      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const boardRow = currentPiece.y + row
            const boardCol = currentPiece.x + col

            if (
              boardRow >= 0 &&
              boardRow < BOARD_HEIGHT &&
              boardCol >= 0 &&
              boardCol < BOARD_WIDTH
            ) {
              displayBoard[boardRow][boardCol] = colorIndex
            }
          }
        }
      }
    }

    return displayBoard
  }

  const displayBoard = renderBoard()

  return (
    <div className="flex justify-center">
      <div className="rounded-lg border-4 border-gray-600 bg-gray-900 p-2 shadow-lg touch-none select-none">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
            width: `${cellSize * BOARD_WIDTH}px`,
          }}
        >
          {displayBoard.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isFilled = cell !== 0
              const cellColor = isFilled ? PLACED_COLORS[cell] || "bg-gray-500" : "bg-gray-800"

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`border border-gray-700 ${cellColor}`}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    minWidth: `${cellSize}px`,
                    minHeight: `${cellSize}px`,
                  }}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// 下一个方块预览组件
interface NextPiecePreviewProps {
  pieceType: PieceType | null
}

export function NextPiecePreview({ pieceType }: NextPiecePreviewProps) {
  if (!pieceType) {
    return (
      <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">下一个</h3>
        <div className="flex h-32 items-center justify-center rounded bg-gray-100">
          <span className="text-gray-400">等待开始</span>
        </div>
      </div>
    )
  }

  const shape = PIECES[pieceType][0] // 预览显示第一个旋转状态
  const color = PIECE_COLORS[pieceType]
  const previewSize = 24

  return (
    <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">下一个</h3>
      <div className="flex h-32 items-center justify-center rounded bg-gray-100">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${shape[0].length}, minmax(0, 1fr))`,
          }}
        >
          {shape.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`border border-gray-300 ${cell ? color : "bg-transparent"}`}
                style={{
                  width: `${previewSize}px`,
                  height: `${previewSize}px`,
                  minWidth: `${previewSize}px`,
                  minHeight: `${previewSize}px`,
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

