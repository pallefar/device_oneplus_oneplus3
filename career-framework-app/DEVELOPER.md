# Career Framework App - Developer Documentation

## Architecture Overview

This is a full-stack Next.js application for managing career frameworks, assessments, and skill development tracking.

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (Prisma ORM) - upgradeable to PostgreSQL
- **Authentication**: NextAuth.js with JWT sessions
- **Charts**: Recharts for data visualization
- **File Generation**: jsPDF (PDFs), ExcelJS (Excel)

## Project Structure

```
career-framework-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Seed data for development
├── scripts/
│   ├── start-server.js        # Interactive server launcher
│   └── create-release.js      # Build release packages
├── src/
│   ├── app/                   # Next.js app router pages
│   │   ├── admin/            # Admin role pages
│   │   ├── leader/           # Leader role pages
│   │   ├── agent/            # Agent role pages
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── layout/           # Navigation, layout components
│   │   └── ui/               # Reusable UI components
│   └── lib/
│       ├── auth.ts           # NextAuth configuration
│       └── prisma.ts         # Prisma client singleton
├── start-server.bat          # Windows startup script
└── start-server.sh           # Linux/Mac startup script
```

## User Roles & Capabilities

### ADMIN
- Full system access
- Create/edit/delete career frameworks
- Manage users (create, update, delete)
- Create assessments and assign to agent-manager pairs
- View comprehensive analytics dashboard
- Access app download and usage metrics

### LEADER (Manager)
- Review team members' self-assessments
- Provide ratings and feedback on skills
- View team-specific analytics
- Access assigned assessments
- Track team performance and skill gaps

### AGENT (Employee)
- Complete self-assessments
- View expected skill levels
- See manager feedback after reviews
- Track personal assessment history
- Access assigned assessments

## Key Features

### 1. Career Framework Management
- Define career levels (Junior, Mid, Senior, etc.)
- Create competencies (Technical, Leadership, etc.)
- Define skills with descriptions and expected levels
- Assign skills to specific competencies and levels

### 2. Assessment Workflow

**Status Flow**: PENDING → SELF_COMPLETED → FINALIZED

1. **PENDING**: Agent hasn't completed self-assessment
2. **SELF_COMPLETED**: Agent finished, awaiting manager review
3. **FINALIZED**: Manager completed review

### 3. Analytics Dashboard

#### Admin Analytics (`/admin/analytics`)
- Overview metrics (total assessments, frameworks, users)
- Completion trends over time (line charts)
- Assignment status distribution (pie charts)
- Skill gap analysis (comparing self vs manager ratings)
- Competency performance (radar charts)
- Top performers leaderboard

#### Leader Analytics (`/leader/analytics`)
- Team-specific metrics
- Completion rates for assigned team
- Team competency performance
- Skill development areas
- Team member rankings

### 4. UI Components

All reusable components in `src/components/ui/`:

- **Modal**: Flexible dialog with customizable sizes
- **Toast**: Global notification system (success, error, warning, info)
- **Button**: Variants (primary, secondary, danger, ghost) with loading states
- **Input**: Form inputs with labels, errors, helper text
- **Card**: Content container with optional title
- **Loading**: Spinner with optional fullscreen mode
- **ConfirmDialog**: Confirmation dialogs for destructive actions
- **ErrorBoundary**: Catches React errors and displays fallback UI
- **Breadcrumb**: Navigation breadcrumbs

## Database Schema

### Key Models

**User**: Email, password (bcrypt hashed), name, role, department

**CareerFramework**: Name, description, levels, competencies, skills

**Level**: Junior, Mid, Senior, Lead, etc.

**Competency**: Technical, Leadership, Communication, etc.

**Skill**: Name, description, belongs to competency and level

**Assessment**: Name, description, due date, linked to framework

**Assignment**: Links agent and manager to assessment, tracks status

**Response**: Self-rating, self-comments, manager-rating, manager-comments per skill

**AppDownload**: Tracks app downloads with IP and user agent

**AppUsage**: Tracks user actions for analytics

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- NextAuth handles `/api/auth/*` (login, logout, session)

### Users
- `GET /api/users` - List users (with search/filter)
- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Frameworks
- `GET /api/frameworks` - List all frameworks
- `POST /api/frameworks` - Create framework
- Full CRUD operations

### Assessments
- `GET /api/assessments` - List assessments
- `POST /api/assessments` - Create assessment with assignments
- `GET /api/assignments/[id]` - Get specific assignment details

### Responses
- `POST /api/responses` - Submit self-assessment or manager review

### Analytics
- `GET /api/analytics?type=overview` - Overview metrics
- `GET /api/analytics?type=completion` - Completion trends
- `GET /api/analytics?type=skills` - Skill gap analysis
- `GET /api/analytics?type=competencies` - Competency performance
- `GET /api/analytics?type=users` - Top performers
- `GET /api/analytics?type=app-usage` - App usage metrics (admin only)

### Downloads
- `GET /api/download` - Generate and download app package

## Development Workflow

### Initial Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Create database and tables
npm run prisma:push

# Seed with sample data
npm run prisma:seed
```

### Running the App

**Development Mode:**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Interactive Server (recommended for demos):**
```bash
npm run server
# Prompts for port, browser auto-open, network access, production mode
```

**Startup Scripts (for non-technical users):**
- Windows: Double-click `start-server.bat`
- Mac/Linux: Run `./start-server.sh`

### Database Management

```bash
# Open Prisma Studio (visual DB editor)
npm run prisma:studio

# Push schema changes to database
npm run prisma:push

# Generate Prisma client after schema changes
npm run prisma:generate
```

## Network Sharing

The app can be shared on a local network:

1. Run `npm run server`
2. Choose "Yes" for network access
3. Server binds to 0.0.0.0 and displays network IP
4. Team members access via: `http://<your-ip>:3000`

## Creating Releases

```bash
npm run release
```

This creates a ZIP package in `releases/` containing:
- All source code
- Configuration files
- Startup scripts
- Installation instructions
- Excludes: node_modules, .next build, database files

Recipients can:
1. Extract ZIP
2. Run startup script (auto-installs dependencies)
3. Access the app

## Default Login Credentials

After running `npm run prisma:seed`:

- **Admin**: admin@example.com / admin123
- **Leader**: manager@example.com / manager123
- **Agent**: john@example.com / john123

## Environment Variables

Create `.env` file:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

## Performance Considerations

- **Database**: SQLite works well for small-medium teams. For production with 100+ users, migrate to PostgreSQL
- **Authentication**: Sessions use JWT (no database lookups per request)
- **File Generation**: PDF/Excel generation happens on-demand
- **Analytics**: Cached for 15 minutes to reduce DB load
- **Pagination**: Implement for large datasets (users, assessments)

## Security Best Practices

- Passwords hashed with bcryptjs (10 rounds)
- Role-based access control on all API routes
- Session validation with NextAuth
- SQL injection prevention via Prisma ORM
- XSS protection via React's built-in escaping
- CSRF protection via NextAuth

## Extending the Application

### Adding a New Role

1. Update Prisma schema (`prisma/schema.prisma`)
2. Add role to navigation (`src/components/layout/Navigation.tsx`)
3. Create role-specific pages in `src/app/[role]/`
4. Update API route permissions
5. Run `npm run prisma:push`

### Adding a New Analytics Chart

1. Create data aggregation function in `/api/analytics/route.ts`
2. Add new chart to analytics page using Recharts
3. Update analytics type in URL params

### Custom Assessment Types

1. Extend Assessment model in schema
2. Add assessment type field
3. Create type-specific response forms
4. Update analytics to group by type

## Troubleshooting

### "Prisma not found" error
```bash
npm run prisma:generate
```

### Port already in use
```bash
# Change port in start-server.js or use:
PORT=3001 npm run dev
```

### Database locked
```bash
# Close Prisma Studio if running
# Restart the dev server
```

### Missing dependencies after git pull
```bash
npm install
npm run prisma:generate
```

## Testing

Manual testing checklist:

- [ ] User registration and login
- [ ] Create framework with levels/competencies/skills
- [ ] Create assessment and assign to users
- [ ] Complete self-assessment as agent
- [ ] Review assessment as manager
- [ ] View analytics dashboards
- [ ] Export assessments (PDF/Excel)
- [ ] User CRUD operations (admin)

## Contributing

1. Create feature branch from main
2. Make changes and test thoroughly
3. Ensure no TypeScript errors: `npm run lint`
4. Build succeeds: `npm run build`
5. Submit pull request with description

## License

Proprietary - Internal use only
