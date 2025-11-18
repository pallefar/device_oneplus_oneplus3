'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { LearningPath } from '@/components/features/LearningPath'
import { LearningGoalModal } from '@/components/features/LearningGoalModal'
import { Loading } from '@/components/ui/Loading'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, TrendingUp, Target, Plus, CheckCircle, Calendar, Edit, Trash2 } from 'lucide-react'

export default function LearningPage() {
  const [loading, setLoading] = useState(true)
  const [skills, setSkills] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)

  useEffect(() => {
    fetchSkillData()
    fetchGoals()
  }, [])

  const fetchSkillData = async () => {
    try {
      // Get skill progression to identify areas for improvement
      const response = await fetch('/api/skill-progression')
      if (response.ok) {
        const data = await response.json()

        // Convert progression data to skills format
        const skillsList = data.progression.map((item: any) => ({
          name: item.skillName,
          rating: item.currentRating,
          priority: calculatePriority(item.currentRating, item.trend),
        }))

        // Sort by priority (skills needing most improvement first)
        skillsList.sort((a: any, b: any) => b.priority - a.priority)

        setSkills(skillsList)
      }
    } catch (error) {
      console.error('Failed to fetch skill data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/learning-goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals || [])
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    }
  }

  const handleUpdateGoalProgress = async (goalId: string, progress: number) => {
    try {
      const response = await fetch(`/api/learning-goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      })
      if (response.ok) {
        fetchGoals()
      }
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const handleCompleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/learning-goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', progress: 100 }),
      })
      if (response.ok) {
        fetchGoals()
      }
    } catch (error) {
      console.error('Failed to complete goal:', error)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const response = await fetch(`/api/learning-goals/${goalId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchGoals()
      }
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }

  const calculatePriority = (rating: number, trend: number): number => {
    // Higher priority for lower ratings and negative trends
    const ratingFactor = (5 - rating) * 2
    const trendFactor = trend < 0 ? 3 : trend > 0 ? -1 : 0
    return ratingFactor + trendFactor
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Loading text="Loading learning resources..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Learning & Goals</h1>
            </div>
            <Button onClick={() => { setSelectedGoal(null); setIsGoalModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Track your learning goals and discover resources tailored to your development needs
          </p>
        </div>

        {/* Learning Goals Section */}
        {goals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Learning Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.filter(g => g.status !== 'abandoned').map((goal: any) => (
                <Card key={goal.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => { setSelectedGoal(goal); setIsGoalModalOpen(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-blue-600">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${goal.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    {goal.targetDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    )}
                    {goal.status === 'active' && goal.progress < 100 && (
                      <Button onClick={() => handleCompleteGoal(goal.id)} variant="ghost" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Button>
                    )}
                    {goal.status === 'completed' && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {skills.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Skills Assessed Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Complete your first assessment to receive personalized learning recommendations
              </p>
              <a
                href="/agent/assessments"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Assessments
              </a>
            </div>
          </Card>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Skills</p>
                    <p className="text-3xl font-bold mt-1">{skills.length}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-blue-200" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">High Priority</p>
                    <p className="text-3xl font-bold mt-1">
                      {skills.filter((s) => s.priority >= 6).length}
                    </p>
                  </div>
                  <Target className="w-10 h-10 text-purple-200" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Average Rating</p>
                    <p className="text-3xl font-bold mt-1">
                      {(skills.reduce((sum, s) => sum + s.rating, 0) / skills.length).toFixed(1)}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-200" />
                </div>
              </Card>
            </div>

            {/* Learning Path */}
            <LearningPath skills={skills} />
          </>
        )}
      </div>

      <LearningGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goal={selectedGoal}
        onSuccess={fetchGoals}
      />
    </div>
  )
}
