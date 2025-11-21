'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Users, Calendar, Target, UserPlus } from 'lucide-react'

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/study-groups')
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups)
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const joinGroup = async (groupId: string) => {
    try {
      const res = await fetch(`/api/study-groups/${groupId}/join`, { method: 'POST' })
      if (res.ok) {
        fetchGroups()
        alert('Joined group successfully!')
      }
    } catch (error) {
      console.error('Failed to join group:', error)
    }
  }

  if (loading) {
    return <div className="p-6"><div className="animate-pulse h-40 bg-gray-200 rounded"></div></div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Groups</h1>
          <p className="text-gray-600 mt-1">Join peer learning communities</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">{group.name}</h3>
                  {group.userRole && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {group.userRole}
                    </span>
                  )}
                </div>

                {group.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                )}

                {group.skillFocus && (
                  <div className="flex items-center text-sm text-gray-700 mb-2">
                    <Target className="w-4 h-4 mr-2 text-purple-500" />
                    <span>{group.skillFocus}</span>
                  </div>
                )}

                {group.meetingSchedule && (
                  <div className="flex items-center text-sm text-gray-700 mb-3">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{group.meetingSchedule}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{group.memberCount} / {group.maxMembers} members</span>
                  </div>
                  {group.isFull && (
                    <span className="text-xs text-red-600 font-semibold">FULL</span>
                  )}
                </div>

                {!group.userRole && !group.isFull && (
                  <button
                    onClick={() => joinGroup(group.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Group
                  </button>
                )}

                {group.userRole && (
                  <div className="text-center text-sm text-gray-500">
                    You're a {group.userRole}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <Card className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Study Groups Yet</h3>
          <p className="text-gray-600 mb-4">Be the first to create a learning community!</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create First Group
          </button>
        </Card>
      )}
    </div>
  )
}
