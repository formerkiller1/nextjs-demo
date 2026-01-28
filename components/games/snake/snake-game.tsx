"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GameDifficulty } from "@/types/game"
import { saveGameRecord, getHighScore, isNewHighScore } from "@/lib/game-storage"
import { Button } from "@/components/ui/button"
import { RefreshCw, Pause, Play } from "lucide-react"
import { SnakeBoard } from "./snake-board"

interface SnakeGameProps {
  userId?: string
}

type GameStatus = "idle" | "playing" | "paused" | "gameover"

// 方向类型
type Direction = "up" | "down" | "left" | "right"

// 坐标类型
interface Position {
  x: number
  y: number
}

// 难度配置
const DIFFICULTY_CONFIG: Record<GameDifficulty, { moveSpeed: number; scoreMultiplier: number }> = {
  beginner: { moveSpeed: 300, scoreMultiplier: 10 },
  intermediate: { moveSpeed: 200, scoreMultiplier: 20 },
  expert: { moveSpeed: 100, scoreMultiplier: 30 },
}

const BOARD_SIZE = 20

export function SnakeGame({ userId }: SnakeGameProps) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("beginner")
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle")
  const [snake, setSnake] = useState<Position[]>([])
  const [food, setFood] = useState<Position | null>(null)
  const [direction, setDirection] = useState<Direction>("right")
  const [nextDirection, setNextDirection] = useState<Direction>("right")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState<number | null>(null)
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const moveSnakeRef = useRef<(() => void) | null>(null)
  const directionRef = useRef<Direction>("right")
  const foodRef = useRef<Position | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const snakeRef = useRef<Position[]>([])
  
  // 计算当前长度（避免每次渲染都计算）
  const currentLength = snake.length > 0 ? snake.length : 1

  useEffect(() => {
    snakeRef.current = snake
  }, [snake])

  const config = DIFFICULTY_CONFIG[difficulty]

  // 初始化游戏板
  const initBoard = useCallback((): number[][] => {
    return Array(BOARD_SIZE)
      .fill(0)
      .map(() => Array(BOARD_SIZE).fill(0))
  }, [])

  // 生成随机位置
  const getRandomPosition = useCallback((): Position => {
    return {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    }
  }, [])

  // 生成食物位置（确保不在蛇身上）
  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position
    do {
      newFood = getRandomPosition()
    } while (snakeBody.some((segment) => segment.x === newFood.x && segment.y === newFood.y))

    return newFood
  }, [getRandomPosition])

  // 检查碰撞（撞墙或撞自己）
  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // 检查撞墙
    if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
      return true
    }

    // 检查撞自己（排除头部）
    return body.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
  }, [])

  // 移动蛇（用 ref 作为真值，避免状态竞争导致“增长回滚”）
  const moveSnake = useCallback(() => {
    if (gameStatus !== "playing") return

    const prevSnake = snakeRef.current
    if (!prevSnake || prevSnake.length === 0) return

    const currentDirection = directionRef.current
    const head = prevSnake[0]
    const currentFood = foodRef.current

    // 计算新头部位置
    let newHead: Position
    switch (currentDirection) {
      case "up":
        newHead = { x: head.x, y: head.y - 1 }
        break
      case "down":
        newHead = { x: head.x, y: head.y + 1 }
        break
      case "left":
        newHead = { x: head.x - 1, y: head.y }
        break
      case "right":
        newHead = { x: head.x + 1, y: head.y }
        break
    }

    // 检查碰撞
    if (checkCollision(newHead, prevSnake)) {
      setGameStatus("gameover")
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current)
        moveIntervalRef.current = null
      }

      const finalLen = prevSnake.length
      const finalScore = finalLen * config.scoreMultiplier
      if (isNewHighScore("snake", difficulty, finalScore)) {
        saveGameRecord({
          gameType: "snake",
          difficulty,
          score: finalScore,
          length: finalLen,
          timestamp: Date.now(),
        })
      }
      setScore(finalScore)
      return
    }

    // 检查是否吃到食物
    const ateFood = currentFood && newHead.x === currentFood.x && newHead.y === currentFood.y

    if (ateFood) {
      const nextSnake = [newHead, ...prevSnake] // 增长：不裁尾巴
      const nextFood = generateFood(nextSnake)
      snakeRef.current = nextSnake
      foodRef.current = nextFood
      setSnake(nextSnake)
      setFood(nextFood)
      setScore(nextSnake.length * config.scoreMultiplier)
      return
    }

    const nextSnake = [newHead, ...prevSnake.slice(0, -1)]
    snakeRef.current = nextSnake
    setSnake(nextSnake)
  }, [gameStatus, checkCollision, generateFood, config.scoreMultiplier, difficulty])

  // 改变方向
  const changeDirection = useCallback((newDirection: Direction) => {
    if (gameStatus !== "playing") return

    setNextDirection((prev) => {
      // 防止反向移动
      const oppositeDirections: Record<Direction, Direction> = {
        up: "down",
        down: "up",
        left: "right",
        right: "left",
      }

      if (newDirection === oppositeDirections[directionRef.current]) {
        return prev
      }

      directionRef.current = newDirection
      setDirection(newDirection)
      return newDirection
    })
  }, [gameStatus])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStatus !== "playing" && gameStatus !== "paused") return

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          if (gameStatus === "playing") changeDirection("up")
          break
        case "ArrowDown":
          e.preventDefault()
          if (gameStatus === "playing") changeDirection("down")
          break
        case "ArrowLeft":
          e.preventDefault()
          if (gameStatus === "playing") changeDirection("left")
          break
        case "ArrowRight":
          e.preventDefault()
          if (gameStatus === "playing") changeDirection("right")
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
  }, [gameStatus, changeDirection])

  // 触摸滑动换向（移动端）
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current
      if (!start) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y

      // 阈值避免误触
      const absX = Math.abs(dx)
      const absY = Math.abs(dy)
      if (Math.max(absX, absY) < 18) return

      if (absX > absY) {
        changeDirection(dx > 0 ? "right" : "left")
      } else {
        changeDirection(dy > 0 ? "down" : "up")
      }
      touchStartRef.current = null
    },
    [changeDirection]
  )

  // 自动移动：避免依赖 snake 导致每一帧重建 interval（会带来状态竞争，尤其在“吃到增长”时）
  useEffect(() => {
    moveSnakeRef.current = moveSnake
  }, [moveSnake])

  useEffect(() => {
    if (gameStatus === "playing") {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current)
        moveIntervalRef.current = null
      }
      moveIntervalRef.current = setInterval(() => {
        moveSnakeRef.current?.()
      }, config.moveSpeed)
    }

    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current)
        moveIntervalRef.current = null
      }
    }
  }, [gameStatus, config.moveSpeed])

  // 初始化游戏
  const initGame = useCallback(() => {
    const initialSnake: Position[] = [
      { x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) },
    ]
    const initialFood = generateFood(initialSnake)

    setSnake(initialSnake)
    snakeRef.current = initialSnake
    setFood(initialFood)
    foodRef.current = initialFood
    setDirection("right")
    directionRef.current = "right"
    setNextDirection("right")
    setScore(0)
    setGameStatus("idle")

    // 加载最高分
    const high = getHighScore("snake", difficulty)
    setHighScore(high?.score || null)
  }, [generateFood, difficulty])

  // 开始游戏
  const startGame = useCallback(() => {
    if (gameStatus === "idle" || gameStatus === "gameover") {
      initGame()
    }

    const initialSnake: Position[] = [
      { x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) },
    ]
    const initialFood = generateFood(initialSnake)

    setSnake(initialSnake)
    snakeRef.current = initialSnake
    setFood(initialFood)
    foodRef.current = initialFood
    setDirection("right")
    directionRef.current = "right"
    setNextDirection("right")
    setGameStatus("playing")
  }, [gameStatus, initGame, generateFood])

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
    const high = getHighScore("snake", difficulty)
    setHighScore(high?.score || null)
  }, [difficulty, gameStatus, initGame])

  // 初始化时加载最高分
  useEffect(() => {
    const high = getHighScore("snake", difficulty)
    setHighScore(high?.score || null)
  }, [difficulty])

  // 游戏结束时更新最高分显示
  useEffect(() => {
    if (gameStatus === "gameover") {
      const high = getHighScore("snake", difficulty)
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
            <span className="text-xs text-gray-600 sm:text-sm">长度</span>
            <span className="text-base font-mono font-bold sm:text-lg">{currentLength.toString().padStart(3, "0")}</span>
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
            游戏结束！分数: {score} | 长度: {currentLength}
          </p>
        </div>
      )}
      {gameStatus === "paused" && (
        <div className="rounded-md bg-yellow-50 p-3 text-center sm:p-4">
          <p className="text-base font-semibold text-yellow-800 sm:text-lg">游戏已暂停</p>
        </div>
      )}

      {/* 游戏区域 */}
      <div className="flex flex-col items-center space-y-4">
        <div
          className="touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <SnakeBoard snake={snake} food={food} gameStatus={gameStatus} />
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 sm:text-sm">
            控制：方向键移动 | P 暂停
          </p>
        </div>

        {/* 移动端方向按钮兜底 */}
        <div className="sm:hidden">
          <div className="grid grid-cols-3 gap-2">
            <div />
            <button
              type="button"
              className="rounded-md border bg-white px-4 py-3 text-sm font-semibold text-gray-800 active:bg-gray-100"
              onClick={() => changeDirection("up")}
            >
              ↑
            </button>
            <div />
            <button
              type="button"
              className="rounded-md border bg-white px-4 py-3 text-sm font-semibold text-gray-800 active:bg-gray-100"
              onClick={() => changeDirection("left")}
            >
              ←
            </button>
            <button
              type="button"
              className="rounded-md border bg-white px-4 py-3 text-sm font-semibold text-gray-800 active:bg-gray-100"
              onClick={() => changeDirection("down")}
            >
              ↓
            </button>
            <button
              type="button"
              className="rounded-md border bg-white px-4 py-3 text-sm font-semibold text-gray-800 active:bg-gray-100"
              onClick={() => changeDirection("right")}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

