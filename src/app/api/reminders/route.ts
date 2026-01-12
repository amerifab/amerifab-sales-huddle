import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// GET /api/reminders - List user's reminders
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")
  const customerId = searchParams.get("customerId")

  const where: Record<string, unknown> = { userId: session.user.id }
  if (status) where.status = status
  if (customerId) where.customerId = customerId

  const reminders = await prisma.reminder.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true } },
      insight: { select: { id: true, type: true, content: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(reminders)
}
