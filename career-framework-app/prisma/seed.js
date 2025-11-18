const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      department: 'Management',
    },
  });
  console.log('Created admin:', admin.email);

  // Create sample leader
  const leaderPassword = await bcrypt.hash('leader123', 10);
  const leader = await prisma.user.upsert({
    where: { email: 'leader@example.com' },
    update: {},
    create: {
      email: 'leader@example.com',
      password: leaderPassword,
      name: 'Team Leader',
      role: 'LEADER',
      department: 'Engineering',
    },
  });
  console.log('Created leader:', leader.email);

  // Create sample agents
  const agent1Password = await bcrypt.hash('agent123', 10);
  const agent1 = await prisma.user.upsert({
    where: { email: 'agent1@example.com' },
    update: {},
    create: {
      email: 'agent1@example.com',
      password: agent1Password,
      name: 'John Doe',
      role: 'AGENT',
      department: 'Engineering',
    },
  });
  console.log('Created agent:', agent1.email);

  const agent2Password = await bcrypt.hash('agent123', 10);
  const agent2 = await prisma.user.upsert({
    where: { email: 'agent2@example.com' },
    update: {},
    create: {
      email: 'agent2@example.com',
      password: agent2Password,
      name: 'Jane Smith',
      role: 'AGENT',
      department: 'Engineering',
    },
  });
  console.log('Created agent:', agent2.email);

  // Create sample career framework
  const framework = await prisma.careerFramework.upsert({
    where: { id: 'sample-framework' },
    update: {},
    create: {
      id: 'sample-framework',
      name: 'Engineering Career Framework',
      description: 'Career progression framework for engineering roles',
      version: '1.0',
      isActive: true,
      createdById: admin.id,
    },
  });
  console.log('Created framework:', framework.name);

  // Create levels
  const levels = [
    { name: 'Junior', description: 'Entry level engineer', order: 1 },
    { name: 'Mid', description: 'Mid-level engineer', order: 2 },
    { name: 'Senior', description: 'Senior engineer', order: 3 },
    { name: 'Lead', description: 'Technical lead', order: 4 },
    { name: 'Principal', description: 'Principal engineer', order: 5 },
  ];

  const createdLevels = [];
  for (const level of levels) {
    const created = await prisma.level.upsert({
      where: { id: `level-${level.order}` },
      update: {},
      create: {
        id: `level-${level.order}`,
        frameworkId: framework.id,
        ...level,
      },
    });
    createdLevels.push(created);
    console.log('Created level:', created.name);
  }

  // Create competencies
  const competencies = [
    { name: 'Technical Skills', description: 'Core technical competencies' },
    { name: 'Communication', description: 'Communication and collaboration skills' },
    { name: 'Leadership', description: 'Leadership and mentoring abilities' },
    { name: 'Problem Solving', description: 'Analytical and problem-solving skills' },
  ];

  const createdCompetencies = [];
  for (const comp of competencies) {
    const created = await prisma.competency.upsert({
      where: { id: `comp-${comp.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `comp-${comp.name.toLowerCase().replace(/\s+/g, '-')}`,
        frameworkId: framework.id,
        ...comp,
      },
    });
    createdCompetencies.push(created);
    console.log('Created competency:', created.name);
  }

  // Create sample skills
  const skills = [
    {
      competencyId: createdCompetencies[0].id,
      levelId: createdLevels[0].id,
      name: 'Programming Fundamentals',
      description: 'Understanding of basic programming concepts',
    },
    {
      competencyId: createdCompetencies[0].id,
      levelId: createdLevels[1].id,
      name: 'System Design',
      description: 'Ability to design scalable systems',
    },
    {
      competencyId: createdCompetencies[0].id,
      levelId: createdLevels[2].id,
      name: 'Architecture Design',
      description: 'Ability to design complex system architectures',
    },
    {
      competencyId: createdCompetencies[1].id,
      levelId: createdLevels[0].id,
      name: 'Team Collaboration',
      description: 'Working effectively with team members',
    },
    {
      competencyId: createdCompetencies[1].id,
      levelId: createdLevels[1].id,
      name: 'Cross-team Communication',
      description: 'Communicating across multiple teams',
    },
    {
      competencyId: createdCompetencies[2].id,
      levelId: createdLevels[2].id,
      name: 'Mentoring',
      description: 'Mentoring junior team members',
    },
    {
      competencyId: createdCompetencies[2].id,
      levelId: createdLevels[3].id,
      name: 'Technical Leadership',
      description: 'Leading technical initiatives',
    },
    {
      competencyId: createdCompetencies[3].id,
      levelId: createdLevels[0].id,
      name: 'Debugging',
      description: 'Finding and fixing bugs effectively',
    },
    {
      competencyId: createdCompetencies[3].id,
      levelId: createdLevels[1].id,
      name: 'Performance Optimization',
      description: 'Optimizing application performance',
    },
  ];

  for (const skill of skills) {
    const created = await prisma.skill.create({
      data: skill,
    });
    console.log('Created skill:', created.name);
  }

  // Create achievements for gamification
  const achievements = [
    {
      key: 'first_login',
      name: 'Welcome Aboard',
      description: 'Complete your first login',
      icon: '👋',
      category: 'milestone',
      xpReward: 10,
      tier: 'bronze',
    },
    {
      key: 'first_assessment',
      name: 'Self Aware',
      description: 'Complete your first self-assessment',
      icon: '📝',
      category: 'assessment',
      xpReward: 50,
      tier: 'bronze',
    },
    {
      key: 'assessment_streak_5',
      name: 'Consistent Learner',
      description: 'Complete 5 assessments',
      icon: '📚',
      category: 'assessment',
      xpReward: 100,
      tier: 'silver',
    },
    {
      key: 'assessment_streak_10',
      name: 'Assessment Master',
      description: 'Complete 10 assessments',
      icon: '🏆',
      category: 'assessment',
      xpReward: 250,
      tier: 'gold',
    },
    {
      key: 'skill_level_up',
      name: 'Skill Grower',
      description: 'Improve any skill by one level',
      icon: '📈',
      category: 'learning',
      xpReward: 75,
      tier: 'bronze',
    },
    {
      key: 'skill_master_5',
      name: 'Multi-talented',
      description: 'Reach expert level in 5 different skills',
      icon: '🎯',
      category: 'learning',
      xpReward: 300,
      tier: 'gold',
    },
    {
      key: 'first_endorsement_received',
      name: 'Peer Recognized',
      description: 'Receive your first skill endorsement',
      icon: '👍',
      category: 'social',
      xpReward: 25,
      tier: 'bronze',
    },
    {
      key: 'endorsements_received_10',
      name: 'Well Respected',
      description: 'Receive 10 skill endorsements',
      icon: '⭐',
      category: 'social',
      xpReward: 150,
      tier: 'silver',
    },
    {
      key: 'first_endorsement_given',
      name: 'Team Player',
      description: 'Give your first skill endorsement',
      icon: '🤝',
      category: 'social',
      xpReward: 20,
      tier: 'bronze',
    },
    {
      key: 'endorsements_given_25',
      name: 'Supportive Colleague',
      description: 'Give 25 skill endorsements',
      icon: '💪',
      category: 'social',
      xpReward: 200,
      tier: 'gold',
    },
    {
      key: 'first_learning_goal',
      name: 'Goal Setter',
      description: 'Create your first learning goal',
      icon: '🎯',
      category: 'learning',
      xpReward: 30,
      tier: 'bronze',
    },
    {
      key: 'learning_goal_completed',
      name: 'Goal Crusher',
      description: 'Complete a learning goal',
      icon: '✅',
      category: 'learning',
      xpReward: 100,
      tier: 'silver',
    },
    {
      key: 'learning_goals_completed_5',
      name: 'Achievement Unlocked',
      description: 'Complete 5 learning goals',
      icon: '🏅',
      category: 'learning',
      xpReward: 300,
      tier: 'gold',
    },
    {
      key: 'ai_coach_first_chat',
      name: 'AI Curious',
      description: 'Have your first conversation with the AI Career Coach',
      icon: '🤖',
      category: 'learning',
      xpReward: 25,
      tier: 'bronze',
    },
    {
      key: 'ai_coach_conversations_10',
      name: 'AI Enthusiast',
      description: 'Have 10 conversations with the AI Career Coach',
      icon: '💬',
      category: 'learning',
      xpReward: 150,
      tier: 'silver',
    },
    {
      key: 'kudos_received_5',
      name: 'Appreciated',
      description: 'Receive 5 kudos from colleagues',
      icon: '❤️',
      category: 'social',
      xpReward: 100,
      tier: 'silver',
    },
    {
      key: 'kudos_given_10',
      name: 'Culture Builder',
      description: 'Give 10 kudos to colleagues',
      icon: '🌟',
      category: 'social',
      xpReward: 125,
      tier: 'silver',
    },
    {
      key: 'level_5',
      name: 'Rising Star',
      description: 'Reach level 5',
      icon: '🌠',
      category: 'milestone',
      xpReward: 200,
      tier: 'silver',
    },
    {
      key: 'level_10',
      name: 'Career Champion',
      description: 'Reach level 10',
      icon: '👑',
      category: 'milestone',
      xpReward: 500,
      tier: 'gold',
    },
    {
      key: 'level_20',
      name: 'Legend',
      description: 'Reach level 20',
      icon: '💎',
      category: 'milestone',
      xpReward: 1000,
      tier: 'platinum',
    },
  ];

  for (const achievement of achievements) {
    const created = await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: achievement,
    });
    console.log('Created achievement:', created.name);
  }

  // Create badges for gamification
  const badges = [
    {
      key: 'early_adopter',
      name: 'Early Adopter',
      description: 'One of the first to join the platform',
      icon: '🚀',
      color: '#3B82F6',
      rarity: 'rare',
      requirement: 'Be among the first 100 users',
    },
    {
      key: 'assessment_champion',
      name: 'Assessment Champion',
      description: 'Complete assessments every quarter for a year',
      icon: '🏆',
      color: '#F59E0B',
      rarity: 'epic',
      requirement: 'Complete 4 consecutive quarterly assessments',
    },
    {
      key: 'skill_specialist',
      name: 'Skill Specialist',
      description: 'Achieve expert level in a specific competency area',
      icon: '🎓',
      color: '#8B5CF6',
      rarity: 'rare',
      requirement: 'Reach level 5 in all skills within one competency',
    },
    {
      key: 'mentor_extraordinaire',
      name: 'Mentor Extraordinaire',
      description: 'Help 10 colleagues improve their skills',
      icon: '👨‍🏫',
      color: '#10B981',
      rarity: 'epic',
      requirement: 'Endorse 10 different people with mentoring relationship',
    },
    {
      key: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Highly engaged with the community',
      icon: '🦋',
      color: '#EC4899',
      rarity: 'rare',
      requirement: 'Give 50 endorsements and 50 kudos',
    },
    {
      key: 'learning_machine',
      name: 'Learning Machine',
      description: 'Complete 10 learning goals in one year',
      icon: '🤓',
      color: '#6366F1',
      rarity: 'epic',
      requirement: 'Complete 10 learning goals within 12 months',
    },
    {
      key: 'ai_power_user',
      name: 'AI Power User',
      description: 'Extensive use of AI Career Coach',
      icon: '🧠',
      color: '#A855F7',
      rarity: 'rare',
      requirement: 'Have 50 AI Coach conversations',
    },
    {
      key: 'perfect_score',
      name: 'Perfect Score',
      description: 'Receive top rating in all assessment categories',
      icon: '💯',
      color: '#EF4444',
      rarity: 'legendary',
      requirement: 'Score 5/5 in every category of an assessment',
    },
    {
      key: 'rapid_growth',
      name: 'Rapid Growth',
      description: 'Improve 5 skills in a single month',
      icon: '⚡',
      color: '#F59E0B',
      rarity: 'rare',
      requirement: 'Level up 5 different skills within 30 days',
    },
    {
      key: 'community_leader',
      name: 'Community Leader',
      description: 'Top contributor to team success',
      icon: '🌟',
      color: '#10B981',
      rarity: 'legendary',
      requirement: 'Be in top 5% of XP earners for 3 consecutive months',
    },
  ];

  for (const badge of badges) {
    const created = await prisma.badge.upsert({
      where: { key: badge.key },
      update: {},
      create: badge,
    });
    console.log('Created badge:', created.name);
  }

  console.log('Seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Leader: leader@example.com / leader123');
  console.log('Agent: agent1@example.com / agent123');
  console.log('Agent: agent2@example.com / agent123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
