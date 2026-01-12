"use client"

import { useState, useEffect } from "react"
import { Modal } from "./ui"
import { REPS } from "@/types"

interface AddInsightModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: InsightFormData) => void
  defaultRep?: string
}

export interface InsightFormData {
  type: string
  rep: string
  content: string
}

const typeOptions = [
  { value: "context", label: "Customer Context" },
  { value: "need", label: "Unstated Need" },
  { value: "action", label: "Action Taken" },
  { value: "dossier", label: "Dossier Update" },
]

const repOptions = [
  { value: "", label: "Select Rep..." },
  ...REPS.map((rep) => ({ value: rep, label: rep })),
]

export function AddInsightModal({
  isOpen,
  onClose,
  onSave,
  defaultRep,
}: AddInsightModalProps) {
  const [formData, setFormData] = useState<InsightFormData>({
    type: "context",
    rep: defaultRep || "",
    content: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: "context",
        rep: defaultRep || "",
        content: "",
      })
      setError("")
    }
  }, [isOpen, defaultRep])

  const handleSubmit = () => {
    if (!formData.content.trim()) {
      setError("Please enter the insight")
      return
    }
    onSave(formData)
  }

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: "#4a5568",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "8px",
  }

  const selectStyle = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    background: "white",
    cursor: "pointer",
  }

  const textareaStyle = {
    width: "100%",
    padding: "14px 16px",
    fontSize: "15px",
    border: error && !formData.content.trim() ? "2px solid #e53e3e" : "2px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    minHeight: "120px",
    resize: "vertical" as const,
    lineHeight: 1.6,
  }

  const buttonStyle = {
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Insight" size="md">
      <div style={{ padding: "28px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
          <div>
            <label style={labelStyle}>Insight Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={selectStyle}
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Rep</label>
            <select
              value={formData.rep}
              onChange={(e) => setFormData({ ...formData, rep: e.target.value })}
              style={selectStyle}
            >
              {repOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Insight *</label>
          <textarea
            placeholder="What did you learn? What did you observe? What action did you take?"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            style={textareaStyle}
          />
          {error && !formData.content.trim() && (
            <p style={{ color: "#e53e3e", fontSize: "13px", marginTop: "6px" }}>{error}</p>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          padding: "20px 32px",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <button
          onClick={onClose}
          style={{ ...buttonStyle, background: "white", border: "1px solid #e2e8f0", color: "#4a5568" }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{ ...buttonStyle, background: "#3182ce", border: "none", color: "white" }}
        >
          Save Insight
        </button>
      </div>
    </Modal>
  )
}
