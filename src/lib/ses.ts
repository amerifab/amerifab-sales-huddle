import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export interface ReminderEmailData {
  to: string
  reminderTitle: string
  reminderDescription: string
  customerName: string
  dueDate?: string
  dollarAmount?: number
  insightContent: string
  reminderUrl: string
}

export async function sendReminderEmail(data: ReminderEmailData): Promise<string | null> {
  const formattedDate = data.dueDate
    ? new Date(data.dueDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No specific date"

  const formattedAmount = data.dollarAmount
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(data.dollarAmount)
    : null

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a202c; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a365d; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f7fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .reminder-box { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #3182ce; }
    .label { font-size: 11px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font-size: 15px; color: #1a202c; margin-top: 4px; }
    .cta { display: inline-block; background: #3182ce; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
    .footer { padding: 20px; font-size: 12px; color: #718096; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px;">AmeriFab Sales Huddle</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">Reminder: ${data.reminderTitle}</p>
    </div>
    <div class="content">
      <div class="reminder-box">
        <div class="label">Customer</div>
        <div class="value">${data.customerName}</div>
      </div>

      <div class="reminder-box">
        <div class="label">Due Date</div>
        <div class="value">${formattedDate}</div>
      </div>

      ${
        formattedAmount
          ? `
      <div class="reminder-box">
        <div class="label">Amount</div>
        <div class="value">${formattedAmount}</div>
      </div>
      `
          : ""
      }

      <div class="reminder-box">
        <div class="label">Context</div>
        <div class="value">${data.reminderDescription}</div>
      </div>

      <div class="reminder-box">
        <div class="label">Original Insight</div>
        <div class="value" style="font-style: italic;">"${data.insightContent}"</div>
      </div>

      <a href="${data.reminderUrl}" class="cta">View in Sales Huddle</a>
    </div>
    <div class="footer">
      This reminder was automatically extracted from your sales insight.<br>
      AmeriFab Inc. Customer Dossier Tracker
    </div>
  </div>
</body>
</html>`

  const textBody = `
AmeriFab Sales Huddle - Reminder

${data.reminderTitle}

Customer: ${data.customerName}
Due Date: ${formattedDate}
${formattedAmount ? `Amount: ${formattedAmount}` : ""}

Context:
${data.reminderDescription}

Original Insight:
"${data.insightContent}"

View in Sales Huddle: ${data.reminderUrl}
---
This reminder was automatically extracted from your sales insight.
AmeriFab Inc. Customer Dossier Tracker
`

  try {
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [data.to],
      },
      Message: {
        Body: {
          Html: { Charset: "UTF-8", Data: htmlBody },
          Text: { Charset: "UTF-8", Data: textBody },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Reminder: ${data.reminderTitle} - ${data.customerName}`,
        },
      },
      Source: process.env.SES_FROM_EMAIL || "noreply@amerifab.com",
    })

    const response = await sesClient.send(command)
    return response.MessageId || null
  } catch (error) {
    console.error("Failed to send reminder email:", error)
    return null
  }
}
