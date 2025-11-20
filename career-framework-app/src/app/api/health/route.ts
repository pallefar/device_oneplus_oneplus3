import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSystemSetting } from '@/lib/settings'

/**
 * GET /api/health
 * Comprehensive health check for all system components
 * Returns status of database, integrations, and features
 */
export async function GET(request: Request) {
  const startTime = Date.now()
  const checks: Record<string, any> = {}

  // 1. Database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = {
      status: 'healthy',
      message: 'Database connection successful',
    }
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // 2. Database models check
  try {
    const userCount = await prisma.user.count()
    const frameworkCount = await prisma.careerFramework.count()
    const achievementCount = await prisma.achievement.count()

    checks.databaseModels = {
      status: 'healthy',
      data: {
        users: userCount,
        frameworks: frameworkCount,
        achievements: achievementCount,
      },
    }
  } catch (error) {
    checks.databaseModels = {
      status: 'unhealthy',
      message: 'Failed to query database models',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // 3. OpenAI API configuration
  try {
    const openaiKey = await getSystemSetting('openai_api_key')
    const aiEnabled = await getSystemSetting('ai_features_enabled')

    checks.openai = {
      status: openaiKey && aiEnabled === 'true' ? 'configured' : 'not_configured',
      configured: !!openaiKey,
      enabled: aiEnabled === 'true',
      message: openaiKey
        ? 'OpenAI API key configured'
        : 'OpenAI API key not set. Configure in Admin Settings.',
    }
  } catch (error) {
    checks.openai = {
      status: 'error',
      message: 'Failed to check OpenAI configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // 4. Microsoft Copilot configuration
  try {
    const copilotKey = await getSystemSetting('ms_copilot_api_key')
    const copilotEndpoint = await getSystemSetting('ms_copilot_endpoint')

    checks.microsoftCopilot = {
      status: copilotKey && copilotEndpoint ? 'configured' : 'not_configured',
      configured: !!(copilotKey && copilotEndpoint),
      message: copilotKey
        ? 'Microsoft Copilot configured'
        : 'Microsoft Copilot not configured',
    }
  } catch (error) {
    checks.microsoftCopilot = {
      status: 'error',
      message: 'Failed to check Microsoft Copilot configuration',
    }
  }

  // 5. Microsoft Graph (Calendar) configuration
  try {
    const graphClientId = await getSystemSetting('ms_graph_client_id')
    const graphRedirectUri = await getSystemSetting('ms_graph_redirect_uri')

    checks.microsoftGraph = {
      status: graphClientId && graphRedirectUri ? 'configured' : 'not_configured',
      configured: !!(graphClientId && graphRedirectUri),
      message: graphClientId
        ? 'Microsoft Graph Calendar integration configured'
        : 'Microsoft Graph not configured',
    }
  } catch (error) {
    checks.microsoftGraph = {
      status: 'error',
      message: 'Failed to check Microsoft Graph configuration',
    }
  }

  // 6. Google Calendar configuration
  try {
    const googleClientId = await getSystemSetting('google_calendar_client_id')
    const googleRedirectUri = await getSystemSetting('google_calendar_redirect_uri')

    checks.googleCalendar = {
      status: googleClientId && googleRedirectUri ? 'configured' : 'not_configured',
      configured: !!(googleClientId && googleRedirectUri),
      message: googleClientId
        ? 'Google Calendar integration configured'
        : 'Google Calendar not configured',
    }
  } catch (error) {
    checks.googleCalendar = {
      status: 'error',
      message: 'Failed to check Google Calendar configuration',
    }
  }

  // 7. Gamification system
  try {
    const achievementCount = await prisma.achievement.count()
    const badgeCount = await prisma.badge.count()
    const gamificationEnabled = await getSystemSetting('gamification_enabled')

    checks.gamification = {
      status: 'healthy',
      enabled: gamificationEnabled !== 'false',
      achievements: achievementCount,
      badges: badgeCount,
      message: `${achievementCount} achievements and ${badgeCount} badges available`,
    }
  } catch (error) {
    checks.gamification = {
      status: 'unhealthy',
      message: 'Failed to check gamification system',
    }
  }

  // 8. Feature flags
  try {
    const featureFlags = {
      gamification: await getSystemSetting('gamification_enabled') !== 'false',
      endorsements: await getSystemSetting('endorsements_enabled') !== 'false',
      calendar: await getSystemSetting('calendar_integration_enabled') !== 'false',
      marketIntel: await getSystemSetting('market_intelligence_enabled') !== 'false',
      multilingual: await getSystemSetting('multilingual_enabled') !== 'false',
      aiFeatures: await getSystemSetting('ai_features_enabled') === 'true',
    }

    checks.featureFlags = {
      status: 'healthy',
      flags: featureFlags,
    }
  } catch (error) {
    checks.featureFlags = {
      status: 'error',
      message: 'Failed to load feature flags',
    }
  }

  // 9. Recent activity
  try {
    const recentAssessments = await prisma.assessmentAssignment.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    })

    const recentEndorsements = await prisma.skillEndorsement.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    })

    const recentKudos = await prisma.kudos.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    })

    checks.recentActivity = {
      status: 'healthy',
      last7Days: {
        assessments: recentAssessments,
        endorsements: recentEndorsements,
        kudos: recentKudos,
      },
    }
  } catch (error) {
    checks.recentActivity = {
      status: 'error',
      message: 'Failed to fetch recent activity',
    }
  }

  // Overall health status
  const allHealthy = Object.values(checks).every(
    (check) => check.status === 'healthy' || check.status === 'configured' || check.status === 'not_configured'
  )

  const responseTime = Date.now() - startTime

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    responseTimeMs: responseTime,
    version: '1.0.0',
    checks,
  })
}
