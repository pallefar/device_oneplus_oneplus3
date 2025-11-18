'use client'

import { useState, useEffect } from 'react'
import { X, Target, Calendar, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface LearningGoal {
  id?: string
  title: string
  description: string
  skillId: string | null
  targetDate: string | null
  priority: number
  milestones: Array<{ title: string; completed: boolean }> | null
  progress: number
  status: string
}

interface LearningGoalModalProps {
  isOpen: boolean
  onClose: () => void
  goal?: LearningGoal
  onSuccess?: () => void
}

export function LearningGoalModal({
  isOpen,
  onClose,
  goal,
  onSuccess,
}: LearningGoalModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [priority, setPriority] = useState(5)
  const [milestones, setMilestones] = useState<Array<{ title: string; completed: boolean }>>([])
  const [newMilestone, setNewMilestone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen && goal) {
      setTitle(goal.title)
      setDescription(goal.description || '')
      setTargetDate(goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '')
      setPriority(goal.priority)
      setMilestones(goal.milestones || [])
    } else if (isOpen) {
      // Reset form for new goal
      setTitle('')
      setDescription('')
      setTargetDate('')
      setPriority(5)
      setMilestones([])
    }
  }, [isOpen, goal])

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([...milestones, { title: newMilestone.trim(), completed: false }])
      setNewMilestone('')
    }
  }

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('error', 'Please enter a title')
      return
    }

    setSubmitting(true)
    try {
      const goalData = {
        title: title.trim(),
        description: description.trim(),
        targetDate: targetDate || null,
        priority,
        milestones: milestones.length > 0 ? milestones : null,
      }

      let response
      if (goal?.id) {
        // Update existing goal
        response = await fetch(`/api/learning-goals/${goal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goalData),
        })
      } else {
        // Create new goal
        response = await fetch('/api/learning-goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goalData),
        })
      }

      if (response.ok) {
        showToast('success', goal?.id ? 'Goal updated successfully!' : 'Goal created successfully!')
        onSuccess?.()
        handleClose()
      } else {
        const data = await response.json()
        showToast('error', data.error || 'Failed to save goal')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setTargetDate('')
    setPriority(5)
    setMilestones([])
    setNewMilestone('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              {goal?.id ? 'Edit Learning Goal' : 'Create Learning Goal'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Set a goal and track your progress
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Master React Hooks"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you want to achieve..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Target Date and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Milestones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Milestones (optional)
            </label>
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-900">{milestone.title}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveMilestone(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone()}
                  placeholder="Add a milestone..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button onClick={handleAddMilestone} variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <Button onClick={handleClose} variant="ghost" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                {goal?.id ? 'Update Goal' : 'Create Goal'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
