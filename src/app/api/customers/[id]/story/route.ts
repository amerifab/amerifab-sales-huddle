import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { generateCustomerStory } from "@/lib/claude"

// GET /api/customers/[id]/story - Get saved story
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        story: true,
        storyGeneratedAt: true,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({
      story: customer.story,
      generatedAt: customer.storyGeneratedAt,
    })
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
  }
}

// POST /api/customers/[id]/story - Generate and save customer story
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        insights: {
          orderBy: { date: "desc" },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key-here") {
      return NextResponse.json(
        { error: "Claude API key not configured. Please add your ANTHROPIC_API_KEY to .env" },
        { status: 500 }
      )
    }

    const story = await generateCustomerStory({
      name: customer.name,
      location: customer.location || undefined,
      contact: customer.contact || undefined,
      rep: customer.rep || undefined,
      type: customer.type,
      notes: customer.notes || undefined,
      insights: customer.insights.map((i) => ({
        type: i.type,
        content: i.content,
        rep: i.rep || undefined,
        date: i.date.toISOString(),
      })),
    })

    // Save the story to the database
    await prisma.customer.update({
      where: { id },
      data: {
        story,
        storyGeneratedAt: new Date(),
      },
    })

    return NextResponse.json({ story, generatedAt: new Date() })
  } catch (error) {
    console.error("Error generating story:", error)
    return NextResponse.json(
      { error: "Failed to generate story. Please check your API key and try again." },
      { status: 500 }
    )
  }
}
