'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import {
  Target,
  TrendingUp,
  BookOpen,
  Users,
  Calendar,
  Download,
  Sparkles,
} from 'lucide-react'
import { LearningPath } from './LearningPath'

interface DevelopmentPlanProps {
  assignmentId: string
}

export function DevelopmentPlan({ assignmentId }: DevelopmentPlanProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<any>(null)
  const { showToast } = useToast()

  const generatePlan = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/development-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId }),
      })

      if (response.ok) {
        const data = await response.json()
        setPlan(data)
        setIsOpen(true)
      } else {
        showToast('error', 'Failed to generate development plan')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const downloadPlan = () => {
    if (!plan) return

    const content = generatePDFContent(plan)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `development-plan-${plan.agentName.replace(/\s+/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Button onClick={generatePlan} loading={loading} variant="secondary">
        <Sparkles className="w-4 h-4 mr-2" />
        Generate Development Plan
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Personalized Development Plan"
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={downloadPlan}>
              <Download className="w-4 h-4 mr-2" />
              Download Plan
            </Button>
          </>
        }
      >
        {plan && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">
                Development Plan for {plan.agentName}
              </h3>
              <p className="text-blue-100">
                Framework: {plan.framework} | Generated:{' '}
                {new Date(plan.generatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Skill Gaps Summary */}
            <Card title="Skill Gaps Overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-800">High Priority</span>
                    <Target className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {plan.skillGaps.filter((g: any) => g.priority >= 6).length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-800">Medium Priority</span>
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">
                    {
                      plan.skillGaps.filter((g: any) => g.priority >= 3 && g.priority < 6)
                        .length
                    }
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Low Priority</span>
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {plan.skillGaps.filter((g: any) => g.priority < 3).length}
                  </p>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <Card title="Development Recommendations">
              <div className="space-y-4">
                {plan.recommendations.map((rec: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'High'
                        ? 'bg-red-50 border-red-500'
                        : rec.priority === 'Medium'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-green-50 border-green-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {rec.type === 'Formal Training' && (
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        )}
                        {rec.type === 'Mentorship' && (
                          <Users className="w-5 h-5 text-purple-600" />
                        )}
                        {rec.type === 'On-the-job Learning' && (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        )}
                        <h4 className="font-semibold text-gray-900">{rec.competency}</h4>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rec.priority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : rec.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{rec.action}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {rec.timeline}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {rec.skills.length} skill{rec.skills.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rec.skills.map((skill: string, sidx: number) => (
                        <span
                          key={sidx}
                          className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Timeline */}
            <Card title="Development Timeline">
              <div className="space-y-6">
                {plan.timeline.map((phase: any, idx: number) => (
                  <div key={idx} className="relative pl-8 pb-6 border-l-2 border-blue-200 last:pb-0">
                    <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-500 rounded-full border-4 border-white"></div>
                    <h4 className="font-semibold text-gray-900 mb-1">{phase.phase}</h4>
                    <p className="text-sm text-gray-600 mb-3">{phase.focus}</p>
                    <div className="space-y-2">
                      {phase.goals.map((goal: any, gidx: number) => (
                        <div key={gidx} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-900 text-sm">{goal.skill}</p>
                          <p className="text-sm text-gray-600">{goal.action}</p>
                          <p className="text-xs text-blue-600 mt-1">Target: {goal.target}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Learning Resources */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Learning Resources</h3>
              <LearningPath
                skills={plan.skillGaps.map((gap: any) => ({
                  name: gap.skill,
                  rating: gap.managerRating,
                  priority: gap.priority,
                }))}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

function generatePDFContent(plan: any): string {
  let content = `PERSONALIZED DEVELOPMENT PLAN\n\n`
  content += `Employee: ${plan.agentName}\n`
  content += `Framework: ${plan.framework}\n`
  content += `Generated: ${new Date(plan.generatedAt).toLocaleDateString()}\n`
  content += `\n${'='.repeat(80)}\n\n`

  content += `DEVELOPMENT RECOMMENDATIONS\n\n`
  plan.recommendations.forEach((rec: any, idx: number) => {
    content += `${idx + 1}. ${rec.competency} (${rec.priority} Priority)\n`
    content += `   Type: ${rec.type}\n`
    content += `   Action: ${rec.action}\n`
    content += `   Timeline: ${rec.timeline}\n`
    content += `   Skills: ${rec.skills.join(', ')}\n\n`
  })

  content += `\n${'='.repeat(80)}\n\n`
  content += `DEVELOPMENT TIMELINE\n\n`
  plan.timeline.forEach((phase: any) => {
    content += `${phase.phase}\n`
    content += `Focus: ${phase.focus}\n\n`
    phase.goals.forEach((goal: any) => {
      content += `  • ${goal.skill}\n`
      content += `    ${goal.action}\n`
      content += `    ${goal.target}\n\n`
    })
  })

  return content
}
