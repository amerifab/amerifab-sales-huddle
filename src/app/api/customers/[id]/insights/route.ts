import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { updateCustomerStory } from "@/lib/claude"

// Helper to update story in background (non-blocking)
async function updateStoryInBackground(customerId: string, customerName: string, existingStory: string, newInsights: Array<{ type: string; content: string; rep?: string }>) {
  try {
    const updatedStory = await updateCustomerStory({
      customerName,
      existingStory,
      newInsights: newInsights.map(i => ({
        type: i.type,
        content: i.content,
        rep: i.rep,
        date: new Date().toISOString(),
      })),
    })

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        story: updatedStory,
        storyGeneratedAt: new Date(),
      },
    })

    console.log(`Story updated for customer ${customerName}`)
  } catch (error) {
    console.error(`Failed to update story for customer ${customerName}:`, error)
  }
}

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

    let newInsights: Array<{ type: string; content: string; rep?: string }> = []

    // Handle batch insert (from check-in form)
    if (Array.isArray(body.insights)) {
      newInsights = body.insights.map((insight: { type: string; content: string; rep?: string }) => ({
        type: insight.type,
        content: insight.content.trim(),
        rep: insight.rep || null,
      }))

      await prisma.insight.createMany({
        data: newInsights.map(insight => ({
          type: insight.type,
          content: insight.content,
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

      // Auto-update story if one exists (non-blocking)
      if (customer.story && process.env.ANTHROPIC_API_KEY) {
        updateStoryInBackground(customerId, customer.name, customer.story, newInsights)
      }

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

    // Auto-update story if one exists (non-blocking)
    if (customer.story && process.env.ANTHROPIC_API_KEY) {
      updateStoryInBackground(customerId, customer.name, customer.story, [{ type, content: content.trim(), rep }])
    }

    return NextResponse.json(insight, { status: 201 })
  } catch (error) {
    console.error("Error creating insight:", error)
    return NextResponse.json({ error: "Failed to create insight" }, { status: 500 })
  }
}
