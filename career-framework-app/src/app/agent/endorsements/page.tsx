'use client'

import { useState } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { Button } from '@/components/ui/Button'
import { EndorseSkillModal } from '@/components/features/EndorseSkillModal'
import { EndorsementsDisplay } from '@/components/features/EndorsementsDisplay'
import { ThumbsUp, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function EndorsementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id

  const handleEndorsementSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <ThumbsUp className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Skill Endorsements</h1>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Users className="w-4 h-4 mr-2" />
              Endorse a Colleague
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            View endorsements you've received and recognize your colleagues' skills
          </p>
        </div>

        <div key={refreshKey}>
          <EndorsementsDisplay userId={userId} />
        </div>
      </div>

      <EndorseSkillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleEndorsementSuccess}
      />
    </div>
  )
}
