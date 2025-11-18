import { prisma } from './prisma'

export type NotificationType =
  | 'assessment_assigned'
  | 'assessment_self_completed'
  | 'assessment_manager_completed'
  | 'assessment_finalized'
  | 'framework_created'
  | 'skill_milestone'
  | 'reminder'
  | 'system'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
      },
    })
    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

export async function createAssessmentAssignedNotification(
  agentId: string,
  assessmentName: string,
  assignmentId: string
) {
  return createNotification({
    userId: agentId,
    type: 'assessment_assigned',
    title: 'New Assessment Assigned',
    message: `You have been assigned a new assessment: ${assessmentName}`,
    link: `/agent/assessments/${assignmentId}`,
  })
}

export async function createAssessmentSelfCompletedNotification(
  managerId: string,
  agentName: string,
  assessmentName: string,
  assignmentId: string
) {
  return createNotification({
    userId: managerId,
    type: 'assessment_self_completed',
    title: 'Assessment Ready for Review',
    message: `${agentName} has completed their self-assessment for: ${assessmentName}`,
    link: `/leader/assessments/${assignmentId}`,
  })
}

export async function createAssessmentManagerCompletedNotification(
  agentId: string,
  assessmentName: string,
  assignmentId: string
) {
  return createNotification({
    userId: agentId,
    type: 'assessment_manager_completed',
    title: 'Manager Review Complete',
    message: `Your manager has completed their review of: ${assessmentName}`,
    link: `/agent/assessments/${assignmentId}`,
  })
}

export async function createAssessmentFinalizedNotification(
  agentId: string,
  assessmentName: string,
  assignmentId: string
) {
  return createNotification({
    userId: agentId,
    type: 'assessment_finalized',
    title: 'Assessment Finalized',
    message: `Your assessment has been finalized: ${assessmentName}. View your development plan and resources.`,
    link: `/agent/assessments/${assignmentId}`,
  })
}

export async function createSkillMilestoneNotification(
  userId: string,
  skillName: string,
  milestone: string
) {
  return createNotification({
    userId,
    type: 'skill_milestone',
    title: 'Skill Milestone Achieved! 🎉',
    message: `Congratulations! You've ${milestone} in ${skillName}`,
    link: '/agent/progress',
  })
}

export async function createFrameworkCreatedNotification(
  userIds: string[],
  frameworkName: string,
  frameworkId: string
) {
  const notifications = userIds.map((userId) =>
    createNotification({
      userId,
      type: 'framework_created',
      title: 'New Career Framework Available',
      message: `A new career framework has been created: ${frameworkName}`,
      link: `/frameworks/${frameworkId}`,
    })
  )
  return Promise.all(notifications)
}
