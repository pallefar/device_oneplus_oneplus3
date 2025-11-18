import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users, FileText, CheckCircle, Clock } from 'lucide-react'

export default async function LeaderDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== 'LEADER') {
    redirect('/login')
  }

  const userId = (session.user as any).id

  // Fetch assigned assessments
  const assignments = await prisma.assessmentAssignment.findMany({
    where: {
      managerId: userId,
    },
    include: {
      assessment: {
        include: {
          framework: true,
        },
      },
      agent: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const pendingReview = assignments.filter(
    (a) => a.status === 'SELF_COMPLETED'
  ).length
  const completed = assignments.filter((a) => a.status === 'FINALIZED').length
  const totalAssignments = assignments.length

  const stats = [
    {
      title: 'Total Assignments',
      value: totalAssignments,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending Review',
      value: pendingReview,
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
          <h1 className="text-3xl font-bold text-gray-900">Leader Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {session.user?.name}! Review and complete agent assessments.
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
        <Card title="Assigned Assessments">
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
                  href={`/leader/assessments/${assignment.id}`}
                  className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {assignment.assessment.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Agent: {assignment.agent.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Framework: {assignment.assessment.framework.name}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        assignment.status === 'FINALIZED'
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'SELF_COMPLETED'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {assignment.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              ))}
              {assignments.length > 5 && (
                <Link
                  href="/leader/assessments"
                  className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
                >
                  View all {assignments.length} assessments
                </Link>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
