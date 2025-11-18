import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Calendar, Users, CheckCircle, Clock, FileText, FolderTree } from 'lucide-react'

export default async function AssessmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/login')
  }

  const assessments = await prisma.assessment.findMany({
    include: {
      framework: true,
      _count: {
        select: {
          assignments: true,
        },
      },
      assignments: {
        include: {
          agent: true,
          manager: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create and manage career assessments
            </p>
          </div>
          <Link
            href="/admin/assessments/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Assessment
          </Link>
        </div>

        {assessments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assessments yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first assessment to evaluate employee skills
              </p>
              <Link
                href="/admin/assessments/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Assessment
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {assessments.map((assessment) => {
              const completedCount = assessment.assignments.filter(
                (a) => a.status === 'FINALIZED'
              ).length
              const totalCount = assessment._count.assignments

              return (
                <Card key={assessment.id}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assessment.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {assessment.description || 'No description'}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="inline-flex items-center">
                            <FolderTree className="w-4 h-4 mr-1" />
                            {assessment.framework.name}
                          </span>
                          {assessment.dueDate && (
                            <span className="inline-flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Due: {new Date(assessment.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          completedCount === totalCount
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {completedCount}/{totalCount} Completed
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{totalCount}</span> Assignments
                        </div>
                        <Link
                          href={`/admin/assessments/${assessment.id}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
