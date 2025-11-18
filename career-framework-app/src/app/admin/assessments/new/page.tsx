'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Plus, Trash2, Save } from 'lucide-react'

interface Framework {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  email: string
}

interface Assignment {
  agentId: string
  managerId: string
}

export default function NewAssessmentPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [agents, setAgents] = useState<User[]>([])
  const [managers, setManagers] = useState<User[]>([])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frameworkId, setFrameworkId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignments, setAssignments] = useState<Assignment[]>([{ agentId: '', managerId: '' }])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [fwRes, usersRes] = await Promise.all([
        fetch('/api/frameworks'),
        fetch('/api/users'),
      ])

      if (fwRes.ok) {
        const data = await fwRes.json()
        setFrameworks(data)
      }

      if (usersRes.ok) {
        const users = await usersRes.json()
        setAgents(users.filter((u: User & { role: string }) => u.role === 'AGENT'))
        setManagers(users.filter((u: User & { role: string }) => u.role === 'LEADER'))
      }
    } catch (error) {
      showToast('error', 'Failed to fetch data')
    }
  }

  const addAssignment = () => {
    setAssignments([...assignments, { agentId: '', managerId: '' }])
  }

  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index))
  }

  const updateAssignment = (index: number, field: keyof Assignment, value: string) => {
    const newAssignments = [...assignments]
    newAssignments[index][field] = value
    setAssignments(newAssignments)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate assignments
      const validAssignments = assignments.filter(
        (a: any) => a.agentId && a.managerId
      )

      if (validAssignments.length === 0) {
        showToast('error', 'Please add at least one agent-manager assignment')
        setLoading(false)
        return
      }

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameworkId,
          name,
          description,
          dueDate: dueDate || null,
          assignments: validAssignments,
        }),
      })

      if (response.ok) {
        showToast('success', 'Assessment created successfully')
        router.push('/admin/assessments')
        router.refresh()
      } else {
        const error = await response.json()
        showToast('error', error.error || 'Failed to create assessment')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Assessment</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new assessment and assign to agent-manager pairs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card title="Assessment Details">
            <div className="space-y-4">
              <Input
                label="Assessment Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q4 2024 Performance Review"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of this assessment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Framework <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={frameworkId}
                  onChange={(e) => setFrameworkId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a framework</option>
                  {frameworks.map((fw) => (
                    <option key={fw.id} value={fw.id}>
                      {fw.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Due Date (optional)"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </Card>

          <Card
            title="Agent-Manager Assignments"
            description="Assign this assessment to agent-manager pairs"
            action={
              <Button type="button" size="sm" onClick={addAssignment}>
                <Plus className="w-4 h-4 mr-1" />
                Add Assignment
              </Button>
            }
          >
            <div className="space-y-4">
              {assignments.map((assignment, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Assignment {index + 1}
                    </span>
                    {assignments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAssignment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agent <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={assignment.agentId}
                        onChange={(e) => updateAssignment(index, 'agentId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select agent</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} ({agent.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manager <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={assignment.managerId}
                        onChange={(e) => updateAssignment(index, 'managerId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select manager</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name} ({manager.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <Save className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
