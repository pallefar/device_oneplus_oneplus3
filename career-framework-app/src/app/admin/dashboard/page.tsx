import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { Users, FileText, FolderTree, TrendingUp } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/login')
  }

  // Fetch dashboard stats
  const [usersCount, frameworksCount, assessmentsCount, pendingAssessments] = await Promise.all([
    prisma.user.count(),
    prisma.careerFramework.count({ where: { isActive: true } }),
    prisma.assessment.count(),
    prisma.assessmentAssignment.count({ where: { status: 'PENDING' } }),
  ])

  const stats = [
    {
      title: 'Total Users',
      value: usersCount,
      icon: Users,
      color: 'bg-blue-500',
      href: '/admin/users',
    },
    {
      title: 'Active Frameworks',
      value: frameworksCount,
      icon: FolderTree,
      color: 'bg-green-500',
      href: '/admin/frameworks',
    },
    {
      title: 'Total Assessments',
      value: assessmentsCount,
      icon: FileText,
      color: 'bg-purple-500',
      href: '/admin/assessments',
    },
    {
      title: 'Pending Assessments',
      value: pendingAssessments,
      icon: TrendingUp,
      color: 'bg-orange-500',
      href: '/admin/analytics',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {session.user?.name}! Manage your career framework system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Quick Actions">
            <div className="space-y-3">
              <Link
                href="/admin/frameworks"
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <h4 className="font-semibold text-blue-900">Create Career Framework</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Define levels, competencies, and skills
                </p>
              </Link>
              <Link
                href="/admin/assessments"
                className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <h4 className="font-semibold text-green-900">Create Assessment</h4>
                <p className="text-sm text-green-700 mt-1">
                  Assign assessments to agents and managers
                </p>
              </Link>
              <Link
                href="/admin/users"
                className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <h4 className="font-semibold text-purple-900">Manage Users</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Add or update user accounts
                </p>
              </Link>
            </div>
          </Card>

          <Card title="Recent Activity">
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">System initialized</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ready to create frameworks and assessments
                  </p>
                </div>
              </div>
              <div className="text-center py-4 text-sm text-gray-500">
                Activity log will appear here as you use the system
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
