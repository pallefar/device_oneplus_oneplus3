// Learning resource database with curated content for skill development

export interface LearningResource {
  id: string
  title: string
  type: 'course' | 'book' | 'article' | 'video' | 'practice' | 'certification'
  provider: string
  url: string
  duration: string
  level: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  description: string
  skills: string[]
}

// Curated learning resources mapped to common skills
export const learningResourcesDatabase: Record<string, LearningResource[]> = {
  // Technical Skills
  javascript: [
    {
      id: 'js-1',
      title: 'JavaScript: The Complete Guide',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/',
      duration: '52 hours',
      level: 'intermediate',
      rating: 4.6,
      description: 'Master JavaScript with the most complete course',
      skills: ['javascript', 'programming', 'web development'],
    },
    {
      id: 'js-2',
      title: 'You Don\'t Know JS (book series)',
      type: 'book',
      provider: 'GitHub',
      url: 'https://github.com/getify/You-Dont-Know-JS',
      duration: 'Self-paced',
      level: 'intermediate',
      rating: 4.8,
      description: 'Deep dive into JavaScript mechanics',
      skills: ['javascript', 'programming'],
    },
  ],
  python: [
    {
      id: 'py-1',
      title: 'Python for Everybody',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/specializations/python',
      duration: '8 months',
      level: 'beginner',
      rating: 4.8,
      description: 'Learn to program and analyze data with Python',
      skills: ['python', 'programming', 'data analysis'],
    },
  ],
  'react': [
    {
      id: 'react-1',
      title: 'React - The Complete Guide',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
      duration: '49 hours',
      level: 'intermediate',
      rating: 4.6,
      description: 'Dive in and learn React from scratch',
      skills: ['react', 'javascript', 'frontend', 'web development'],
    },
  ],

  // Leadership Skills
  'team management': [
    {
      id: 'lead-1',
      title: 'Managing People and Teams',
      type: 'course',
      provider: 'LinkedIn Learning',
      url: 'https://www.linkedin.com/learning/paths/become-a-manager',
      duration: '16 hours',
      level: 'intermediate',
      rating: 4.7,
      description: 'Essential skills for new and aspiring managers',
      skills: ['leadership', 'team management', 'communication'],
    },
    {
      id: 'lead-2',
      title: 'The Manager\'s Path',
      type: 'book',
      provider: 'O\'Reilly',
      url: 'https://www.oreilly.com/library/view/the-managers-path/9781491973882/',
      duration: 'Self-paced',
      level: 'intermediate',
      rating: 4.6,
      description: 'Guide for tech leaders navigating growth',
      skills: ['leadership', 'team management', 'career development'],
    },
  ],

  // Communication Skills
  'communication': [
    {
      id: 'comm-1',
      title: 'Effective Communication Skills',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/wharton-communication-skills',
      duration: '12 hours',
      level: 'beginner',
      rating: 4.7,
      description: 'Improve your communication skills',
      skills: ['communication', 'presentation', 'writing'],
    },
  ],

  // Project Management
  'project management': [
    {
      id: 'pm-1',
      title: 'Project Management Professional (PMP)',
      type: 'certification',
      provider: 'PMI',
      url: 'https://www.pmi.org/certifications/project-management-pmp',
      duration: '3-6 months prep',
      level: 'advanced',
      rating: 4.8,
      description: 'Industry-recognized PM certification',
      skills: ['project management', 'leadership', 'planning'],
    },
    {
      id: 'pm-2',
      title: 'Agile Project Management',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/agile-project-management/',
      duration: '8 hours',
      level: 'intermediate',
      rating: 4.5,
      description: 'Learn Agile methodology and Scrum',
      skills: ['project management', 'agile', 'scrum'],
    },
  ],

  // Data Analysis
  'data analysis': [
    {
      id: 'data-1',
      title: 'Google Data Analytics Certificate',
      type: 'certification',
      provider: 'Coursera',
      url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
      duration: '6 months',
      level: 'beginner',
      rating: 4.8,
      description: 'Launch your career in data analytics',
      skills: ['data analysis', 'sql', 'visualization'],
    },
  ],

  // Problem Solving
  'problem solving': [
    {
      id: 'prob-1',
      title: 'Creative Problem Solving',
      type: 'course',
      provider: 'LinkedIn Learning',
      url: 'https://www.linkedin.com/learning/creative-problem-solving',
      duration: '2 hours',
      level: 'intermediate',
      rating: 4.6,
      description: 'Develop creative solutions to challenges',
      skills: ['problem solving', 'critical thinking', 'innovation'],
    },
  ],

  // Design
  'ui/ux design': [
    {
      id: 'design-1',
      title: 'Google UX Design Certificate',
      type: 'certification',
      provider: 'Coursera',
      url: 'https://www.coursera.org/professional-certificates/google-ux-design',
      duration: '6 months',
      level: 'beginner',
      rating: 4.8,
      description: 'Start your career in UX design',
      skills: ['ux design', 'ui design', 'prototyping', 'user research'],
    },
  ],
}

// Skill keywords for fuzzy matching
const skillKeywords: Record<string, string[]> = {
  'frontend': ['react', 'javascript', 'ui/ux design'],
  'backend': ['python', 'data analysis'],
  'leadership': ['team management', 'communication', 'project management'],
  'technical': ['javascript', 'python', 'react', 'data analysis'],
  'soft skills': ['communication', 'problem solving', 'team management'],
}

export function findLearningResources(
  skillName: string,
  currentRating: number
): LearningResource[] {
  const resources: LearningResource[] = []
  const normalizedSkill = skillName.toLowerCase()

  // Direct match
  if (learningResourcesDatabase[normalizedSkill]) {
    resources.push(...learningResourcesDatabase[normalizedSkill])
  }

  // Fuzzy match using keywords
  Object.entries(skillKeywords).forEach(([keyword, skills]) => {
    if (normalizedSkill.includes(keyword.toLowerCase())) {
      skills.forEach((skill) => {
        if (learningResourcesDatabase[skill]) {
          resources.push(...learningResourcesDatabase[skill])
        }
      })
    }
  })

  // Partial match
  Object.entries(learningResourcesDatabase).forEach(([key, value]) => {
    if (key.includes(normalizedSkill) || normalizedSkill.includes(key)) {
      resources.push(...value)
    }
  })

  // Filter by appropriate level based on current rating
  const appropriateLevel = getAppropriateLearningLevel(currentRating)
  const filteredResources = resources.filter((r) => r.level === appropriateLevel || r.level === 'intermediate')

  // Remove duplicates
  const uniqueResources = Array.from(
    new Map(filteredResources.map((r) => [r.id, r])).values()
  )

  // Sort by rating
  return uniqueResources.sort((a, b) => b.rating - a.rating).slice(0, 5)
}

function getAppropriateLearningLevel(rating: number): 'beginner' | 'intermediate' | 'advanced' {
  if (rating <= 2) return 'beginner'
  if (rating <= 3) return 'intermediate'
  return 'advanced'
}

export function generateLearningPath(skills: Array<{ name: string; rating: number; priority: number }>) {
  const learningPath: Array<{
    skill: string
    priority: string
    resources: LearningResource[]
    estimatedTime: string
  }> = []

  skills
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
    .forEach((skill) => {
      const resources = findLearningResources(skill.name, skill.rating)
      const estimatedTime = calculateEstimatedTime(resources)

      learningPath.push({
        skill: skill.name,
        priority: skill.priority >= 6 ? 'High' : skill.priority >= 3 ? 'Medium' : 'Low',
        resources,
        estimatedTime,
      })
    })

  return learningPath
}

function calculateEstimatedTime(resources: LearningResource[]): string {
  if (resources.length === 0) return 'N/A'

  // Take the shortest high-rated resource
  const recommended = resources[0]
  return recommended.duration
}
