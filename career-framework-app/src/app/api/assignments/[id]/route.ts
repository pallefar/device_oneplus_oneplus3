import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assignment = await prisma.assessmentAssignment.findUnique({
      where: { id: params.id },
      include: {
        assessment: {
          include: {
            framework: {
              include: {
                competencies: {
                  include: {
                    skills: true,
                  },
                },
              },
            },
          },
        },
        agent: true,
        manager: true,
        responses: {
          include: {
            skill: {
              include: {
                competency: true,
                level: true,
              },
            },
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Check access
    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    if (
      userRole !== 'ADMIN' &&
      assignment.agentId !== userId &&
      assignment.managerId !== userId
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}
