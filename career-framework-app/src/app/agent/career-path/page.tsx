'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { TrendingUp, Target, Clock, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react'

interface CareerPrediction {
  targetRole: string
  successProbability: number
  estimatedMonths: number
  requiredSkills: string[]
  skillGaps: Array<{
    skill: string
    currentLevel: number
    requiredLevel: number
    gap: number
    priority: string
  }>
  recommendations: Array<{
    type: string
    title: string
    description: string
    priority: string
    estimatedTime: string
  }>
  confidenceScore: number
}

export default function CareerPathPage() {
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState<CareerPrediction[]>([])
  const [currentRole, setCurrentRole] = useState('')

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/career-path/predictions')
      if (res.ok) {
        const data = await res.json()
        setPredictions(data.predictions.map((p: any) => ({
          ...p,
          requiredSkills: JSON.parse(p.requiredSkills),
          skillGaps: JSON.parse(p.skillGaps),
          recommendations: JSON.parse(p.recommendations),
        })))
        setCurrentRole(data.currentRole)
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const getProbabilityColor = (prob: number) => {
    if (prob >= 75) return 'text-green-600'
    if (prob >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-800'
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Career Path Predictions</h1>
        <p className="text-gray-600 mt-1">
          AI-powered predictions for your career trajectory from {currentRole}
        </p>
      </div>

      <div className="space-y-6">
        {predictions.map((prediction, idx) => (
          <Card key={idx} className="hover:shadow-xl transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{prediction.targetRole}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Predicted career path from {currentRole}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getProbabilityColor(prediction.successProbability)}`}>
                    {prediction.successProbability}%
                  </div>
                  <div className="text-xs text-gray-500">Success Probability</div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Estimated Time</div>
                    <div className="font-semibold">{prediction.estimatedMonths} months</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-purple-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Skills Needed</div>
                    <div className="font-semibold">{prediction.requiredSkills.length} skills</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                  <div>
                    <div className="text-sm text-gray-600">Skill Gaps</div>
                    <div className="font-semibold">{prediction.skillGaps.length} gaps</div>
                  </div>
                </div>
              </div>

              {/* Skill Gaps */}
              {prediction.skillGaps.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                    Skills to Develop
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {prediction.skillGaps.map((gap, gapIdx) => (
                      <div key={gapIdx} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{gap.skill}</span>
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(gap.priority)}`}>
                            {gap.priority}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span>Current: Level {gap.currentLevel}</span>
                          <span className="mx-2">→</span>
                          <span>Target: Level {gap.requiredLevel}</span>
                          <span className="ml-auto text-orange-600 font-semibold">
                            Gap: +{gap.gap}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {prediction.recommendations.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                    Recommended Actions
                  </h4>
                  <div className="space-y-2">
                    {prediction.recommendations.map((rec, recIdx) => (
                      <div
                        key={recIdx}
                        className={`border-l-4 pl-4 py-3 rounded-r-lg ${
                          rec.priority === 'high'
                            ? 'bg-red-50 border-red-400'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-50 border-yellow-400'
                            : 'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{rec.title}</h5>
                            <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xs text-gray-500">Timeline</div>
                            <div className="text-sm font-semibold">{rec.estimatedTime}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
                    Prediction Confidence: {prediction.confidenceScore}%
                  </span>
                  <span className="text-gray-500">
                    Based on your current skills and organizational data
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {predictions.length === 0 && (
        <Card className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Predictions Available</h3>
          <p className="text-gray-600">
            Complete an assessment to generate AI-powered career path predictions.
          </p>
        </Card>
      )}
    </div>
  )
}
