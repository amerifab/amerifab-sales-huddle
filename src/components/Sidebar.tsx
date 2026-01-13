"use client"

import type { CustomerWithInsights } from "@/types"
import { getCustomerDisplayName } from "@/lib/customer-utils"
import { formatRevenue } from "@/lib/utils"

interface SidebarProps {
  customers: CustomerWithInsights[]
  selectedCustomerId: string | null
  onSelectCustomer: (id: string) => void
  isLoading?: boolean
}

export function Sidebar({ customers, selectedCustomerId, onSelectCustomer, isLoading }: SidebarProps) {
  return (
    <aside
      style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        overflow: "hidden",
        position: "sticky",
        top: "100px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <h2 style={{ fontSize: "11px", fontWeight: 600, color: "#718096", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
          Customers
        </h2>
        <span
          style={{
            background: "#3182ce",
            color: "white",
            fontSize: "12px",
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: "12px",
          }}
        >
          {customers.length}
        </span>
      </div>

      <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
        {isLoading ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#718096" }}>
            Loading...
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#718096" }}>
            No customers found
          </div>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => onSelectCustomer(customer.id)}
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                cursor: "pointer",
                background: selectedCustomerId === customer.id ? "#f7fafc" : "white",
                borderLeft: selectedCustomerId === customer.id ? "3px solid #3182ce" : "3px solid transparent",
                transition: "all 0.15s ease",
              }}
              onMouseOver={(e) => {
                if (selectedCustomerId !== customer.id) {
                  e.currentTarget.style.background = "#f7fafc"
                }
              }}
              onMouseOut={(e) => {
                if (selectedCustomerId !== customer.id) {
                  e.currentTarget.style.background = "white"
                }
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1a202c", marginBottom: "4px" }}>
                {getCustomerDisplayName(customer)}
              </h3>
              <p style={{ fontSize: "13px", color: "#718096", margin: 0 }}>
                {customer.location || "No location"}
              </p>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 10px",
                    background: "#edf2f7",
                    borderRadius: "4px",
                    color: "#4a5568",
                  }}
                >
                  {customer.rep || "Unassigned"}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 10px",
                    background: "#38a169",
                    borderRadius: "4px",
                    color: "white",
                  }}
                >
                  {customer.insights?.length || 0} insights
                </span>
              </div>
              {customer.revenue && (
                <div style={{ marginTop: "8px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "4px 10px",
                      background: "#805ad5",
                      borderRadius: "4px",
                      color: "white",
                      fontWeight: 500,
                    }}
                  >
                    {formatRevenue(customer.revenue)} Revenue
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
