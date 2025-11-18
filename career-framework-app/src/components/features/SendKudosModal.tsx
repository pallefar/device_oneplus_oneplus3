'use client'

import { useState, useEffect } from 'react'
import { X, Heart, Search, Loader2 } from 'lucide-react'
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
  competency: {
    name: string
  }
}

interface SendKudosModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedUser?: User
  onSuccess?: () => void
}

export function SendKudosModal({
  isOpen,
  onClose,
  preselectedUser,
  onSuccess,
}: SendKudosModalProps) {
  const [step, setStep] = useState<'selectUser' | 'writeMessage'>('selectUser')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(preselectedUser || null)
  const [message, setMessage] = useState('')
  const [selectedSkillId, setSelectedSkillId] = useState<string>('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      if (preselectedUser) {
        setStep('writeMessage')
        setSelectedUser(preselectedUser)
      } else {
        setStep('selectUser')
        fetchUsers()
      }
      fetchSkills()
    }
  }, [isOpen, preselectedUser])

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
    try {
      const response = await fetch('/api/skills')
      if (response.ok) {
        const data = await response.json()
        setSkills(data.skills || [])
      }
    } catch (error) {
      console.error('Error fetching skills:', error)
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setStep('writeMessage')
  }

  const handleSubmit = async () => {
    if (!selectedUser || !message.trim()) {
      showToast('error', 'Please enter a message')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/kudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          message: message.trim(),
          skillId: selectedSkillId || null,
          isPublic,
        }),
      })

      if (response.ok) {
        showToast('success', 'Kudos sent successfully!')
        onSuccess?.()
        handleClose()
      } else {
        const data = await response.json()
        showToast('error', data.error || 'Failed to send kudos')
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
    setMessage('')
    setSelectedSkillId('')
    setIsPublic(true)
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
              <Heart className="w-6 h-6 text-red-500" />
              Send Kudos
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 'selectUser' && 'Select a colleague to recognize'}
              {step === 'writeMessage' && 'Write your appreciation message'}
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
                    className="w-full p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
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

          {/* Step 2: Write Message */}
          {step === 'writeMessage' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  Sending kudos to: <strong>{selectedUser?.name}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share what you appreciate about this person..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Skill (optional)
                </label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">None</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name} - {skill.competency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Make this kudos public (visible to everyone)
                </label>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep('selectUser')} variant="ghost" className="flex-1">
                  ← Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !message.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Send Kudos
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
