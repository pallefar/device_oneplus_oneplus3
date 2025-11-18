'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { Download, Users, Activity, TrendingUp, Calendar } from 'lucide-react'

interface DownloadData {
  id: string
  downloadedBy: string | null
  ipAddress: string | null
  userAgent: string | null
  downloadedAt: string
}

interface UsageData {
  id: string
  userId: string | null
  ipAddress: string | null
  action: string
  metadata: string | null
  timestamp: string
}

interface Analytics {
  downloads: {
    total: number
    recent: DownloadData[]
  }
  usage: {
    total: number
    recent: UsageData[]
    byAction: Array<{ action: string; _count: { action: number } }>
  }
}

export default function DownloadsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch('/api/download')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `career-framework-app-${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Refresh analytics
        setTimeout(fetchAnalytics, 1000)
      } else {
        alert('Failed to download app')
      }
    } catch (error) {
      console.error('Error downloading:', error)
      alert('An error occurred while downloading')
    } finally {
      setDownloading(false)
    }
  }

  const stats = analytics
    ? [
        {
          title: 'Total Downloads',
          value: analytics.downloads.total,
          icon: Download,
          color: 'bg-blue-500',
        },
        {
          title: 'Total Usage Events',
          value: analytics.usage.total,
          icon: Activity,
          color: 'bg-green-500',
        },
        {
          title: 'Unique Actions',
          value: analytics.usage.byAction.length,
          icon: TrendingUp,
          color: 'bg-purple-500',
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">App Distribution & Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Download the app package and track installations and usage
          </p>
        </div>

        {/* Download Section */}
        <Card className="mb-8">
          <div className="text-center py-8">
            <Download className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Download Complete App Package
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Download a ZIP file containing the entire application. This package can be
              installed on any computer with Node.js. Perfect for distributing to teams or
              setting up on shared drives for network access.
            </p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              {downloading ? 'Creating Package...' : 'Download App Package'}
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Includes installation instructions and all necessary files
            </p>
          </div>
        </Card>

        {/* Stats */}
        {!loading && analytics && (
          <>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Downloads */}
              <Card title="Recent Downloads" description="Last 10 downloads">
                <div className="space-y-3">
                  {analytics.downloads.recent.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No downloads yet</p>
                  ) : (
                    analytics.downloads.recent.slice(0, 10).map((download) => (
                      <div key={download.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Download #{download.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              IP: {download.ipAddress || 'Unknown'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(download.downloadedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(download.downloadedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Usage by Action */}
              <Card title="Usage Statistics" description="Most common actions">
                <div className="space-y-3">
                  {analytics.usage.byAction.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No usage data yet</p>
                  ) : (
                    analytics.usage.byAction.slice(0, 10).map((item) => (
                      <div
                        key={item.action}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {item.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-gray-600 font-semibold">
                          {item._count.action} times
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Installation Instructions */}
            <Card className="mt-6" title="Installation Instructions">
              <div className="prose max-w-none">
                <h4 className="font-semibold text-gray-900 mb-3">
                  How to install the downloaded package:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>
                    <strong>Extract the ZIP file</strong> to your desired location (e.g.,
                    shared drive)
                  </li>
                  <li>
                    <strong>Install Node.js</strong> 18 or higher if not already installed
                  </li>
                  <li>
                    <strong>Open terminal/command prompt</strong> in the extracted folder
                  </li>
                  <li>
                    <strong>Run:</strong> <code className="bg-gray-100 px-2 py-1 rounded">npm install</code>
                  </li>
                  <li>
                    <strong>Set up database:</strong>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">npm run prisma:push</code> and{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">npm run prisma:seed</code>
                  </li>
                  <li>
                    <strong>Start server:</strong>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">npm run server</code>
                  </li>
                  <li>
                    <strong>Share network URL</strong> with your team (shown in terminal)
                  </li>
                </ol>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Pro Tip:</strong> Install on a shared network drive so your
                    entire team can access it. One person starts the server, everyone else
                    connects using the network URL!
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        )}
      </div>
    </div>
  )
}
