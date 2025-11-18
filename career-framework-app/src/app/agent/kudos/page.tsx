'use client'

import { useState } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { Button } from '@/components/ui/Button'
import { SendKudosModal } from '@/components/features/SendKudosModal'
import { KudosFeed } from '@/components/features/KudosFeed'
import { Heart, Users, Send, Inbox } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function KudosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'received' | 'sent'>('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id

  const handleKudosSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-900">Kudos Wall</h1>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-700">
              <Send className="w-4 h-4 mr-2" />
              Send Kudos
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Recognize and appreciate your colleagues' contributions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Public Feed
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'received'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Inbox className="w-4 h-4 inline mr-2" />
            Received
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'sent'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Sent
          </button>
        </div>

        {/* Feed */}
        <div key={`${activeTab}-${refreshKey}`}>
          <KudosFeed
            userId={activeTab === 'all' ? undefined : userId}
            type={activeTab}
          />
        </div>
      </div>

      <SendKudosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleKudosSuccess}
      />
    </div>
  )
}
