'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { BookOpen, Star, Clock, DollarSign, ExternalLink } from 'lucide-react'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [platforms, setPlatforms] = useState<any[]>([])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/lms/courses')
      if (res.ok) {
        const data = await res.json()
        setCourses(data.courses)
        setPlatforms(data.platforms)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6"><div className="animate-pulse h-40 bg-gray-200 rounded"></div></div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Learning Courses</h1>
        <p className="text-gray-600 mt-1">
          Aggregated courses from {platforms.length} platforms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                    {course.platform}
                  </span>
                  {course.rating && (
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-semibold">{course.rating}</span>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>

                {course.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {course.description}
                  </p>
                )}

                {course.skillsTaught && course.skillsTaught.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.skillsTaught.slice(0, 3).map((skill: string, sidx: number) => (
                      <span key={sidx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between text-sm mb-3">
                  {course.duration && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{Math.floor(course.duration / 60)}h</span>
                    </div>
                  )}
                  {course.price !== null && (
                    <div className="flex items-center text-gray-900 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{course.price === 0 ? 'Free' : course.price}</span>
                    </div>
                  )}
                </div>

                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Course
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
          <p className="text-gray-600">Check back later for course recommendations.</p>
        </Card>
      )}
    </div>
  )
}
