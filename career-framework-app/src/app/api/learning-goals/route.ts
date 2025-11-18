import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { awardXP, checkLearningGoalAchievements } from '@/lib/gamification'

const prisma = new PrismaClient()

// GET - Get user's learning goals
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let where: any = { userId }

    if (status) {
      where.status = status
    }

    const goals = await prisma.learningGoal.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { targetDate: 'asc' },
      ],
    })

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Error fetching learning goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning goals' },
      { status: 500 }
    )
  }
}

// POST - Create new learning goal
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { title, description, skillId, targetDate, priority, milestones } = body

    // Validate input
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Create goal
    const goal = await prisma.learningGoal.create({
      data: {
        userId,
        title,
        description,
        skillId: skillId || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        priority: priority || 5,
        milestones: milestones ? JSON.stringify(milestones) : null,
        status: 'active',
        progress: 0,
      },
    })

    // Gamification: Award XP and check achievements
    try {
      await awardXP(
        userId,
        20,
        `Created learning goal: ${title}`,
        'learning'
      )
      await checkLearningGoalAchievements(userId)
    } catch (error) {
      console.error('Error awarding XP:', error)
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'learning_goal_created',
        title: 'Learning Goal Created',
        message: `You've set a new learning goal: ${title}`,
        link: '/agent/learning',
      },
    })

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error) {
    console.error('Error creating learning goal:', error)
    return NextResponse.json(
      { error: 'Failed to create learning goal' },
      { status: 500 }
    )
  }
}
