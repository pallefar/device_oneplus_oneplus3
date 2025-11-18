'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Heart, User, Calendar, Award } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Kudos {
  id: string
  message: string
  isPublic: boolean
  createdAt: Date
  giver: {
    id: string
    name: string
    avatarUrl: string | null
    department: string | null
  }
  receiver: {
    id: string
    name: string
    avatarUrl: string | null
    department: string | null
  }
  skill: {
    id: string
    name: string
    competency: {
      name: string
    }
  } | null
}

interface KudosFeedProps {
  userId?: string
  type?: 'sent' | 'received' | 'all'
  limit?: number
}

export function KudosFeed({ userId, type = 'all', limit }: KudosFeedProps) {
  const [kudos, setKudos] = useState<Kudos[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKudos()
  }, [userId, type])

  const fetchKudos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (type) params.append('type', type)

      const response = await fetch(`/api/kudos?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        let kudosList = data.kudos || []
        if (limit) {
          kudosList = kudosList.slice(0, limit)
        }
        setKudos(kudosList)
      }
    } catch (error) {
      console.error('Error fetching kudos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (kudos.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No kudos yet</p>
          <p className="text-sm text-gray-500 mt-1">
            {type === 'sent' && "You haven't sent any kudos"}
            {type === 'received' && "You haven't received any kudos"}
            {type === 'all' && 'Be the first to spread some appreciation!'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {kudos.map((kudo) => (
        <Card key={kudo.id}>
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold flex-shrink-0">
                  {kudo.giver.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">{kudo.giver.name}</span>
                    {' sent kudos to '}
                    <span className="font-semibold text-gray-900">{kudo.receiver.name}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {kudo.giver.department && (
                      <span className="text-xs text-gray-500">{kudo.giver.department}</span>
                    )}
                    <span className="text-xs text-gray-400">•</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(kudo.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
              {kudo.isPublic ? (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Public</span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Private</span>
              )}
            </div>

            {/* Message */}
            <div className="pl-13">
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" />
                  <p className="text-gray-900 flex-1">{kudo.message}</p>
                </div>
              </div>
            </div>

            {/* Skill Tag */}
            {kudo.skill && (
              <div className="pl-13">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <Award className="w-3 h-3" />
                  {kudo.skill.name}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
