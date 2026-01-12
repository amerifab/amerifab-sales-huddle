"use client"

import { formatDate } from "@/lib/utils"
import { INSIGHT_TYPE_CONFIG, type InsightData } from "@/types"

interface InsightTimelineProps {
  insights: InsightData[]
  onDelete: (id: string) => void
  currentUserId?: string
  currentUserRole?: string
}

export function InsightTimeline({ insights, onDelete, currentUserId, currentUserRole }: InsightTimelineProps) {
  if (insights.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#718096" }}>
        <p>No insights recorded yet. Start building the dossier!</p>
      </div>
    )
  }

  // Sort by date, newest first
  const sortedInsights = [...insights].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {sortedInsights.map((insight) => (
        <InsightCard
          key={insight.id}
          insight={insight}
          onDelete={onDelete}
          canDelete={
            currentUserRole === "ADMIN" ||
            currentUserRole === "MANAGER" ||
            insight.createdBy === currentUserId
          }
        />
      ))}
    </div>
  )
}

function InsightCard({
  insight,
  onDelete,
  canDelete,
}: {
  insight: InsightData
  onDelete: (id: string) => void
  canDelete?: boolean
}) {
  const typeConfig = INSIGHT_TYPE_CONFIG[insight.type as keyof typeof INSIGHT_TYPE_CONFIG] || {
    label: insight.type,
    color: "#3182ce",
  }

  const borderColors: Record<string, string> = {
    context: "#2c5282",
    need: "#d69e2e",
    action: "#38a169",
    dossier: "#1a365d",
  }

  const bgColors: Record<string, string> = {
    context: "#2c5282",
    need: "#d69e2e",
    action: "#38a169",
    dossier: "#1a365d",
  }

  return (
    <div
      style={{
        background: "#f7fafc",
        borderRadius: "10px",
        padding: "24px",
        borderLeft: `4px solid ${borderColors[insight.type] || "#3182ce"}`,
        position: "relative",
      }}
    >
      {canDelete && (
        <button
          onClick={() => {
            if (confirm("Delete this insight?")) {
              onDelete(insight.id)
            }
          }}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "#a0aec0",
            fontSize: "20px",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#e53e3e")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#a0aec0")}
        >
          &times;
        </button>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", paddingRight: canDelete ? "32px" : "0" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            padding: "6px 12px",
            borderRadius: "4px",
            color: "white",
            background: bgColors[insight.type] || "#3182ce",
          }}
        >
          {typeConfig.label}
        </span>
        <span style={{ fontSize: "13px", color: "#718096" }}>
          {formatDate(insight.date)}
        </span>
      </div>

      <p style={{ fontSize: "15px", color: "#1a202c", lineHeight: 1.7, margin: 0 }}>{insight.content}</p>

      {insight.rep && (
        <p style={{ marginTop: "14px", fontSize: "14px", color: "#718096" }}>— {insight.rep}</p>
      )}
    </div>
  )
}
