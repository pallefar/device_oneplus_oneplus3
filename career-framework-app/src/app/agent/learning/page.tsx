'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { LearningPath } from '@/components/features/LearningPath'
import { Loading } from '@/components/ui/Loading'
import { Card } from '@/components/ui/Card'
import { BookOpen, TrendingUp, Target } from 'lucide-react'

export default function LearningPage() {
  const [loading, setLoading] = useState(true)
  const [skills, setSkills] = useState<any[]>([])

  useEffect(() => {
    fetchSkillData()
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
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Learning Resources</h1>
          </div>
          <p className="text-sm text-gray-600">
            Curated learning resources tailored to your skill development needs
          </p>
        </div>

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
    </div>
  )
}
