'use client'

import { Navigation } from '@/components/layout/Navigation'
import { AICareerCoach } from '@/components/features/AICareerCoach'
import { Sparkles } from 'lucide-react'

export default function AICoachPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Career Coach</h1>
          </div>
          <p className="text-sm text-gray-600">
            Get personalized career advice powered by OpenAI GPT-4 or Microsoft Copilot
          </p>
        </div>

        <AICareerCoach />
      </div>
    </div>
  )
}
