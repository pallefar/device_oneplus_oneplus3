#!/usr/bin/env node

const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('📦 Creating Release Package');
console.log('========================================\n');

const output = fs.createWriteStream(path.join(__dirname, '..', 'career-framework-app-release.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

output.on('close', function() {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Release package created successfully!`);
  console.log(`📦 File: career-framework-app-release.zip`);
  console.log(`📊 Size: ${sizeMB} MB`);
  console.log(`📄 Total files: ${archive.pointer()} bytes\n`);
  console.log('🎉 Ready for distribution!\n');
});

archive.on('error', function(err) {
  throw err;
});

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

archive.pipe(output);

const appRoot = path.join(__dirname, '..');

// Files and directories to exclude
const excludePaths = [
  'node_modules',
  '.next',
  '.git',
  'prisma/dev.db',
  'prisma/dev.db-journal',
  '.env',
  'dist',
  'build',
  'career-framework-app-release.zip',
  '.gitignore'
];

console.log('📁 Adding files to package...\n');

// Add files to archive
const files = fs.readdirSync(appRoot);

for (const file of files) {
  const filePath = path.join(appRoot, file);

  if (excludePaths.includes(file)) {
    console.log(`⏭️  Skipping: ${file}`);
    continue;
  }

  const stat = fs.statSync(filePath);

  if (stat.isDirectory()) {
    console.log(`📂 Adding directory: ${file}/`);
    archive.directory(filePath, `career-framework-app/${file}`);
  } else {
    console.log(`📄 Adding file: ${file}`);
    archive.file(filePath, { name: `career-framework-app/${file}` });
  }
}

// Add installation instructions
const installInstructions = `
CAREER FRAMEWORK APP - INSTALLATION INSTRUCTIONS
================================================

Version: 1.0.0
Release Date: ${new Date().toLocaleDateString()}

Thank you for downloading the Career Framework App!

QUICK START:
============

1. Extract this ZIP file to your desired location
2. Open terminal/command prompt in the extracted folder
3. Run: npm install
4. Run: npm run prisma:push
5. Run: npm run prisma:seed
6. Run: npm run server
7. Follow the interactive prompts!

SYSTEM REQUIREMENTS:
===================

- Node.js 18.x or higher (Download from https://nodejs.org)
- npm (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 500MB free disk space
- For network access: Local network connection

INSTALLATION STEPS (DETAILED):
==============================

1. Prerequisites:
   - Install Node.js 18+ from https://nodejs.org
   - Verify installation: node --version && npm --version

2. Extract Files:
   Windows: Right-click ZIP → Extract All
   Mac: Double-click ZIP file
   Linux: unzip career-framework-app-release.zip

3. Navigate to Folder:
   cd career-framework-app

4. Install Dependencies:
   npm install
   (This may take 2-5 minutes)

5. Set Up Database:
   npm run prisma:push
   npm run prisma:seed

6. Start the Application:
   npm run server

   The server will ask you:
   - What port to use (default: 3000)
   - Auto-open browser? (default: Yes)
   - Enable network access? (default: Yes)
   - Production mode? (default: No)

7. Access the Application:
   - Local: http://localhost:3000
   - Network: Use URL shown in terminal

DEFAULT LOGIN CREDENTIALS:
=========================

Admin Account:
  Email: admin@example.com
  Password: admin123

Leader Account:
  Email: leader@example.com
  Password: leader123

Agent Account:
  Email: agent1@example.com
  Password: agent123

IMPORTANT: Change these passwords after first login!

COMMAND LINE OPTIONS:
====================

Start with custom options:
  npm run server -- -p 8080              (Use port 8080)
  npm run server -- --no-browser         (Don't auto-open browser)
  npm run server -- --local-only         (No network access)
  npm run server -- --help               (Show all options)

NETWORK DEPLOYMENT:
==================

For Team Access on Local Network:
1. Start server: npm run server
2. Choose "Yes" for network access
3. Share the network URL with your team
4. Team members open URL in their browsers

For Shared Network Drive:
1. Extract to: \\\\SharedDrive\\CareerFramework\\
2. Anyone can run: npm run server
3. Everyone accesses via network URL

FIREWALL CONFIGURATION:
======================

Windows:
  Run as Administrator:
  netsh advfirewall firewall add rule name="Career Framework" dir=in action=allow protocol=TCP localport=3000

Mac:
  System Preferences → Security & Privacy → Firewall → Firewall Options
  Allow Node.js connections

Linux:
  sudo ufw allow 3000/tcp

TROUBLESHOOTING:
===============

Issue: "npm: command not found"
Solution: Install Node.js from https://nodejs.org

Issue: "Port 3000 already in use"
Solution: Use different port: npm run server -- -p 8080

Issue: Team can't connect
Solution: Check firewall settings and ensure same network

Issue: Database errors
Solution: Delete prisma/dev.db and run prisma:push again

UPDATING THE APP:
================

1. Download new release ZIP
2. Extract to a NEW folder
3. Copy your database: prisma/dev.db
4. Run: npm install
5. Run: npm run prisma:push
6. Start: npm run server

DOCUMENTATION:
=============

Full documentation available in:
- README.md - Complete documentation
- QUICKSTART.md - 5-minute setup guide
- NETWORK-SETUP.md - Network configuration
- See /docs folder for more guides

SUPPORT:
========

- Documentation: See README.md
- Network Setup: See NETWORK-SETUP.md
- Issues: Check troubleshooting section above

FEATURES:
=========

✅ Career framework management
✅ Assessment creation and tracking
✅ User management (Admin, Leader, Agent)
✅ Self-assessment and manager review
✅ PDF and Excel export
✅ Network sharing for teams
✅ Usage analytics and monitoring
✅ Skill matrix tracking

TECHNICAL DETAILS:
==================

Built with:
- Next.js 14 (React Framework)
- TypeScript
- Prisma ORM + SQLite
- NextAuth.js (Authentication)
- Tailwind CSS
- jsPDF & ExcelJS

File Structure:
- src/ - Application source code
- prisma/ - Database schema and migrations
- public/ - Static assets
- scripts/ - Utility scripts

GETTING HELP:
=============

1. Check documentation in README.md
2. Review NETWORK-SETUP.md for network issues
3. Check QUICKSTART.md for quick setup
4. Ensure all prerequisites are installed

LICENSE:
========

This software is provided for internal use.
See LICENSE file for details.

---

Installation Date: ${new Date().toLocaleString()}

Enjoy using the Career Framework App! 🚀
`;

archive.append(installInstructions, { name: 'career-framework-app/INSTALL.txt' });

// Add release notes
const releaseNotes = `
CAREER FRAMEWORK APP - RELEASE NOTES
====================================

Version: 1.0.0
Release Date: ${new Date().toLocaleDateString()}

🎉 INITIAL RELEASE

This is the first official release of the Career Framework Management System.

NEW FEATURES:
=============

🔐 Authentication & User Management
  - Secure login with bcrypt password hashing
  - Role-based access control (Admin, Leader, Agent)
  - JWT session management
  - User profile management

📊 Career Framework Management
  - Create custom career frameworks
  - Define career levels (Junior, Mid, Senior, etc.)
  - Set up competency areas
  - Add specific skills tied to levels and competencies

✅ Assessment System
  - Create assessments based on frameworks
  - Assign to agent-manager pairs
  - Self-assessment workflow
  - Manager review and feedback
  - Track status (Pending → Completed → Finalized)

📱 Role-Specific Dashboards
  - Admin: Full system management
  - Leader: Team assessment and review
  - Agent: Self-assessment and progress tracking

📥 Export Functionality
  - Export assessments to PDF
  - Export to Excel spreadsheets
  - Download assessment templates
  - Generate skill matrix reports

🌐 Network Sharing
  - Interactive server setup
  - Network access for teams
  - Shared drive support
  - Auto-detect network IP
  - Configurable port and options

📦 Distribution & Analytics
  - Download complete app package
  - Track downloads and installations
  - Usage monitoring and analytics
  - Activity logging

🎨 User Interface
  - Modern, responsive design
  - Tailwind CSS styling
  - Mobile-friendly
  - Intuitive navigation
  - Clean, professional look

TECHNICAL HIGHLIGHTS:
====================

- Built with Next.js 14 (latest App Router)
- TypeScript for type safety
- SQLite database (easily upgradeable to PostgreSQL)
- Prisma ORM for database management
- NextAuth.js for secure authentication
- Server-side rendering for performance
- API routes for backend functionality

SYSTEM REQUIREMENTS:
===================

- Node.js 18.x or higher
- npm package manager
- Modern web browser
- 500MB disk space
- Optional: Network connection for team features

KNOWN LIMITATIONS:
==================

- SQLite database (recommended PostgreSQL for 100+ users)
- Single instance (no clustering yet)
- File-based uploads not implemented
- Email notifications pending

FUTURE ROADMAP:
===============

Planned for v1.1:
- Email notifications for assessments
- Bulk user import from CSV
- Advanced analytics dashboard
- Custom skill rating scales
- Historical progression charts

Planned for v1.2:
- Mobile app (React Native)
- Advanced reporting features
- Integration APIs
- Multi-language support
- Dark mode

INSTALLATION:
=============

See INSTALL.txt for complete installation instructions.

Quick start:
1. npm install
2. npm run prisma:push && npm run prisma:seed
3. npm run server
4. Login with default credentials

UPGRADING:
==========

This is the first release. Upgrade instructions will be
included in future releases.

SECURITY:
=========

- All passwords are hashed with bcrypt
- JWT tokens for session management
- Role-based access control
- SQL injection protection via Prisma
- XSS protection built-in

SUPPORT:
========

- Full documentation in README.md
- Quick start guide in QUICKSTART.md
- Network setup in NETWORK-SETUP.md
- Interactive help: npm run server -- --help

CONTRIBUTORS:
=============

Built with ❤️ using modern web technologies.

---

Thank you for using Career Framework App!

We hope this tool helps you and your team manage
career development effectively.

For questions, issues, or feedback, please refer to
the documentation or contact your system administrator.

Happy career tracking! 🚀
`;

archive.append(releaseNotes, { name: 'career-framework-app/RELEASE-NOTES.txt' });

// Finalize the archive
console.log('\n📦 Finalizing package...\n');
archive.finalize();
