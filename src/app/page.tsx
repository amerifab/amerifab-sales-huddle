"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Header,
  Sidebar,
  CustomerDetail,
  AddCustomerModal,
  AddInsightModal,
  CheckInModal,
  type CustomerFormData,
  type InsightFormData,
  type CheckInNotes,
} from "@/components"
import type { CustomerWithInsights } from "@/types"
import { formatDate } from "@/lib/utils"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [customers, setCustomers] = useState<CustomerWithInsights[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithInsights[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isAddInsightOpen, setIsAddInsightOpen] = useState(false)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithInsights | null>(null)

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers")
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
        setFilteredCustomers(data)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Filter customers based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.location?.toLowerCase().includes(query) ||
        c.rep?.toLowerCase().includes(query) ||
        c.insights?.some((i) => i.content.toLowerCase().includes(query))
    )
    setFilteredCustomers(filtered)
  }, [searchQuery, customers])

  // Add/Edit customer
  const handleSaveCustomer = async (data: CustomerFormData) => {
    try {
      const url = editingCustomer
        ? `/api/customers/${editingCustomer.id}`
        : "/api/customers"
      const method = editingCustomer ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const customer = await res.json()
        if (editingCustomer) {
          setCustomers((prev) =>
            prev.map((c) => (c.id === customer.id ? customer : c))
          )
        } else {
          setCustomers((prev) => [customer, ...prev])
          setSelectedCustomerId(customer.id)
        }
        setIsAddCustomerOpen(false)
        setEditingCustomer(null)
      }
    } catch (error) {
      console.error("Error saving customer:", error)
    }
  }

  // Add insight
  const handleSaveInsight = async (data: InsightFormData) => {
    if (!selectedCustomerId) return

    try {
      const res = await fetch(`/api/customers/${selectedCustomerId}/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        fetchCustomers()
        setIsAddInsightOpen(false)
      }
    } catch (error) {
      console.error("Error saving insight:", error)
    }
  }

  // Delete insight
  const handleDeleteInsight = async (insightId: string) => {
    try {
      const res = await fetch(`/api/insights/${insightId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        fetchCustomers()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to delete insight")
      }
    } catch (error) {
      console.error("Error deleting insight:", error)
    }
  }

  // Save check-in insights
  const handleSaveCheckIn = async (notes: CheckInNotes) => {
    if (!selectedCustomerId) return

    const insights = []

    if (notes.notes1.trim()) {
      insights.push({ type: "context", content: notes.notes1, rep: notes.rep })
    }
    if (notes.notes2.trim()) {
      insights.push({ type: "need", content: notes.notes2, rep: notes.rep })
    }
    if (notes.notes3.trim()) {
      insights.push({ type: "action", content: notes.notes3, rep: notes.rep })
    }
    if (notes.notes4.trim()) {
      insights.push({ type: "dossier", content: notes.notes4, rep: notes.rep })
    }

    if (insights.length === 0) return

    try {
      const res = await fetch(`/api/customers/${selectedCustomerId}/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insights }),
      })

      if (res.ok) {
        fetchCustomers()
        setIsCheckInOpen(false)
        alert(`Saved ${insights.length} insight(s) to ${selectedCustomer?.name}'s dossier.`)
      }
    } catch (error) {
      console.error("Error saving check-in:", error)
    }
  }

  // Export functions
  const handleExportText = () => {
    if (!selectedCustomer) return

    let text = `CUSTOMER DOSSIER: ${selectedCustomer.name}\n`
    text += `${"=".repeat(50)}\n\n`
    text += `Location: ${selectedCustomer.location || "N/A"}\n`
    text += `Primary Contact: ${selectedCustomer.contact || "N/A"}\n`
    text += `Assigned Rep: ${selectedCustomer.rep || "N/A"}\n`
    text += `Account Type: ${selectedCustomer.type || "N/A"}\n\n`
    text += `Notes: ${selectedCustomer.notes || "None"}\n\n`
    text += `${"─".repeat(50)}\n`
    text += `INSIGHTS TIMELINE\n`
    text += `${"─".repeat(50)}\n\n`

    const sortedInsights = [...(selectedCustomer.insights || [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    sortedInsights.forEach((insight) => {
      text += `[${formatDate(insight.date)}] ${insight.type.toUpperCase()}\n`
      text += `${insight.content}\n`
      if (insight.rep) text += `— ${insight.rep}\n`
      text += `\n`
    })

    text += `\n${"─".repeat(50)}\n`
    text += `Generated: ${new Date().toLocaleString()}\n`
    text += `AmeriFab Inc. Customer Dossier Tracker\n`

    downloadFile(text, `${selectedCustomer.name.replace(/\s+/g, "_")}_dossier.txt`, "text/plain")
  }

  const handleExportJSON = () => {
    if (!selectedCustomer) return

    const exportData = {
      ...selectedCustomer,
      exportedAt: new Date().toISOString(),
    }

    downloadFile(
      JSON.stringify(exportData, null, 2),
      `${selectedCustomer.name.replace(/\s+/g, "_")}_dossier.json`,
      "application/json"
    )
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7fafc" }}>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddCustomer={() => {
          setEditingCustomer(null)
          setIsAddCustomerOpen(true)
        }}
        onOpenCheckIn={() => setIsCheckInOpen(true)}
      />

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "32px" }}>
          <Sidebar
            customers={filteredCustomers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
            isLoading={isLoading}
          />

          {selectedCustomer ? (
            <CustomerDetail
              customer={selectedCustomer}
              onEdit={() => {
                setEditingCustomer(selectedCustomer)
                setIsAddCustomerOpen(true)
              }}
              onRunCheckIn={() => setIsCheckInOpen(true)}
              onAddInsight={() => setIsAddInsightOpen(true)}
              onDeleteInsight={handleDeleteInsight}
              onExportText={handleExportText}
              onExportJSON={handleExportJSON}
              currentUserId={session?.user?.id}
              currentUserRole={session?.user?.role}
            />
          ) : (
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                padding: "64px 48px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "20px", opacity: 0.4 }}>&#128203;</div>
              <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#4a5568", marginBottom: "8px" }}>
                Select a customer to view their dossier
              </h3>
              <p style={{ fontSize: "15px", color: "#718096" }}>
                Or add a new customer to get started building insights.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => {
          setIsAddCustomerOpen(false)
          setEditingCustomer(null)
        }}
        onSave={handleSaveCustomer}
        editingCustomer={editingCustomer}
      />

      <AddInsightModal
        isOpen={isAddInsightOpen}
        onClose={() => setIsAddInsightOpen(false)}
        onSave={handleSaveInsight}
        defaultRep={selectedCustomer?.rep || undefined}
      />

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSave={handleSaveCheckIn}
        defaultRep={session?.user?.name || ""}
        customerName={selectedCustomer?.name}
      />
    </div>
  )
}
