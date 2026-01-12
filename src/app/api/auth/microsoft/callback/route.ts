import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { exchangeMicrosoftCode } from "@/lib/microsoft-graph"

// GET /api/auth/microsoft/callback - Handle OAuth callback
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state") // This is the userId
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || ""

  if (error) {
    console.error("Microsoft OAuth error:", error, errorDescription)
    return NextResponse.redirect(new URL(`/?calendar_error=${encodeURIComponent(error)}`, baseUrl))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?calendar_error=missing_params", baseUrl))
  }

  // Verify the user exists
  const user = await prisma.user.findUnique({
    where: { id: state },
  })

  if (!user) {
    return NextResponse.redirect(new URL("/?calendar_error=invalid_user", baseUrl))
  }

  const redirectUri = `${baseUrl}/api/auth/microsoft/callback`
  const tokens = await exchangeMicrosoftCode(code, redirectUri)

  if (!tokens) {
    return NextResponse.redirect(new URL("/?calendar_error=token_exchange_failed", baseUrl))
  }

  // Store tokens in database
  await prisma.microsoftToken.upsert({
    where: { userId: state },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      scope: "Calendars.ReadWrite",
    },
    create: {
      userId: state,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      scope: "Calendars.ReadWrite",
    },
  })

  return NextResponse.redirect(new URL("/?calendar_connected=true", baseUrl))
}
