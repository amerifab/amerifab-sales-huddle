"use client"

import { useState, useEffect } from "react"

interface Reminder {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  dollarAmount: number | null
  reminderType: string
  status: string
  calendarSynced: boolean
  emailSentAt: string | null
  customer: { id: string; name: string }
  insight: { id: string; type: string; content: string }
}

interface RemindersListProps {
  customerId?: string
}

const typeColors: Record<string, string> = {
  follow_up: "#3182ce",
  deadline: "#e53e3e",
  meeting: "#38a169",
  quote_expiry: "#d69e2e",
  payment_due: "#805ad5",
  general: "#718096",
}

const typeLabels: Record<string, string> = {
  follow_up: "Follow Up",
  deadline: "Deadline",
  meeting: "Meeting",
  quote_expiry: "Quote Expiry",
  payment_due: "Payment Due",
  general: "General",
}

export function RemindersList({ customerId }: RemindersListProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  useEffect(() => {
    fetchReminders()
  }, [customerId])

  const fetchReminders = async () => {
    try {
      const url = customerId ? `/api/reminders?customerId=${customerId}` : "/api/reminders"
      const res = await fetch(url)
      if (res.ok) {
        setReminders(await res.json())
      }
    } catch (error) {
      console.error("Error fetching reminders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      })
      if (res.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error("Error completing reminder:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return

    try {
      const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error("Error deleting reminder:", error)
    }
  }

  const handleSyncCalendar = async (id: string) => {
    setSyncingId(id)
    try {
      const res = await fetch(`/api/reminders/${id}/sync-calendar`, { method: "POST" })
      const data = await res.json()

      if (res.ok) {
        fetchReminders()
      } else if (data.needsAuth) {
        // Redirect to Microsoft OAuth
        const authRes = await fetch("/api/auth/microsoft")
        const authData = await authRes.json()
        if (authData.authUrl) {
          window.location.href = authData.authUrl
        } else {
          alert("Microsoft calendar integration is not configured.")
        }
      } else {
        alert(data.error || "Failed to sync to calendar")
      }
    } catch (error) {
      console.error("Error syncing to calendar:", error)
      alert("Failed to sync to calendar")
    } finally {
      setSyncingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#718096" }}>
        <p>Loading reminders...</p>
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            background: "#f7fafc",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
            fontSize: "28px",
          }}
        >
          &#128276;
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#4a5568", margin: "0 0 8px 0" }}>
          No Reminders Yet
        </h3>
        <p style={{ fontSize: "14px", color: "#718096", margin: 0, maxWidth: "320px", marginLeft: "auto", marginRight: "auto" }}>
          Reminders are automatically extracted from insights when dates, dollar amounts, or action items are mentioned.
        </p>
      </div>
    )
  }

  const pendingReminders = reminders.filter((r) => r.status !== "completed")
  const completedReminders = reminders.filter((r) => r.status === "completed")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {pendingReminders.map((reminder) => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onSyncCalendar={handleSyncCalendar}
          isSyncing={syncingId === reminder.id}
          formatDate={formatDate}
          formatAmount={formatAmount}
        />
      ))}

      {completedReminders.length > 0 && (
        <>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#718096",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginTop: "16px",
              paddingBottom: "8px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            Completed ({completedReminders.length})
          </div>
          {completedReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onSyncCalendar={handleSyncCalendar}
              isSyncing={syncingId === reminder.id}
              formatDate={formatDate}
              formatAmount={formatAmount}
            />
          ))}
        </>
      )}
    </div>
  )
}

function ReminderCard({
  reminder,
  onComplete,
  onDelete,
  onSyncCalendar,
  isSyncing,
  formatDate,
  formatAmount,
}: {
  reminder: Reminder
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onSyncCalendar: (id: string) => void
  isSyncing: boolean
  formatDate: (date: string) => string
  formatAmount: (amount: number) => string
}) {
  const isCompleted = reminder.status === "completed"
  const isPastDue = reminder.dueDate && new Date(reminder.dueDate) < new Date() && !isCompleted

  return (
    <div
      style={{
        background: isCompleted ? "#f7fafc" : "white",
        borderRadius: "10px",
        padding: "20px",
        border: `1px solid ${isPastDue ? "#fc8181" : "#e2e8f0"}`,
        borderLeft: `4px solid ${typeColors[reminder.reminderType] || "#718096"}`,
        opacity: isCompleted ? 0.7 : 1,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              padding: "4px 8px",
              borderRadius: "4px",
              color: "white",
              background: typeColors[reminder.reminderType] || "#718096",
            }}
          >
            {typeLabels[reminder.reminderType] || reminder.reminderType}
          </span>
          {isPastDue && (
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#e53e3e" }}>PAST DUE</span>
          )}
          {reminder.calendarSynced && (
            <span style={{ fontSize: "11px", color: "#38a169" }} title="Synced to Outlook">
              &#128197; Synced
            </span>
          )}
          {reminder.emailSentAt && (
            <span style={{ fontSize: "11px", color: "#3182ce" }} title="Email sent">
              &#9993; Sent
            </span>
          )}
        </div>
        {reminder.dueDate && (
          <span style={{ fontSize: "13px", color: isPastDue ? "#e53e3e" : "#718096", fontWeight: isPastDue ? 600 : 400 }}>
            {formatDate(reminder.dueDate)}
          </span>
        )}
      </div>

      {/* Title */}
      <h4
        style={{
          margin: "0 0 8px 0",
          fontSize: "16px",
          color: "#1a202c",
          textDecoration: isCompleted ? "line-through" : "none",
        }}
      >
        {reminder.title}
      </h4>

      {/* Description */}
      {reminder.description && (
        <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#4a5568", lineHeight: 1.5 }}>
          {reminder.description}
        </p>
      )}

      {/* Dollar Amount */}
      {reminder.dollarAmount && (
        <p style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 600, color: "#38a169" }}>
          {formatAmount(reminder.dollarAmount)}
        </p>
      )}

      {/* Insight Source */}
      <div
        style={{
          fontSize: "12px",
          color: "#a0aec0",
          padding: "8px 12px",
          background: "#f7fafc",
          borderRadius: "6px",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontWeight: 500 }}>From {reminder.insight.type} insight:</span> &ldquo;
        {reminder.insight.content.length > 100
          ? reminder.insight.content.slice(0, 100) + "..."
          : reminder.insight.content}
        &rdquo;
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {!isCompleted && (
          <>
            <button
              onClick={() => onComplete(reminder.id)}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 500,
                background: "#38a169",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Mark Complete
            </button>
            {reminder.dueDate && !reminder.calendarSynced && (
              <button
                onClick={() => onSyncCalendar(reminder.id)}
                disabled={isSyncing}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 500,
                  background: "white",
                  color: "#3182ce",
                  border: "1px solid #3182ce",
                  borderRadius: "6px",
                  cursor: isSyncing ? "not-allowed" : "pointer",
                  opacity: isSyncing ? 0.6 : 1,
                }}
              >
                {isSyncing ? "Syncing..." : "Add to Calendar"}
              </button>
            )}
          </>
        )}
        <button
          onClick={() => onDelete(reminder.id)}
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: 500,
            background: "white",
            color: "#e53e3e",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
