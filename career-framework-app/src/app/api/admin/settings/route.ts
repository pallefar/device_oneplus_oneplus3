import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Simple encryption (in production, use a more robust solution)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32b'
const ALGORITHM = 'aes-256-cbc'

function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))
    const parts = text.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encryptedText = parts[1]
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    return text // Return as-is if decryption fails (might not be encrypted)
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const settings = await prisma.systemSettings.findMany({
      orderBy: { category: 'asc' },
    })

    // Decrypt secret values for display (masked)
    const settingsWithValues = settings.map((setting) => ({
      ...setting,
      value: setting.isSecret && setting.value
        ? '••••••••' // Mask secrets
        : setting.value,
    }))

    return NextResponse.json({ settings: settingsWithValues })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { settings } = body

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    const userId = (session.user as any).id

    // Upsert each setting
    for (const setting of settings) {
      const { key, value, description, category, isSecret } = setting

      // Encrypt if secret
      const storedValue = isSecret && value ? encrypt(value) : value

      await prisma.systemSettings.upsert({
        where: { key },
        update: {
          value: storedValue,
          description,
          category,
          isSecret,
          updatedBy: userId,
        },
        create: {
          key,
          value: storedValue,
          description,
          category,
          isSecret,
          updatedBy: userId,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save settings error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}

// Utility function to get a setting value (for use in other APIs)
export async function getSystemSetting(key: string): Promise<string | null> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
    })

    if (!setting || !setting.value) {
      return null
    }

    // Decrypt if secret
    return setting.isSecret ? decrypt(setting.value) : setting.value
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error)
    return null
  }
}
