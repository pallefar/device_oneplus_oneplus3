import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { awardXP, checkLearningGoalAchievements } from '@/lib/gamification'

const prisma = new PrismaClient()

// GET - Get single learning goal
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const goalId = params.id

    const goal = await prisma.learningGoal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Error fetching learning goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning goal' },
      { status: 500 }
    )
  }
}

// PUT - Update learning goal
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const goalId = params.id
    const body = await request.json()

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.learningGoal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    const { title, description, skillId, targetDate, priority, milestones, progress, status } = body

    // Prepare update data
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (skillId !== undefined) updateData.skillId = skillId || null
    if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null
    if (priority !== undefined) updateData.priority = priority
    if (milestones !== undefined) updateData.milestones = milestones ? JSON.stringify(milestones) : null
    if (progress !== undefined) updateData.progress = progress
    if (status !== undefined) updateData.status = status

    // If marking as completed, set completedAt
    if (status === 'completed' && existingGoal.status !== 'completed') {
      updateData.completedAt = new Date()

      // Gamification: Award XP for completing goal
      try {
        await awardXP(
          userId,
          50,
          `Completed learning goal: ${existingGoal.title}`,
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
          type: 'learning_goal_completed',
          title: 'Learning Goal Completed!',
          message: `Congratulations! You've completed: ${existingGoal.title}`,
          link: '/agent/learning',
        },
      })
    }

    const goal = await prisma.learningGoal.update({
      where: { id: goalId },
      data: updateData,
    })

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Error updating learning goal:', error)
    return NextResponse.json(
      { error: 'Failed to update learning goal' },
      { status: 500 }
    )
  }
}

// DELETE - Delete learning goal
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const goalId = params.id

    // Check if goal exists and belongs to user
    const goal = await prisma.learningGoal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    await prisma.learningGoal.delete({
      where: { id: goalId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting learning goal:', error)
    return NextResponse.json(
      { error: 'Failed to delete learning goal' },
      { status: 500 }
    )
  }
}
