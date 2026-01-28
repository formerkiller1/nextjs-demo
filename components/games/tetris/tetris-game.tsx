"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GameDifficulty } from "@/types/game"
import { saveGameRecord, getHighScore, isNewHighScore } from "@/lib/game-storage"
import { Button } from "@/components/ui/button"
import { RefreshCw, Pause, Play } from "lucide-react"
import { TetrisBoard, NextPiecePreview, type PieceType, type GameStatus, type CurrentPiece } from "./tetris-board"

interface TetrisGameProps {
  userId?: string
}

// 方块形状定义（每个方块有4个旋转状态）
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

// 方块颜色
const PIECE_COLORS: Record<PieceType, string> = {
  I: "bg-cyan-500",
  O: "bg-yellow-500",
  T: "bg-purple-500",
  S: "bg-green-500",
  Z: "bg-red-500",
  J: "bg-blue-500",
  L: "bg-orange-500",
}

// 难度配置
const DIFFICULTY_CONFIG: Record<GameDifficulty, { fallSpeed: number; scoreMultiplier: number }> = {
  beginner: { fallSpeed: 800, scoreMultiplier: 100 },
  intermediate: { fallSpeed: 400, scoreMultiplier: 200 },
  expert: { fallSpeed: 200, scoreMultiplier: 300 },
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20


export function TetrisGame({ userId }: TetrisGameProps) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("beginner")
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle")
  const [board, setBoard] = useState<number[][]>([])
  const [currentPiece, setCurrentPiece] = useState<CurrentPiece | null>(null)
  const [nextPiece, setNextPiece] = useState<PieceType | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [highScore, setHighScore] = useState<number | null>(null)
  const fallIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const moveDownRef = useRef<(() => void) | null>(null)
  const downHoldTimerRef = useRef<NodeJS.Timeout | null>(null)
  const downHoldTriggeredRef = useRef(false)

  const config = DIFFICULTY_CONFIG[difficulty]

  // 初始化游戏板
  const initBoard = useCallback(() => {
    return Array(BOARD_HEIGHT)
      .fill(0)
      .map(() => Array(BOARD_WIDTH).fill(0))
  }, [])

  // 随机生成方块类型
  const getRandomPiece = useCallback((): PieceType => {
    const types: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"]
    return types[Math.floor(Math.random() * types.length)]
  }, [])

  // 获取方块形状
  const getPieceShape = useCallback((piece: CurrentPiece): number[][] => {
    return PIECES[piece.type][piece.rotation]
  }, [])

  // 检查碰撞
  const checkCollision = useCallback(
    (piece: CurrentPiece, board: number[][]): boolean => {
      const shape = getPieceShape(piece)

      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const boardRow = piece.y + row
            const boardCol = piece.x + col

            // 检查边界
            if (
              boardRow < 0 ||
              boardRow >= BOARD_HEIGHT ||
              boardCol < 0 ||
              boardCol >= BOARD_WIDTH
            ) {
              return true
            }

            // 检查与已放置方块的碰撞
            if (board[boardRow] && board[boardRow][boardCol]) {
              return true
            }
          }
        }
      }

      return false
    },
    [getPieceShape]
  )

  // 放置方块到游戏板
  const placePiece = useCallback(
    (piece: CurrentPiece, board: number[][]): number[][] => {
      const newBoard = board.map((row) => [...row])
      const shape = getPieceShape(piece)
      const colorIndex = ["I", "O", "T", "S", "Z", "J", "L"].indexOf(piece.type) + 1

      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const boardRow = piece.y + row
            const boardCol = piece.x + col

            if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardCol >= 0 && boardCol < BOARD_WIDTH) {
              newBoard[boardRow][boardCol] = colorIndex
            }
          }
        }
      }

      return newBoard
    },
    [getPieceShape]
  )

  // 消除满行
  const clearLines = useCallback((board: number[][]): { newBoard: number[][]; clearedLines: number } => {
    const newBoard: number[][] = []
    let clearedLines = 0

    // 从底部向上检查
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (board[row].every((cell) => cell !== 0)) {
        // 满行，跳过
        clearedLines++
      } else {
        // 保留这一行
        newBoard.unshift([...board[row]])
      }
    }

    // 在顶部添加空行
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0))
    }

    return { newBoard, clearedLines }
  }, [])

  // 生成新方块
  const spawnNewPiece = useCallback((): CurrentPiece => {
    const type = nextPiece || getRandomPiece()
    const newNextPiece = getRandomPiece()

    setNextPiece(newNextPiece)

    return {
      type,
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      rotation: 0,
    }
  }, [nextPiece, getRandomPiece])

  // 处理方块放置后的逻辑
  const handlePiecePlaced = useCallback(
    (placedPiece: CurrentPiece, currentBoard: number[][]) => {
      const newBoard = placePiece(placedPiece, currentBoard)
      const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard)

      setBoard(clearedBoard)
      setLines((prevLines) => {
        const newLines = prevLines + clearedLines
        setScore((prevScore) => {
          const newScore = prevScore + clearedLines * config.scoreMultiplier

          // 生成新方块
          const next = spawnNewPiece()
          if (checkCollision(next, clearedBoard)) {
            // 游戏结束
            setGameStatus("gameover")
            if (fallIntervalRef.current) {
              clearInterval(fallIntervalRef.current)
              fallIntervalRef.current = null
            }
            // 保存记录
            if (isNewHighScore("tetris", difficulty, newScore)) {
              saveGameRecord({
                gameType: "tetris",
                difficulty,
                score: newScore,
                lines: newLines,
                timestamp: Date.now(),
              })
            }
            setCurrentPiece(null)
            return newScore
          }

          setCurrentPiece(next)
          return newScore
        })
        return newLines
      })
    },
    [placePiece, clearLines, config.scoreMultiplier, spawnNewPiece, checkCollision, difficulty]
  )

  // 方块下落
  const moveDown = useCallback(() => {
    if (gameStatus !== "playing") return

    setCurrentPiece((prev) => {
      if (!prev) return prev

      const newPiece = { ...prev, y: prev.y + 1 }

      if (checkCollision(newPiece, board)) {
        // 无法下落，放置方块
        handlePiecePlaced(prev, board)
        return null
      }

      return newPiece
    })
  }, [gameStatus, checkCollision, handlePiecePlaced, board])


  // 移动方块（左/右）
  const movePiece = useCallback(
    (dx: number) => {
      if (gameStatus !== "playing") return

      setCurrentPiece((prev) => {
        if (!prev) return prev

        const newPiece = { ...prev, x: prev.x + dx }

        if (!checkCollision(newPiece, board)) {
          return newPiece
        }

        return prev
      })
    },
    [gameStatus, checkCollision, board]
  )

  // 旋转方块
  const rotatePiece = useCallback(() => {
    if (gameStatus !== "playing") return

    setCurrentPiece((prev) => {
      if (!prev) return prev

      const newRotation = (prev.rotation + 1) % 4
      const newPiece = { ...prev, rotation: newRotation }

      // 尝试旋转，如果碰撞则尝试左右移动（墙踢）
      if (!checkCollision(newPiece, board)) {
        return newPiece
      }

      // 尝试向左移动一格
      const leftKick = { ...newPiece, x: prev.x - 1 }
      if (!checkCollision(leftKick, board)) {
        return leftKick
      }

      // 尝试向右移动一格
      const rightKick = { ...newPiece, x: prev.x + 1 }
      if (!checkCollision(rightKick, board)) {
        return rightKick
      }

      return prev
    })
  }, [gameStatus, checkCollision, board])

  // 快速下落
  const hardDrop = useCallback(() => {
    if (gameStatus !== "playing") return

    setCurrentPiece((prev) => {
      if (!prev) return prev

      let newPiece = { ...prev }
      while (!checkCollision({ ...newPiece, y: newPiece.y + 1 }, board)) {
        newPiece.y++
      }

      // 立即放置
      handlePiecePlaced(newPiece, board)
      return null
    })
  }, [gameStatus, checkCollision, handlePiecePlaced, board])

  // 移动端：↓ 长按落到底，短按下移一格
  const handleDownPressStart = useCallback(() => {
    if (gameStatus !== "playing") return

    downHoldTriggeredRef.current = false
    if (downHoldTimerRef.current) clearTimeout(downHoldTimerRef.current)

    downHoldTimerRef.current = setTimeout(() => {
      downHoldTriggeredRef.current = true
      hardDrop()
    }, 260)
  }, [gameStatus, hardDrop])

  const handleDownPressEnd = useCallback(() => {
    if (downHoldTimerRef.current) {
      clearTimeout(downHoldTimerRef.current)
      downHoldTimerRef.current = null
    }
    if (gameStatus !== "playing") return
    // 若未触发长按，则当作短按：下移一格
    if (!downHoldTriggeredRef.current) {
      moveDown()
    }
  }, [gameStatus, moveDown])

  useEffect(() => {
    return () => {
      if (downHoldTimerRef.current) clearTimeout(downHoldTimerRef.current)
    }
  }, [])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStatus !== "playing" && gameStatus !== "paused") return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          if (gameStatus === "playing") movePiece(-1)
          break
        case "ArrowRight":
          e.preventDefault()
          if (gameStatus === "playing") movePiece(1)
          break
        case "ArrowDown":
          e.preventDefault()
          if (gameStatus === "playing") moveDown()
          break
        case "ArrowUp":
        case " ":
          e.preventDefault()
          if (gameStatus === "playing") rotatePiece()
          break
        case "Enter":
          e.preventDefault()
          if (gameStatus === "playing") hardDrop()
          break
        case "p":
        case "P":
          e.preventDefault()
          togglePause()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameStatus, movePiece, moveDown, rotatePiece, hardDrop])

  // 自动下落
  useEffect(() => {
    moveDownRef.current = moveDown
  }, [moveDown])

  useEffect(() => {
    if (gameStatus === "playing") {
      fallIntervalRef.current = setInterval(() => {
        moveDownRef.current?.()
      }, config.fallSpeed)
    }

    return () => {
      if (fallIntervalRef.current) {
        clearInterval(fallIntervalRef.current)
        fallIntervalRef.current = null
      }
    }
  }, [gameStatus, config.fallSpeed])

  // 初始化游戏
  const initGame = useCallback(() => {
    const newBoard = initBoard()
    setBoard(newBoard)
    setScore(0)
    setLines(0)
    setGameStatus("idle")
    setCurrentPiece(null)
    setNextPiece(getRandomPiece())

    // 加载最高分
    const high = getHighScore("tetris", difficulty)
    setHighScore(high?.score || null)
  }, [initBoard, getRandomPiece, difficulty])

  // 开始游戏
  const startGame = useCallback(() => {
    if (gameStatus === "idle" || gameStatus === "gameover") {
      initGame()
    }

    const newBoard = initBoard()
    setBoard(newBoard)
    const firstPiece = spawnNewPiece()
    setCurrentPiece(firstPiece)
    setGameStatus("playing")
  }, [gameStatus, initGame, initBoard, spawnNewPiece])

  // 暂停/继续
  const togglePause = useCallback(() => {
    if (gameStatus === "playing") {
      setGameStatus("paused")
    } else if (gameStatus === "paused") {
      setGameStatus("playing")
    }
  }, [gameStatus])

  // 难度改变时重新初始化
  useEffect(() => {
    if (gameStatus === "idle") {
      initGame()
    }
    const high = getHighScore("tetris", difficulty)
    setHighScore(high?.score || null)
  }, [difficulty, gameStatus, initGame])

  // 游戏结束时更新最高分显示
  useEffect(() => {
    if (gameStatus === "gameover") {
      const high = getHighScore("tetris", difficulty)
      setHighScore(high?.score || null)
    }
  }, [gameStatus, difficulty])

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* 游戏控制栏 */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as GameDifficulty)}
            disabled={gameStatus === "playing" || gameStatus === "paused"}
            className="rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:py-2"
          >
            <option value="beginner">初级 (慢速)</option>
            <option value="intermediate">中级 (中速)</option>
            <option value="expert">高级 (快速)</option>
          </select>
          {gameStatus === "idle" || gameStatus === "gameover" ? (
            <Button onClick={startGame} variant="outline" size="sm" className="w-full sm:w-auto">
              <Play className="mr-2 h-4 w-4" />
              开始游戏
            </Button>
          ) : (
            <Button onClick={togglePause} variant="outline" size="sm" className="w-full sm:w-auto">
              {gameStatus === "paused" ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  继续
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  暂停
                </>
              )}
            </Button>
          )}
          <Button onClick={initGame} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            重新开始
          </Button>
        </div>

        <div className="flex items-center justify-between space-x-4 sm:space-x-6">
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-gray-600 sm:text-sm">分数</span>
            <span className="text-base font-mono font-bold sm:text-lg">{score.toString().padStart(6, "0")}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-gray-600 sm:text-sm">行数</span>
            <span className="text-base font-mono font-bold sm:text-lg">{lines.toString().padStart(3, "0")}</span>
          </div>
          {highScore !== null && (
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-gray-600 sm:text-sm">最高分</span>
              <span className="text-base font-mono font-bold text-green-600 sm:text-lg">
                {highScore.toString().padStart(6, "0")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 游戏状态提示 */}
      {gameStatus === "gameover" && (
        <div className="rounded-md bg-red-50 p-3 text-center sm:p-4">
          <p className="text-base font-semibold text-red-800 sm:text-lg">
            游戏结束！分数: {score} | 消除行数: {lines}
          </p>
        </div>
      )}
      {gameStatus === "paused" && (
        <div className="rounded-md bg-yellow-50 p-3 text-center sm:p-4">
          <p className="text-base font-semibold text-yellow-800 sm:text-lg">游戏已暂停</p>
        </div>
      )}

      {/* 游戏区域和下一个方块预览 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <TetrisBoard board={board} currentPiece={currentPiece} gameStatus={gameStatus} />
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 sm:text-sm">
              控制：← → 移动 | ↑ 或 空格 旋转 | ↓ 加速 | P 暂停
            </p>
          </div>

          {/* 移动端虚拟按键 */}
          <div className="mt-4 sm:hidden">
            <div className="grid grid-cols-3 gap-2">
              <div />
              <button
                type="button"
                className="rounded-md border bg-white px-3 py-3 text-sm font-semibold text-gray-800 active:bg-gray-100"
                onClick={() => rotatePiece()}
                disabled={gameStatus !== "playing"}
              >
                ↑
              </button>
              <div />

              <button
                type="button"
                className="rounded-md border bg-white px-3 py-3 text-sm font-semibold text-gray-800 active:bg-gray-100"
                onClick={() => movePiece(-1)}
                disabled={gameStatus !== "playing"}
              >
                ←
              </button>
              <button
                type="button"
                className="rounded-md border bg-white px-3 py-3 text-sm font-semibold text-gray-800 active:bg-gray-100"
                onMouseDown={handleDownPressStart}
                onMouseUp={handleDownPressEnd}
                onMouseLeave={handleDownPressEnd}
                onTouchStart={handleDownPressStart}
                onTouchEnd={handleDownPressEnd}
                disabled={gameStatus !== "playing"}
              >
                ↓
              </button>
              <button
                type="button"
                className="rounded-md border bg-white px-3 py-3 text-sm font-semibold text-gray-800 active:bg-gray-100"
                onClick={() => movePiece(1)}
                disabled={gameStatus !== "playing"}
              >
                →
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-500">
              提示：短按 ↓ 下移一格，长按 ↓ 落到底
            </p>
          </div>
        </div>
        <div className="lg:col-span-1">
          <NextPiecePreview pieceType={nextPiece} />
        </div>
      </div>
    </div>
  )
}

