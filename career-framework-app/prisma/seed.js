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
