"use client"

import { useState } from "react"
import { InsightTimeline } from "./InsightTimeline"
import { StatsRow } from "./StatsRow"
import { WholeStory } from "./WholeStory"
import { RemindersList } from "./RemindersList"
import type { CustomerWithInsights } from "@/types"
import { getCustomerDisplayName } from "@/lib/customer-utils"
import { formatRevenue } from "@/lib/utils"

interface CustomerDetailProps {
  customer: CustomerWithInsights
  onEdit: () => void
  onRunCheckIn: () => void
  onAddInsight: () => void
  onDeleteInsight: (id: string) => void
  onExportText: () => void
  onExportJSON: () => void
  currentUserId?: string
  currentUserRole?: string
}

type Tab = "insights" | "reminders" | "story" | "profile" | "export"

export function CustomerDetail({
  customer,
  onEdit,
  onRunCheckIn,
  onAddInsight,
  onDeleteInsight,
  onExportText,
  onExportJSON,
  currentUserId,
  currentUserRole,
}: CustomerDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("insights")

  const tabs: { id: Tab; label: string }[] = [
    { id: "insights", label: "Insights Timeline" },
    { id: "reminders", label: "Reminders" },
    { id: "story", label: "The Whole Story" },
    { id: "profile", label: "Profile" },
    { id: "export", label: "Export" },
  ]

  const buttonStyle = {
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#4a5568",
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "28px 32px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1a365d", margin: "0 0 6px 0" }}>
            {getCustomerDisplayName(customer)}
          </h2>
          <p style={{ fontSize: "14px", color: "#718096", margin: 0 }}>
            {[customer.location, customer.contact].filter(Boolean).join(" • ")}
          </p>
          {customer.revenue && (
            <p style={{ fontSize: "14px", color: "#805ad5", fontWeight: 500, margin: "6px 0 0 0" }}>
              2025 Revenue: {formatRevenue(customer.revenue)}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onEdit} style={buttonStyle}>
            Edit
          </button>
          <button onClick={onRunCheckIn} style={buttonStyle}>
            Run Check-In
          </button>
          <button
            onClick={onAddInsight}
            style={{ ...buttonStyle, background: "#3182ce", color: "white", border: "none" }}
          >
            + Add Insight
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 32px" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "16px 24px",
              fontSize: "14px",
              fontWeight: 500,
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #3182ce" : "2px solid transparent",
              color: activeTab === tab.id ? "#3182ce" : "#718096",
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: "28px 32px" }}>
        {activeTab === "insights" && (
          <>
            <StatsRow insights={customer.insights} />
            <InsightTimeline
              insights={customer.insights}
              onDelete={onDeleteInsight}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          </>
        )}

        {activeTab === "reminders" && <RemindersList customerId={customer.id} currentUserRole={currentUserRole} />}

        {activeTab === "story" && <WholeStory customer={customer} />}

        {activeTab === "profile" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <ProfileSection label="Parent Company" value={customer.parentCompany} />
            <ProfileSection label="Company/Mill Name" value={customer.name} />
            <ProfileSection label="Location" value={customer.location} />
            <ProfileSection label="Primary Contact" value={customer.contact} />
            <ProfileSection label="Assigned Rep" value={customer.rep} />
            <ProfileSection label="Account Type" value={customer.type} />
            <ProfileSection label="2025 Revenue" value={formatRevenue(customer.revenue)} />
            <ProfileSection
              label="Notes"
              value={customer.notes}
              fullWidth
            />
            <ProfileSection
              label="Added"
              value={new Date(customer.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              fullWidth
            />
          </div>
        )}

        {activeTab === "export" && (
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1a202c", margin: "0 0 8px 0" }}>
              Export Customer Dossier
            </h3>
            <p style={{ fontSize: "14px", color: "#718096", margin: "0 0 24px 0" }}>
              Download a complete summary of all insights and profile information for this customer.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onExportText}
                style={{ ...buttonStyle, background: "#3182ce", color: "white", border: "none" }}
              >
                Export as Text
              </button>
              <button onClick={onExportJSON} style={buttonStyle}>
                Export as JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileSection({
  label,
  value,
  fullWidth,
}: {
  label: string
  value: string | null | undefined
  fullWidth?: boolean
}) {
  return (
    <div
      style={{
        background: "#f7fafc",
        borderRadius: "8px",
        padding: "20px",
        gridColumn: fullWidth ? "span 2" : undefined,
      }}
    >
      <h4
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#718096",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          margin: "0 0 10px 0",
        }}
      >
        {label}
      </h4>
      <p style={{ fontSize: "15px", color: "#1a202c", margin: 0 }}>{value || "Not specified"}</p>
    </div>
  )
}
