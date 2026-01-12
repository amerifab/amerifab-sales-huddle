import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

// GET /api/customers - List all customers with insights
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    let customers

    if (query) {
      customers = await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { location: { contains: query } },
            { rep: { contains: query } },
            {
              insights: {
                some: {
                  content: { contains: query },
                },
              },
            },
          ],
        },
        include: {
          insights: {
            orderBy: { date: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      customers = await prisma.customer.findMany({
        include: {
          insights: {
            orderBy: { date: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, location, contact, rep, type, notes } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        location: location?.trim() || null,
        contact: contact?.trim() || null,
        rep: rep || null,
        type: type || "Key Account",
        notes: notes?.trim() || null,
      },
      include: {
        insights: true,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
