'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { BookOpen, Video, Award, FileText, Code, ExternalLink, Star } from 'lucide-react'
import { findLearningResources, generateLearningPath, LearningResource } from '@/lib/learning-resources'

interface LearningPathProps {
  skills: Array<{ name: string; rating: number; priority: number }>
  compact?: boolean
}

export function LearningPath({ skills, compact = false }: LearningPathProps) {
  const [learningPath, setLearningPath] = useState<any[]>([])

  useEffect(() => {
    if (skills && skills.length > 0) {
      const path = generateLearningPath(skills)
      setLearningPath(path)
    }
  }, [skills])

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <Video className="w-5 h-5 text-blue-600" />
      case 'book':
        return <BookOpen className="w-5 h-5 text-green-600" />
      case 'certification':
        return <Award className="w-5 h-5 text-purple-600" />
      case 'article':
        return <FileText className="w-5 h-5 text-orange-600" />
      case 'practice':
        return <Code className="w-5 h-5 text-red-600" />
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />
      default:
        return <BookOpen className="w-5 h-5 text-gray-600" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-blue-100 text-blue-800'
      case 'advanced':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (learningPath.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No learning resources available for these skills yet.</p>
        </div>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {learningPath.slice(0, 3).map((item, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 text-sm">{item.skill}</h4>
              <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </span>
            </div>
            {item.resources.slice(0, 2).map((resource: LearningResource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded transition-colors"
              >
                {getResourceIcon(resource.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{resource.title}</p>
                  <p className="text-xs text-gray-500">{resource.provider} • {resource.duration}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </a>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Personalized Learning Path</h3>
            <p className="text-sm text-gray-600">
              Based on your skill gaps, we've curated the best learning resources to help you grow.
              Resources are ordered by priority and matched to your current skill level.
            </p>
          </div>
        </div>
      </div>

      {learningPath.map((item, idx) => (
        <Card
          key={idx}
          title={
            <div className="flex items-center justify-between">
              <span>{item.skill}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(item.priority)}`}>
                  {item.priority} Priority
                </span>
                <span className="text-xs text-gray-500">
                  Est. Time: {item.estimatedTime}
                </span>
              </div>
            </div>
          }
        >
          {item.resources.length === 0 ? (
            <p className="text-sm text-gray-600 italic">
              No specific resources found. Consider searching for "{item.skill}" on popular learning platforms.
            </p>
          ) : (
            <div className="space-y-3">
              {item.resources.map((resource: LearningResource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">{getResourceIcon(resource.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-gray-700 font-medium">{resource.provider}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{resource.duration}</span>
                        <span className="text-gray-500">•</span>
                        <span className={`px-2 py-1 rounded ${getLevelColor(resource.level)}`}>
                          {resource.level.charAt(0).toUpperCase() + resource.level.slice(1)}
                        </span>
                        <span className="text-gray-500">•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-gray-700 font-medium">{resource.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      {resource.skills && resource.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resource.skills.map((skill, skillIdx) => (
                            <span
                              key={skillIdx}
                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </Card>
      ))}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Tips for Success</h4>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Start with high-priority skills that align with your career goals</li>
          <li>• Complete one resource before moving to the next for better retention</li>
          <li>• Apply what you learn through practical projects or on-the-job tasks</li>
          <li>• Track your progress and reassess your skills regularly</li>
        </ul>
      </div>
    </div>
  )
}
