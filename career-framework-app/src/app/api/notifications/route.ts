import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch notifications for current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const userId = (session.user as any).id

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// POST - Create a notification (internal use or for testing)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, type, title, message, link } = body

    // Only admins can create notifications for other users
    const currentUserRole = (session.user as any).role
    const currentUserId = (session.user as any).id

    if (currentUserRole !== 'ADMIN' && userId !== currentUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    })

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body
    const userId = (session.user as any).id

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
        },
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId, // Ensure user can only mark their own notifications
        },
        data: {
          read: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark as read error:', error)
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}

// DELETE - Delete notification(s)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const deleteAll = searchParams.get('deleteAll') === 'true'
    const userId = (session.user as any).id

    if (deleteAll) {
      await prisma.notification.deleteMany({
        where: {
          userId,
          read: true, // Only delete read notifications
        },
      })
    } else if (notificationId) {
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId, // Ensure user can only delete their own notifications
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
  }
}
