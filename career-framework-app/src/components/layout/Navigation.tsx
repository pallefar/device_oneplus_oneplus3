'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FolderTree,
  FileText,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Download,
  BookOpen
} from 'lucide-react'
import { useState } from 'react'
import { NotificationCenter } from '@/components/features/NotificationCenter'

interface NavItem {
  name: string
  href: string
  icon: any
  roles: string[]
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'LEADER', 'AGENT'],
  },
  {
    name: 'Frameworks',
    href: '/frameworks',
    icon: FolderTree,
    roles: ['ADMIN'],
  },
  {
    name: 'Assessments',
    href: '/assessments',
    icon: FileText,
    roles: ['ADMIN', 'LEADER', 'AGENT'],
  },
  {
    name: 'Progress',
    href: '/progress',
    icon: TrendingUp,
    roles: ['AGENT'],
  },
  {
    name: 'Learning',
    href: '/learning',
    icon: BookOpen,
    roles: ['AGENT'],
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    roles: ['ADMIN', 'LEADER'],
  },
  {
    name: 'Downloads',
    href: '/downloads',
    icon: Download,
    roles: ['ADMIN'],
  },
]

export function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!session) return null

  const userRole = (session.user as any).role
  const basePath = `/${userRole.toLowerCase()}`

  const allowedNavItems = navItems.filter(item => item.roles.includes(userRole))

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center px-2">
              <span className="text-2xl font-bold text-blue-600">Career Framework</span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {allowedNavItems.map((item) => {
                const fullPath = `${basePath}${item.href}`
                const isActive = pathname === fullPath
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={fullPath}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <NotificationCenter />
            <div className="text-sm text-gray-700">
              <span className="font-medium">{session.user?.name}</span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {userRole}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {allowedNavItems.map((item) => {
              const fullPath = `${basePath}${item.href}`
              const isActive = pathname === fullPath
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={fullPath}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 flex items-center justify-between">
              <div>
                <div className="text-base font-medium text-gray-800">{session.user?.name}</div>
                <div className="text-sm font-medium text-gray-500">{userRole}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
