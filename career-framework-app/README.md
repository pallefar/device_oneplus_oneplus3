# Career Framework Management System

A comprehensive web application for managing career frameworks, assessments, and employee skill development. Built with Next.js, TypeScript, Prisma, and SQLite.

## 📥 Download & Quick Start

**Want to get started quickly?**

Generate the release package:
```bash
npm run release
```

Then extract and run:
```bash
npm install
npm run prisma:push && npm run prisma:seed
npm run server
```

📖 **For detailed download options, see [DOWNLOAD.md](./DOWNLOAD.md)**

## Features

### For Administrators
- **Career Framework Management**: Create and manage career frameworks with levels and competencies
- **Assessment Creation**: Design assessments and assign them to agent-manager pairs
- **User Management**: Manage users across different roles (Admin, Leader, Agent)
- **Analytics Dashboard**: View organization-wide skill development metrics
- **Skill Matrix**: Define and track skills across different competency areas

### For Leaders/Managers
- **Assessment Review**: Review and rate employee self-assessments
- **Team Overview**: Track assessment completion and team development
- **Export Reports**: Generate PDF and Excel reports of assessments
- **Feedback System**: Provide structured feedback on employee skills

### For Agents/Employees
- **Self-Assessment**: Complete self-assessments on assigned skills
- **Progress Tracking**: View personal skill development over time
- **Career Visibility**: See expectations for each career level
- **Export Options**: Download personal assessment reports

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Styling**: Tailwind CSS
- **Export**: jsPDF and ExcelJS
- **Icons**: Lucide React
- **Distribution**: ZIP download and installation tracking

## Network Access & Distribution

### Running on a Network

The app can be accessed by multiple users on your local network:

1. **Start the server** with network access:
   ```bash
   npm run server
   ```

2. **Share the network URL** shown in the terminal with your team

3. **Team members access** the app from their browsers using the network URL

See [NETWORK-SETUP.md](./NETWORK-SETUP.md) for detailed network configuration.

### Download & Distribute

**Admin users** can download the complete app package:

1. Log in as admin
2. Navigate to **Downloads** in the navigation menu
3. Click **Download App Package**
4. Receive a ZIP file with:
   - Complete application code
   - Installation instructions
   - Setup scripts

This package can be:
- Shared with team members
- Installed on multiple computers
- Placed on a shared network drive

The admin dashboard also tracks:
- Download history
- Installation metrics
- Usage analytics

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Setup Steps

1. **Clone or navigate to the project directory**:
   ```bash
   cd career-framework-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```bash
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

   # Database (using SQLite - no additional config needed)
   DATABASE_URL="file:./dev.db"
   ```

4. **Initialize the database**:
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Push schema to database
   npm run prisma:push

   # Seed database with sample data
   npm run prisma:seed
   ```

5. **Run the server**:

   **For network access (recommended for teams):**
   ```bash
   npm run server
   ```
   This will:
   - Start the server accessible to your network
   - Automatically open your browser
   - Display network URL for team members

   **For local development only:**
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - **Local**: `http://localhost:3000`
   - **Network**: Use the URL displayed in terminal (e.g., `http://192.168.1.100:3000`)
   - **Team members**: Share the network URL with your team!

## Default User Accounts

After seeding the database, you can log in with these accounts:

| Role    | Email                  | Password  |
|---------|------------------------|-----------|
| Admin   | admin@example.com      | admin123  |
| Leader  | leader@example.com     | leader123 |
| Agent   | agent1@example.com     | agent123  |
| Agent   | agent2@example.com     | agent123  |

## Usage Guide

### For Administrators

#### Creating a Career Framework

1. Log in as an admin
2. Navigate to **Frameworks** from the navigation menu
3. Click **New Framework**
4. Fill in framework details:
   - Framework name and description
   - Define career levels (Junior, Mid, Senior, etc.)
   - Define competency areas (Technical Skills, Communication, etc.)
5. Click **Create Framework**

#### Creating Skills

After creating a framework, you'll need to add specific skills:

1. Navigate to the framework details
2. For each competency, add skills with:
   - Skill name
   - Description
   - Associated level
3. Save the skills

#### Creating and Assigning Assessments

1. Navigate to **Assessments**
2. Click **New Assessment**
3. Fill in assessment details:
   - Select a framework
   - Set name and description
   - Set due date (optional)
4. Assign to agent-manager pairs
5. Submit the assessment

### For Leaders/Managers

#### Reviewing Assessments

1. Log in with leader credentials
2. View assigned assessments on the dashboard
3. Click on an assessment to review
4. For each skill:
   - View employee self-rating
   - Add your manager rating (1-5)
   - Provide feedback comments
5. Submit the completed assessment

#### Exporting Reports

1. Open a completed assessment
2. Click **Export as PDF** or **Export as Excel**
3. The report will download automatically

### For Agents/Employees

#### Completing Self-Assessments

1. Log in with agent credentials
2. View pending assessments on the dashboard
3. Click on an assessment
4. For each skill:
   - Rate yourself (1-5 scale)
   - Add comments about your experience
5. Submit the self-assessment

#### Tracking Development

1. View completed assessments on your dashboard
2. See manager feedback and ratings
3. Track skill progression over time

## File Export Formats

### PDF Reports
- Formatted assessment results
- Includes all ratings and comments
- Professional layout for printing
- Skill matrix visualization

### Excel Spreadsheets
- Tabular data format
- Easy to manipulate and analyze
- Can be used for offline completion
- Importable back into the system

### Assessment Templates
- Pre-formatted Excel templates
- Can be completed offline
- Upload completed templates (future feature)

## Database Schema

The application uses the following main models:

- **User**: Stores user accounts with roles (ADMIN, LEADER, AGENT)
- **CareerFramework**: Defines career progression frameworks
- **Level**: Career levels within a framework (Junior, Mid, Senior, etc.)
- **Competency**: Competency areas (Technical, Communication, etc.)
- **Skill**: Specific skills tied to competencies and levels
- **Assessment**: Assessment instances
- **AssessmentAssignment**: Links assessments to agent-manager pairs
- **AssessmentResponse**: Individual skill ratings and feedback
- **SkillMatrix**: Tracks user skill levels over time

## API Routes

The application provides the following API endpoints:

- `POST /api/frameworks` - Create a new framework
- `GET /api/frameworks` - List all frameworks
- `POST /api/assessments` - Create a new assessment
- `GET /api/assessments` - List assessments
- `POST /api/auth/[...nextauth]` - Authentication endpoints

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with sample data

### Project Structure

```
career-framework-app/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js            # Database seeding script
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── admin/         # Admin pages
│   │   ├── leader/        # Leader pages
│   │   ├── agent/         # Agent pages
│   │   ├── api/           # API routes
│   │   └── login/         # Login page
│   ├── components/        # React components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components
│   └── lib/               # Utilities
│       ├── auth.ts        # Authentication config
│       ├── prisma.ts      # Prisma client
│       └── export/        # Export utilities
├── .env                   # Environment variables
├── package.json           # Dependencies
└── README.md              # This file
```

## Customization

### Adding New Roles

1. Update the `Role` enum in `prisma/schema.prisma`
2. Add role-specific routes in `src/app/`
3. Update navigation logic in components
4. Update authentication redirects

### Changing Rating Scale

The default rating scale is 1-5. To change:

1. Update validation in assessment components
2. Modify export templates
3. Update UI to reflect new scale

### Custom Competencies

Competencies are fully customizable per framework. Create as many as needed when defining a framework.

## Security Considerations

- All routes are protected with NextAuth.js
- Role-based access control on all pages
- API routes validate user permissions
- Passwords are hashed with bcrypt
- JWT sessions for authentication

## Production Deployment

1. Set `NEXTAUTH_SECRET` to a strong random string
2. Update `NEXTAUTH_URL` to your production URL
3. Consider migrating from SQLite to PostgreSQL for production
4. Set up proper environment variables
5. Build the application: `npm run build`
6. Start: `npm run start`

### Database Migration (SQLite → PostgreSQL)

To migrate to PostgreSQL for production:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/career_framework"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

## Troubleshooting

### Database Issues

If you encounter database errors:
```bash
# Reset database
rm prisma/dev.db
npm run prisma:push
npm run prisma:seed
```

### Authentication Issues

- Clear browser cookies
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your URL

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

- [ ] Skill gap analysis visualization
- [ ] Automated development plan generation
- [ ] Email notifications for pending assessments
- [ ] Import assessments from Excel
- [ ] Historical skill progression charts
- [ ] Multi-language support
- [ ] Mobile responsive improvements
- [ ] Advanced analytics dashboard
- [ ] Batch user import
- [ ] Custom skill rating scales

## Support

For issues or questions:
1. Check this README
2. Review the code comments
3. Check Prisma Studio for database inspection

## License

This project is provided as-is for internal use.

---

**Built with ❤️ using Next.js and TypeScript**
