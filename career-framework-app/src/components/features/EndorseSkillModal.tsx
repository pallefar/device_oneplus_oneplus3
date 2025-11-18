'use client'

import { useState, useEffect } from 'react'
import { X, Search, ThumbsUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface User {
  id: string
  name: string
  email: string
  department: string | null
  avatarUrl: string | null
}

interface Skill {
  id: string
  name: string
  description: string | null
  competency: {
    name: string
  }
}

interface EndorseSkillModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedUser?: User
  preselectedSkill?: Skill
  onSuccess?: () => void
}

export function EndorseSkillModal({
  isOpen,
  onClose,
  preselectedUser,
  preselectedSkill,
  onSuccess,
}: EndorseSkillModalProps) {
  const [step, setStep] = useState<'selectUser' | 'selectSkill' | 'writeComment'>('selectUser')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(preselectedUser || null)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(preselectedSkill || null)
  const [comment, setComment] = useState('')
  const [relationshipType, setRelationshipType] = useState<string>('colleague')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      if (preselectedUser && preselectedSkill) {
        setStep('writeComment')
        setSelectedUser(preselectedUser)
        setSelectedSkill(preselectedSkill)
      } else if (preselectedUser) {
        setStep('selectSkill')
        setSelectedUser(preselectedUser)
        fetchSkills()
      } else {
        setStep('selectUser')
        fetchUsers()
      }
    }
  }, [isOpen, preselectedUser, preselectedSkill])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/endorsements/users?search=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSkills = async () => {
    setLoading(true)
    try {
      // Fetch all available skills from frameworks
      const response = await fetch('/api/skills')
      if (response.ok) {
        const data = await response.json()
        setSkills(data.skills || [])
      }
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setStep('selectSkill')
    fetchSkills()
  }

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill)
    setStep('writeComment')
  }

  const handleSubmit = async () => {
    if (!selectedUser || !selectedSkill) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/endorsements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endorseeId: selectedUser.id,
          skillId: selectedSkill.id,
          comment: comment.trim(),
          relationshipType,
        }),
      })

      if (response.ok) {
        showToast('success', 'Endorsement sent successfully!')
        onSuccess?.()
        handleClose()
      } else {
        const data = await response.json()
        showToast('error', data.error || 'Failed to send endorsement')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('selectUser')
    setSearchQuery('')
    setSelectedUser(null)
    setSelectedSkill(null)
    setComment('')
    setRelationshipType('colleague')
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
              <ThumbsUp className="w-6 h-6 text-blue-600" />
              Endorse a Skill
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 'selectUser' && 'Select a colleague to endorse'}
              {step === 'selectSkill' && `Select a skill to endorse for ${selectedUser?.name}`}
              {step === 'writeComment' && 'Add a comment (optional)'}
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
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select User */}
          {step === 'selectUser' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && fetchUsers()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <Button onClick={fetchUsers} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Search
              </Button>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">
                          {user.department || 'No department'} • {user.email}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                {users.length === 0 && !loading && (
                  <p className="text-center text-gray-500 py-8">
                    No users found. Try a different search.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Select Skill */}
          {step === 'selectSkill' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  Endorsing: <strong>{selectedUser?.name}</strong>
                </p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  skills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => handleSkillSelect(skill)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
                    >
                      <p className="font-medium text-gray-900">{skill.name}</p>
                      <p className="text-sm text-gray-600">{skill.competency.name}</p>
                      {skill.description && (
                        <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
                      )}
                    </button>
                  ))
                )}
                {skills.length === 0 && !loading && (
                  <p className="text-center text-gray-500 py-8">No skills available</p>
                )}
              </div>

              <Button onClick={() => setStep('selectUser')} variant="ghost">
                ← Back to user selection
              </Button>
            </div>
          )}

          {/* Step 3: Write Comment */}
          {step === 'writeComment' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                <p className="text-sm text-gray-700">
                  Endorsing: <strong>{selectedUser?.name}</strong>
                </p>
                <p className="text-sm text-gray-700">
                  Skill: <strong>{selectedSkill?.name}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your relationship
                </label>
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="colleague">Colleague</option>
                  <option value="manager">Manager</option>
                  <option value="mentor">Mentor</option>
                  <option value="direct_report">Direct Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share why you're endorsing this skill..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep('selectSkill')} variant="ghost" className="flex-1">
                  ← Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Send Endorsement
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
