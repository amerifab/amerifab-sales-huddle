import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getMicrosoftAuthUrl, hasMicrosoftConnection } from "@/lib/microsoft-graph"

// GET /api/auth/microsoft - Get OAuth URL or check connection status
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if Microsoft credentials are configured
  if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Microsoft OAuth not configured", configured: false },
      { status: 400 }
    )
  }

  // Check if user already has a connection
  const isConnected = await hasMicrosoftConnection(session.user.id)

  const redirectUri = `${process.env.AUTH_URL || process.env.NEXTAUTH_URL}/api/auth/microsoft/callback`
  const authUrl = getMicrosoftAuthUrl(session.user.id, redirectUri)

  return NextResponse.json({
    authUrl,
    isConnected,
    configured: true,
  })
}
