import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardXP, checkAssessmentAchievements } from '@/lib/gamification'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assignmentId, responses, type } = body // type: 'self' | 'manager'

    const assignment = await prisma.assessmentAssignment.findUnique({
      where: { id: assignmentId },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    const userId = (session.user as any).id

    // Check authorization
    if (type === 'self' && assignment.agentId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (type === 'manager' && assignment.managerId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update all responses
    for (const response of responses) {
      const updateData: any = {}

      if (type === 'self') {
        updateData.selfRating = response.rating
        updateData.selfComments = response.comments
      } else {
        updateData.managerRating = response.rating
        updateData.managerComments = response.comments
      }

      await prisma.assessmentResponse.update({
        where: {
          assignmentId_skillId: {
            assignmentId,
            skillId: response.skillId,
          },
        },
        data: updateData,
      })
    }

    // Update assignment status
    const updateStatus: any = {}

    if (type === 'self') {
      updateStatus.status = 'SELF_COMPLETED'
      updateStatus.selfCompletedAt = new Date()
    } else {
      updateStatus.status = 'FINALIZED'
      updateStatus.managerCompletedAt = new Date()
    }

    await prisma.assessmentAssignment.update({
      where: { id: assignmentId },
      data: updateStatus,
    })

    // Gamification: Award XP when assessment is finalized
    if (type === 'manager') {
      // Manager completed = assessment finalized
      try {
        await awardXP(
          assignment.agentId,
          75,
          'Completed assessment',
          'assessment',
          { assignmentId }
        )
        await checkAssessmentAchievements(assignment.agentId)

        // Create notification
        await prisma.notification.create({
          data: {
            userId: assignment.agentId,
            type: 'assessment_completed',
            title: 'Assessment Completed!',
            message: `Your assessment has been finalized. You earned 75 XP!`,
            link: `/agent/progress`,
          },
        })
      } catch (error) {
        console.error('Error awarding XP for assessment:', error)
        // Don't fail the request if gamification fails
      }
    } else if (type === 'self') {
      // Self-assessment completed
      try {
        await awardXP(
          assignment.agentId,
          30,
          'Completed self-assessment',
          'assessment',
          { assignmentId }
        )
        await checkAssessmentAchievements(assignment.agentId)
      } catch (error) {
        console.error('Error awarding XP for self-assessment:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting responses:', error)
    return NextResponse.json(
      { error: 'Failed to submit responses' },
      { status: 500 }
    )
  }
}
