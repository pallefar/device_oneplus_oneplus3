'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Award } from 'lucide-react'

interface SkillProgressionProps {
  userId?: string
}

export function SkillProgression({ userId }: SkillProgressionProps) {
  const [loading, setLoading] = useState(true)
  const [progression, setProgression] = useState<any[]>([])
  const [selectedSkill, setSelectedSkill] = useState<any>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchProgression()
  }, [userId])

  const fetchProgression = async () => {
    try {
      const url = userId
        ? `/api/skill-progression?userId=${userId}`
        : '/api/skill-progression'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setProgression(data.progression || [])
        if (data.progression && data.progression.length > 0) {
          setSelectedSkill(data.progression[0])
        }
      } else {
        showToast('error', 'Failed to fetch skill progression')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading text="Loading skill progression..." />
  }

  if (progression.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Progression Data Yet
          </h3>
          <p className="text-gray-600">
            Complete at least one assessment to see your skill progression over time
          </p>
        </div>
      </Card>
    )
  }

  const chartData = selectedSkill
    ? selectedSkill.dataPoints.map((dp: any) => ({
        date: new Date(dp.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        'Self Rating': dp.selfRating,
        'Manager Rating': dp.managerRating,
        assessment: dp.assessment,
      }))
    : []

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Skills Tracked</p>
              <p className="text-3xl font-bold mt-1">{progression.length}</p>
            </div>
            <Award className="w-10 h-10 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Improving</p>
              <p className="text-3xl font-bold mt-1">
                {progression.filter((p: any) => p.trendDirection === 'improving').length}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Stable</p>
              <p className="text-3xl font-bold mt-1">
                {progression.filter((p: any) => p.trendDirection === 'stable').length}
              </p>
            </div>
            <Minus className="w-10 h-10 text-yellow-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Needs Focus</p>
              <p className="text-3xl font-bold mt-1">
                {progression.filter((p: any) => p.currentRating < 3).length}
              </p>
            </div>
            <TrendingDown className="w-10 h-10 text-red-200" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills List */}
        <Card title="Skills" className="lg:col-span-1">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {progression.map((skill: any) => (
              <button
                key={skill.skillId}
                onClick={() => setSelectedSkill(skill)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedSkill?.skillId === skill.skillId
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-gray-900 text-sm">{skill.skillName}</p>
                  {skill.trendDirection === 'improving' && (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  )}
                  {skill.trendDirection === 'declining' && (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  {skill.trendDirection === 'stable' && (
                    <Minus className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1">{skill.competency}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {skill.assessmentCount} assessment{skill.assessmentCount !== 1 ? 's' : ''}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      skill.currentRating >= 4
                        ? 'text-green-600'
                        : skill.currentRating >= 3
                        ? 'text-blue-600'
                        : 'text-red-600'
                    }`}
                  >
                    {skill.currentRating}/5
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Progression Chart */}
        <Card title={`${selectedSkill?.skillName || 'Skill'} Progression`} className="lg:col-span-2">
          {selectedSkill && (
            <>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Competency</p>
                    <p className="font-semibold text-gray-900">{selectedSkill.competency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Rating</p>
                    <p className="font-semibold text-gray-900">
                      {selectedSkill.currentRating}/5
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trend</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${
                          selectedSkill.trend > 0
                            ? 'text-green-600'
                            : selectedSkill.trend < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {selectedSkill.trend > 0 ? '+' : ''}
                        {selectedSkill.trend}
                      </span>
                      {selectedSkill.trendDirection === 'improving' && (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      )}
                      {selectedSkill.trendDirection === 'declining' && (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      {selectedSkill.trendDirection === 'stable' && (
                        <Minus className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900 mb-1">
                              {payload[0].payload.assessment}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">{payload[0].payload.date}</p>
                            <div className="space-y-1">
                              <p className="text-sm text-blue-600">
                                Self Rating: {payload[0].value}
                              </p>
                              <p className="text-sm text-green-600">
                                Manager Rating: {payload[1].value}
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Self Rating"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Manager Rating"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Assessment History */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Assessment History</h4>
                <div className="space-y-2">
                  {selectedSkill.dataPoints.map((dp: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{dp.assessment}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(dp.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700">
                          Self: <span className="font-semibold">{dp.selfRating}</span> | Manager:{' '}
                          <span className="font-semibold">{dp.managerRating}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
