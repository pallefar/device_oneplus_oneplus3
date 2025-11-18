import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { awardXP, checkEndorsementAchievements } from '@/lib/gamification'

const prisma = new PrismaClient()

// GET - Get endorsements for a user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const skillId = searchParams.get('skillId')

    let where: any = {}

    if (userId) {
      where.endorseeId = userId
    }

    if (skillId) {
      where.skillId = skillId
    }

    const endorsements = await prisma.skillEndorsement.findMany({
      where,
      include: {
        skill: {
          include: {
            competency: true,
            level: true,
          },
        },
        endorser: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            department: true,
          },
        },
        endorsee: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ endorsements })
  } catch (error) {
    console.error('Error fetching endorsements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch endorsements' },
      { status: 500 }
    )
  }
}

// POST - Create new endorsement
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const endorserId = (session.user as any).id
    const body = await request.json()
    const { endorseeId, skillId, comment, relationshipType } = body

    // Validate input
    if (!endorseeId || !skillId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user is trying to endorse themselves
    if (endorserId === endorseeId) {
      return NextResponse.json(
        { error: 'You cannot endorse yourself' },
        { status: 400 }
      )
    }

    // Check if endorsement already exists
    const existing = await prisma.skillEndorsement.findUnique({
      where: {
        skillId_endorserId_endorseeId: {
          skillId,
          endorserId,
          endorseeId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already endorsed this skill for this user' },
        { status: 400 }
      )
    }

    // Create endorsement
    const endorsement = await prisma.skillEndorsement.create({
      data: {
        skillId,
        endorserId,
        endorseeId,
        comment,
        relationshipType,
      },
      include: {
        skill: {
          include: {
            competency: true,
          },
        },
        endorser: {
          select: {
            name: true,
          },
        },
      },
    })

    // Create notification for endorsee
    await prisma.notification.create({
      data: {
        userId: endorseeId,
        type: 'endorsement_received',
        title: 'New Skill Endorsement',
        message: `${endorsement.endorser.name} endorsed your ${endorsement.skill.name} skill`,
        link: `/agent/progress`,
      },
    })

    // Gamification: Award XP and check achievements
    try {
      // Award XP to endorser
      await awardXP(
        endorserId,
        10,
        `Endorsed ${endorsement.skill.name} for a colleague`,
        'social'
      )
      await checkEndorsementAchievements(endorserId, 'given')

      // Award XP to endorsee
      await awardXP(
        endorseeId,
        15,
        `Received endorsement for ${endorsement.skill.name}`,
        'social'
      )
      await checkEndorsementAchievements(endorseeId, 'received')
    } catch (error) {
      console.error('Error awarding XP:', error)
    }

    return NextResponse.json({ endorsement }, { status: 201 })
  } catch (error) {
    console.error('Error creating endorsement:', error)
    return NextResponse.json(
      { error: 'Failed to create endorsement' },
      { status: 500 }
    )
  }
}

// DELETE - Remove endorsement
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const endorserId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const endorsementId = searchParams.get('id')

    if (!endorsementId) {
      return NextResponse.json(
        { error: 'Endorsement ID required' },
        { status: 400 }
      )
    }

    // Check if endorsement exists and belongs to user
    const endorsement = await prisma.skillEndorsement.findUnique({
      where: { id: endorsementId },
    })

    if (!endorsement) {
      return NextResponse.json(
        { error: 'Endorsement not found' },
        { status: 404 }
      )
    }

    if (endorsement.endorserId !== endorserId) {
      return NextResponse.json(
        { error: 'You can only delete your own endorsements' },
        { status: 403 }
      )
    }

    await prisma.skillEndorsement.delete({
      where: { id: endorsementId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting endorsement:', error)
    return NextResponse.json(
      { error: 'Failed to delete endorsement' },
      { status: 500 }
    )
  }
}
