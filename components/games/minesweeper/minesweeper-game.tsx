"use client"

import { useState, useEffect, useCallback } from "react"
import { GameDifficulty } from "@/types/game"
import { MinesweeperBoard } from "./minesweeper-board"
import { Leaderboard } from "./leaderboard"
import { Button } from "@/components/ui/button"
import { Timer, Flag, RefreshCw } from "lucide-react"

interface MinesweeperGameProps {
  userId?: string
}

type GameStatus = "idle" | "playing" | "won" | "lost"

interface GameConfig {
  rows: number
  cols: number
  mines: number
}

const DIFFICULTY_CONFIG: Record<GameDifficulty, GameConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
}

export function MinesweeperGame({ userId }: MinesweeperGameProps) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("beginner")
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle")
  const [time, setTime] = useState(0)
  const [minesLeft, setMinesLeft] = useState(DIFFICULTY_CONFIG.beginner.mines)
  const [board, setBoard] = useState<number[][]>([])
  const [revealed, setRevealed] = useState<boolean[][]>([])
  const [flagged, setFlagged] = useState<boolean[][]>([])
  const [mines, setMines] = useState<Set<string>>(new Set())
  const [firstClick, setFirstClick] = useState(true)

  const config = DIFFICULTY_CONFIG[difficulty]

  // 初始化游戏
  const initGame = useCallback(() => {
    const newBoard: number[][] = Array(config.rows)
      .fill(0)
      .map(() => Array(config.cols).fill(0))
    const newRevealed: boolean[][] = Array(config.rows)
      .fill(false)
      .map(() => Array(config.cols).fill(false))
    const newFlagged: boolean[][] = Array(config.rows)
      .fill(false)
      .map(() => Array(config.cols).fill(false))

    setBoard(newBoard)
    setRevealed(newRevealed)
    setFlagged(newFlagged)
    setMines(new Set())
    setGameStatus("idle")
    setTime(0)
    setMinesLeft(config.mines)
    setFirstClick(true)
  }, [config])

  // 生成地雷
  const generateMines = useCallback(
    (excludeRow: number, excludeCol: number) => {
      const newMines = new Set<string>()
      let placed = 0

      while (placed < config.mines) {
        const row = Math.floor(Math.random() * config.rows)
        const col = Math.floor(Math.random() * config.cols)

        // 确保第一个点击的位置不是雷
        if (row === excludeRow && col === excludeCol) continue

        const key = `${row},${col}`
        if (!newMines.has(key)) {
          newMines.add(key)
          placed++
        }
      }

      // 计算每个格子的数字
      const newBoard: number[][] = Array(config.rows)
        .fill(0)
        .map(() => Array(config.cols).fill(0))

      newMines.forEach((key) => {
        const [row, col] = key.split(",").map(Number)
        newBoard[row][col] = -1 // -1 表示地雷

        // 更新周围格子的数字
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const nr = row + dr
            const nc = col + dc
            if (
              nr >= 0 &&
              nr < config.rows &&
              nc >= 0 &&
              nc < config.cols &&
              newBoard[nr][nc] !== -1
            ) {
              newBoard[nr][nc]++
            }
          }
        }
      })

      setMines(newMines)
      setBoard(newBoard)
      return { newMines, newBoard }
    },
    [config]
  )

  // 自动展开空白区域
  const revealEmpty = useCallback(
    (row: number, col: number) => {
      setRevealed((prev) => {
        const newRevealed = prev.map((r) => [...r])
        const visited = new Set<string>()
        const queue: [number, number][] = [[row, col]]

        while (queue.length > 0) {
          const [r, c] = queue.shift()!
          const key = `${r},${c}`

          if (visited.has(key)) continue
          visited.add(key)

          if (r < 0 || r >= config.rows || c < 0 || c >= config.cols) continue
          if (newRevealed[r][c] || flagged[r][c]) continue

          newRevealed[r][c] = true

          // 如果当前格子是0，继续展开周围（使用函数式更新获取最新 board）
          setBoard((currentBoard) => {
            if (currentBoard[r] && currentBoard[r][c] === 0) {
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  if (dr === 0 && dc === 0) continue
                  const nr = r + dr
                  const nc = c + dc
                  if (
                    nr >= 0 &&
                    nr < config.rows &&
                    nc >= 0 &&
                    nc < config.cols &&
                    !newRevealed[nr][nc] &&
                    !flagged[nr][nc]
                  ) {
                    queue.push([nr, nc])
                  }
                }
              }
            }
            return currentBoard
          })
        }

        return newRevealed
      })
    },
    [config, flagged]
  )

  // 处理格子点击
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameStatus === "won" || gameStatus === "lost") return
      if (revealed[row][col] || flagged[row][col]) return

      // 第一次点击时生成地雷
      if (firstClick) {
        const { newBoard } = generateMines(row, col)
        setFirstClick(false)
        setGameStatus("playing")
        // 第一次点击的位置已经被排除在地雷之外，所以直接展开
        setRevealed((prev) => {
          const newRevealed = prev.map((r) => [...r])
          newRevealed[row][col] = true
          return newRevealed
        })
        // 如果点击的是空白区域，需要展开
        if (newBoard[row][col] === 0) {
          // 使用 requestAnimationFrame 确保 board 状态已更新
          requestAnimationFrame(() => {
            revealEmpty(row, col)
          })
        }
        return
      }

      // 检查是否踩雷
      if (mines.has(`${row},${col}`)) {
        setGameStatus("lost")
        // 显示所有地雷
        setRevealed((prev) => {
          const newRevealed = prev.map((r) => [...r])
          mines.forEach((key) => {
            const [r, c] = key.split(",").map(Number)
            newRevealed[r][c] = true
          })
          return newRevealed
        })
        return
      }

      // 展开格子
      if (board[row][col] === 0) {
        revealEmpty(row, col)
      } else {
        setRevealed((prev) => {
          const newRevealed = prev.map((r) => [...r])
          newRevealed[row][col] = true
          return newRevealed
        })
      }
    },
    [gameStatus, revealed, flagged, firstClick, mines, revealEmpty]
  )

  // 处理右键标记
  const handleCellRightClick = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault()
      if (gameStatus === "won" || gameStatus === "lost") return
      if (revealed[row][col]) return

      setFlagged((prev) => {
        const newFlagged = prev.map((r) => [...r])
        const wasFlagged = newFlagged[row][col]
        newFlagged[row][col] = !wasFlagged
        
        // 同步更新剩余地雷数
        setMinesLeft((prevMines) => (wasFlagged ? prevMines + 1 : prevMines - 1))
        
        return newFlagged
      })
    },
    [gameStatus, revealed, flagged]
  )

  // 计时器
  useEffect(() => {
    if (gameStatus === "playing") {
      const interval = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [gameStatus])

  // 初始化游戏
  useEffect(() => {
    initGame()
  }, [difficulty, initGame])

  // 更新剩余地雷数
  useEffect(() => {
    if (gameStatus === "idle") {
      setMinesLeft(config.mines)
    }
  }, [config.mines, gameStatus])

  // 检查是否胜利
  useEffect(() => {
    if (gameStatus !== "playing" || !board.length || !board[0]) return

    let revealedCount = 0
    revealed.forEach((row) => {
      row.forEach((cell) => {
        if (cell) revealedCount++
      })
    })

    const totalCells = config.rows * config.cols
    if (revealedCount + config.mines === totalCells && revealedCount > 0) {
      setGameStatus("won")
      // 保存记录到数据库（仅在有userId时保存）
      if (userId) {
        fetch("/api/games/records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameType: "minesweeper",
            difficulty,
            time,
          }),
        }).catch(console.error)
      }
    }
  }, [revealed, gameStatus, config, difficulty, time, board])

  const formatTime = (seconds: number) => {
    return seconds.toString().padStart(3, "0")
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* 游戏控制栏 */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as GameDifficulty)}
            disabled={gameStatus === "playing"}
            className="rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:py-2"
          >
            <option value="beginner">初级 (9x9, 10雷)</option>
            <option value="intermediate">中级 (16x16, 40雷)</option>
            <option value="expert">高级 (16x30, 99雷)</option>
          </select>
          <Button onClick={initGame} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            重新开始
          </Button>
        </div>

        <div className="flex items-center justify-between space-x-4 sm:space-x-6">
          <div className="flex items-center space-x-2">
            <Flag className="h-4 w-4 text-red-600 sm:h-5 sm:w-5" />
            <span className="text-base font-mono font-bold sm:text-lg">
              {minesLeft.toString().padStart(3, "0")}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Timer className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
            <span className="text-base font-mono font-bold sm:text-lg">{formatTime(time)}</span>
          </div>
        </div>
      </div>

      {/* 游戏状态提示 */}
      {gameStatus === "won" && (
        <div className="rounded-md bg-green-50 p-3 text-center sm:p-4">
          <p className="text-base font-semibold text-green-800 sm:text-lg">
            恭喜！你赢了！用时 {formatTime(time)} 秒
          </p>
        </div>
      )}
      {gameStatus === "lost" && (
        <div className="rounded-md bg-red-50 p-3 text-center sm:p-4">
          <p className="text-base font-semibold text-red-800 sm:text-lg">游戏结束！你踩到地雷了</p>
        </div>
      )}

      {/* 游戏棋盘和排行榜 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MinesweeperBoard
            board={board}
            revealed={revealed}
            flagged={flagged}
            onCellClick={handleCellClick}
            onCellRightClick={handleCellRightClick}
            gameStatus={gameStatus}
            difficulty={difficulty}
          />
        </div>
        {/* 暂时隐藏排行榜 */}
        {/* <div className="lg:col-span-1">
          <Leaderboard gameType="minesweeper" />
        </div> */}
      </div>
    </div>
  )
}

