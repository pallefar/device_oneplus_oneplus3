import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSystemSetting } from '@/lib/settings'
import { awardXP, checkAICoachAchievements } from '@/lib/gamification'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

async function callOpenAI(messages: Message[], apiKey: string, model: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert AI Career Coach helping professionals advance their careers. You provide:
- Personalized career advice based on skills and goals
- Interview preparation and practice
- Resume and LinkedIn optimization tips
- Salary negotiation strategies
- Skill development recommendations
- Leadership coaching
- Work-life balance guidance

Be encouraging, practical, and specific. Reference industry trends and best practices. Keep responses concise but thorough.`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error: any) {
    throw new Error(`OpenAI error: ${error.message}`)
  }
}

async function callMSCopilot(messages: Message[], apiKey: string, endpoint: string): Promise<string> {
  try {
    // MS Copilot integration - adjust based on actual MS API
    const response = await fetch(endpoint || 'https://api.copilot.microsoft.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'api-key': apiKey, // Some Azure APIs use this header
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a professional career development coach. Help users with career planning, skill development, and professional growth.',
          },
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      // If MS Copilot fails, fall back to a helpful message
      console.error('MS Copilot API error:', await response.text())
      throw new Error('MS Copilot API error - check your API key and endpoint configuration')
    }

    const data = await response.json()
    // Adjust based on actual MS Copilot response format
    return data.choices?.[0]?.message?.content || data.response || data.message
  } catch (error: any) {
    throw new Error(`MS Copilot error: ${error.message}`)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { message, conversationId, provider = 'openai', messages = [] } = body

    // Check if AI features are enabled
    const aiEnabled = await getSystemSetting('ai_features_enabled')
    if (aiEnabled !== 'true') {
      return NextResponse.json(
        { error: 'AI features are not enabled. Please contact your administrator.' },
        { status: 403 }
      )
    }

    // Get API keys based on provider
    let aiResponse: string
    if (provider === 'openai') {
      const apiKey = await getSystemSetting('openai_api_key')
      const model = await getSystemSetting('openai_model')

      if (!apiKey) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured. Please configure in Settings.' },
          { status: 500 }
        )
      }

      aiResponse = await callOpenAI(
        [...messages, { role: 'user', content: message }],
        apiKey,
        model || 'gpt-4-turbo-preview'
      )
    } else if (provider === 'copilot') {
      const apiKey = await getSystemSetting('ms_copilot_api_key')
      const endpoint = await getSystemSetting('ms_copilot_endpoint')

      if (!apiKey) {
        return NextResponse.json(
          { error: 'MS Copilot API key not configured. Please configure in Settings.' },
          { status: 500 }
        )
      }

      aiResponse = await callMSCopilot(
        [...messages, { role: 'user', content: message }],
        apiKey,
        endpoint || ''
      )
    } else {
      return NextResponse.json({ error: 'Invalid AI provider' }, { status: 400 })
    }

    // Save conversation
    const allMessages = [...messages, { role: 'user', content: message }, { role: 'assistant', content: aiResponse }]

    let conversation
    const isNewConversation = !conversationId

    if (conversationId) {
      conversation = await prisma.aIConversation.update({
        where: { id: conversationId },
        data: {
          messages: JSON.stringify(allMessages),
          provider,
        },
      })
    } else {
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          provider,
          messages: JSON.stringify(allMessages),
        },
      })
    }

    // Gamification: Award XP and check achievements for new conversations
    if (isNewConversation) {
      try {
        await awardXP(
          userId,
          15,
          'Started a new AI Career Coach conversation',
          'learning'
        )
        await checkAICoachAchievements(userId)
      } catch (error) {
        console.error('Error awarding XP:', error)
        // Don't fail the request if gamification fails
      }
    }

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversation.id,
    })
  } catch (error: any) {
    console.error('AI Coach chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
