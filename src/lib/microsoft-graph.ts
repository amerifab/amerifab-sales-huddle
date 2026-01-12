import { prisma } from "./db"

const MICROSOFT_GRAPH_BASE = "https://graph.microsoft.com/v1.0"
const MICROSOFT_AUTH_BASE = "https://login.microsoftonline.com"

export interface CalendarEvent {
  subject: string
  body: {
    contentType: "HTML" | "Text"
    content: string
  }
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  reminderMinutesBeforeStart: number
}

// Get OAuth authorization URL for user consent
export function getMicrosoftAuthUrl(userId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "openid profile email Calendars.ReadWrite offline_access",
    state: userId,
    response_mode: "query",
  })

  const tenantId = process.env.MICROSOFT_TENANT_ID || "common"
  return `${MICROSOFT_AUTH_BASE}/${tenantId}/oauth2/v2.0/authorize?${params}`
}

// Exchange authorization code for tokens
export async function exchangeMicrosoftCode(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  try {
    const tenantId = process.env.MICROSOFT_TENANT_ID || "common"
    const response = await fetch(`${MICROSOFT_AUTH_BASE}/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Microsoft token exchange failed:", error)
      return null
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    }
  } catch (error) {
    console.error("Microsoft token exchange error:", error)
    return null
  }
}

// Refresh expired access token
export async function refreshMicrosoftToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  try {
    const tenantId = process.env.MICROSOFT_TENANT_ID || "common"
    const response = await fetch(`${MICROSOFT_AUTH_BASE}/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
    }
  } catch (error) {
    console.error("Microsoft token refresh error:", error)
    return null
  }
}

// Get valid access token (refresh if needed)
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const tokenRecord = await prisma.microsoftToken.findUnique({
    where: { userId },
  })

  if (!tokenRecord) {
    return null
  }

  // Check if token is expired (with 5 minute buffer)
  const now = new Date()
  const expiresAt = new Date(tokenRecord.expiresAt)
  const bufferMs = 5 * 60 * 1000

  if (now.getTime() + bufferMs < expiresAt.getTime()) {
    return tokenRecord.accessToken
  }

  // Token expired, refresh it
  const refreshed = await refreshMicrosoftToken(tokenRecord.refreshToken)
  if (!refreshed) {
    // Refresh failed, delete token record
    await prisma.microsoftToken.delete({ where: { userId } })
    return null
  }

  // Update token in database
  await prisma.microsoftToken.update({
    where: { userId },
    data: {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
    },
  })

  return refreshed.accessToken
}

// Check if user has Microsoft calendar connected
export async function hasMicrosoftConnection(userId: string): Promise<boolean> {
  const token = await prisma.microsoftToken.findUnique({
    where: { userId },
  })
  return !!token
}

// Create calendar event
export async function createCalendarEvent(
  userId: string,
  event: CalendarEvent
): Promise<{ eventId: string } | null> {
  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) {
    console.error("No valid Microsoft access token for user:", userId)
    return null
  }

  try {
    const response = await fetch(`${MICROSOFT_GRAPH_BASE}/me/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Failed to create calendar event:", error)
      return null
    }

    const data = await response.json()
    return { eventId: data.id }
  } catch (error) {
    console.error("Calendar event creation error:", error)
    return null
  }
}

// Delete calendar event
export async function deleteCalendarEvent(userId: string, eventId: string): Promise<boolean> {
  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) {
    return false
  }

  try {
    const response = await fetch(`${MICROSOFT_GRAPH_BASE}/me/events/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return response.ok || response.status === 404
  } catch (error) {
    console.error("Calendar event deletion error:", error)
    return false
  }
}
