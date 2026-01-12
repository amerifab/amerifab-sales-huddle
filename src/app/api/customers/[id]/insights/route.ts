import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// POST /api/customers/[id]/insights - Add insight(s) to a customer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: customerId } = await params
    const body = await request.json()

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Handle batch insert (from check-in form)
    if (Array.isArray(body.insights)) {
      const insights = await prisma.insight.createMany({
        data: body.insights.map((insight: { type: string; content: string; rep?: string }) => ({
          type: insight.type,
          content: insight.content.trim(),
          rep: insight.rep || null,
          customerId,
          createdBy: session.user.id,
          date: new Date(),
        })),
      })

      // Fetch and return the updated customer
      const updatedCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          insights: {
            orderBy: { date: "desc" },
          },
        },
      })

      return NextResponse.json(updatedCustomer, { status: 201 })
    }

    // Single insight
    const { type, content, rep } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 })
    }

    const insight = await prisma.insight.create({
      data: {
        type,
        content: content.trim(),
        rep: rep || null,
        customerId,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(insight, { status: 201 })
  } catch (error) {
    console.error("Error creating insight:", error)
    return NextResponse.json({ error: "Failed to create insight" }, { status: 500 })
  }
}
