import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()

    return NextResponse.json({
      status: "ok",
      database: "connected",
      userCount,
      env: {
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasAuthUrl: !!process.env.AUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        authTrustHost: process.env.AUTH_TRUST_HOST,
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      env: {
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasAuthUrl: !!process.env.AUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        authTrustHost: process.env.AUTH_TRUST_HOST,
      }
    }, { status: 500 })
  }
}
