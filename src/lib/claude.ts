import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface CustomerInsight {
  type: string
  content: string
  rep?: string
  date: string
}

interface CustomerData {
  name: string
  parentCompany?: string | null
  location?: string
  contact?: string
  rep?: string
  type: string
  notes?: string
  insights: CustomerInsight[]
}

export async function generateCustomerStory(customer: CustomerData): Promise<string> {
  const insightsByType = {
    context: customer.insights.filter((i) => i.type === "context"),
    need: customer.insights.filter((i) => i.type === "need"),
    action: customer.insights.filter((i) => i.type === "action"),
    dossier: customer.insights.filter((i) => i.type === "dossier"),
  }

  const formatInsights = (insights: CustomerInsight[]) =>
    insights.map((i) => `- ${i.content} (${i.rep || "Unknown"}, ${new Date(i.date).toLocaleDateString()})`).join("\n")

  // Generate display name for the customer
  const displayName = customer.parentCompany
    ? `${customer.parentCompany} - ${customer.name}`
    : customer.name

  const prompt = `You are a strategic sales analyst helping AmeriFab Inc., a steel fabrication company, understand their customers deeply. Your goal is to synthesize customer intelligence into an actionable narrative.

CUSTOMER PROFILE:
- Company: ${displayName}${customer.parentCompany ? `\n- Parent Company: ${customer.parentCompany}\n- Site/Mill: ${customer.name}` : ""}
- Location: ${customer.location || "Unknown"}
- Primary Contact: ${customer.contact || "Unknown"}
- Assigned Rep: ${customer.rep || "Unassigned"}
- Account Type: ${customer.type}
- General Notes: ${customer.notes || "None"}

GATHERED INTELLIGENCE:

Customer Context (What's happening in their world):
${insightsByType.context.length > 0 ? formatInsights(insightsByType.context) : "No context insights recorded yet."}

Unstated Needs (Pain points they haven't explicitly asked us to solve):
${insightsByType.need.length > 0 ? formatInsights(insightsByType.need) : "No unstated needs identified yet."}

Actions Taken (How we've helped them):
${insightsByType.action.length > 0 ? formatInsights(insightsByType.action) : "No actions recorded yet."}

Dossier Updates (Key facts to remember):
${insightsByType.dossier.length > 0 ? formatInsights(insightsByType.dossier) : "No dossier updates yet."}

---

Using Amazon's Customer Obsession leadership principle as your guide ("Leaders start with the customer and work backwards. They work vigorously to earn and keep customer trust. Although leaders pay attention to competitors, they obsess over customers."), write "The Whole Story" for this customer.

Structure your response as follows:

## Who They Are
A brief narrative about this customer - their business, their situation, and what matters to them.

## Their World Right Now
What's happening in their business environment? What pressures, opportunities, or changes are they facing?

## The Pain We Can Address
Based on both stated and unstated needs, what problems can AmeriFab help solve? Be specific about the pain points.

## Our Opportunity to Obsess
How can we demonstrate customer obsession? What would "working backwards from the customer" look like for this account? Include specific, actionable recommendations.

## The Trust-Building Path
What concrete steps should we take to earn and deepen their trust? Prioritize 2-3 immediate actions.

Write in a professional but warm tone. Be specific and actionable. If there's limited intelligence, acknowledge gaps and suggest what we need to learn.`

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const textBlock = message.content.find((block) => block.type === "text")
  return textBlock ? textBlock.text : "Unable to generate story."
}

interface UpdateStoryData {
  customerName: string
  parentCompany?: string | null
  existingStory: string
  newInsights: CustomerInsight[]
}

export async function updateCustomerStory(data: UpdateStoryData): Promise<string> {
  const formatInsights = (insights: CustomerInsight[]) =>
    insights.map((i) => `- [${i.type.toUpperCase()}] ${i.content} (${i.rep || "Unknown"}, ${new Date(i.date).toLocaleDateString()})`).join("\n")

  // Generate display name for the customer
  const displayName = data.parentCompany
    ? `${data.parentCompany} - ${data.customerName}`
    : data.customerName

  const prompt = `You are a strategic sales analyst helping AmeriFab Inc. maintain customer intelligence narratives.

CUSTOMER: ${displayName}

EXISTING STORY:
${data.existingStory}

---

NEW INSIGHTS ADDED:
${formatInsights(data.newInsights)}

---

Please revise "The Whole Story" above to incorporate these new insights.

IMPORTANT GUIDELINES:
- Preserve the existing narrative structure and flow
- Weave in the new information naturally where it fits best
- Update relevant sections based on the insight type (context, need, action, or dossier)
- Don't just append - integrate the new insights thoughtfully
- If new insights contradict or update old information, reflect the current state
- Keep the same section headers (Who They Are, Their World Right Now, The Pain We Can Address, Our Opportunity to Obsess, The Trust-Building Path)
- Maintain the professional but warm tone

Return the complete updated story with all sections.`

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const textBlock = message.content.find((block) => block.type === "text")
  return textBlock ? textBlock.text : "Unable to update story."
}
