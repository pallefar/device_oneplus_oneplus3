import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import archiver from 'archiver'
import { Readable } from 'stream'
import path from 'path'
import fs from 'fs'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can download the app
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get client IP and user agent
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Track download
    await prisma.appDownload.create({
      data: {
        downloadedBy: (session.user as any).id,
        ipAddress,
        userAgent,
      },
    })

    // Create a zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    })

    const appRoot = path.join(process.cwd())

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
    ]

    // Add files to archive
    const files = fs.readdirSync(appRoot)

    for (const file of files) {
      const filePath = path.join(appRoot, file)
      const stat = fs.statSync(filePath)

      if (excludePaths.includes(file)) {
        continue
      }

      if (stat.isDirectory()) {
        archive.directory(filePath, file)
      } else {
        archive.file(filePath, { name: file })
      }
    }

    // Add a INSTALL.txt with instructions
    const installInstructions = `
CAREER FRAMEWORK APP - INSTALLATION INSTRUCTIONS
================================================

Thank you for downloading the Career Framework App!

INSTALLATION STEPS:

1. Prerequisites:
   - Install Node.js 18 or higher from https://nodejs.org
   - Ensure npm is available (comes with Node.js)

2. Extract this ZIP file:
   - Extract all contents to a folder of your choice
   - Example: C:\\CareerFrameworkApp or /home/user/CareerFrameworkApp

3. Install Dependencies:
   Open terminal/command prompt in the extracted folder and run:

   npm install

4. Set Up Database:
   Run these commands in order:

   npm run prisma:push
   npm run prisma:seed

5. Start the Application:

   npm run server

   This will:
   - Start the server
   - Open your browser automatically
   - Show network URL for team access

6. Access the App:
   - Local: http://localhost:3000
   - Network: Check the terminal for your network IP address
   - Share the network URL with your team!

DEFAULT LOGIN CREDENTIALS:
- Admin: admin@example.com / admin123
- Leader: leader@example.com / leader123
- Agent: agent1@example.com / agent123

IMPORTANT NOTES:
- Keep this installation on a shared drive for team access
- The first person to start the server hosts it for everyone
- Others can access using the network URL shown in terminal
- Make sure port 3000 is not blocked by firewall

For detailed documentation, see README.md

SUPPORT:
- Check README.md for full documentation
- Check QUICKSTART.md for quick setup guide

Downloaded on: ${new Date().toLocaleString()}
Downloaded by: ${session.user?.name} (${session.user?.email})
`

    archive.append(installInstructions, { name: 'INSTALL.txt' })

    // Finalize archive
    archive.finalize()

    // Convert archive to buffer
    const chunks: Uint8Array[] = []
    archive.on('data', (chunk) => chunks.push(chunk))

    await new Promise((resolve, reject) => {
      archive.on('end', resolve)
      archive.on('error', reject)
    })

    const buffer = Buffer.concat(chunks)

    // Return the zip file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="career-framework-app-${Date.now()}.zip"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error creating download:', error)
    return NextResponse.json(
      { error: 'Failed to create download' },
      { status: 500 }
    )
  }
}
