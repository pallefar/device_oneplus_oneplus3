import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/study-groups/[id]/join
 * Join a study group
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const groupId = params.id

    // Check if group exists and has space
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        _count: { select: { members: true } },
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group._count.members >= group.maxMembers) {
      return NextResponse.json({ error: 'Group is full' }, { status: 400 })
    }

    // Check if already a member
    const existing = await prisma.studyGroupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }

    // Join group
    await prisma.studyGroupMember.create({
      data: {
        groupId,
        userId,
        role: 'member',
      },
    })

    // Award XP
    await prisma.xPTransaction.create({
      data: {
        userId,
        amount: 10,
        reason: 'Joined study group',
        category: 'social',
        metadata: JSON.stringify({ groupId, groupName: group.name }),
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { experiencePoints: { increment: 10 } },
    })

    return NextResponse.json({
      success: true,
      message: `Joined ${group.name}! +10 XP`,
    })
  } catch (error) {
    console.error('Error joining study group:', error)
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 })
  }
}

/**
 * DELETE /api/study-groups/[id]/join
 * Leave a study group
 */
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
    const groupId = params.id

    // Check membership
    const membership = await prisma.studyGroupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 400 })
    }

    if (membership.role === 'creator') {
      return NextResponse.json(
        { error: 'Creator cannot leave. Delete the group instead.' },
        { status: 400 }
      )
    }

    // Leave group
    await prisma.studyGroupMember.delete({
      where: {
        groupId_userId: { groupId, userId },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Left study group successfully',
    })
  } catch (error) {
    console.error('Error leaving study group:', error)
    return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 })
  }
}
