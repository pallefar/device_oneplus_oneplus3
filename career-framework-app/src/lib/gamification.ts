import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// XP required for each level (exponential growth)
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0
  // Formula: 100 * (level - 1) ^ 1.5
  return Math.floor(100 * Math.pow(level - 1, 1.5))
}

// Calculate total XP required to reach a specific level
export function getTotalXPForLevel(level: number): number {
  let totalXP = 0
  for (let i = 1; i < level; i++) {
    totalXP += getXPForLevel(i + 1)
  }
  return totalXP
}

// Get level from total XP
export function getLevelFromXP(xp: number): number {
  let level = 1
  let totalXP = 0

  while (totalXP <= xp) {
    level++
    totalXP += getXPForLevel(level)
  }

  return level - 1
}

// Get XP progress within current level (0-100%)
export function getXPProgressInLevel(xp: number): { currentLevel: number; progress: number; xpInLevel: number; xpForNextLevel: number } {
  const currentLevel = getLevelFromXP(xp)
  const xpForCurrentLevel = getTotalXPForLevel(currentLevel)
  const xpForNextLevel = getXPForLevel(currentLevel + 1)
  const xpInLevel = xp - xpForCurrentLevel
  const progress = xpForNextLevel > 0 ? (xpInLevel / xpForNextLevel) * 100 : 0

  return {
    currentLevel,
    progress,
    xpInLevel,
    xpForNextLevel,
  }
}

// Award XP to a user
export async function awardXP(
  userId: string,
  amount: number,
  reason: string,
  category: 'assessment' | 'learning' | 'social' | 'achievement' | 'milestone',
  metadata?: any
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean; oldLevel: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { experiencePoints: true, level: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const oldXP = user.experiencePoints
  const oldLevel = user.level
  const newXP = oldXP + amount
  const newLevel = getLevelFromXP(newXP)
  const leveledUp = newLevel > oldLevel

  // Update user XP and level
  await prisma.user.update({
    where: { id: userId },
    data: {
      experiencePoints: newXP,
      level: newLevel,
    },
  })

  // Create XP transaction record
  await prisma.xPTransaction.create({
    data: {
      userId,
      amount,
      reason,
      category,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })

  // If leveled up, check for level-based achievements
  if (leveledUp) {
    await checkLevelAchievements(userId, newLevel)
  }

  return { newXP, newLevel, leveledUp, oldLevel }
}

// Check and unlock achievements
export async function checkAndUnlockAchievement(
  userId: string,
  achievementKey: string
): Promise<{ unlocked: boolean; xpAwarded: number }> {
  // Check if user already has this achievement
  const existing = await prisma.userAchievement.findFirst({
    where: {
      userId,
      achievement: { key: achievementKey },
    },
  })

  if (existing) {
    return { unlocked: false, xpAwarded: 0 }
  }

  // Get achievement details
  const achievement = await prisma.achievement.findUnique({
    where: { key: achievementKey },
  })

  if (!achievement || !achievement.isActive) {
    return { unlocked: false, xpAwarded: 0 }
  }

  // Award achievement
  await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: achievement.id,
    },
  })

  // Award XP for achievement
  if (achievement.xpReward > 0) {
    await awardXP(
      userId,
      achievement.xpReward,
      `Achievement unlocked: ${achievement.name}`,
      'achievement',
      { achievementKey }
    )
  }

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'achievement_unlocked',
      title: 'Achievement Unlocked!',
      message: `You've unlocked "${achievement.name}" ${achievement.icon}`,
      link: '/agent/achievements',
    },
  })

  return { unlocked: true, xpAwarded: achievement.xpReward }
}

// Award badge to user
export async function awardBadge(
  userId: string,
  badgeKey: string
): Promise<{ awarded: boolean }> {
  // Check if user already has this badge
  const existing = await prisma.userBadge.findFirst({
    where: {
      userId,
      badge: { key: badgeKey },
    },
  })

  if (existing) {
    return { awarded: false }
  }

  // Get badge details
  const badge = await prisma.badge.findUnique({
    where: { key: badgeKey },
  })

  if (!badge || !badge.isActive) {
    return { awarded: false }
  }

  // Award badge
  await prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
    },
  })

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'badge_awarded',
      title: 'Badge Earned!',
      message: `You've earned the "${badge.name}" badge ${badge.icon}`,
      link: '/agent/badges',
    },
  })

  return { awarded: true }
}

// Check level-based achievements
async function checkLevelAchievements(userId: string, level: number) {
  const levelAchievements = [
    { level: 5, key: 'level_5' },
    { level: 10, key: 'level_10' },
    { level: 20, key: 'level_20' },
  ]

  for (const { level: targetLevel, key } of levelAchievements) {
    if (level >= targetLevel) {
      await checkAndUnlockAchievement(userId, key)
    }
  }
}

// Check assessment-related achievements
export async function checkAssessmentAchievements(userId: string) {
  // Count completed assessments
  const completedAssessments = await prisma.assessmentAssignment.count({
    where: {
      agentId: userId,
      status: 'FINALIZED',
    },
  })

  // Check for achievements
  if (completedAssessments >= 1) {
    await checkAndUnlockAchievement(userId, 'first_assessment')
  }
  if (completedAssessments >= 5) {
    await checkAndUnlockAchievement(userId, 'assessment_streak_5')
  }
  if (completedAssessments >= 10) {
    await checkAndUnlockAchievement(userId, 'assessment_streak_10')
  }
}

// Check endorsement achievements
export async function checkEndorsementAchievements(userId: string, type: 'given' | 'received') {
  if (type === 'received') {
    const count = await prisma.skillEndorsement.count({
      where: { endorseeId: userId },
    })

    if (count >= 1) {
      await checkAndUnlockAchievement(userId, 'first_endorsement_received')
    }
    if (count >= 10) {
      await checkAndUnlockAchievement(userId, 'endorsements_received_10')
    }
  } else {
    const count = await prisma.skillEndorsement.count({
      where: { endorserId: userId },
    })

    if (count >= 1) {
      await checkAndUnlockAchievement(userId, 'first_endorsement_given')
    }
    if (count >= 25) {
      await checkAndUnlockAchievement(userId, 'endorsements_given_25')
    }
  }
}

// Check learning goal achievements
export async function checkLearningGoalAchievements(userId: string) {
  const totalGoals = await prisma.learningGoal.count({
    where: { userId },
  })

  const completedGoals = await prisma.learningGoal.count({
    where: {
      userId,
      status: 'completed',
    },
  })

  if (totalGoals >= 1) {
    await checkAndUnlockAchievement(userId, 'first_learning_goal')
  }
  if (completedGoals >= 1) {
    await checkAndUnlockAchievement(userId, 'learning_goal_completed')
  }
  if (completedGoals >= 5) {
    await checkAndUnlockAchievement(userId, 'learning_goals_completed_5')
  }
}

// Check AI Coach achievements
export async function checkAICoachAchievements(userId: string) {
  const conversations = await prisma.aIConversation.count({
    where: { userId },
  })

  if (conversations >= 1) {
    await checkAndUnlockAchievement(userId, 'ai_coach_first_chat')
  }
  if (conversations >= 10) {
    await checkAndUnlockAchievement(userId, 'ai_coach_conversations_10')
  }
}

// Get user's gamification stats
export async function getUserGamificationStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      experiencePoints: true,
      level: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const xpProgress = getXPProgressInLevel(user.experiencePoints)

  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { earnedAt: 'desc' },
  })

  const badges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' },
  })

  const recentXP = await prisma.xPTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return {
    xp: user.experiencePoints,
    level: user.level,
    xpProgress,
    achievements,
    badges,
    recentXP,
  }
}

// Get leaderboard
export async function getLeaderboard(limit: number = 10) {
  const topUsers = await prisma.user.findMany({
    where: {
      role: 'AGENT',
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      experiencePoints: true,
      level: true,
      department: true,
    },
    orderBy: [
      { experiencePoints: 'desc' },
      { level: 'desc' },
    ],
    take: limit,
  })

  return topUsers.map((user, index) => ({
    rank: index + 1,
    ...user,
  }))
}
