import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { updateCustomerStory } from "@/lib/claude"
import { extractRemindersFromInsight } from "@/lib/claude-reminders"
import { sendReminderEmail } from "@/lib/ses"
import { createCalendarEvent, getValidAccessToken } from "@/lib/microsoft-graph"

// Helper to process reminders in background (non-blocking)
async function processRemindersInBackground(
  insightId: string,
  insightContent: string,
  insightType: string,
  customerId: string,
  customerName: string,
  userId: string,
  userEmail: string
) {
  try {
    // Step 1: Extract reminders using Claude
    const currentDate = new Date().toISOString().split("T")[0]
    const extraction = await extractRemindersFromInsight(insightContent, insightType, customerName, currentDate)

    if (!extraction.hasReminders || extraction.reminders.length === 0) {
      console.log(`No reminders extracted for insight ${insightId}`)
      return
    }

    console.log(`Extracted ${extraction.reminders.length} reminder(s) for insight ${insightId}`)

    const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || ""

    // Step 2: Create reminder records
    for (const extracted of extraction.reminders) {
      const reminder = await prisma.reminder.create({
        data: {
          title: extracted.title,
          description: extracted.description,
          dueDate: extracted.dueDate ? new Date(extracted.dueDate) : null,
          dollarAmount: extracted.dollarAmount,
          reminderType: extracted.reminderType,
          status: "pending",
          insightId,
          userId,
          customerId,
        },
      })

      // Step 3: Send email notification
      if (process.env.AWS_ACCESS_KEY_ID && process.env.SES_FROM_EMAIL) {
        const messageId = await sendReminderEmail({
          to: userEmail,
          reminderTitle: extracted.title,
          reminderDescription: extracted.description,
          customerName,
          dueDate: extracted.dueDate || undefined,
          dollarAmount: extracted.dollarAmount || undefined,
          insightContent,
          reminderUrl: `${baseUrl}?customer=${customerId}`,
        })

        if (messageId) {
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: {
              emailSentAt: new Date(),
              emailMessageId: messageId,
              status: "sent",
            },
          })
          console.log(`Email sent for reminder ${reminder.id}`)
        }
      }

      // Step 4: Auto-sync to calendar if user has Microsoft connected and reminder has date
      if (extracted.dueDate) {
        const hasToken = await getValidAccessToken(userId)
        if (hasToken) {
          const eventResult = await createCalendarEvent(userId, {
            subject: `${extracted.title} - ${customerName}`,
            body: {
              contentType: "HTML",
              content: `<p>${extracted.description}</p><p><em>From insight: "${insightContent}"</em></p>`,
            },
            start: {
              dateTime: new Date(extracted.dueDate).toISOString(),
              timeZone: "America/Chicago",
            },
            end: {
              dateTime: new Date(new Date(extracted.dueDate).getTime() + 30 * 60 * 1000).toISOString(),
              timeZone: "America/Chicago",
            },
            reminderMinutesBeforeStart: 60,
          })

          if (eventResult) {
            await prisma.reminder.update({
              where: { id: reminder.id },
              data: {
                outlookEventId: eventResult.eventId,
                calendarSynced: true,
              },
            })
            console.log(`Calendar event created for reminder ${reminder.id}`)
          }
        }
      }
    }

    console.log(`Reminder processing complete for insight ${insightId}`)
  } catch (error) {
    console.error(`Failed to process reminders for insight ${insightId}:`, error)
  }
}

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

      // Fetch and return the updated customer with new insights
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

      // Process reminders for batch insights (non-blocking)
      if (process.env.ANTHROPIC_API_KEY && updatedCustomer?.insights) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true },
        })

        if (user?.email) {
          // Get the IDs of newly created insights (they're at the top, ordered by date desc)
          const newInsightRecords = updatedCustomer.insights.slice(0, newInsights.length)
          for (const insightRecord of newInsightRecords) {
            processRemindersInBackground(
              insightRecord.id,
              insightRecord.content,
              insightRecord.type,
              customerId,
              customer.name,
              session.user.id,
              user.email
            )
          }
        }
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

    // Process reminders for single insight (non-blocking)
    if (process.env.ANTHROPIC_API_KEY) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true },
      })

      if (user?.email) {
        processRemindersInBackground(
          insight.id,
          content.trim(),
          type,
          customerId,
          customer.name,
          session.user.id,
          user.email
        )
      }
    }

    return NextResponse.json(insight, { status: 201 })
  } catch (error) {
    console.error("Error creating insight:", error)
    return NextResponse.json({ error: "Failed to create insight" }, { status: 500 })
  }
}
