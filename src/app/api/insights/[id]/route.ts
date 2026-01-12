import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// DELETE /api/insights/[id] - Delete an insight
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get the insight to check permissions
    const insight = await prisma.insight.findUnique({
      where: { id },
    })

    if (!insight) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 })
    }

    // Check if user can delete this insight
    // REPs can only delete their own insights
    // MANAGER and ADMIN can delete any insight
    const userRole = session.user.role
    const isOwner = insight.createdBy === session.user.id

    if (userRole === "REP" && !isOwner) {
      return NextResponse.json(
        { error: "You can only delete your own insights" },
        { status: 403 }
      )
    }

    await prisma.insight.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting insight:", error)
    return NextResponse.json({ error: "Failed to delete insight" }, { status: 500 })
  }
}
