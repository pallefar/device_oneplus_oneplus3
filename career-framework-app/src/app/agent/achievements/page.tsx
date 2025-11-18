'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { Trophy, Award, Star, Lock, CheckCircle, TrendingUp } from 'lucide-react'

interface Achievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  category: string
  xpReward: number
  tier: string
  unlocked: boolean
  unlockedAt: Date | null
  progress: number
}

interface Badge {
  id: string
  key: string
  name: string
  description: string
  icon: string
  color: string
  rarity: string
  requirement: string
  earned: boolean
  earnedAt: Date | null
  isPinned: boolean
}

interface Leaderboard {
  rank: number
  id: string
  name: string
  experiencePoints: number
  level: number
  department: string | null
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'achievements' | 'badges' | 'leaderboard'>('achievements')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [achievementsRes, leaderboardRes] = await Promise.all([
        fetch('/api/gamification/achievements'),
        fetch('/api/gamification/leaderboard?limit=20'),
      ])

      if (achievementsRes.ok) {
        const data = await achievementsRes.json()
        setAchievements(data.achievements || [])
        setBadges(data.badges || [])
      }

      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'bg-gradient-to-br from-orange-600 to-orange-400'
      case 'silver':
        return 'bg-gradient-to-br from-gray-400 to-gray-300'
      case 'gold':
        return 'bg-gradient-to-br from-yellow-500 to-yellow-400'
      case 'platinum':
        return 'bg-gradient-to-br from-purple-600 to-purple-400'
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-400'
    }
  }

  const getRarityBorder = (rarity: string) => {
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

  const categorizedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = []
    }
    acc[achievement.category].push(achievement)
    return acc
  }, {} as Record<string, Achievement[]>)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'milestone':
        return <Trophy className="w-5 h-5" />
      case 'assessment':
        return <CheckCircle className="w-5 h-5" />
      case 'learning':
        return <TrendingUp className="w-5 h-5" />
      case 'social':
        return <Star className="w-5 h-5" />
      default:
        return <Award className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading achievements...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">Achievements & Badges</h1>
          </div>
          <p className="text-sm text-gray-600">
            Track your progress and earn rewards as you advance your career
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'achievements'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Achievements ({achievements.filter((a) => a.unlocked).length}/{achievements.length})
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'badges'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Badges ({badges.filter((b) => b.earned).length}/{badges.length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Leaderboard
          </button>
        </div>

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {Object.entries(categorizedAchievements).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  {getCategoryIcon(category)}
                  <h2 className="text-xl font-bold text-gray-900 capitalize">{category}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((achievement) => (
                    <Card key={achievement.id}>
                      <div
                        className={`flex items-start gap-4 ${
                          !achievement.unlocked ? 'opacity-60' : ''
                        }`}
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                            achievement.unlocked
                              ? getTierColor(achievement.tier)
                              : 'bg-gray-200'
                          }`}
                        >
                          {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1">{achievement.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-blue-600">
                              +{achievement.xpReward} XP
                            </span>
                            {achievement.unlocked && (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Unlocked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <Card key={badge.id}>
                <div className={`${!badge.earned ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl border-4 ${getRarityBorder(
                        badge.rarity
                      )}`}
                      style={{
                        backgroundColor: badge.earned ? badge.color + '40' : '#f3f4f6',
                      }}
                    >
                      {badge.earned ? badge.icon : <Lock className="w-6 h-6 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                      <span
                        className={`inline-block text-xs font-medium px-2 py-1 rounded capitalize ${
                          badge.rarity === 'legendary'
                            ? 'bg-yellow-100 text-yellow-800'
                            : badge.rarity === 'epic'
                            ? 'bg-purple-100 text-purple-800'
                            : badge.rarity === 'rare'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {badge.rarity}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      <strong>How to earn:</strong> {badge.requirement}
                    </p>
                    {badge.earned && (
                      <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Earned on {new Date(badge.earnedAt!).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-900">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-900">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-900">
                      Department
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-900">
                      Level
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-gray-900">
                      XP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.rank <= 3 ? (
                            <span className="text-2xl">
                              {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-gray-600 w-8 text-center">
                              #{user.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {user.department || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {user.level}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-blue-600">
                          {user.experiencePoints.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
