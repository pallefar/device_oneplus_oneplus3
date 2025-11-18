import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit, Eye, Trash2 } from 'lucide-react'

export default async function FrameworksPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/login')
  }

  const frameworks = await prisma.careerFramework.findMany({
    include: {
      _count: {
        select: {
          levels: true,
          competencies: true,
        },
      },
      createdBy: {
        select: {
          name: true,
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
            <h1 className="text-3xl font-bold text-gray-900">Career Frameworks</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create and manage career progression frameworks
            </p>
          </div>
          <Link
            href="/admin/frameworks/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Framework
          </Link>
        </div>

        {frameworks.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No frameworks yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first career framework to get started
              </p>
              <Link
                href="/admin/frameworks/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Framework
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {frameworks.map((framework) => (
              <Card key={framework.id}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {framework.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {framework.description || 'No description'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        framework.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {framework.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{framework._count.levels}</span> Levels
                    </div>
                    <div>
                      <span className="font-medium">{framework._count.competencies}</span>{' '}
                      Competencies
                    </div>
                    <div className="text-xs">v{framework.version}</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Created by {framework.createdBy.name}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/frameworks/${framework.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                      <Link
                        href={`/admin/frameworks/${framework.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
