'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Settings, Key, Zap, Globe, Shield, Save, Eye, EyeOff } from 'lucide-react'

interface Setting {
  id: string
  key: string
  value: string
  description: string
  category: string
  isSecret: boolean
}

const SETTING_CATEGORIES = {
  ai: {
    title: 'AI & Machine Learning',
    icon: Zap,
    color: 'text-purple-600',
    settings: [
      {
        key: 'openai_api_key',
        description: 'OpenAI API Key for AI Career Coach (GPT-4)',
        isSecret: true,
        placeholder: 'sk-...',
      },
      {
        key: 'openai_model',
        description: 'OpenAI Model to use',
        isSecret: false,
        placeholder: 'gpt-4-turbo-preview',
      },
      {
        key: 'ms_copilot_api_key',
        description: 'Microsoft Copilot API Key',
        isSecret: true,
        placeholder: 'Enter MS Copilot API key',
      },
      {
        key: 'ms_copilot_endpoint',
        description: 'Microsoft Copilot API Endpoint',
        isSecret: false,
        placeholder: 'https://api.copilot.microsoft.com/v1',
      },
      {
        key: 'anthropic_api_key',
        description: 'Anthropic Claude API Key (optional)',
        isSecret: true,
        placeholder: 'sk-ant-...',
      },
      {
        key: 'ai_features_enabled',
        description: 'Enable AI features globally',
        isSecret: false,
        placeholder: 'true',
      },
    ],
  },
  integrations: {
    title: 'Integrations',
    icon: Globe,
    color: 'text-blue-600',
    settings: [
      {
        key: 'google_calendar_client_id',
        description: 'Google Calendar OAuth Client ID',
        isSecret: false,
        placeholder: 'Enter Google OAuth Client ID',
      },
      {
        key: 'google_calendar_client_secret',
        description: 'Google Calendar OAuth Client Secret',
        isSecret: true,
        placeholder: 'Enter Google OAuth Secret',
      },
      {
        key: 'microsoft_graph_client_id',
        description: 'Microsoft Graph API Client ID (Outlook Calendar)',
        isSecret: false,
        placeholder: 'Enter Microsoft Client ID',
      },
      {
        key: 'microsoft_graph_client_secret',
        description: 'Microsoft Graph API Client Secret',
        isSecret: true,
        placeholder: 'Enter Microsoft Secret',
      },
      {
        key: 'github_token',
        description: 'GitHub Personal Access Token (for skill inference)',
        isSecret: true,
        placeholder: 'ghp_...',
      },
      {
        key: 'jira_api_token',
        description: 'Jira API Token (for project management skills)',
        isSecret: true,
        placeholder: 'Enter Jira API token',
      },
      {
        key: 'slack_bot_token',
        description: 'Slack Bot Token (for notifications and kudos)',
        isSecret: true,
        placeholder: 'xoxb-...',
      },
    ],
  },
  features: {
    title: 'Feature Flags',
    icon: Settings,
    color: 'text-green-600',
    settings: [
      {
        key: 'gamification_enabled',
        description: 'Enable gamification (XP, achievements, badges)',
        isSecret: false,
        placeholder: 'true',
      },
      {
        key: 'endorsements_enabled',
        description: 'Enable peer skill endorsements',
        isSecret: false,
        placeholder: 'true',
      },
      {
        key: 'calendar_integration_enabled',
        description: 'Enable calendar integration',
        isSecret: false,
        placeholder: 'true',
      },
      {
        key: 'market_intelligence_enabled',
        description: 'Enable real-time skill market intelligence',
        isSecret: false,
        placeholder: 'true',
      },
      {
        key: 'ai_coach_enabled',
        description: 'Enable AI Career Coach',
        isSecret: false,
        placeholder: 'true',
      },
      {
        key: 'skill_inference_enabled',
        description: 'Enable automated skill inference from work artifacts',
        isSecret: false,
        placeholder: 'false',
      },
      {
        key: 'multilingual_enabled',
        description: 'Enable multi-language support',
        isSecret: false,
        placeholder: 'true',
      },
    ],
  },
  security: {
    title: 'Security & Privacy',
    icon: Shield,
    color: 'text-red-600',
    settings: [
      {
        key: 'encryption_key',
        description: 'Encryption key for sensitive data',
        isSecret: true,
        placeholder: 'Auto-generated on first save',
      },
      {
        key: 'session_timeout_minutes',
        description: 'User session timeout (minutes)',
        isSecret: false,
        placeholder: '480',
      },
      {
        key: 'require_2fa_for_admins',
        description: 'Require 2FA for admin users',
        isSecret: false,
        placeholder: 'false',
      },
      {
        key: 'data_retention_days',
        description: 'Data retention period (days)',
        isSecret: false,
        placeholder: '365',
      },
    ],
  },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({})
  const { showToast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || [])
      }
    } catch (error) {
      showToast('error', 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setPendingChanges({ ...pendingChanges, [key]: value })
  }

  const handleSave = async (category: string) => {
    setSaving(true)
    try {
      const categorySettings = SETTING_CATEGORIES[category as keyof typeof SETTING_CATEGORIES]
      const settingsToSave = categorySettings.settings
        .filter((s) => pendingChanges.hasOwnProperty(s.key))
        .map((s) => ({
          key: s.key,
          value: pendingChanges[s.key],
          description: s.description,
          category,
          isSecret: s.isSecret,
        }))

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      })

      if (response.ok) {
        showToast('success', 'Settings saved successfully')
        fetchSettings()
        // Clear pending changes for this category
        const newPending = { ...pendingChanges }
        categorySettings.settings.forEach((s) => {
          delete newPending[s.key]
        })
        setPendingChanges(newPending)
      } else {
        showToast('error', 'Failed to save settings')
      }
    } catch (error) {
      showToast('error', 'An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets({ ...showSecrets, [key]: !showSecrets[key] })
  }

  const getCurrentValue = (key: string) => {
    if (pendingChanges.hasOwnProperty(key)) {
      return pendingChanges[key]
    }
    const existing = settings.find((s) => s.key === key)
    return existing?.value || ''
  }

  const hasPendingChanges = (category: string) => {
    const categorySettings = SETTING_CATEGORIES[category as keyof typeof SETTING_CATEGORIES]
    return categorySettings.settings.some((s) => pendingChanges.hasOwnProperty(s.key))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          </div>
          <p className="text-sm text-gray-600">
            Configure API keys, integrations, and feature flags for Vision 2030 features
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(SETTING_CATEGORIES).map(([categoryKey, category]) => {
            const Icon = category.icon
            const isPending = hasPendingChanges(categoryKey)

            return (
              <Card key={categoryKey}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${category.color}`} />
                    <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                  </div>
                  <Button
                    onClick={() => handleSave(categoryKey)}
                    disabled={!isPending || saving}
                    variant={isPending ? 'primary' : 'ghost'}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isPending ? 'Save Changes' : 'No Changes'}
                  </Button>
                </div>

                <div className="space-y-4">
                  {category.settings.map((setting) => {
                    const currentValue = getCurrentValue(setting.key)
                    const isSecret = setting.isSecret
                    const showValue = showSecrets[setting.key]

                    return (
                      <div key={setting.key} className="space-y-2">
                        <label className="block">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {setting.key}
                            </span>
                            {isSecret && currentValue && (
                              <button
                                onClick={() => toggleSecretVisibility(setting.key)}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                {showValue ? (
                                  <>
                                    <EyeOff className="w-4 h-4" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4" />
                                    Show
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
                          <input
                            type={isSecret && !showValue ? 'password' : 'text'}
                            value={currentValue}
                            onChange={(e) => handleChange(setting.key, e.target.value)}
                            placeholder={setting.placeholder}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          />
                          {isSecret && currentValue && (
                            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                              <Key className="w-3 h-3" />
                              Sensitive data - will be encrypted
                            </p>
                          )}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>API keys are encrypted before storage</li>
            <li>Changes take effect immediately after saving</li>
            <li>Some features require API keys to be set before activation</li>
            <li>Test integrations after configuring API keys</li>
            <li>Keep API keys secure and rotate them regularly</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
