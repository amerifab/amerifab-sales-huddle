"use client"

import { useState } from "react"
import type { CustomerWithInsights } from "@/types"

interface WholeStoryProps {
  customer: CustomerWithInsights
}

export function WholeStory({ customer }: WholeStoryProps) {
  const [story, setStory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateStory = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/customers/${customer.id}/story`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate story")
      }

      setStory(data.story)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const buttonStyle = {
    padding: "14px 28px",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "linear-gradient(135deg, #1a365d 0%, #2c5282 100%)",
    color: "white",
  }

  const insightCount = customer.insights?.length || 0

  // Render markdown-like content with proper formatting
  const renderStory = (text: string) => {
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let key = 0

    lines.forEach((line) => {
      if (line.startsWith("## ")) {
        elements.push(
          <h3
            key={key++}
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#1a365d",
              margin: "28px 0 14px 0",
              paddingBottom: "8px",
              borderBottom: "2px solid #e2e8f0",
            }}
          >
            {line.replace("## ", "")}
          </h3>
        )
      } else if (line.startsWith("- ")) {
        elements.push(
          <li
            key={key++}
            style={{
              fontSize: "15px",
              color: "#4a5568",
              lineHeight: 1.7,
              marginBottom: "8px",
              marginLeft: "20px",
            }}
          >
            {line.replace("- ", "")}
          </li>
        )
      } else if (line.startsWith("**") && line.endsWith("**")) {
        elements.push(
          <p
            key={key++}
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#1a202c",
              lineHeight: 1.7,
              margin: "12px 0",
            }}
          >
            {line.replace(/\*\*/g, "")}
          </p>
        )
      } else if (line.trim()) {
        // Handle inline bold markers
        const parts = line.split(/(\*\*.*?\*\*)/)
        const formattedParts = parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} style={{ fontWeight: 600, color: "#1a202c" }}>
                {part.replace(/\*\*/g, "")}
              </strong>
            )
          }
          return part
        })

        elements.push(
          <p
            key={key++}
            style={{
              fontSize: "15px",
              color: "#4a5568",
              lineHeight: 1.7,
              margin: "12px 0",
            }}
          >
            {formattedParts}
          </p>
        )
      }
    })

    return elements
  }

  if (story) {
    return (
      <div>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1a365d", margin: "0 0 6px 0" }}>
              The Whole Story
            </h3>
            <p style={{ fontSize: "14px", color: "#718096", margin: 0 }}>
              AI-generated narrative based on {insightCount} insight{insightCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={generateStory}
            disabled={isLoading}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: isLoading ? "not-allowed" : "pointer",
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#4a5568",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? "Regenerating..." : "Regenerate"}
          </button>
        </div>

        {/* Story Content */}
        <div
          style={{
            background: "#f7fafc",
            borderRadius: "12px",
            padding: "28px 32px",
            border: "1px solid #e2e8f0",
          }}
        >
          {renderStory(story)}
        </div>

        {/* Customer Obsession Reminder */}
        <div
          style={{
            marginTop: "24px",
            padding: "20px 24px",
            background: "linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%)",
            borderRadius: "10px",
            border: "1px solid #90cdf4",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <span style={{ fontSize: "24px" }}>&#128161;</span>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#2c5282", margin: "0 0 6px 0" }}>
                Customer Obsession Principle
              </h4>
              <p style={{ fontSize: "13px", color: "#4a5568", lineHeight: 1.6, margin: 0 }}>
                "Leaders start with the customer and work backwards. They work vigorously to earn and keep customer
                trust. Although leaders pay attention to competitors, they obsess over customers."
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ textAlign: "center", padding: "48px 32px" }}>
      {/* Icon */}
      <div
        style={{
          width: "80px",
          height: "80px",
          background: "linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px auto",
          fontSize: "36px",
        }}
      >
        &#128214;
      </div>

      <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1a365d", margin: "0 0 12px 0" }}>
        The Whole Story
      </h3>

      <p style={{ fontSize: "15px", color: "#718096", maxWidth: "480px", margin: "0 auto 8px auto", lineHeight: 1.6 }}>
        Generate an AI-powered narrative that synthesizes all gathered insights about {customer.name} into a cohesive
        story.
      </p>

      <p style={{ fontSize: "14px", color: "#a0aec0", margin: "0 auto 28px auto" }}>
        Based on {insightCount} recorded insight{insightCount !== 1 ? "s" : ""}
      </p>

      {error && (
        <div
          style={{
            background: "#fed7d7",
            border: "1px solid #fc8181",
            borderRadius: "8px",
            padding: "14px 20px",
            marginBottom: "24px",
            maxWidth: "480px",
            margin: "0 auto 24px auto",
          }}
        >
          <p style={{ color: "#c53030", fontSize: "14px", margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        onClick={generateStory}
        disabled={isLoading}
        style={{
          ...buttonStyle,
          opacity: isLoading ? 0.7 : 1,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? (
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            Generating Story...
          </span>
        ) : (
          "Generate The Whole Story"
        )}
      </button>

      {/* What's included */}
      <div
        style={{
          marginTop: "40px",
          padding: "24px",
          background: "#f7fafc",
          borderRadius: "10px",
          textAlign: "left",
          maxWidth: "520px",
          margin: "40px auto 0 auto",
        }}
      >
        <h4 style={{ fontSize: "13px", fontWeight: 600, color: "#4a5568", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          The story will include
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { icon: "&#128101;", label: "Who They Are" },
            { icon: "&#127758;", label: "Their World Right Now" },
            { icon: "&#128293;", label: "Pain Points" },
            { icon: "&#128161;", label: "Our Opportunity" },
            { icon: "&#129309;", label: "Trust-Building Path" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                color: "#4a5568",
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: item.icon }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
