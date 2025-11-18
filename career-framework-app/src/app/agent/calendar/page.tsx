'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Calendar, Clock, Plus, Trash2, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startTime: Date
  endTime: Date
  provider: string
  learningGoalId: string | null
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/calendar/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = async () => {
    if (!title || !startTime || !endTime) {
      showToast('error', 'Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          startTime,
          endTime,
          provider: 'internal',
        }),
      })

      if (response.ok) {
        showToast('success', 'Learning session scheduled!')
        setTitle('')
        setDescription('')
        setStartTime('')
        setEndTime('')
        setShowAddForm(false)
        fetchEvents()
      } else {
        const data = await response.json()
        showToast('error', data.error || 'Failed to schedule event')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this learning session?')) return

    try {
      const response = await fetch(`/api/calendar/events?id=${eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showToast('success', 'Event deleted')
        fetchEvents()
      }
    } catch (error) {
      showToast('error', 'Failed to delete event')
    }
  }

  const handleConnectCalendar = async (provider: 'microsoft' | 'google') => {
    try {
      const response = await fetch(`/api/calendar/connect?provider=${provider}`)
      if (response.ok) {
        const data = await response.json()
        // Open OAuth flow in new window
        window.open(data.authUrl, '_blank', 'width=600,height=700')
        showToast('info', 'Complete the authorization in the new window')
      } else {
        const data = await response.json()
        showToast('error', data.error || 'Calendar integration not configured')
      }
    } catch (error) {
      showToast('error', 'Failed to connect calendar')
    }
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter((e) => new Date(e.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }

  const getPastEvents = () => {
    const now = new Date()
    return events
      .filter((e) => new Date(e.endTime) < now)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Learning Calendar</h1>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Learning Time
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Schedule dedicated time for your learning goals
          </p>
        </div>

        {/* Calendar Integration Options */}
        <Card className="mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Connect Your Calendar</h3>
          <p className="text-sm text-gray-600 mb-4">
            Sync learning sessions with your external calendar
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => handleConnectCalendar('microsoft')}
              variant="ghost"
              className="border border-blue-300"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Microsoft Calendar
            </Button>
            <Button
              onClick={() => handleConnectCalendar('google')}
              variant="ghost"
              className="border border-red-300"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Calendar
            </Button>
          </div>
        </Card>

        {/* Add Event Form */}
        {showAddForm && (
          <Card className="mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Schedule Learning Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., React Hooks Study Session"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will you focus on?"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setShowAddForm(false)} variant="ghost" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddEvent} disabled={submitting} className="flex-1">
                  {submitting ? 'Scheduling...' : 'Schedule'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Upcoming Events */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
          {loading ? (
            <Card>
              <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
            </Card>
          ) : getUpcomingEvents().length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-8">
                No upcoming learning sessions scheduled
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {getUpcomingEvents().map((event) => (
                <Card key={event.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.startTime).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(event.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(event.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        {getPastEvents().length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Past Sessions</h2>
            <div className="space-y-3 opacity-60">
              {getPastEvents().slice(0, 5).map((event) => (
                <Card key={event.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.startTime).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
