"use client"

import { useState, useEffect } from "react"
import { Modal } from "./ui"
import { REPS, ACCOUNT_TYPES, type CustomerWithInsights } from "@/types"

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CustomerFormData) => void
  editingCustomer?: CustomerWithInsights | null
}

export interface CustomerFormData {
  name: string
  location: string
  contact: string
  rep: string
  type: string
  notes: string
}

const repOptions = [
  { value: "", label: "Select Rep..." },
  ...REPS.map((rep) => ({ value: rep, label: rep })),
]

const typeOptions = ACCOUNT_TYPES.map((type) => ({ value: type, label: type }))

export function AddCustomerModal({
  isOpen,
  onClose,
  onSave,
  editingCustomer,
}: AddCustomerModalProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    location: "",
    contact: "",
    rep: "",
    type: "Key Account",
    notes: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name,
        location: editingCustomer.location || "",
        contact: editingCustomer.contact || "",
        rep: editingCustomer.rep || "",
        type: editingCustomer.type,
        notes: editingCustomer.notes || "",
      })
    } else {
      setFormData({
        name: "",
        location: "",
        contact: "",
        rep: "",
        type: "Key Account",
        notes: "",
      })
    }
    setError("")
  }, [editingCustomer, isOpen])

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError("Please enter a company name")
      return
    }
    onSave(formData)
  }

  const isEditing = !!editingCustomer

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: "#4a5568",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "8px",
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    background: "white",
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
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    minHeight: "100px",
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Customer" : "Add New Customer"}
      size="md"
    >
      <div style={{ padding: "28px 32px" }}>
        {/* Company Name */}
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Company Name *</label>
          <input
            type="text"
            placeholder="e.g., Nucor Steel"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              ...inputStyle,
              border: error && !formData.name.trim() ? "2px solid #e53e3e" : "2px solid #e2e8f0",
            }}
          />
          {error && !formData.name.trim() && (
            <p style={{ color: "#e53e3e", fontSize: "13px", marginTop: "6px" }}>{error}</p>
          )}
        </div>

        {/* Location and Contact */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={labelStyle}>Location</label>
            <input
              type="text"
              placeholder="e.g., Charlotte, NC"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Primary Contact</label>
            <input
              type="text"
              placeholder="e.g., John Smith"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Rep and Account Type */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={labelStyle}>Assigned Rep</label>
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
          <div>
            <label style={labelStyle}>Account Type</label>
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
        </div>

        {/* Notes */}
        <div>
          <label style={labelStyle}>Initial Notes</label>
          <textarea
            placeholder="Any initial context about this customer..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            style={textareaStyle}
          />
        </div>
      </div>

      {/* Footer */}
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
          {isEditing ? "Save Changes" : "Add Customer"}
        </button>
      </div>
    </Modal>
  )
}
