'use client'

import { Navigation } from '@/components/layout/Navigation'
import { SkillProgression } from '@/components/features/SkillProgression'
import { TrendingUp } from 'lucide-react'

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Skill Progression</h1>
          </div>
          <p className="text-sm text-gray-600">
            Track your skill development journey across all completed assessments
          </p>
        </div>

        <SkillProgression />
      </div>
    </div>
  )
}
