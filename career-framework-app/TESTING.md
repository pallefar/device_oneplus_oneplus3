# Career Framework App - Testing Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Internet connection for Prisma engine download

### Initial Setup

1. **Install Dependencies**
   ```bash
   cd career-framework-app
   npm install
   ```

2. **Generate Prisma Client** (IMPORTANT!)
   ```bash
   # Standard generation
   npx prisma generate

   # If you encounter network/checksum errors, try:
   PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
   ```

3. **Initialize Database**
   ```bash
   # Push schema to database (creates dev.db SQLite file)
   npx prisma db push

   # Optional: Seed initial data
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   - Navigate to: http://localhost:3000
   - Login page should appear

---

## 🧪 Testing Newly Implemented Features

### Feature #16: Skills-Based Compensation Engine ✅ (Just Implemented!)

#### Testing Agent Features (Skill Valuation)

1. **Access the Skill Valuation Page**
   - Login as an AGENT user
   - Navigate to: **Skill Valuation** in the navigation menu
   - Or go directly to: http://localhost:3000/agent/skill-valuation

2. **Verify Key Metrics Display**
   - [ ] Total Skill Value card shows calculated value
   - [ ] Market Percentile shows ranking (0-100%)
   - [ ] Valued Skills count is accurate
   - [ ] Potential Gain shows opportunities

3. **Test Personalized Recommendations**
   - [ ] Recommendations cards appear with priority levels (High/Medium/Low)
   - [ ] Each recommendation shows potential gain in dollars
   - [ ] Action buttons are displayed
   - [ ] Recommendations are relevant to user's skills

4. **Verify Top Valued Skills Section**
   - [ ] Skills are sorted by market value (highest first)
   - [ ] Each skill shows:
     - Name and competency
     - Trend indicator (rising/stable/declining)
     - Level progress bar (1-5 scale)
     - Market value in dollars
     - Demand score (0-100)

5. **Check Value by Competency**
   - [ ] Skills are grouped by competency
   - [ ] Total value per competency is calculated
   - [ ] Progress bars show relative value distribution

6. **Test Market Insights**
   - [ ] Trending Skills section shows high-demand skills
   - [ ] Each skill shows demand score and average value
   - [ ] Declining Skills section (if any) appears
   - [ ] Icons indicate trend direction

7. **Verify High-Value Learning Opportunities**
   - [ ] Gap analysis shows skills user doesn't have
   - [ ] Only high-demand skills (70+ demand) appear
   - [ ] Potential value gains are shown
   - [ ] Estimated time to acquire is displayed

#### Testing Admin Features (Compensation Analytics)

1. **Access Compensation Analytics Dashboard**
   - Login as an ADMIN user
   - Navigate to: **Compensation Analytics** in navigation menu
   - Or go to: http://localhost:3000/admin/compensation-analytics

2. **Verify Summary Cards**
   - [ ] Total Skill Value shows organization total
   - [ ] Average Value per Person is calculated
   - [ ] Unique Skills count is accurate
   - [ ] Total Team count matches assessed users

3. **Test Strategic Recommendations**
   - [ ] Recommendations appear with priority levels
   - [ ] Each recommendation includes:
     - Type indicator (skill-gap, training, equity)
     - Title and description
     - Actionable next steps
     - Impact assessment

4. **Check Critical Skill Gaps**
   - [ ] High-demand missing skills are identified
   - [ ] Demand scores (0-100) are shown
   - [ ] Estimated value for each gap
   - [ ] Sorted by demand/value

5. **Verify Training Investment Opportunities**
   - [ ] Shows skills team has but could improve
   - [ ] User count for each skill
   - [ ] Current average level
   - [ ] Potential ROI value
   - [ ] Recommendations (e.g., "Training program")

6. **Test Department Analysis**
   - [ ] Each department card shows:
     - Department name and user count
     - Average skill value per person
     - Top 3 skills in that department
   - [ ] Departments are listed in grid layout

7. **Verify Skill Value Distribution**
   - [ ] Top 15 skills by value are displayed
   - [ ] Progress bars show relative contribution
   - [ ] User counts and average levels shown
   - [ ] Values in dollars (k/M format)

8. **Check Competency Distribution**
   - [ ] Skills grouped by competency
   - [ ] Total value and percentage shown
   - [ ] Visual progress bars
   - [ ] Sorted by total value

9. **Test Top Performers Table**
   - [ ] Shows top 20 users by skill value
   - [ ] Rank badges (1st gold, 2nd silver, 3rd bronze)
   - [ ] Name, department, role displayed
   - [ ] Total skill value and skill count
   - [ ] Top 3 skills shown as tags

10. **Verify Pay Equity Analysis**
    - [ ] Shows analysis by role
    - [ ] User count per role
    - [ ] Average, median, min, max values
    - [ ] Spread percentage with color coding:
      - Red: >50% spread (high risk)
      - Yellow: 30-50% spread (medium)
      - Green: <30% spread (low risk)

---

### Feature #15: Succession Planning Engine ✅

#### Testing Succession Planning Dashboard

1. **Access Succession Planning**
   - Login as ADMIN
   - Go to: **Succession Planning** in navigation
   - URL: http://localhost:3000/admin/succession-planning

2. **Verify Summary Cards**
   - [ ] Pipeline Health Score (percentage)
   - [ ] Ready Now count
   - [ ] In Development count
   - [ ] Total Candidates count

3. **Test Readiness Tabs**
   - [ ] High Ready tab (80-100 score, green)
   - [ ] Medium Ready tab (60-79 score, yellow)
   - [ ] Low Ready tab (40-59 score, orange)
   - [ ] Not Ready tab (<40 score, gray)

4. **Verify Candidate Cards**
   - [ ] Each card shows:
     - Name, role, department
     - Readiness score (0-100)
     - Development timeline
     - Suggested next role
     - Leadership and technical scores
     - Top 5 strengths
     - Development needs (gaps)
     - Endorsements, goals, achievements counts

5. **Test Candidate Detail Modal**
   - [ ] Click on candidate card
   - [ ] Modal opens with full details
   - [ ] Strengths and gaps clearly listed
   - [ ] Timeline visualization
   - [ ] Close button works

---

### Feature #19: Organizational Health Dashboard ✅

#### Testing Org Health Analytics

1. **Access Analytics Dashboard**
   - Login as ADMIN
   - Go to: **Analytics** in navigation
   - URL: http://localhost:3000/admin/analytics

2. **Verify Time Range Selector**
   - [ ] Can select 7, 30, 90, 180 days
   - [ ] Data updates when range changes

3. **Check User Statistics**
   - [ ] Total users
   - [ ] Users by role
   - [ ] New users in range
   - [ ] Department distribution
   - [ ] Top contributors by XP
   - [ ] Most endorsed users

4. **Verify Assessment Metrics**
   - [ ] Total assessments
   - [ ] Completion rate percentage
   - [ ] Status breakdown (pending, completed, etc.)
   - [ ] Assessments created in time range

5. **Test Skills Analytics**
   - [ ] Total skills count
   - [ ] Top performing skills (avg rating >= 4)
   - [ ] Skill gaps (avg rating < 3)
   - [ ] Frameworks count

6. **Check Activity Timeline**
   - [ ] Daily breakdown for selected range
   - [ ] Assessments per day
   - [ ] Endorsements per day
   - [ ] Kudos per day
   - [ ] Learning goals per day
   - [ ] AI conversations per day

---

### Feature #20: Personal Career Analytics ✅

#### Testing My Analytics

1. **Access Personal Analytics**
   - Login as AGENT
   - Go to: **My Analytics** in navigation
   - URL: http://localhost:3000/agent/my-analytics

2. **Verify Profile Summary Card**
   - [ ] Name displayed
   - [ ] Level and XP shown
   - [ ] Rank (#X of Y)
   - [ ] Percentile (Top X%)
   - [ ] Gradient background

3. **Check Key Metrics Cards**
   - [ ] Assessments Completed
   - [ ] Endorsements Received
   - [ ] Active Goals
   - [ ] Kudos Received

4. **Test Skills by Competency**
   - [ ] Each competency section shows:
     - Progress bars for each skill
     - Self vs manager ratings
     - Gap indicators
     - Competency averages

5. **Verify Top Strengths**
   - [ ] Shows skills rated >= 4
   - [ ] Skill names and ratings
   - [ ] Check marks or badges

6. **Check Growth Areas**
   - [ ] Shows skills rated < 3
   - [ ] Identifies improvement opportunities
   - [ ] Gap values shown

7. **Test Learning Goals Progress**
   - [ ] Active goals listed
   - [ ] Progress percentages
   - [ ] Target dates
   - [ ] Completion status

8. **Verify Recent Achievements**
   - [ ] Achievement badges displayed
   - [ ] Achievement names and descriptions
   - [ ] Earned dates
   - [ ] XP rewards

9. **Check XP Timeline**
   - [ ] Last 30 days XP progression
   - [ ] Visual chart or graph
   - [ ] Daily breakdown

10. **Test Recent Kudos**
    - [ ] Kudos messages displayed
    - [ ] Sender names
    - [ ] Timestamps
    - [ ] Skills tagged (if any)

---

### Other Implemented Features to Test

#### ✅ Feature #1: AI Career Coach

1. **Access AI Coach**
   - Navigate to: **AI Coach** in agent menu
   - URL: http://localhost:3000/agent/ai-coach

2. **Test Chat Interface**
   - [ ] Chat input field is visible
   - [ ] Suggested prompts appear
   - [ ] Can send a message
   - [ ] Response received (if API key configured)
   - [ ] Conversation history persists

3. **Test Provider Toggle**
   - [ ] Can switch between OpenAI and MS Copilot
   - [ ] Settings icon accessible
   - [ ] Provider selection saves

#### ✅ Feature #4: Gamification System

1. **Verify Achievements Page**
   - URL: http://localhost:3000/agent/achievements
   - [ ] Achievements tab shows all achievements
   - [ ] Progress bars for incomplete achievements
   - [ ] Earned achievements highlighted
   - [ ] Badges tab shows collected badges
   - [ ] Leaderboard tab shows top users by XP

2. **Test XP Widget**
   - [ ] Widget appears on dashboard
   - [ ] Shows current level and XP
   - [ ] Progress bar to next level
   - [ ] Recent achievements listed

#### ✅ Feature #5: Peer Endorsements

1. **Access Endorsements Page**
   - URL: http://localhost:3000/agent/endorsements
   - [ ] "Give Endorsement" button visible
   - [ ] Can search for users
   - [ ] Can select skills to endorse
   - [ ] Can add comment
   - [ ] Endorsement submission works

2. **Verify Endorsements Display**
   - [ ] Received endorsements shown
   - [ ] Grouped by skill
   - [ ] Shows endorser name and relationship
   - [ ] Comments displayed
   - [ ] Timestamps shown

#### ✅ Feature #6: Learning Goals

1. **Access Learning Page**
   - URL: http://localhost:3000/agent/learning
   - [ ] "New Goal" button visible
   - [ ] Can create new goal
   - [ ] Progress slider works
   - [ ] Target date picker functional
   - [ ] Priority selection (1-10)

2. **Test Goal Management**
   - [ ] Can edit goals
   - [ ] Can delete goals
   - [ ] Can mark as complete
   - [ ] Progress updates save
   - [ ] Status changes (active/completed)

#### ✅ Feature #7: Kudos System

1. **Access Kudos Page**
   - URL: http://localhost:3000/agent/kudos
   - [ ] "Send Kudos" button visible
   - [ ] Can search for recipients
   - [ ] Can write kudos message
   - [ ] Can tag skills
   - [ ] Can set public/private

2. **Verify Kudos Feed**
   - [ ] Filter tabs work (All/Received/Sent)
   - [ ] Kudos cards display correctly
   - [ ] Timestamps shown
   - [ ] Skills tagged visible

#### ✅ Feature #8: Calendar Integration

1. **Access Calendar Page**
   - URL: http://localhost:3000/agent/calendar
   - [ ] Calendar view displays
   - [ ] Can create learning session
   - [ ] Title and description fields work
   - [ ] Date/time pickers functional
   - [ ] Session saved

2. **Test OAuth Connection**
   - [ ] "Connect Microsoft Calendar" button
   - [ ] "Connect Google Calendar" button
   - [ ] OAuth flow (if credentials configured)

#### ✅ Feature #9: Market Intelligence

1. **Test API Endpoint**
   ```bash
   curl http://localhost:3000/api/market-intelligence
   ```
   - [ ] Returns skill trends data
   - [ ] Shows demand scores
   - [ ] Salary data included
   - [ ] Growth rates displayed

#### ✅ Feature #10: Health Check

1. **Test Health Endpoint**
   ```bash
   curl http://localhost:3000/api/health
   ```
   - [ ] Returns 200 status
   - [ ] Shows database status
   - [ ] Lists configured integrations
   - [ ] Shows recent activity metrics

---

## 🔍 Common Test Scenarios

### End-to-End User Journey: Agent

1. **Login as Agent**
   - Email: `agent@example.com`
   - Password: `password123`

2. **Complete Daily Tasks**
   - [ ] Check dashboard for notifications
   - [ ] Review pending assessments
   - [ ] Complete self-assessment
   - [ ] Check My Analytics for progress
   - [ ] Review Skill Valuation insights
   - [ ] Identify high-value learning opportunities
   - [ ] Create learning goal based on recommendations
   - [ ] Give endorsement to colleague
   - [ ] Send kudos for recent help
   - [ ] Schedule learning time on calendar
   - [ ] Chat with AI Coach for guidance
   - [ ] Review achievements and badges

### End-to-End User Journey: Admin

1. **Login as Admin**
   - Email: `admin@example.com`
   - Password: `admin123`

2. **Monitor Organization Health**
   - [ ] Check Organizational Health Dashboard
   - [ ] Review activity timeline
   - [ ] Identify skill gaps
   - [ ] Check assessment completion rates

3. **Strategic Planning**
   - [ ] Open Succession Planning dashboard
   - [ ] Review pipeline health
   - [ ] Identify ready candidates
   - [ ] Note development needs

4. **Compensation Analysis**
   - [ ] Open Compensation Analytics
   - [ ] Review organization skill value
   - [ ] Identify critical skill gaps
   - [ ] Assess training investment opportunities
   - [ ] Check pay equity by role
   - [ ] Review top performers
   - [ ] Note strategic recommendations

5. **Configuration**
   - [ ] Go to Settings
   - [ ] Review API key configuration
   - [ ] Check feature flags
   - [ ] Update system settings

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Prisma Engine Download**
   - May encounter 403 errors when downloading Prisma engines
   - Workaround: Use `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`

2. **Sample Market Data**
   - Market intelligence currently uses sample data
   - Real API integration pending (LinkedIn, Indeed, Glassdoor)

3. **AI Coach Requirements**
   - Requires OpenAI API key or MS Copilot credentials
   - Configure in Admin → Settings

4. **OAuth Calendar Integration**
   - Requires Microsoft Graph or Google Calendar credentials
   - Configure Client IDs and redirect URIs in settings

5. **Database**
   - Currently using SQLite (dev.db)
   - For production, migrate to PostgreSQL or MySQL

### Troubleshooting

**Issue**: Prisma client not found
```bash
Solution: Run `npx prisma generate`
```

**Issue**: Database tables missing
```bash
Solution: Run `npx prisma db push`
```

**Issue**: AI Coach not responding
```bash
Solution: Check Admin → Settings → AI keys configured
```

**Issue**: Navigation items not showing
```bash
Solution: Clear cache, restart server, check user role
```

**Issue**: 500 errors on pages
```bash
Solution: Check server logs for details, verify Prisma client generated
```

---

## 📊 Testing Checklist Summary

### Critical Features to Test
- [ ] Authentication (login/logout)
- [ ] Dashboard access for all roles
- [ ] Skills-Based Compensation (Agent & Admin)
- [ ] Succession Planning (Admin)
- [ ] Organizational Health Dashboard (Admin)
- [ ] Personal Career Analytics (Agent)
- [ ] AI Career Coach (Agent)
- [ ] Gamification (Achievements, XP, Badges)
- [ ] Peer Endorsements (Agent)
- [ ] Learning Goals (Agent)
- [ ] Kudos System (Agent)
- [ ] Calendar Integration (Agent)

### Performance Tests
- [ ] Page load times < 2 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] No memory leaks

### Security Tests
- [ ] Role-based access control enforced
- [ ] API keys encrypted in database
- [ ] Session management working
- [ ] SQL injection prevention
- [ ] XSS prevention

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile responsive

---

## 🚀 Next Steps After Testing

1. **Report Issues**
   - Document bugs found
   - Note feature requests
   - List UX improvements

2. **Performance Optimization**
   - Review slow queries
   - Optimize database indexes
   - Add caching where needed

3. **Additional Features**
   - Implement remaining Vision 2030 features
   - Add real market data integration
   - Enhance UI/UX based on feedback

4. **Production Preparation**
   - Migrate to PostgreSQL
   - Set up proper environment variables
   - Configure production APIs
   - Add monitoring and logging
   - Set up CI/CD pipeline

---

## 📞 Support

For issues or questions:
- Check IMPLEMENTATION-STATUS.md for feature details
- Review FEATURES.md for user guides
- See VISION-2030.md for future roadmap

---

**Last Updated**: 2025-11-21
**Version**: 1.4.0 (14/22 features complete - 64%)
