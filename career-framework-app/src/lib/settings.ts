import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Simple encryption (in production, use a more robust solution)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32b'
const ALGORITHM = 'aes-256-cbc'

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
