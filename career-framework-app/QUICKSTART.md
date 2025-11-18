# Quick Start Guide

Get the Career Framework App running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Terminal/command line access

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, Tailwind CSS, and more.

### 2. Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database and tables
npm run prisma:push

# Seed with sample data
npm run prisma:seed
```

### 3. Start the Application

**For team/network access (recommended):**
```bash
npm run server
```

**For local development only:**
```bash
npm run dev
```

The terminal will show:
- Local URL: `http://localhost:3000`
- Network URL: `http://192.168.x.x:3000` (share with team)

### 4. Log In

Use one of these test accounts:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**Leader Account:**
- Email: `leader@example.com`
- Password: `leader123`

**Agent Account:**
- Email: `agent1@example.com`
- Password: `agent123`

## First Steps

### As Admin

1. **Create a Career Framework**:
   - Click "Frameworks" in navigation
   - Click "New Framework"
   - Add levels (Junior, Mid, Senior, etc.)
   - Add competencies (Technical, Communication, etc.)
   - Save

2. **Add Skills** (after creating framework):
   - Open the framework
   - For each competency, add specific skills
   - Assign skills to appropriate levels

3. **Create an Assessment**:
   - Click "Assessments"
   - Click "New Assessment"
   - Select a framework
   - Assign to agent-manager pairs
   - Set due date (optional)

### As Leader/Manager

1. **View Dashboard**:
   - See all assigned assessments
   - Check pending reviews

2. **Complete Assessments**:
   - Click on an assessment
   - Review agent self-ratings
   - Add your ratings (1-5)
   - Provide feedback
   - Submit

3. **Export Reports**:
   - Open completed assessment
   - Click export button (PDF or Excel)

### As Agent/Employee

1. **Complete Self-Assessment**:
   - View pending assessments
   - Rate yourself on each skill (1-5)
   - Add comments about your experience
   - Submit

2. **View Feedback**:
   - Check completed assessments
   - See manager ratings and feedback

## Troubleshooting

### Issue: "Prisma Client not generated"

```bash
npm run prisma:generate
```

### Issue: "Database doesn't exist"

```bash
npm run prisma:push
```

### Issue: "No users to log in"

```bash
npm run prisma:seed
```

### Issue: "Port 3000 already in use"

```bash
# Use a different port
PORT=3001 npm run dev
```

### Reset Everything

```bash
# Delete database
rm prisma/dev.db

# Recreate
npm run prisma:push
npm run prisma:seed
```

## Next Steps

1. Explore the sample framework created by seed
2. Create your own custom framework
3. Invite team members (create new users as admin)
4. Start running assessments
5. Export and analyze results

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run server` | **Start with network access (recommended)** |
| `npm run dev` | Start development server (local only) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push schema to database |
| `npm run prisma:studio` | Open database GUI |
| `npm run prisma:seed` | Populate sample data |

## Need Help?

Check the full [README.md](./README.md) for detailed documentation.

---

**Ready to go!** 🚀
