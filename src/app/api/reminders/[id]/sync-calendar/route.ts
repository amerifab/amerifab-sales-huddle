import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { createCalendarEvent, getValidAccessToken } from "@/lib/microsoft-graph"

// POST /api/reminders/[id]/sync-calendar - Sync reminder to Outlook calendar
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Check if user has Microsoft token
  const hasToken = await getValidAccessToken(session.user.id)
  if (!hasToken) {
    return NextResponse.json(
      { error: "Microsoft calendar not connected", needsAuth: true },
      { status: 400 }
    )
  }

  const reminder = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
    include: {
      customer: true,
      insight: true,
    },
  })

  if (!reminder) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
  }

  if (!reminder.dueDate) {
    return NextResponse.json({ error: "Cannot sync reminder without a due date" }, { status: 400 })
  }

  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || ""

  // Create calendar event
  const eventResult = await createCalendarEvent(session.user.id, {
    subject: `${reminder.title} - ${reminder.customer.name}`,
    body: {
      contentType: "HTML",
      content: `
        <h3>${reminder.title}</h3>
        <p><strong>Customer:</strong> ${reminder.customer.name}</p>
        <p><strong>Context:</strong> ${reminder.description || "No description"}</p>
        ${reminder.dollarAmount ? `<p><strong>Amount:</strong> $${reminder.dollarAmount.toLocaleString()}</p>` : ""}
        <hr>
        <p><em>Original Insight:</em> "${reminder.insight.content}"</p>
        <p><a href="${baseUrl}?customer=${reminder.customerId}">View in Sales Huddle</a></p>
      `,
    },
    start: {
      dateTime: reminder.dueDate.toISOString(),
      timeZone: "America/Chicago",
    },
    end: {
      dateTime: new Date(reminder.dueDate.getTime() + 30 * 60 * 1000).toISOString(),
      timeZone: "America/Chicago",
    },
    reminderMinutesBeforeStart: 60,
  })

  if (!eventResult) {
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 })
  }

  // Update reminder with calendar info
  const updated = await prisma.reminder.update({
    where: { id },
    data: {
      outlookEventId: eventResult.eventId,
      calendarSynced: true,
    },
  })

  return NextResponse.json(updated)
}
