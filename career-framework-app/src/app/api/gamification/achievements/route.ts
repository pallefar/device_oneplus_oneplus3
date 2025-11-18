import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get all achievements with user's progress
    const allAchievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { tier: 'asc' }],
    })

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    })

    const achievementsWithProgress = allAchievements.map((achievement) => {
      const userAchievement = userAchievements.find(
        (ua) => ua.achievementId === achievement.id
      )

      return {
        ...achievement,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.earnedAt || null,
        progress: userAchievement?.progress || 0,
      }
    })

    // Get all badges
    const allBadges = await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: [{ rarity: 'desc' }],
    })

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    })

    const badgesWithStatus = allBadges.map((badge) => {
      const userBadge = userBadges.find((ub) => ub.badgeId === badge.id)

      return {
        ...badge,
        earned: !!userBadge,
        earnedAt: userBadge?.earnedAt || null,
        isPinned: userBadge?.isPinned || false,
      }
    })

    return NextResponse.json({
      achievements: achievementsWithProgress,
      badges: badgesWithStatus,
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
