'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { TrendingUp, Users, FileText, Award, Activity } from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalAssessments: number
    totalFrameworks: number
    assignmentsByStatus: Record<string, number>
    usersByRole: Record<string, number> | null
    avgCompletionDays: number
  }
  recentActivity: any[]
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState<AnalyticsData | null>(null)
  const [completionTrends, setCompletionTrends] = useState<any[]>([])
  const [skillGaps, setSkillGaps] = useState<any[]>([])
  const [competencies, setCompetencies] = useState<any[]>([])
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    fetchAllAnalytics()
  }, [])

  const fetchAllAnalytics = async () => {
    try {
      const [overview, completion, skills, comps, users] = await Promise.all([
        fetch('/api/analytics?type=overview').then((r) => r.json()),
        fetch('/api/analytics?type=completion').then((r) => r.json()),
        fetch('/api/analytics?type=skills').then((r) => r.json()),
        fetch('/api/analytics?type=competencies').then((r) => r.json()),
        fetch('/api/analytics?type=users').then((r) => r.json()),
      ])

      setOverviewData(overview)
      setCompletionTrends(completion.trends || [])
      setSkillGaps(skills.skillGaps?.slice(0, 10) || [])
      setCompetencies(comps.competencies || [])
      setTopPerformers(users.topPerformers || [])
    } catch (error) {
      showToast('error', 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading fullScreen text="Loading analytics..." />
  }

  if (!overviewData) {
    return null
  }

  // Prepare data for charts
  const statusData = Object.entries(overviewData.overview.assignmentsByStatus).map(
    ([status, count]) => ({
      status: status.replace('_', ' '),
      count,
    })
  )

  const roleData = overviewData.overview.usersByRole
    ? Object.entries(overviewData.overview.usersByRole).map(([role, count]) => ({
        role,
        count,
      }))
    : []

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Comprehensive insights into assessments and team performance
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Assessments</p>
                <p className="text-3xl font-bold mt-1">
                  {overviewData.overview.totalAssessments}
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Frameworks</p>
                <p className="text-3xl font-bold mt-1">
                  {overviewData.overview.totalFrameworks}
                </p>
              </div>
              <Award className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg. Completion</p>
                <p className="text-3xl font-bold mt-1">
                  {overviewData.overview.avgCompletionDays}
                  <span className="text-lg ml-1">days</span>
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Active Users</p>
                <p className="text-3xl font-bold mt-1">
                  {roleData.reduce((sum, r) => sum + r.count, 0)}
                </p>
              </div>
              <Users className="w-12 h-12 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Assignment Status Distribution */}
          <Card title="Assignment Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.status}: ${entry.count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry: any, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Users by Role */}
          {roleData.length > 0 && (
            <Card title="Users by Role">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Completion Trends */}
        {completionTrends.length > 0 && (
          <Card title="Assessment Completion Trends (Last 6 Months)" className="mb-8">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={completionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#3B82F6"
                  name="Created"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="selfCompleted"
                  stroke="#10B981"
                  name="Self-Completed"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="managerCompleted"
                  stroke="#8B5CF6"
                  name="Manager-Completed"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Competency Performance Radar */}
        {competencies.length > 0 && (
          <Card title="Team Performance by Competency" className="mb-8">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={competencies}>
                <PolarGrid />
                <PolarAngleAxis dataKey="competency" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar
                  name="Self Rating"
                  dataKey="selfRating"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Manager Rating"
                  dataKey="managerRating"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Skill Gaps */}
          {skillGaps.length > 0 && (
            <Card title="Top 10 Skill Gaps (Self vs Manager Rating)">
              <div className="space-y-4">
                {skillGaps.map((skill, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{skill.skill}</p>
                        <p className="text-xs text-gray-500">{skill.competency}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          Math.abs(skill.gap) > 1
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        Gap: {skill.gap > 0 ? '+' : ''}
                        {skill.gap}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-600">Self: {skill.selfRating}</span>
                      <span className="text-green-600">Manager: {skill.managerRating}</span>
                      <span className="text-gray-500">({skill.assessmentCount} assessments)</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <Card title="Top 10 Performers">
              <div className="space-y-4">
                {topPerformers.map((performer, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          idx === 0
                            ? 'bg-yellow-500'
                            : idx === 1
                            ? 'bg-gray-400'
                            : idx === 2
                            ? 'bg-orange-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{performer.name}</p>
                        <p className="text-xs text-gray-500">{performer.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{performer.avgRating}</p>
                      <p className="text-xs text-gray-500">
                        {performer.assignmentCount} assessments
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        {overviewData.recentActivity.length > 0 && (
          <Card title="Recent Activity" className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Assessment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Agent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Manager
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {overviewData.recentActivity.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{activity.assessment}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{activity.agent}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{activity.manager}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            activity.status === 'FINALIZED'
                              ? 'bg-green-100 text-green-800'
                              : activity.status === 'SELF_COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {activity.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(activity.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
