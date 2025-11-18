import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting responses:', error)
    return NextResponse.json(
      { error: 'Failed to submit responses' },
      { status: 500 }
    )
  }
}
