import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/lms/courses
 * Aggregated courses from multiple LMS platforms
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const skillQuery = searchParams.get('skill')
    const platform = searchParams.get('platform')
    const difficulty = searchParams.get('difficulty')
    const maxPrice = searchParams.get('maxPrice')

    // Build where clause
    const where: any = {}

    if (skillQuery) {
      where.OR = [
        { title: { contains: skillQuery, mode: 'insensitive' } },
        { description: { contains: skillQuery, mode: 'insensitive' } },
        { skillsTaught: { contains: skillQuery, mode: 'insensitive' } },
      ]
    }

    if (platform) {
      where.platform = platform
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (maxPrice) {
      where.price = { lte: parseFloat(maxPrice) }
    }

    // Fetch courses
    const courses = await prisma.externalCourse.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { enrollmentCount: 'desc' }],
      take: 50,
    })

    // Get user's enrollments
    const userId = (session.user as any).id
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId },
      select: { courseId: true, status: true, progress: true },
    })

    const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]))

    // Enhance courses with enrollment status
    const enhancedCourses = courses.map((course) => ({
      ...course,
      skillsTaught: course.skillsTaught ? JSON.parse(course.skillsTaught) : [],
      instructors: course.instructors ? JSON.parse(course.instructors) : [],
      enrollment: enrollmentMap.get(course.id) || null,
    }))

    // Get available platforms
    const platforms = await prisma.externalCourse.groupBy({
      by: ['platform'],
      _count: { platform: true },
    })

    return NextResponse.json({
      courses: enhancedCourses,
      platforms: platforms.map((p) => ({ name: p.platform, count: p._count.platform })),
      total: courses.length,
    })
  } catch (error) {
    console.error('Error fetching LMS courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

/**
 * POST /api/lms/courses/sync
 * Admin endpoint to sync courses from external platforms
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Sample course data (in production, this would call real APIs)
    const sampleCourses = generateSampleCourses()

    // Upsert courses
    for (const course of sampleCourses) {
      await prisma.externalCourse.upsert({
        where: {
          platform_externalId: {
            platform: course.platform,
            externalId: course.externalId,
          },
        },
        create: course,
        update: {
          ...course,
          lastUpdated: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      synced: sampleCourses.length,
      message: 'Courses synced successfully',
    })
  } catch (error) {
    console.error('Error syncing courses:', error)
    return NextResponse.json({ error: 'Failed to sync courses' }, { status: 500 })
  }
}

/**
 * Generate sample course data
 */
function generateSampleCourses() {
  return [
    // Coursera courses
    {
      platform: 'coursera',
      externalId: 'machine-learning-stanford',
      title: 'Machine Learning',
      description: 'Learn about the most effective machine learning techniques.',
      instructors: JSON.stringify(['Andrew Ng']),
      skillsTaught: JSON.stringify(['Machine Learning', 'Python', 'Data Science']),
      duration: 660,
      difficulty: 'intermediate',
      rating: 4.9,
      enrollmentCount: 500000,
      price: 0,
      currency: 'USD',
      url: 'https://www.coursera.org/learn/machine-learning',
      thumbnailUrl: null,
    },
    {
      platform: 'coursera',
      externalId: 'cloud-architecture-gcp',
      title: 'Architecting with Google Cloud',
      description: 'Learn to design and implement cloud solutions on GCP.',
      instructors: JSON.stringify(['Google Cloud']),
      skillsTaught: JSON.stringify(['Cloud Architecture', 'GCP', 'Kubernetes']),
      duration: 480,
      difficulty: 'advanced',
      rating: 4.7,
      enrollmentCount: 50000,
      price: 49,
      currency: 'USD',
      url: 'https://www.coursera.org/professional-certificates/gcp-cloud-architect',
      thumbnailUrl: null,
    },

    // Udemy courses
    {
      platform: 'udemy',
      externalId: 'react-complete-guide',
      title: 'React - The Complete Guide',
      description: 'Master React with hooks, Redux, and Next.js.',
      instructors: JSON.stringify(['Maximilian Schwarzmüller']),
      skillsTaught: JSON.stringify(['React', 'TypeScript', 'JavaScript']),
      duration: 2880,
      difficulty: 'beginner',
      rating: 4.8,
      enrollmentCount: 300000,
      price: 19.99,
      currency: 'USD',
      url: 'https://www.udemy.com/course/react-the-complete-guide',
      thumbnailUrl: null,
    },
    {
      platform: 'udemy',
      externalId: 'kubernetes-practical',
      title: 'Kubernetes for Developers',
      description: 'Learn Kubernetes from scratch with hands-on exercises.',
      instructors: JSON.stringify(['Mumshad Mannambeth']),
      skillsTaught: JSON.stringify(['Kubernetes', 'Docker', 'DevOps']),
      duration: 720,
      difficulty: 'intermediate',
      rating: 4.6,
      enrollmentCount: 80000,
      price: 29.99,
      currency: 'USD',
      url: 'https://www.udemy.com/course/learn-kubernetes',
      thumbnailUrl: null,
    },

    // LinkedIn Learning courses
    {
      platform: 'linkedin',
      externalId: 'leadership-foundations',
      title: 'Leadership Foundations',
      description: 'Essential leadership skills for new and aspiring leaders.',
      instructors: JSON.stringify(['Chris Croft']),
      skillsTaught: JSON.stringify(['Team Leadership', 'Communication', 'Management']),
      duration: 180,
      difficulty: 'beginner',
      rating: 4.5,
      enrollmentCount: 120000,
      price: 0,
      currency: 'USD',
      url: 'https://www.linkedin.com/learning/leadership-foundations',
      thumbnailUrl: null,
    },
    {
      platform: 'linkedin',
      externalId: 'python-data-analysis',
      title: 'Python for Data Science',
      description: 'Learn Python essentials for data analysis and visualization.',
      instructors: JSON.stringify(['Lillian Pierson']),
      skillsTaught: JSON.stringify(['Python', 'Data Analysis', 'Pandas']),
      duration: 240,
      difficulty: 'intermediate',
      rating: 4.6,
      enrollmentCount: 90000,
      price: 0,
      currency: 'USD',
      url: 'https://www.linkedin.com/learning/python-for-data-science',
      thumbnailUrl: null,
    },

    // Pluralsight courses
    {
      platform: 'pluralsight',
      externalId: 'security-best-practices',
      title: 'Application Security Best Practices',
      description: 'Learn to secure your applications from common vulnerabilities.',
      instructors: JSON.stringify(['Troy Hunt']),
      skillsTaught: JSON.stringify(['Security', 'OWASP', 'Web Security']),
      duration: 300,
      difficulty: 'intermediate',
      rating: 4.7,
      enrollmentCount: 60000,
      price: 29,
      currency: 'USD',
      url: 'https://www.pluralsight.com/courses/web-security-owasp',
      thumbnailUrl: null,
    },
    {
      platform: 'pluralsight',
      externalId: 'system-design-fundamentals',
      title: 'System Design Fundamentals',
      description: 'Master the art of designing scalable systems.',
      instructors: JSON.stringify(['Pluralsight Authors']),
      skillsTaught: JSON.stringify(['System Design', 'Architecture', 'Scalability']),
      duration: 360,
      difficulty: 'advanced',
      rating: 4.8,
      enrollmentCount: 45000,
      price: 29,
      currency: 'USD',
      url: 'https://www.pluralsight.com/paths/software-architecture',
      thumbnailUrl: null,
    },
  ]
}
