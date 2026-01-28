"use client"

import { useState, useRef, useEffect } from "react"
import { GameDifficulty } from "@/types/game"

interface MinesweeperBoardProps {
  board: number[][]
  revealed: boolean[][]
  flagged: boolean[][]
  onCellClick: (row: number, col: number) => void
  onCellRightClick: (e: React.MouseEvent, row: number, col: number) => void
  gameStatus: "idle" | "playing" | "won" | "lost"
  difficulty: GameDifficulty
}

const NUMBER_COLORS = [
  "", // 0 - 无颜色
  "text-blue-600", // 1
  "text-green-600", // 2
  "text-red-600", // 3
  "text-purple-600", // 4
  "text-yellow-600", // 5
  "text-pink-600", // 6
  "text-gray-800", // 7
  "text-gray-900", // 8
]

export function MinesweeperBoard({
  board,
  revealed,
  flagged,
  onCellClick,
  onCellRightClick,
  gameStatus,
  difficulty,
}: MinesweeperBoardProps) {
  const [cellSize, setCellSize] = useState(32)
  const longPressTimerRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const touchStartRef = useRef<Map<string, { row: number; col: number; time: number }>>(new Map())

  // 根据难度和屏幕大小计算格子大小
  useEffect(() => {
    const updateCellSize = () => {
      const isMobile = window.innerWidth < 640
      const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024
      
      if (difficulty === "expert") {
        // 高级难度：移动端更小，桌面端正常
        setCellSize(isMobile ? 24 : isTablet ? 28 : 32)
      } else if (difficulty === "intermediate") {
        // 中级难度
        setCellSize(isMobile ? 28 : isTablet ? 32 : 36)
      } else {
        // 初级难度：可以更大
        setCellSize(isMobile ? 32 : isTablet ? 36 : 40)
      }
    }

    updateCellSize()
    window.addEventListener("resize", updateCellSize)
    return () => window.removeEventListener("resize", updateCellSize)
  }, [difficulty])

  // 清理长按定时器
  useEffect(() => {
    return () => {
      longPressTimerRef.current.forEach((timer) => clearTimeout(timer))
      longPressTimerRef.current.clear()
    }
  }, [])

  if (!board.length || !board[0]) {
    return (
      <div className="flex items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100 p-8">
        <p className="text-gray-500">准备开始游戏</p>
      </div>
    )
  }

  const rows = board.length
  const cols = board[0].length

  // 处理触摸开始
  const handleTouchStart = (row: number, col: number, e: React.TouchEvent) => {
    const key = `${row}-${col}`
    const touch = e.touches[0]
    
    touchStartRef.current.set(key, { row, col, time: Date.now() })

    // 设置长按定时器（500ms）
    const timer = setTimeout(() => {
      if (!revealed[row]?.[col] && gameStatus !== "won" && gameStatus !== "lost") {
        // 触发右键标记
        const syntheticEvent = {
          preventDefault: () => {},
        } as React.MouseEvent
        onCellRightClick(syntheticEvent, row, col)
      }
      longPressTimerRef.current.delete(key)
    }, 500)

    longPressTimerRef.current.set(key, timer)
  }

  // 处理触摸结束
  const handleTouchEnd = (row: number, col: number, e: React.TouchEvent) => {
    const key = `${row}-${col}`
    const touchInfo = touchStartRef.current.get(key)
    
    // 清除长按定时器
    const timer = longPressTimerRef.current.get(key)
    if (timer) {
      clearTimeout(timer)
      longPressTimerRef.current.delete(key)
    }

    // 如果是短按（不是长按），触发点击
    if (touchInfo && Date.now() - touchInfo.time < 500) {
      if (!revealed[row]?.[col] && !flagged[row]?.[col]) {
        onCellClick(row, col)
      }
    }

    touchStartRef.current.delete(key)
  }

  // 处理触摸取消（如滚动时）
  const handleTouchCancel = (row: number, col: number) => {
    const key = `${row}-${col}`
    const timer = longPressTimerRef.current.get(key)
    if (timer) {
      clearTimeout(timer)
      longPressTimerRef.current.delete(key)
    }
    touchStartRef.current.delete(key)
  }

  return (
    <div className="minesweeper-board-container overflow-auto rounded-lg border-2 border-gray-400 bg-gray-300 p-1 sm:border-4 sm:p-2">
      <div
        className="inline-grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isRevealed = revealed[rowIndex]?.[colIndex]
            const isFlagged = flagged[rowIndex]?.[colIndex]
            const value = cell

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => onCellRightClick(e, rowIndex, colIndex)}
                onTouchStart={(e) => handleTouchStart(rowIndex, colIndex, e)}
                onTouchEnd={(e) => handleTouchEnd(rowIndex, colIndex, e)}
                onTouchCancel={() => handleTouchCancel(rowIndex, colIndex)}
                className={`
                  relative border-2 text-xs font-bold transition-all touch-none select-none
                  sm:text-sm
                  ${
                    isRevealed
                      ? "border-gray-400 bg-gray-200"
                      : "border-t-white border-l-white border-r-gray-500 border-b-gray-500 bg-gray-300 active:border-t-gray-500 active:border-l-gray-500 active:border-r-white active:border-b-white sm:hover:bg-gray-200"
                  }
                  ${isRevealed && value === -1 ? "bg-red-500" : ""}
                `}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  minWidth: `${cellSize}px`,
                  minHeight: `${cellSize}px`,
                }}
                disabled={gameStatus === "won" || gameStatus === "lost"}
              >
                {isFlagged && !isRevealed && (
                  <span className="text-red-600 text-base sm:text-lg">🚩</span>
                )}
                {isRevealed && value === -1 && (
                  <span className="text-black text-base sm:text-lg">💣</span>
                )}
                {isRevealed && value > 0 && (
                  <span className={NUMBER_COLORS[value]}>{value}</span>
                )}
                {isRevealed && value === 0 && <span>&nbsp;</span>}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

