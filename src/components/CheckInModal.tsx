"use client"

import { useState, useEffect } from "react"
import { Modal } from "./ui"
import { getWeekStart } from "@/lib/utils"

interface CheckInModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (notes: CheckInNotes) => void
  defaultRep?: string
  customerName?: string
}

export interface CheckInNotes {
  week: string
  rep: string
  notes1: string
  notes2: string
  notes3: string
  notes4: string
}

const questions = [
  {
    id: 1,
    title: "Customer Context Check",
    purpose:
      "Forces you to think like a GM at the customer's company, not just a vendor. Understanding their world—expansions, maintenance headaches, cost pressures—reveals where AmeriFab can add real value.",
    outcome:
      "Identify 1-2 key business dynamics at the customer that have nothing to do with current quotes. This builds strategic awareness and opens doors for proactive solutions.",
    placeholder:
      "Pick one key account you're engaging this week. What's happening in their business right now that has nothing to do with us?",
  },
  {
    id: 2,
    title: "The Unstated Need",
    purpose:
      "Trains you to listen for pain that isn't in an RFQ—the inefficiency they're working around, the risk they're tolerating, the upgrade they've been postponing. This is where differentiation lives.",
    outcome:
      "Articulate a hypothesis about what the customer needs but hasn't explicitly asked for. Over time, these become validated insights that drive larger, stickier deals.",
    placeholder: "What do you think they need that they haven't asked for yet?",
  },
  {
    id: 3,
    title: "This Week's Move",
    purpose:
      'Shifts focus from "advance the deal" to "make their situation better." Sometimes that\'s a proposal, sometimes a technical resource, sometimes just useful information with no strings attached.',
    outcome:
      "Commit to one specific action that serves the customer's interests. This creates accountability and ensures every week includes at least one genuinely helpful touchpoint.",
    placeholder:
      "What's one thing you can do this week to make their life easier or their decision clearer?",
  },
  {
    id: 4,
    title: "The Dossier Update",
    purpose:
      'Builds institutional memory. A single insight—"Charter Steel Kankakee team frustrated with hood maintenance cycle times"—captured consistently becomes strategic advantage over months and years.',
    outcome:
      "One durable piece of information that gets recorded in the customer dossier. These compound into genuine competitive intelligence that informs proposals and strategy.",
    placeholder: "What did you learn last week that we should remember forever?",
  },
]

export function CheckInModal({
  isOpen,
  onClose,
  onSave,
  defaultRep,
  customerName,
}: CheckInModalProps) {
  const [formData, setFormData] = useState<CheckInNotes>({
    week: getWeekStart(),
    rep: defaultRep || "",
    notes1: "",
    notes2: "",
    notes3: "",
    notes4: "",
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({
        week: getWeekStart(),
        rep: defaultRep || "",
        notes1: "",
        notes2: "",
        notes3: "",
        notes4: "",
      })
    }
  }, [isOpen, defaultRep])

  const handleSave = () => {
    const hasNotes =
      formData.notes1.trim() ||
      formData.notes2.trim() ||
      formData.notes3.trim() ||
      formData.notes4.trim()

    if (!hasNotes) {
      alert("No notes to save. Please fill in at least one field.")
      return
    }

    if (!customerName) {
      alert("Please select a customer first to save insights to their dossier.")
      return
    }

    onSave(formData)
  }

  const inputStyle = {
    padding: "10px 14px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "6px",
    color: "white",
    fontSize: "14px",
    width: "140px",
    outline: "none",
  }

  const buttonStyle = {
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#4a5568",
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a365d 0%, #2c5282 100%)",
          padding: "32px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: 700, color: "white", margin: "0 0 6px 0" }}>
            Know Before You Go
          </h2>
          <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)" }}>Weekly Sales Check-In</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>Week of:</span>
            <input
              type="text"
              value={formData.week}
              onChange={(e) => setFormData({ ...formData, week: e.target.value })}
              style={inputStyle}
              placeholder="MM/DD/YYYY"
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>Rep:</span>
            <input
              type="text"
              value={formData.rep}
              onChange={(e) => setFormData({ ...formData, rep: e.target.value })}
              style={inputStyle}
              placeholder="Name"
            />
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.7)",
            fontSize: "28px",
            cursor: "pointer",
          }}
        >
          &times;
        </button>
      </div>

      {/* Core Question */}
      <div
        style={{
          background: "#edf2f7",
          padding: "20px 36px",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            background: "#3182ce",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: "18px",
            flexShrink: 0,
          }}
        >
          ?
        </div>
        <div>
          <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#1a202c", margin: "0 0 6px 0" }}>
            THE CORE QUESTION
          </h4>
          <p style={{ fontSize: "15px", color: "#4a5568", fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>
            "What's the most important thing happening in your customer's world right now—and how
            does that change what you do this week?"
          </p>
        </div>
      </div>

      {/* Questions */}
      <div style={{ padding: "28px 36px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {questions.map((q, index) => (
          <div
            key={q.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#2c5282",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  background: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2c5282",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                {q.id}
              </div>
              <span style={{ color: "white", fontWeight: 600, fontSize: "15px" }}>{q.title}</span>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div style={{ background: "#f7fafc", borderRadius: "8px", padding: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#3182ce", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                    Purpose
                  </div>
                  <p style={{ fontSize: "13px", color: "#4a5568", lineHeight: 1.6, margin: 0 }}>{q.purpose}</p>
                </div>
                <div style={{ background: "#f7fafc", borderRadius: "8px", padding: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#38a169", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                    Outcome
                  </div>
                  <p style={{ fontSize: "13px", color: "#4a5568", lineHeight: 1.6, margin: 0 }}>{q.outcome}</p>
                </div>
              </div>
              <div style={{ background: "#edf2f7", borderRadius: "8px", padding: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                  Notes
                </div>
                <textarea
                  value={
                    index === 0
                      ? formData.notes1
                      : index === 1
                      ? formData.notes2
                      : index === 2
                      ? formData.notes3
                      : formData.notes4
                  }
                  onChange={(e) => {
                    const key = `notes${index + 1}` as keyof CheckInNotes
                    setFormData({ ...formData, [key]: e.target.value })
                  }}
                  placeholder={q.placeholder}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: "14px",
                    color: "#1a202c",
                    resize: "none",
                    minHeight: "70px",
                    lineHeight: 1.6,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          background: "#f7fafc",
          padding: "20px 36px",
          textAlign: "center",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: 500, color: "#4a5568", margin: "0 0 4px 0" }}>
          AmeriFab Inc. • Building Customer Dossiers Through Curiosity
        </p>
        <p style={{ fontSize: "12px", color: "#718096", margin: 0 }}>
          "The difference between transactional and customer-obsessed is structured curiosity."
        </p>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: "20px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <p style={{ fontSize: "14px", color: "#718096", margin: 0 }}>
          &#128161; Use Ctrl/Cmd + P to print this form
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => window.print()} style={buttonStyle}>
            &#128424; Print
          </button>
          <button
            onClick={handleSave}
            style={{ ...buttonStyle, background: "#3182ce", color: "white", border: "none" }}
          >
            Save All Insights to Dossier
          </button>
        </div>
      </div>
    </Modal>
  )
}
