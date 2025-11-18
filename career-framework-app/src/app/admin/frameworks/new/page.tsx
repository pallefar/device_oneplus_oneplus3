'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { Plus, Trash2, Save } from 'lucide-react'

interface Level {
  name: string
  description: string
}

interface Competency {
  name: string
  description: string
}

export default function NewFrameworkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [version, setVersion] = useState('1.0')

  const [levels, setLevels] = useState<Level[]>([
    { name: 'Junior', description: 'Entry level' },
    { name: 'Mid', description: 'Mid-level professional' },
    { name: 'Senior', description: 'Senior professional' },
  ])

  const [competencies, setCompetencies] = useState<Competency[]>([
    { name: 'Technical Skills', description: 'Core technical competencies' },
    { name: 'Communication', description: 'Communication skills' },
  ])

  const addLevel = () => {
    setLevels([...levels, { name: '', description: '' }])
  }

  const removeLevel = (index: number) => {
    setLevels(levels.filter((_, i) => i !== index))
  }

  const updateLevel = (index: number, field: keyof Level, value: string) => {
    const newLevels = [...levels]
    newLevels[index][field] = value
    setLevels(newLevels)
  }

  const addCompetency = () => {
    setCompetencies([...competencies, { name: '', description: '' }])
  }

  const removeCompetency = (index: number) => {
    setCompetencies(competencies.filter((_, i) => i !== index))
  }

  const updateCompetency = (index: number, field: keyof Competency, value: string) => {
    const newCompetencies = [...competencies]
    newCompetencies[index][field] = value
    setCompetencies(newCompetencies)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/frameworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          version,
          levels,
          competencies,
        }),
      })

      if (response.ok) {
        router.push('/admin/frameworks')
        router.refresh()
      } else {
        alert('Failed to create framework')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Career Framework</h1>
          <p className="mt-2 text-sm text-gray-600">
            Define levels and competencies for your career progression framework
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card title="Framework Details">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Framework Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Engineering Career Framework"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of this framework"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1.0"
                />
              </div>
            </div>
          </Card>

          {/* Levels */}
          <Card
            title="Career Levels"
            description="Define the progression levels in this framework"
            action={
              <button
                type="button"
                onClick={addLevel}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Level
              </button>
            }
          >
            <div className="space-y-4">
              {levels.map((level, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Level {index + 1}
                    </span>
                    {levels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLevel(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={level.name}
                      onChange={(e) => updateLevel(index, 'name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Level name (e.g., Junior, Senior)"
                    />
                    <input
                      type="text"
                      value={level.description}
                      onChange={(e) => updateLevel(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Competencies */}
          <Card
            title="Competencies"
            description="Define the competency areas to be assessed"
            action={
              <button
                type="button"
                onClick={addCompetency}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Competency
              </button>
            }
          >
            <div className="space-y-4">
              {competencies.map((comp, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Competency {index + 1}
                    </span>
                    {competencies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCompetency(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) => updateCompetency(index, 'name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Competency name (e.g., Technical Skills)"
                    />
                    <input
                      type="text"
                      value={comp.description}
                      onChange={(e) => updateCompetency(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'Create Framework'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
