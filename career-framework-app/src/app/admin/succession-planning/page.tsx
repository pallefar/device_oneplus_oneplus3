'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import {
  Users,
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Target,
  ArrowRight,
} from 'lucide-react'

interface SuccessionCandidate {
  userId: string
  name: string
  email: string
  currentRole: string
  department: string | null
  level: number
  readinessScore: number
  readinessLevel: 'high' | 'medium' | 'low' | 'not-ready'
  suggestedNextRole: string
  developmentTime: number
  scores: {
    overall: number
    leadership: number
    technical: number
    selfAwareness: number
  }
  metrics: {
    endorsements: number
    achievements: number
    completedGoals: number
  }
  strengths: Array<{ skill: string; competency: string; rating: number }>
  developmentNeeds: Array<{
    skill: string
    competency: string
    currentRating: number
    gap: number
  }>
  lastAssessmentDate: string
}

interface SuccessionData {
  summary: {
    totalCandidates: number
    readyCandidates: number
    pipelineHealth: number
    byReadiness: {
      high: number
      medium: number
      low: number
      notReady: number
    }
  }
  candidates: SuccessionCandidate[]
  grouped: {
    high: SuccessionCandidate[]
    medium: SuccessionCandidate[]
    low: SuccessionCandidate[]
    notReady: SuccessionCandidate[]
  }
  recommendations: Array<{
    type: string
    status?: string
    message: string
  }>
}

export default function SuccessionPlanningPage() {
  const [data, setData] = useState<SuccessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState<SuccessionCandidate | null>(
    null
  )
  const [activeTab, setActiveTab] = useState<'high' | 'medium' | 'low' | 'notReady'>('high')

  useEffect(() => {
    fetchSuccessionData()
  }, [])

  const fetchSuccessionData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/succession-planning')
      if (res.ok) {
        const successionData = await res.json()
        setData(successionData)
      }
    } catch (error) {
      console.error('Failed to fetch succession planning data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }: any) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      red: 'bg-red-50 text-red-600',
    }

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Succession Planning</h1>
        <p className="text-gray-600 mt-1">
          Identify and develop your leadership pipeline
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Pipeline Health"
          value={`${data.summary.pipelineHealth}%`}
          subtitle={
            data.summary.pipelineHealth >= 70
              ? 'Strong pipeline'
              : data.summary.pipelineHealth >= 50
              ? 'Moderate pipeline'
              : 'Needs improvement'
          }
          icon={TrendingUp}
          color={
            data.summary.pipelineHealth >= 70
              ? 'green'
              : data.summary.pipelineHealth >= 50
              ? 'yellow'
              : 'red'
          }
        />
        <StatCard
          title="Ready Now"
          value={data.summary.byReadiness.high}
          subtitle={`${data.summary.readyCandidates} ready in 6 months`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="In Development"
          value={data.summary.byReadiness.medium + data.summary.byReadiness.low}
          subtitle="Candidates needing support"
          icon={Target}
          color="yellow"
        />
        <StatCard
          title="Total Candidates"
          value={data.summary.totalCandidates}
          subtitle="Assessed for succession"
          icon={Users}
          color="blue"
        />
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="mb-6 space-y-3">
          {data.recommendations.map((rec, idx) => (
            <Card key={idx} className="border-l-4 border-blue-500">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{rec.message}</p>
                  {rec.status && (
                    <span
                      className={`text-xs font-semibold mt-1 inline-block ${
                        rec.status === 'good'
                          ? 'text-green-600'
                          : rec.status === 'fair'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {rec.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs for Readiness Levels */}
      <div className="mb-4 border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { key: 'high', label: 'Ready Now', count: data.summary.byReadiness.high },
            {
              key: 'medium',
              label: 'Medium Ready',
              count: data.summary.byReadiness.medium,
            },
            { key: 'low', label: 'Low Ready', count: data.summary.byReadiness.low },
            {
              key: 'notReady',
              label: 'Not Ready',
              count: data.summary.byReadiness.notReady,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.grouped[activeTab].map((candidate) => (
          <Card
            key={candidate.userId}
            className={`hover:shadow-xl transition-all cursor-pointer border-l-4 ${
              selectedCandidate?.userId === candidate.userId
                ? 'ring-2 ring-blue-500'
                : ''
            } ${
              candidate.readinessLevel === 'high'
                ? 'border-green-500'
                : candidate.readinessLevel === 'medium'
                ? 'border-yellow-500'
                : candidate.readinessLevel === 'low'
                ? 'border-orange-500'
                : 'border-gray-300'
            }`}
            onClick={() => setSelectedCandidate(candidate)}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
                  <p className="text-sm text-gray-600">
                    {candidate.currentRole}
                    {candidate.department && ` • ${candidate.department}`}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${getReadinessColor(
                    candidate.readinessLevel
                  )}`}
                >
                  {candidate.readinessScore}/100
                </span>
              </div>

              {/* Suggested Next Role */}
              {candidate.suggestedNextRole !== candidate.currentRole && (
                <div className="flex items-center text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
                  <span className="font-medium">{candidate.currentRole}</span>
                  <ArrowRight className="w-4 h-4 mx-2" />
                  <span className="font-medium">{candidate.suggestedNextRole}</span>
                  <Clock className="w-3 h-3 ml-auto mr-1" />
                  <span className="text-xs">
                    {candidate.developmentTime === 0
                      ? 'Ready now'
                      : `${candidate.developmentTime}mo`}
                  </span>
                </div>
              )}

              {/* Scores */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600">Leadership</p>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(candidate.scores.leadership / 5) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">
                      {candidate.scores.leadership.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Technical</p>
                  <div className="flex items-center mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${(candidate.scores.technical / 5) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">
                      {candidate.scores.technical.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center justify-between text-xs text-gray-600 pt-3 border-t">
                <div className="flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  {candidate.metrics.endorsements} endorsements
                </div>
                <div className="flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  {candidate.metrics.completedGoals} goals
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Level {candidate.level}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {data.grouped[activeTab].length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No candidates in this readiness level</p>
          </div>
        )}
      </div>

      {/* Selected Candidate Detail Modal (simplified - in real app would be a proper modal) */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCandidate.name}
                  </h2>
                  <p className="text-gray-600">{selectedCandidate.email}</p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Top Strengths */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Top Strengths
                </h3>
                <div className="space-y-2">
                  {selectedCandidate.strengths.slice(0, 5).map((strength, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{strength.skill}</div>
                        <div className="text-xs text-gray-600">{strength.competency}</div>
                      </div>
                      <span className="text-green-600 font-semibold">
                        {strength.rating}/5
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Development Needs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Development Needs
                </h3>
                <div className="space-y-2">
                  {selectedCandidate.developmentNeeds.slice(0, 5).map((need, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{need.skill}</div>
                        <div className="text-xs text-gray-600">{need.competency}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-orange-600 font-semibold">
                          {need.currentRating}/5
                        </div>
                        <div className="text-xs text-gray-500">
                          Gap: {need.gap.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment Date */}
              <div className="text-sm text-gray-600 pt-4 border-t">
                Last assessed:{' '}
                {new Date(selectedCandidate.lastAssessmentDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
