import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get download stats
    const downloads = await prisma.appDownload.findMany({
      orderBy: { downloadedAt: 'desc' },
      take: 50,
    })

    const totalDownloads = await prisma.appDownload.count()

    // Get usage stats
    const usageStats = await prisma.appUsage.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    })

    const totalUsage = await prisma.appUsage.count()

    // Get usage by action
    const usageByAction = await prisma.appUsage.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
    })

    return NextResponse.json({
      downloads: {
        total: totalDownloads,
        recent: downloads,
      },
      usage: {
        total: totalUsage,
        recent: usageStats,
        byAction: usageByAction,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const { action, metadata } = body

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown'

    // Track usage
    await prisma.appUsage.create({
      data: {
        userId: session ? (session.user as any).id : null,
        ipAddress,
        action,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking usage:', error)
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    )
  }
}
