import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { frameworkId, name, description, dueDate, assignments } = body

    // Validate
    if (!frameworkId || !name || !assignments || assignments.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get all skills from the framework
    const framework = await prisma.careerFramework.findUnique({
      where: { id: frameworkId },
      include: {
        competencies: {
          include: {
            skills: true,
          },
        },
      },
    })

    if (!framework) {
      return NextResponse.json(
        { error: 'Framework not found' },
        { status: 404 }
      )
    }

    const allSkills = framework.competencies.flatMap((c: any) => c.skills)

    // Create assessment with assignments
    const assessment = await prisma.assessment.create({
      data: {
        frameworkId,
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: (session.user as any).id,
        assignments: {
          create: assignments.map((a: { agentId: string; managerId: string }) => ({
            agentId: a.agentId,
            managerId: a.managerId,
            responses: {
              create: allSkills.map((skill: any) => ({
                skillId: skill.id,
              })),
            },
          })),
        },
      },
      include: {
        framework: true,
        assignments: {
          include: {
            agent: true,
            manager: true,
          },
        },
      },
    })

    return NextResponse.json(assessment, { status: 201 })
  } catch (error) {
    console.error('Error creating assessment:', error)
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    )
  }
}
