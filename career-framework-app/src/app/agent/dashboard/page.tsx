import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react'

export default async function AgentDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== 'AGENT') {
    redirect('/login')
  }

  const userId = (session.user as any).id

  // Fetch assigned assessments
  const assignments = await prisma.assessmentAssignment.findMany({
    where: {
      agentId: userId,
    },
    include: {
      assessment: {
        include: {
          framework: true,
        },
      },
      manager: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const pending = assignments.filter((a) => a.status === 'PENDING').length
  const completed = assignments.filter(
    (a) => a.status === 'FINALIZED' || a.status === 'MANAGER_COMPLETED'
  ).length
  const totalAssignments = assignments.length

  const stats = [
    {
      title: 'Total Assessments',
      value: totalAssignments,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending',
      value: pending,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'Completed',
      value: completed,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {session.user?.name}! Track your career development.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Assessments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="My Assessments">
            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No assessments assigned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.slice(0, 5).map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/agent/assessments/${assignment.id}`}
                    className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {assignment.assessment.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Manager: {assignment.manager.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {assignment.assessment.framework.name}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          assignment.status === 'FINALIZED'
                            ? 'bg-green-100 text-green-800'
                            : assignment.status === 'SELF_COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {assignment.status === 'PENDING'
                          ? 'To Do'
                          : assignment.status === 'SELF_COMPLETED'
                          ? 'Under Review'
                          : 'Complete'}
                      </span>
                    </div>
                  </Link>
                ))}
                {assignments.length > 5 && (
                  <Link
                    href="/agent/assessments"
                    className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
                  >
                    View all {assignments.length} assessments
                  </Link>
                )}
              </div>
            )}
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-3">
              <Link
                href="/agent/assessments"
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <h4 className="font-semibold text-blue-900">Complete Assessments</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {pending} pending self-assessment{pending !== 1 ? 's' : ''}
                </p>
              </Link>
              <div className="block p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">View Skill Matrix</h4>
                <p className="text-sm text-gray-700 mt-1">
                  Track your skill development (Coming soon)
                </p>
              </div>
              <div className="block p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">Development Plan</h4>
                <p className="text-sm text-gray-700 mt-1">
                  View your career progression plan (Coming soon)
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
