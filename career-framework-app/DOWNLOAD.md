# Download Career Framework App

## 📦 Release Package

The Career Framework App is available as a complete downloadable package that includes everything needed to run the application on any computer.

### Version: 1.0.0
**Release Date:** November 18, 2024

## 🎯 Download Options

### Option 1: Generate Release Package (Recommended)

If you have access to the source code, you can generate the release package yourself:

```bash
cd career-framework-app
npm run release
```

This creates `career-framework-app-release.zip` (approximately 94KB) containing:
- ✅ Complete application source code
- ✅ Installation instructions (INSTALL.txt)
- ✅ Release notes (RELEASE-NOTES.txt)
- ✅ All documentation (README.md, QUICKSTART.md, NETWORK-SETUP.md)
- ✅ Configuration files
- ✅ Scripts for easy setup
- ❌ Excludes: node_modules, .next, database files, .env

### Option 2: Download from Admin Dashboard

If the app is already running and you're an admin:

1. Log in as admin
2. Navigate to **Downloads** in the navigation menu
3. Click **Download App Package**
4. Save the ZIP file

The admin dashboard also tracks:
- Download history
- Installation metrics
- Usage analytics

### Option 3: GitHub Release

**For GitHub users:**

The release package is available from the GitHub repository:

```
Repository: pallefar/device_oneplus_oneplus3
Branch: claude/career-framework-app-01TvodK72SgsEHcNWS79g5J9
```

To access:

1. Clone the repository or download as ZIP
2. Navigate to: `career-framework-app/`
3. Generate release: `npm run release`

**Direct File Access:**
```bash
# Clone the repository
git clone https://github.com/pallefar/device_oneplus_oneplus3.git
cd device_oneplus_oneplus3/career-framework-app

# Generate release package
npm install
npm run release

# Your release package is now ready: career-framework-app-release.zip
```

## 📥 What's Included in the Package?

The release ZIP contains:

```
career-framework-app/
├── INSTALL.txt                    # Installation instructions
├── RELEASE-NOTES.txt              # Version history and features
├── README.md                      # Complete documentation
├── QUICKSTART.md                  # 5-minute setup guide
├── NETWORK-SETUP.md               # Network configuration guide
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Styling configuration
├── tsconfig.json                  # TypeScript configuration
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.js                   # Sample data
├── src/
│   ├── app/                      # Application pages
│   ├── components/               # UI components
│   └── lib/                      # Utilities
├── scripts/
│   ├── start-server.js           # Interactive server launcher
│   └── create-release.js         # Release package creator
└── public/                       # Static assets
```

## 🚀 Quick Installation

After downloading the ZIP:

1. **Extract** the ZIP file to your desired location
2. **Open terminal** in the extracted folder
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up database:**
   ```bash
   npm run prisma:push
   npm run prisma:seed
   ```
5. **Start the server:**
   ```bash
   npm run server
   ```
6. **Access the app:**
   - Follow the prompts in the terminal
   - Browser opens automatically
   - Login with default credentials (see INSTALL.txt)

## 💾 System Requirements

**Minimum:**
- Node.js 18.x or higher
- npm (comes with Node.js)
- 500MB free disk space
- Modern web browser

**Recommended:**
- Node.js 20.x LTS
- 1GB free disk space
- Fast internet for initial download
- Local network for team features

## 🌐 Deployment Scenarios

### Personal Use
- Extract on your computer
- Run `npm run server`
- Access locally

### Team Use (Same Network)
- Extract on one computer
- Run `npm run server`
- Share network URL with team
- Everyone accesses from their browsers

### Shared Drive
- Extract to network drive (e.g., `\\SharedDrive\CareerFramework\`)
- Anyone can run `npm run server`
- Team accesses via network URL

### Multiple Installations
- Distribute ZIP to each team member
- Each person runs their own instance
- Data stays local to each installation

## 📊 File Sizes

- **Compressed ZIP:** ~94KB (without node_modules)
- **After npm install:** ~250MB (includes all dependencies)
- **With database:** ~250MB + data size
- **Running app:** ~300MB RAM usage

## 🔄 Updates & Versioning

**Current Version:** 1.0.0

To update to a newer version:
1. Download the new release ZIP
2. Extract to a NEW folder
3. Copy your database (`prisma/dev.db`) from old installation
4. Run `npm install` in new folder
5. Run `npm run prisma:push`
6. Start server: `npm run server`

## 🔒 Security & Privacy

- ✅ No external dependencies on runtime
- ✅ All data stored locally (SQLite)
- ✅ No data sent to external servers
- ✅ Passwords encrypted with bcrypt
- ✅ JWT session tokens
- ⚠️ Use HTTPS for internet deployment

## 📚 Documentation

Included in the package:

- **INSTALL.txt** - Step-by-step installation
- **README.md** - Complete feature documentation
- **QUICKSTART.md** - 5-minute setup guide
- **NETWORK-SETUP.md** - Network configuration
- **RELEASE-NOTES.txt** - Version history

## ❓ FAQ

**Q: Do I need to download new dependencies?**
A: Yes, run `npm install` after extracting the ZIP.

**Q: Can I install on multiple computers?**
A: Yes! Extract the ZIP on each computer and run `npm install`.

**Q: Will my data be lost on update?**
A: No, copy `prisma/dev.db` to the new installation.

**Q: Can I use without internet?**
A: After initial `npm install`, yes. The app runs entirely offline.

**Q: How do I share with my team?**
A: Extract the ZIP and send it to them, or use the admin download feature.

## 🆘 Support

For installation help:
1. Check INSTALL.txt in the package
2. Review QUICKSTART.md for quick setup
3. See NETWORK-SETUP.md for network issues
4. Check README.md for detailed docs

## 📝 License

This software is provided for internal use. See the repository for license details.

---

## 🎉 Ready to Download?

Choose your preferred method above and get started with the Career Framework App today!

For the latest version and updates, check the GitHub repository:
https://github.com/pallefar/device_oneplus_oneplus3

**Current Branch:** `claude/career-framework-app-01TvodK72SgsEHcNWS79g5J9`

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
