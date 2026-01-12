"use client"

import { signOut } from "next-auth/react"
import type { Session } from "next-auth"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddCustomer: () => void
  session: Session
}

export function Header({ searchQuery, onSearchChange, onAddCustomer, session }: HeaderProps) {

  return (
    <header
      style={{
        background: "linear-gradient(135deg, #1a365d 0%, #2c5282 100%)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "white",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <span style={{ color: "#1a365d", fontWeight: "bold", fontSize: "16px" }}>AFI</span>
            </div>
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: 600, color: "white", margin: 0 }}>Sales Huddle</h1>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                AmeriFab Inc.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)", fontSize: "16px" }}>
                &#128269;
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search customers or insights..."
                style={{
                  width: "280px",
                  padding: "12px 16px 12px 42px",
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <button
              onClick={onAddCustomer}
              style={{
                padding: "12px 20px",
                background: "white",
                border: "none",
                borderRadius: "8px",
                color: "#1a365d",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Add Customer
            </button>

            {/* User menu */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "8px", paddingLeft: "20px", borderLeft: "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)" }}>{session?.user?.name}</span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background:
                      session?.user?.role === "ADMIN"
                        ? "#e53e3e"
                        : session?.user?.role === "MANAGER"
                        ? "#d69e2e"
                        : "#38a169",
                    color: "white",
                  }}
                >
                  {session?.user?.role}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
