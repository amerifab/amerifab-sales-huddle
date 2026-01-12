import type { InsightData } from "@/types"

interface StatsRowProps {
  insights: InsightData[]
}

export function StatsRow({ insights }: StatsRowProps) {
  const total = insights.length
  const contextCount = insights.filter((i) => i.type === "context").length
  const needCount = insights.filter((i) => i.type === "need").length
  const dossierCount = insights.filter((i) => i.type === "dossier").length

  const stats = [
    { label: "Total Insights", value: total },
    { label: "Context", value: contextCount },
    { label: "Unstated Needs", value: needCount },
    { label: "Dossier Items", value: dossierCount },
  ]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            background: "#f7fafc",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#1a365d" }}>{stat.value}</div>
          <div style={{ fontSize: "11px", color: "#718096", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px" }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}
