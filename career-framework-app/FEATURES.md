# Career Framework App - Feature Documentation

## 🎯 Overview

The Career Framework App is a best-in-class career development platform designed for organizations to manage employee skill assessments, track progression, and generate personalized development plans.

## ✨ Key Features

### 1. **Smart Development Plans** 🎓
Generate AI-powered, personalized development plans based on skill gaps identified in assessments.

**Features:**
- Automatic skill gap analysis
- Priority-based recommendations (High/Medium/Low)
- Three learning modalities:
  - Formal Training (for significant gaps)
  - Mentorship (for moderate development needs)
  - On-the-job Learning (for fine-tuning)
- Timeline-based development phases:
  - Immediate (0-30 days) - Critical gaps
  - Short-term (1-3 months) - Competency building
  - Medium-term (3-6 months) - Excellence and mastery
- Downloadable plans in text format

**Access:** Available after assessment finalization for both agents and managers

### 2. **Skill Progression Tracking** 📈
Visual tracking of skill development across multiple assessments over time.

**Features:**
- Interactive line charts showing self vs manager ratings
- Trend analysis (improving/declining/stable)
- Historical assessment timeline
- Skill-by-skill progression views
- Competency grouping
- Performance indicators:
  - Skills tracked
  - Improving skills count
  - Stable skills count
  - Skills needing focus

**Access:** Dedicated "Progress" page in agent navigation

### 3. **Learning Path Recommendations** 📚
Curated external learning resources personalized to individual skill gaps.

**Features:**
- Database of high-quality courses, books, certifications from trusted providers:
  - Udemy, Coursera, LinkedIn Learning
  - O'Reilly, GitHub, Google Certificates
  - PMI Certifications
- Intelligent resource matching:
  - Direct skill name matching
  - Fuzzy matching with keyword expansion
  - Partial string matching
- Level-appropriate filtering (beginner/intermediate/advanced based on current rating)
- Priority-based organization
- Skills covered:
  - Technical: JavaScript, Python, React, Data Analysis, UI/UX
  - Leadership: Team Management, Communication, Project Management
  - Soft Skills: Problem Solving, Critical Thinking

**Access:** Dedicated "Learning" page in agent navigation + integrated into Development Plans

### 4. **Notification Center** 🔔
Real-time notification system with unread tracking.

**Features:**
- Bell icon in navigation with unread badge
- Dropdown panel with notification list
- Notification types:
  - Assessment assigned
  - Self-assessment completed (notifies manager)
  - Manager review completed
  - Assessment finalized
  - Skill milestones achieved
  - Framework updates
- Mark as read/unread functionality
- Delete notifications
- Auto-polling (every 30 seconds)
- Relative time formatting (e.g., "2h ago", "Just now")
- Color-coded notification icons
- Clickable links to related content

**Access:** Navigation bar (all roles)

### 5. **Enhanced Dashboard** ✨
Personalized career development dashboard with actionable next steps.

**Features:**
- **Your Next Steps Section:**
  - Priority-based action cards (orange=urgent, blue=recommended, green=progress, purple=learning)
  - Pending assessments with due dates
  - Top skills to develop recommendations
  - Progress tracking shortcuts
  - Learning resource access
- **Top Skills to Develop:**
  - Visual progress bars
  - Color-coded ratings (red < 2, orange < 3, yellow >= 3, green >= 4)
  - Competency grouping
  - Direct links to learning resources
- **Recent Achievements:**
  - Milestone tracking with emoji indicators
  - Achievement types: First Assessment, Skills Improved, High Performer, Consistent Growth
  - Date tracking
- **Quick Stats Cards:**
  - Assessments completed
  - Skills improving count
  - Available learning resources count

**Access:** Agent dashboard (main page after login)

### 6. **Enhanced PDF Exports** 📄
Professional, branded PDF reports with visual formatting.

**Features:**
- **Design System:**
  - Professional header with company branding area
  - Color-coded elements (blue primary, status colors)
  - Rounded corner cards and modern typography
  - Consistent footers with generation date
- **Summary Page:**
  - Assessment information box
  - Statistics cards (skills assessed, avg ratings, alignment gap)
  - Competency breakdown table with auto-formatting
- **Detailed Pages:**
  - Skill cards with visual rating bars
  - Gap indicators (self vs manager alignment)
  - Color-coded ratings
  - Comments sections with proper wrapping
  - Automated pagination
- **Technical Features:**
  - Table-based layouts using jspdf-autotable
  - Automatic page breaks
  - Smart layout calculations
  - Text wrapping for long content

**Access:** Export buttons in assessment views

### 7. **Advanced Analytics Dashboards** 📊

#### Admin Analytics
- Organization-wide metrics and KPIs
- Completion trends over time (line charts)
- Skill gap analysis (self vs manager ratings)
- Competency performance (radar charts)
- Top performers leaderboard
- Assignment status distribution (pie charts)
- Recent activity tracking

#### Leader Analytics
- Team-specific performance metrics
- Completion rates and trends
- Team competency radar charts
- Skill development areas identification
- Team member rankings
- Individual team member progress

### 4. **Comprehensive User Management** 👥
Full CRUD interface for managing users across roles.

**Features:**
- Create, read, update, delete users
- Search and filter by role (Admin/Leader/Agent)
- Department assignment
- Role-based access control
- Password management
- Activity tracking

### 5. **Assessment Workflow** 📝

#### Three-Stage Process:
1. **PENDING** - Agent hasn't started self-assessment
2. **SELF_COMPLETED** - Agent finished, awaiting manager review
3. **FINALIZED** - Manager completed review

**Features:**
- Framework-based skill assessments
- 1-5 rating scale with clear definitions
- Comments and feedback system
- Side-by-side comparison (self vs manager ratings)
- Expected level indicators
- Progress tracking

### 6. **Reusable UI Component Library** 🎨

**Components:**
- **Modal** - Flexible dialog with customizable sizes (sm/md/lg/xl)
- **Toast** - Global notification system with auto-dismiss
- **Button** - Multiple variants (primary, secondary, danger, ghost) + loading states
- **Input** - Form inputs with labels, errors, helper text
- **Card** - Content containers with optional titles
- **Loading** - Spinners with optional fullscreen mode
- **ConfirmDialog** - Confirmation dialogs for destructive actions
- **ErrorBoundary** - Graceful error handling with fallback UI
- **Breadcrumb** - Navigation breadcrumbs

### 7. **Network Sharing & Distribution** 🌐

**Features:**
- Local network access (0.0.0.0 binding)
- Automatic network IP detection
- Interactive server launcher
- ZIP package generation
- Download tracking and analytics
- Team collaboration support

### 8. **Cross-Platform Compatibility** 💻

**Startup Scripts:**
- `start-server.bat` - Windows double-click startup
- `start-server.sh` - Linux/Mac executable script
- Automatic dependency installation
- Database setup and seeding
- Error handling and user guidance

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Bcrypt password hashing (10 rounds)
- Session validation
- SQL injection prevention (Prisma ORM)
- XSS protection (React escaping)
- CSRF protection (NextAuth)

## 📱 User Roles & Capabilities

### Admin
- ✅ Create/manage career frameworks
- ✅ Create/assign assessments
- ✅ Full user management
- ✅ Organization-wide analytics
- ✅ App distribution and tracking
- ✅ System configuration

### Leader (Manager)
- ✅ Review team member assessments
- ✅ Provide ratings and feedback
- ✅ Generate development plans for team
- ✅ View team analytics
- ✅ Track team progress
- ✅ Export reports

### Agent (Employee)
- ✅ Complete self-assessments
- ✅ View development plans
- ✅ Track skill progression
- ✅ See manager feedback
- ✅ Monitor assessment history
- ✅ Export personal reports

## 🚀 Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (Prisma ORM) - upgradeable to PostgreSQL
- **Authentication:** NextAuth.js with JWT
- **Styling:** Tailwind CSS 4
- **Charts:** Recharts (Line, Bar, Pie, Radar)
- **Icons:** Lucide React
- **Error Handling:** React Error Boundaries

## 📊 Analytics & Reporting

### Metrics Tracked:
- Assessment completion rates
- Skill gap trends
- Competency performance
- User activity
- Download/install metrics
- Team performance rankings

### Available Reports:
- Development plans (downloadable)
- Skill progression charts
- Competency radar charts
- Top performers
- Team analytics
- Historical trends

## 🎓 Best Practices Implementation

Based on 2025 industry standards for career development platforms:

✅ **Skills-based assessment framework**
✅ **Multi-modal assessment methods**
✅ **AI-driven gap analysis**
✅ **Personalized learning paths**
✅ **Real-time progress tracking**
✅ **Competency-based leveling**
✅ **Visual progress indicators**
✅ **Actionable insights**
✅ **Succession planning support**
✅ **Team collaboration features**

## 🔄 Assessment Lifecycle

```
1. Admin creates Framework → 2. Admin creates Assessment →
3. Assigns to Agent-Manager pairs → 4. Agent completes self-assessment →
5. Manager reviews and rates → 6. Assessment finalized →
7. Development plan generated → 8. Progress tracked over time
```

## 🎯 Key Differentiators

1. **Automated Development Plans** - Unlike competitors, generates detailed, timeline-based development plans automatically
2. **Historical Progression Tracking** - Visual skill progression across multiple assessments
3. **Real-time Analytics** - Live dashboards with actionable insights
4. **Zero-Config Startup** - Double-click scripts for Windows/Mac/Linux
5. **Offline-First** - Works without internet after setup
6. **Network Sharing** - Easy team access from multiple computers
7. **Comprehensive Component Library** - Consistent, polished UI throughout

## 📈 Future Enhancements

- [ ] Email notifications for pending assessments
- [ ] Import assessments from Excel/CSV
- [ ] Multi-language support
- [ ] Mobile responsive improvements
- [ ] Batch user import
- [ ] Custom skill rating scales
- [ ] Peer review system
- [ ] Assessment templates library
- [ ] Automated reminders
- [ ] Integration with HR systems

## 💡 Usage Tips

1. **For Best Results:**
   - Complete assessments within the suggested timeframe
   - Provide constructive feedback in comments
   - Review development plans regularly
   - Track progress over multiple assessment cycles

2. **For Managers:**
   - Use analytics to identify team-wide skill gaps
   - Generate development plans for all team members
   - Schedule regular check-ins based on development timelines
   - Celebrate improvements shown in progression tracking

3. **For Employees:**
   - Be honest in self-assessments
   - Review manager feedback carefully
   - Follow development plan recommendations
   - Track your progression to stay motivated

## 🆘 Support

For issues or questions:
1. Check [DEVELOPER.md](./DEVELOPER.md) for technical details
2. Review [README.md](./README.md) for setup instructions
3. Use Prisma Studio to inspect database: `npm run prisma:studio`

---

**Built with ❤️ to empower career growth**
