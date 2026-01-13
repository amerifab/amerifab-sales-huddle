// Sales Rep names
export const REPS = ["Soja", "Collins", "Akers", "Roudebush"] as const
export type Rep = typeof REPS[number]

// Account types
export const ACCOUNT_TYPES = ["Key Account", "Growth", "Prospect"] as const
export type AccountType = typeof ACCOUNT_TYPES[number]

// Insight types
export const INSIGHT_TYPES = ["context", "need", "action", "dossier"] as const
export type InsightType = typeof INSIGHT_TYPES[number]

// User roles
export const ROLES = ["REP", "MANAGER", "ADMIN"] as const
export type Role = typeof ROLES[number]

// Insight type labels and colors
export const INSIGHT_TYPE_CONFIG: Record<InsightType, { label: string; color: string; bgColor: string }> = {
  context: { label: "Customer Context", color: "#2c5282", bgColor: "bg-steel-blue" },
  need: { label: "Unstated Need", color: "#d69e2e", bgColor: "bg-warning" },
  action: { label: "Action Taken", color: "#38a169", bgColor: "bg-success" },
  dossier: { label: "Dossier Update", color: "#1a365d", bgColor: "bg-navy" },
}

// Customer with insights
export interface CustomerWithInsights {
  id: string
  name: string
  parentCompany: string | null
  location: string | null
  contact: string | null
  rep: string | null
  type: string
  notes: string | null
  revenue: number | null
  createdAt: Date
  updatedAt: Date
  insights: InsightData[]
}

// Insight data
export interface InsightData {
  id: string
  type: string
  content: string
  rep: string | null
  date: Date
  customerId: string
  createdBy: string | null
}

// Check-in form data
export interface CheckInFormData {
  week: string
  rep: string
  notes1: string // Customer Context
  notes2: string // Unstated Need
  notes3: string // This Week's Move
  notes4: string // Dossier Update
}
