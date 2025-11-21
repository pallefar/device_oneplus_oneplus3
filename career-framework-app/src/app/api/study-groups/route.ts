import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/study-groups
 * Get all study groups (public + user's groups)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const skillFocus = searchParams.get('skillFocus')

    // Build where clause
    const where: any = {
      OR: [{ isPublic: true }, { creatorId: userId }],
    }

    if (skillFocus) {
      where.skillFocus = { contains: skillFocus, mode: 'insensitive' }
    }

    // Fetch study groups
    const groups = await prisma.studyGroup.findMany({
      where,
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get user's memberships
    const memberships = await prisma.studyGroupMember.findMany({
      where: { userId },
      select: { groupId: true, role: true },
    })

    const membershipMap = new Map(memberships.map((m) => [m.groupId, m.role]))

    // Enhance groups with membership info
    const enhancedGroups = groups.map((group) => ({
      ...group,
      memberCount: group._count.members,
      userRole: membershipMap.get(group.id) || null,
      isFull: group._count.members >= group.maxMembers,
    }))

    return NextResponse.json({
      groups: enhancedGroups,
      total: groups.length,
    })
  } catch (error) {
    console.error('Error fetching study groups:', error)
    return NextResponse.json({ error: 'Failed to fetch study groups' }, { status: 500 })
  }
}

/**
 * POST /api/study-groups
 * Create new study group
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()

    const { name, description, skillFocus, meetingSchedule, maxMembers, isPublic } = body

    // Create study group
    const group = await prisma.studyGroup.create({
      data: {
        name,
        description,
        skillFocus,
        meetingSchedule,
        maxMembers: maxMembers || 10,
        isPublic: isPublic !== false,
        creatorId: userId,
      },
    })

    // Add creator as first member
    await prisma.studyGroupMember.create({
      data: {
        groupId: group.id,
        userId: userId,
        role: 'creator',
      },
    })

    // Award XP for creating study group
    await prisma.xPTransaction.create({
      data: {
        userId: userId,
        amount: 50,
        reason: 'Created study group',
        category: 'social',
        metadata: JSON.stringify({ groupId: group.id, groupName: name }),
      },
    })

    // Update user XP
    await prisma.user.update({
      where: { id: userId },
      data: { experiencePoints: { increment: 50 } },
    })

    return NextResponse.json({
      success: true,
      group,
      message: 'Study group created successfully! +50 XP',
    })
  } catch (error) {
    console.error('Error creating study group:', error)
    return NextResponse.json({ error: 'Failed to create study group' }, { status: 500 })
  }
}
