import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/blockchain/credentials
 * Get user's blockchain credentials
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const credentials = await prisma.blockchainCredential.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
    })

    return NextResponse.json({
      credentials,
      total: credentials.length,
      verified: credentials.filter((c) => c.isVerified).length,
    })
  } catch (error) {
    console.error('Error fetching blockchain credentials:', error)
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 })
  }
}

/**
 * POST /api/blockchain/credentials
 * Issue new blockchain credential (Admin or system)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'LEADER'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const {
      userId,
      skillName,
      competency,
      level,
      issuedBy,
      blockchainType = 'ethereum',
    } = body

    // In production, this would interact with smart contracts
    // For now, we'll simulate blockchain issuance
    const transactionHash = generateMockTransactionHash()
    const tokenId = generateMockTokenId()
    const contractAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    const metadataUri = `ipfs://Qm${generateMockIPFSHash()}`

    const credential = await prisma.blockchainCredential.create({
      data: {
        userId,
        skillName,
        competency,
        level,
        issuedBy,
        blockchainType,
        tokenId,
        contractAddress,
        transactionHash,
        metadataUri,
        isVerified: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    })

    // Award XP for receiving blockchain credential
    await prisma.xPTransaction.create({
      data: {
        userId,
        amount: 100,
        reason: 'Blockchain credential issued',
        category: 'achievement',
        metadata: JSON.stringify({
          credentialId: credential.id,
          skillName,
          level,
        }),
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { experiencePoints: { increment: 100 } },
    })

    return NextResponse.json({
      success: true,
      credential,
      message: 'Blockchain credential issued successfully! +100 XP',
    })
  } catch (error) {
    console.error('Error issuing blockchain credential:', error)
    return NextResponse.json({ error: 'Failed to issue credential' }, { status: 500 })
  }
}

/**
 * Generate mock transaction hash (simulated blockchain)
 */
function generateMockTransactionHash(): string {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

/**
 * Generate mock token ID
 */
function generateMockTokenId(): string {
  return Math.floor(Math.random() * 1000000).toString()
}

/**
 * Generate mock IPFS hash
 */
function generateMockIPFSHash(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let hash = ''
  for (let i = 0; i < 46; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}
