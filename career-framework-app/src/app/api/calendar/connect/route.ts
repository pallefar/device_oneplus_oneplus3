import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSystemSetting } from '@/lib/settings'

// Microsoft Graph OAuth
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') || 'microsoft'

    if (provider === 'microsoft') {
      // Get MS Graph credentials from settings
      const clientId = await getSystemSetting('ms_graph_client_id')
      const redirectUri = await getSystemSetting('ms_graph_redirect_uri')

      if (!clientId) {
        return NextResponse.json(
          { error: 'Microsoft Graph not configured. Please configure in Admin Settings.' },
          { status: 500 }
        )
      }

      // Build Microsoft OAuth URL
      const scopes = [
        'Calendars.ReadWrite',
        'User.Read',
        'offline_access',
      ]

      const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')
      authUrl.searchParams.set('client_id', clientId)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('redirect_uri', redirectUri || `${process.env.NEXTAUTH_URL}/api/calendar/callback`)
      authUrl.searchParams.set('scope', scopes.join(' '))
      authUrl.searchParams.set('response_mode', 'query')
      authUrl.searchParams.set('state', (session.user as any).id)

      return NextResponse.json({ authUrl: authUrl.toString() })
    } else if (provider === 'google') {
      // Get Google Calendar credentials from settings
      const clientId = await getSystemSetting('google_calendar_client_id')
      const redirectUri = await getSystemSetting('google_calendar_redirect_uri')

      if (!clientId) {
        return NextResponse.json(
          { error: 'Google Calendar not configured. Please configure in Admin Settings.' },
          { status: 500 }
        )
      }

      // Build Google OAuth URL
      const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ]

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', clientId)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('redirect_uri', redirectUri || `${process.env.NEXTAUTH_URL}/api/calendar/callback`)
      authUrl.searchParams.set('scope', scopes.join(' '))
      authUrl.searchParams.set('access_type', 'offline')
      authUrl.searchParams.set('state', `google:${(session.user as any).id}`)

      return NextResponse.json({ authUrl: authUrl.toString() })
    }

    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  } catch (error) {
    console.error('Error generating auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}
