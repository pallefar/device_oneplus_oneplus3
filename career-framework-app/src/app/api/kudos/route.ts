import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { awardXP } from '@/lib/gamification'

const prisma = new PrismaClient()

// GET - Get kudos feed
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'sent' or 'received' or 'all'

    let where: any = {}

    if (userId) {
      if (type === 'sent') {
        where.giverId = userId
      } else if (type === 'received') {
        where.receiverId = userId
      } else {
        // Show all public kudos or kudos involving the user
        where = {
          OR: [
            { isPublic: true },
            { giverId: userId },
            { receiverId: userId },
          ],
        }
      }
    } else {
      // Show all public kudos for feed
      where.isPublic = true
    }

    const kudos = await prisma.kudos.findMany({
      where,
      include: {
        giver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            department: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            department: true,
          },
        },
        skill: {
          select: {
            id: true,
            name: true,
            competency: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json({ kudos })
  } catch (error) {
    console.error('Error fetching kudos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kudos' },
      { status: 500 }
    )
  }
}

// POST - Send kudos
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const giverId = (session.user as any).id
    const body = await request.json()
    const { receiverId, message, skillId, isPublic = true } = body

    // Validate input
    if (!receiverId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user is trying to give kudos to themselves
    if (giverId === receiverId) {
      return NextResponse.json(
        { error: 'You cannot give kudos to yourself' },
        { status: 400 }
      )
    }

    // Create kudos
    const kudos = await prisma.kudos.create({
      data: {
        giverId,
        receiverId,
        message,
        skillId: skillId || null,
        isPublic,
      },
      include: {
        giver: {
          select: {
            name: true,
          },
        },
        receiver: {
          select: {
            name: true,
          },
        },
        skill: {
          select: {
            name: true,
          },
        },
      },
    })

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'kudos_received',
        title: 'Kudos Received!',
        message: `${kudos.giver.name} sent you kudos: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
        link: '/agent/kudos',
      },
    })

    // Gamification: Award XP
    try {
      // Award XP to giver
      await awardXP(
        giverId,
        5,
        `Sent kudos to ${kudos.receiver.name}`,
        'social'
      )

      // Award XP to receiver
      await awardXP(
        receiverId,
        10,
        `Received kudos from ${kudos.giver.name}`,
        'social'
      )

      // Check for kudos achievements
      const kudosReceived = await prisma.kudos.count({
        where: { receiverId },
      })

      const kudosGiven = await prisma.kudos.count({
        where: { giverId },
      })

      // Import dynamically to avoid circular dependencies
      const { checkAndUnlockAchievement } = await import('@/lib/gamification')

      if (kudosReceived >= 5) {
        await checkAndUnlockAchievement(receiverId, 'kudos_received_5')
      }

      if (kudosGiven >= 10) {
        await checkAndUnlockAchievement(giverId, 'kudos_given_10')
      }
    } catch (error) {
      console.error('Error awarding XP:', error)
    }

    return NextResponse.json({ kudos }, { status: 201 })
  } catch (error) {
    console.error('Error creating kudos:', error)
    return NextResponse.json(
      { error: 'Failed to send kudos' },
      { status: 500 }
    )
  }
}
