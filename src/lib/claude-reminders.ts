import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ExtractedReminder {
  title: string
  description: string
  dueDate: string | null
  dollarAmount: number | null
  reminderType: "follow_up" | "deadline" | "meeting" | "quote_expiry" | "payment_due" | "general"
  confidence: number
}

export interface ExtractionResult {
  hasReminders: boolean
  reminders: ExtractedReminder[]
  reasoning: string
}

export async function extractRemindersFromInsight(
  insightContent: string,
  insightType: string,
  customerName: string,
  currentDate: string
): Promise<ExtractionResult> {
  const prompt = `You are an AI assistant helping AmeriFab Inc. sales reps extract actionable reminders from their customer insights.

CURRENT DATE: ${currentDate}
CUSTOMER: ${customerName}
INSIGHT TYPE: ${insightType}
INSIGHT CONTENT:
"""
${insightContent}
"""

TASK: Analyze this insight and extract any actionable reminders that should be tracked. Look for:

1. **Dates/Deadlines**: Specific dates, relative dates ("next week", "in 30 days", "Q2"), or time-sensitive commitments
2. **Dollar Amounts**: Quotes, budgets, contract values, payment amounts
3. **Follow-up Actions**: Commitments to call back, send information, schedule meetings
4. **Operational Facts**: Equipment delivery dates, project milestones, decision timelines

RESPONSE FORMAT (JSON only):
{
  "hasReminders": boolean,
  "reminders": [
    {
      "title": "Brief action-oriented title (max 60 chars)",
      "description": "Full context including relevant details from the insight",
      "dueDate": "ISO 8601 date string or null if no specific date",
      "dollarAmount": number or null,
      "reminderType": "follow_up" | "deadline" | "meeting" | "quote_expiry" | "payment_due" | "general",
      "confidence": 0.0 to 1.0
    }
  ],
  "reasoning": "Brief explanation of what was extracted and why"
}

RULES:
- Only extract genuinely actionable items with clear timing or importance
- For relative dates, calculate the actual date from CURRENT DATE
- If a date is ambiguous (e.g., "soon"), use null for dueDate but still create reminder if actionable
- Set confidence based on how explicit the information is (explicit date = 0.9+, inferred = 0.5-0.8)
- If no actionable reminders exist, return hasReminders: false with empty reminders array
- Dollar amounts should be numeric without currency symbols
- Titles should start with a verb (Follow up, Send, Call, Review, etc.)

Return ONLY valid JSON, no markdown or explanation outside the JSON.`

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const textBlock = message.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return { hasReminders: false, reminders: [], reasoning: "No response from AI" }
    }

    // Parse JSON response, handling potential markdown code blocks
    let jsonStr = textBlock.text.trim()
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7)
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3)
    }

    const result = JSON.parse(jsonStr.trim()) as ExtractionResult

    // Validate and sanitize the response
    return {
      hasReminders: result.hasReminders ?? false,
      reminders: (result.reminders ?? []).filter(
        (r) => r.title && r.reminderType && r.confidence >= 0.5
      ),
      reasoning: result.reasoning ?? "",
    }
  } catch (error) {
    console.error("Failed to extract reminders from insight:", error)
    return { hasReminders: false, reminders: [], reasoning: "Extraction failed" }
  }
}
