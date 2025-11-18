'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { ThumbsUp, User, Calendar, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Endorsement {
  id: string
  comment: string | null
  relationshipType: string | null
  createdAt: Date
  skill: {
    id: string
    name: string
    description: string | null
    competency: {
      name: string
    }
    level: {
      name: string
    }
  }
  endorser: {
    id: string
    name: string
    avatarUrl: string | null
    department: string | null
  }
}

interface EndorsementsDisplayProps {
  userId?: string
  skillId?: string
  showEndorseButton?: boolean
}

export function EndorsementsDisplay({
  userId,
  skillId,
  showEndorseButton = false,
}: EndorsementsDisplayProps) {
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [loading, setLoading] = useState(true)
  const [groupedEndorsements, setGroupedEndorsements] = useState<Record<string, Endorsement[]>>({})

  useEffect(() => {
    fetchEndorsements()
  }, [userId, skillId])

  const fetchEndorsements = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (skillId) params.append('skillId', skillId)

      const response = await fetch(`/api/endorsements?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEndorsements(data.endorsements || [])

        // Group endorsements by skill
        const grouped = (data.endorsements || []).reduce((acc: Record<string, Endorsement[]>, endorsement: Endorsement) => {
          const skillId = endorsement.skill.id
          if (!acc[skillId]) {
            acc[skillId] = []
          }
          acc[skillId].push(endorsement)
          return acc
        }, {})
        setGroupedEndorsements(grouped)
      }
    } catch (error) {
      console.error('Error fetching endorsements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRelationshipBadge = (type: string | null) => {
    if (!type) return null

    const colors: Record<string, string> = {
      colleague: 'bg-blue-100 text-blue-800',
      manager: 'bg-purple-100 text-purple-800',
      mentor: 'bg-green-100 text-green-800',
      direct_report: 'bg-orange-100 text-orange-800',
    }

    return (
      <span className={`text-xs px-2 py-1 rounded ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.replace('_', ' ')}
      </span>
    )
  }

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (endorsements.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <ThumbsUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No endorsements yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Endorsements from colleagues will appear here
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedEndorsements).map(([skillId, skillEndorsements]) => {
        const firstEndorsement = skillEndorsements[0]

        return (
          <Card key={skillId}>
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {firstEndorsement.skill.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {firstEndorsement.skill.competency.name} • {firstEndorsement.skill.level.name}
                  </p>
                </div>
                <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {skillEndorsements.length} {skillEndorsements.length === 1 ? 'endorsement' : 'endorsements'}
                </span>
              </div>
              {firstEndorsement.skill.description && (
                <p className="text-sm text-gray-500">{firstEndorsement.skill.description}</p>
              )}
            </div>

            <div className="space-y-3">
              {skillEndorsements.map((endorsement) => (
                <div
                  key={endorsement.id}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                      {endorsement.endorser.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{endorsement.endorser.name}</p>
                        {endorsement.relationshipType && getRelationshipBadge(endorsement.relationshipType)}
                      </div>
                      {endorsement.endorser.department && (
                        <p className="text-xs text-gray-600 mb-2">{endorsement.endorser.department}</p>
                      )}
                      {endorsement.comment && (
                        <div className="flex items-start gap-2 mt-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700 italic">"{endorsement.comment}"</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(endorsement.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
