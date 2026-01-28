"use client"

import { useEffect, useState } from "react"
import { GameRecord, GameDifficulty } from "@/types/game"
import { Trophy } from "lucide-react"

interface LeaderboardProps {
  gameType: string
}

const DIFFICULTY_LABELS: Record<GameDifficulty, string> = {
  beginner: "初级",
  intermediate: "中级",
  expert: "高级",
}

export function Leaderboard({ gameType }: LeaderboardProps) {
  const [records, setRecords] = useState<Record<GameDifficulty, GameRecord[]>>({
    beginner: [],
    intermediate: [],
    expert: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/games/records?gameType=${gameType}`)
      .then((res) => res.json())
      .then((data) => {
        const grouped: Record<GameDifficulty, GameRecord[]> = {
          beginner: [],
          intermediate: [],
          expert: [],
        }

        data.forEach((record: GameRecord) => {
          if (record.difficulty in grouped) {
            grouped[record.difficulty as GameDifficulty].push({
              ...record,
              createdAt: new Date(record.createdAt),
            })
          }
        })

        // 按时间升序排序，取前10名
        Object.keys(grouped).forEach((difficulty) => {
          grouped[difficulty as GameDifficulty].sort((a, b) => a.time - b.time)
          grouped[difficulty as GameDifficulty] = grouped[
            difficulty as GameDifficulty
          ].slice(0, 10)
        })

        setRecords(grouped)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch leaderboard:", err)
        setLoading(false)
      })
  }, [gameType])

  const formatTime = (seconds: number) => {
    return seconds.toString().padStart(3, "0")
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
          <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
          排行榜
        </h3>
        <p className="text-sm text-gray-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
        <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
        排行榜
      </h3>

      <div className="space-y-6">
        {(["beginner", "intermediate", "expert"] as GameDifficulty[]).map(
          (difficulty) => (
            <div key={difficulty}>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">
                {DIFFICULTY_LABELS[difficulty]}
              </h4>
              {records[difficulty].length === 0 ? (
                <p className="text-xs text-gray-400">暂无记录</p>
              ) : (
                <div className="space-y-1">
                  {records[difficulty].map((record, index) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-gray-500">
                          {index + 1}.
                        </span>
                        <span className="text-gray-700">
                          {record.userName || record.userEmail.split("@")[0]}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-blue-600">
                          {formatTime(record.time)}
                        </span>
                        <span className="text-gray-400">
                          {formatDate(record.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}

