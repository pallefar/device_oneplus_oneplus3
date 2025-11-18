'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Trophy, Star, Award, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'

interface GamificationStats {
  xp: number
  level: number
  xpProgress: {
    currentLevel: number
    progress: number
    xpInLevel: number
    xpForNextLevel: number
  }
  achievements: Array<{
    id: string
    achievement: {
      name: string
      description: string
      icon: string
      tier: string
    }
    earnedAt: Date
  }>
  badges: Array<{
    id: string
    badge: {
      name: string
      icon: string
      color: string
      rarity: string
    }
    earnedAt: Date
  }>
  recentXP: Array<{
    amount: number
    reason: string
    category: string
    createdAt: Date
  }>
}

export function GamificationWidget() {
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/gamification/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching gamification stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'text-orange-600'
      case 'silver':
        return 'text-gray-400'
      case 'gold':
        return 'text-yellow-500'
      case 'platinum':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-400'
      case 'rare':
        return 'border-blue-500'
      case 'epic':
        return 'border-purple-500'
      case 'legendary':
        return 'border-yellow-500'
      default:
        return 'border-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Level & XP Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {stats.level}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Level {stats.level}</h3>
              <p className="text-sm text-gray-600">{stats.xp.toLocaleString()} XP</p>
            </div>
          </div>
          <Link
            href="/agent/achievements"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Trophy className="w-4 h-4" />
            View All
          </Link>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>{stats.xpProgress.xpInLevel} / {stats.xpProgress.xpForNextLevel} XP</span>
            <span>{Math.round(stats.xpProgress.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.xpProgress.progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {stats.xpProgress.xpForNextLevel - stats.xpProgress.xpInLevel} XP to Level {stats.level + 1}
          </p>
        </div>
      </Card>

      {/* Recent Achievements */}
      {stats.achievements.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-yellow-600" />
            <h3 className="text-sm font-bold text-gray-900">Recent Achievements</h3>
          </div>
          <div className="space-y-2">
            {stats.achievements.slice(0, 3).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200"
              >
                <span className="text-2xl">{achievement.achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {achievement.achievement.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {achievement.achievement.description}
                  </p>
                </div>
                <Star className={`w-4 h-4 ${getTierColor(achievement.achievement.tier)}`} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Badges */}
      {stats.badges.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-gray-900">Badges</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.badges.slice(0, 6).map((badge) => (
              <div
                key={badge.id}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2 ${getRarityColor(
                  badge.badge.rarity
                )} transition-transform hover:scale-110`}
                style={{ backgroundColor: badge.badge.color + '20' }}
                title={badge.badge.name}
              >
                {badge.badge.icon}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent XP Activity */}
      {stats.recentXP.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-2">
            {stats.recentXP.slice(0, 5).map((xp, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 truncate flex-1">{xp.reason}</span>
                <span className="font-medium text-green-600 ml-2">+{xp.amount} XP</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
