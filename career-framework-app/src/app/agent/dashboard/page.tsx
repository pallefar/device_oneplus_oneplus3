import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { EnhancedAgentDashboard } from '@/components/features/EnhancedDashboard'

export default async function AgentDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== 'AGENT') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {session.user?.name}! Here's your personalized career development overview.
          </p>
        </div>

        <EnhancedAgentDashboard />
      </div>
    </div>
  )
}
