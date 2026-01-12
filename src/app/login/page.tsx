"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #3182ce 100%)" }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className="text-center"
            style={{ padding: "48px 40px", background: "linear-gradient(135deg, #1a365d 0%, #2c5282 100%)" }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-4 shadow-lg">
              <span className="text-2xl font-bold" style={{ color: "#1a365d" }}>AF</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Sales Huddle</h1>
            <p className="text-sm text-white/70 uppercase tracking-widest">AmeriFab Inc.</p>
          </div>

          {/* Form */}
          <div style={{ padding: "32px 40px" }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block font-semibold uppercase tracking-wide"
                  style={{ color: "#4a5568", fontSize: "11px", marginBottom: "8px" }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg transition-all"
                  style={{
                    padding: "12px 16px",
                    fontSize: "15px",
                    border: "2px solid #e2e8f0",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3182ce"
                    e.target.style.boxShadow = "0 0 0 3px rgba(49, 130, 206, 0.1)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0"
                    e.target.style.boxShadow = "none"
                  }}
                  placeholder="you@amerifab.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block font-semibold uppercase tracking-wide"
                  style={{ color: "#4a5568", fontSize: "11px", marginBottom: "8px" }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg transition-all"
                  style={{
                    padding: "12px 16px",
                    fontSize: "15px",
                    border: "2px solid #e2e8f0",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3182ce"
                    e.target.style.boxShadow = "0 0 0 3px rgba(49, 130, 206, 0.1)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0"
                    e.target.style.boxShadow = "none"
                  }}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    background: "#fed7d7",
                    border: "1px solid #fc8181",
                    color: "#c53030"
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  padding: "14px 16px",
                  fontSize: "15px",
                  background: "linear-gradient(135deg, #1a365d 0%, #2c5282 100%)",
                  marginTop: "8px",
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-1px)"
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(26, 54, 93, 0.3)"
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div
            className="text-center"
            style={{ padding: "20px 40px", background: "#f7fafc", borderTop: "1px solid #e2e8f0", color: "#718096", fontSize: "13px" }}
          >
            Customer Dossier Tracker • Know Before You Go
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 text-center text-white/80 text-sm">
          <p className="font-medium mb-2">Default Password</p>
          <p className="text-white/60">AmeriFab2026!</p>
        </div>
      </div>
    </div>
  )
}
