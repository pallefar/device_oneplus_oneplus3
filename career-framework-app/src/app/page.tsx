import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Redirect based on role
  const role = (session.user as any).role

  switch (role) {
    case 'ADMIN':
      redirect('/admin/dashboard')
    case 'LEADER':
      redirect('/leader/dashboard')
    case 'AGENT':
      redirect('/agent/dashboard')
    default:
      redirect('/login')
  }
}
