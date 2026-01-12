"use client"

import { useEffect, useCallback } from "react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeStyles = {
  sm: "480px",
  md: "560px",
  lg: "720px",
  xl: "900px",
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
          width: "100%",
          maxWidth: sizeStyles[size],
        }}
      >
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 28px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1a202c", margin: 0 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#718096",
                fontSize: "24px",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              &times;
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function ModalBody({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "28px" }}>{children}</div>
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        padding: "20px 28px",
        borderTop: "1px solid #e2e8f0",
      }}
    >
      {children}
    </div>
  )
}
