import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { deleteCalendarEvent } from "@/lib/microsoft-graph"

// GET /api/reminders/[id] - Get single reminder
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
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

  return NextResponse.json(reminder)
}

// PATCH /api/reminders/[id] - Update reminder (edit, complete, cancel)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { title, description, dueDate, status } = body

  // Verify ownership
  const existing = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
  if (status !== undefined) {
    updateData.status = status
    // Set completedAt when marking as completed
    if (status === "completed" && existing.status !== "completed") {
      updateData.completedAt = new Date()
    }
    // Clear completedAt if un-completing
    if (status !== "completed" && existing.status === "completed") {
      updateData.completedAt = null
    }
  }

  const reminder = await prisma.reminder.update({
    where: { id },
    data: updateData,
    include: {
      customer: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(reminder)
}

// DELETE /api/reminders/[id] - Delete reminder (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only Admin can delete reminders
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only administrators can delete reminders" }, { status: 403 })
  }

  const { id } = await params

  const reminder = await prisma.reminder.findUnique({
    where: { id },
  })

  if (!reminder) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
  }

  // Delete calendar event if synced
  if (reminder.outlookEventId && reminder.calendarSynced) {
    await deleteCalendarEvent(session.user.id, reminder.outlookEventId)
  }

  await prisma.reminder.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
