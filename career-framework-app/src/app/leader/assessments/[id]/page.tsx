'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Loading } from '@/components/ui/Loading'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'

interface Skill {
  id: string
  name: string
  description: string
  competency: { name: string }
  level: { name: string }
}

interface Response {
  skillId: string
  selfRating?: number
  selfComments?: string
  managerRating?: number
  managerComments?: string
  skill: Skill
}

interface Assignment {
  id: string
  status: string
  assessment: {
    name: string
    description: string
    dueDate: string
    framework: { name: string }
  }
  agent: { name: string }
  responses: Response[]
  selfCompletedAt?: string
}

export default function ManagerAssessmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [responses, setResponses] = useState<Record<string, { rating: number; comments: string }>>({})

  useEffect(() => {
    fetchAssignment()
  }, [])

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAssignment(data)

        // Initialize responses
        const initialResponses: Record<string, { rating: number; comments: string }> = {}
        data.responses.forEach((r: Response) => {
          initialResponses[r.skillId] = {
            rating: r.managerRating || 0,
            comments: r.managerComments || '',
          }
        })
        setResponses(initialResponses)
      } else {
        showToast('error', 'Failed to fetch assessment')
        router.push('/leader/dashboard')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = (skillId: string, rating: number) => {
    setResponses({
      ...responses,
      [skillId]: {
        ...responses[skillId],
        rating,
      },
    })
  }

  const handleCommentsChange = (skillId: string, comments: string) => {
    setResponses({
      ...responses,
      [skillId]: {
        ...responses[skillId],
        comments,
      },
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      // Validate all skills have ratings
      const allRated = Object.values(responses).every((r) => r.rating > 0)
      if (!allRated) {
        showToast('error', 'Please rate all skills')
        setSubmitting(false)
        return
      }

      const responsesArray = Object.entries(responses).map(([skillId, data]) => ({
        skillId,
        rating: data.rating,
        comments: data.comments,
      }))

      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: params.id,
          responses: responsesArray,
          type: 'manager',
        }),
      })

      if (response.ok) {
        showToast('success', 'Review submitted successfully')
        router.push('/leader/dashboard')
        router.refresh()
      } else {
        showToast('error', 'Failed to submit review')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loading fullScreen text="Loading assessment..." />
  }

  if (!assignment) {
    return null
  }

  // Group responses by competency
  const groupedResponses: Record<string, Response[]> = {}
  assignment.responses.forEach((response) => {
    const compName = response.skill.competency.name
    if (!groupedResponses[compName]) {
      groupedResponses[compName] = []
    }
    groupedResponses[compName].push(response)
  })

  const isFinalized = assignment.status === 'FINALIZED'
  const canReview = assignment.status === 'SELF_COMPLETED'
  const pendingSelfAssessment = assignment.status === 'PENDING'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{assignment.assessment.name}</h1>
          <p className="mt-2 text-sm text-gray-600">{assignment.assessment.description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>Framework: {assignment.assessment.framework.name}</span>
            <span>•</span>
            <span>Agent: {assignment.agent.name}</span>
            {assignment.assessment.dueDate && (
              <>
                <span>•</span>
                <span>Due: {new Date(assignment.assessment.dueDate).toLocaleDateString()}</span>
              </>
            )}
          </div>

          {isFinalized && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Assessment completed and finalized
              </span>
            </div>
          )}

          {pendingSelfAssessment && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                Waiting for {assignment.agent.name} to complete self-assessment
              </span>
            </div>
          )}

          {canReview && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Self-assessment completed on {new Date(assignment.selfCompletedAt!).toLocaleDateString()}. Ready for your review.
              </span>
            </div>
          )}
        </div>

        {canReview && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Review Instructions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Review the agent's self-assessment ratings and comments</li>
                <li>Provide your own rating from 1 (Beginner) to 5 (Expert)</li>
                <li>Add constructive feedback to help the agent improve</li>
                <li>Submit when ready to finalize the assessment</li>
              </ul>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          {Object.entries(groupedResponses).map(([competency, skillResponses]) => (
            <Card key={competency} title={competency}>
              <div className="space-y-6">
                {skillResponses.map((response) => (
                  <div key={response.skillId} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {response.skill.name}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          (Expected: {response.skill.level.name})
                        </span>
                      </h4>
                      {response.skill.description && (
                        <p className="text-sm text-gray-600">{response.skill.description}</p>
                      )}
                    </div>

                    {/* Agent's Self-Assessment */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Agent's Self-Assessment:</p>
                      <p className="text-sm text-gray-600 mb-2">
                        Rating: <span className="font-semibold">{response.selfRating || 'Not rated'}/5</span>
                      </p>
                      {response.selfComments && (
                        <p className="text-sm text-gray-600">{response.selfComments}</p>
                      )}
                    </div>

                    {/* Manager Rating */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Rating {canReview && <span className="text-red-500">*</span>}
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              disabled={!canReview}
                              onClick={() => handleRatingChange(response.skillId, rating)}
                              className={`w-12 h-12 rounded-lg border-2 font-semibold transition-colors ${
                                responses[response.skillId]?.rating === rating
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-gray-300 hover:border-blue-400 text-gray-700'
                              } ${!canReview ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          1 = Beginner, 3 = Competent, 5 = Expert
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Feedback
                        </label>
                        <textarea
                          disabled={!canReview}
                          value={responses[response.skillId]?.comments || ''}
                          onChange={(e) => handleCommentsChange(response.skillId, e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="Provide constructive feedback on their performance and areas for improvement..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {canReview && (
          <div className="mt-8 flex justify-end space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              <Save className="w-4 h-4 mr-2" />
              Submit Review
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
