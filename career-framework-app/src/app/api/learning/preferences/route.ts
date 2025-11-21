import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/learning/preferences
 * Get user's learning preferences
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const preferences = await prisma.learningPreference.findUnique({
      where: { userId },
    })

    if (!preferences) {
      // Return defaults
      return NextResponse.json({
        primaryStyle: 'visual',
        pace: 'normal',
        sessionLength: 30,
        timeOfDay: null,
        includeVideo: true,
        includeText: true,
        includeAudio: false,
        includeInteractive: true,
        neurodiversity: null,
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching learning preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

/**
 * PUT /api/learning/preferences
 * Update learning preferences
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()

    const preferences = await prisma.learningPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...body,
      },
      update: body,
    })

    return NextResponse.json({
      success: true,
      preferences,
      message: 'Learning preferences updated successfully',
    })
  } catch (error) {
    console.error('Error updating learning preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
