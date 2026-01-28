"use client"

import { GameDifficulty } from "@/types/game"

export interface LocalGameRecord {
  gameType: string
  difficulty: GameDifficulty
  score: number
  lines?: number // 俄罗斯方块消除行数
  length?: number // 贪吃蛇长度
  timestamp: number
}

const STORAGE_PREFIX = "game_records_"

/**
 * 保存游戏记录到本地存储
 */
export function saveGameRecord(record: LocalGameRecord): void {
  if (typeof window === "undefined") return

  const key = `${STORAGE_PREFIX}${record.gameType}`
  const existingRecords = getGameRecords(record.gameType)
  
  // 添加新记录
  existingRecords.push(record)
  
  // 保存到localStorage
  try {
    localStorage.setItem(key, JSON.stringify(existingRecords))
  } catch (error) {
    console.error("保存游戏记录失败:", error)
  }
}

/**
 * 获取指定游戏类型的所有记录
 */
export function getGameRecords(gameType: string): LocalGameRecord[] {
  if (typeof window === "undefined") return []

  const key = `${STORAGE_PREFIX}${gameType}`
  try {
    const data = localStorage.getItem(key)
    if (!data) return []
    return JSON.parse(data) as LocalGameRecord[]
  } catch (error) {
    console.error("读取游戏记录失败:", error)
    return []
  }
}

/**
 * 获取指定游戏类型和难度的最高分
 */
export function getHighScore(
  gameType: string,
  difficulty: GameDifficulty
): LocalGameRecord | null {
  const records = getGameRecords(gameType)
  const filtered = records.filter((r) => r.difficulty === difficulty)
  
  if (filtered.length === 0) return null
  
  // 按分数降序排序，返回最高分
  return filtered.sort((a, b) => b.score - a.score)[0]
}

/**
 * 检查是否为新的最高分
 */
export function isNewHighScore(
  gameType: string,
  difficulty: GameDifficulty,
  score: number
): boolean {
  const highScore = getHighScore(gameType, difficulty)
  return !highScore || score > highScore.score
}

