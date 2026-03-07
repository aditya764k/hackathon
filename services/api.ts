import type {
  ClaimFeatures,
  PredictionResult,
  FullPipelineResult,
  Claim,
  AnalyticsData,
} from "@/types/claim-types"

// API Functions - All calls go to real Next.js API routes

export async function predictClaim(features: ClaimFeatures): Promise<PredictionResult> {
  const response = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || "Prediction failed")
  }
  
  return data
}

export async function runFullPipeline(file: File, payer: string = "Medicare"): Promise<FullPipelineResult> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("payer", payer)

  const response = await fetch("/api/full-pipeline", {
    method: "POST",
    body: formData,
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || "Pipeline failed")
  }
  
  return data
}

// Claims storage - persisted in localStorage for demo, but real data from API calls
function getStoredClaims(): Claim[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("claimshield_claims")
  return stored ? JSON.parse(stored) : []
}

function storeCliam(claim: Claim): void {
  if (typeof window === "undefined") return
  const claims = getStoredClaims()
  
  // Debug: Log the claim being saved
  console.log("Saving claim with date:", claim.date, "Claim ID:", claim.id)
  
  // Check if claim with today's date already exists and remove it to avoid duplicates
  const today = new Date().toISOString().split("T")[0]
  console.log("Today's date:", today)
  
  const filteredClaims = claims.filter(c => c.date !== today || c.id !== claim.id)
  
  // Add new claim at the beginning
  filteredClaims.unshift(claim)
  
  // Keep only last 100 claims
  localStorage.setItem("claimshield_claims", JSON.stringify(filteredClaims.slice(0, 100)))
  
  console.log("Stored claims count:", filteredClaims.length)
}

export async function saveClaim(claim: Claim): Promise<void> {
  storeCliam(claim)
}

export async function getClaims(): Promise<Claim[]> {
  const claims = getStoredClaims()
  
  // Debug: Log all stored claims dates
  console.log("All stored claims with dates:", claims.map(c => ({ id: c.id, date: c.date })))
  
  return claims
}

export function clearOldClaims(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("claimshield_claims")
  console.log("Cleared all claims from localStorage")
}

export async function getRecentClaims(limit: number = 10): Promise<Claim[]> {
  return getStoredClaims().slice(0, limit)
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const claims = getStoredClaims()

  const totalClaims = claims.length
  const approvedClaims = claims.filter((c) => c.claim_status === "Approved").length
  const deniedClaims = claims.filter((c) => c.claim_status === "Denied").length
  const highConfidenceClaims = claims.filter((c) => c.denial_probability >= 0.7).length

  // Confidence level distribution
  const ranges = ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"]
  const confidenceDistribution = ranges.map((range, i) => {
    const min = i * 0.2
    const max = (i + 1) * 0.2
    return {
      range,
      count: claims.filter((c) => c.denial_probability >= min && c.denial_probability < max).length,
    }
  })

  // Claims trend (last 7 days)
  const today = new Date()
  const claimsTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - i))
    const dateStr = date.toISOString().split("T")[0]
    const dayClaims = claims.filter((c) => c.date === dateStr)
    return {
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      approved: dayClaims.filter((c) => c.claim_status === "Approved").length,
      denied: dayClaims.filter((c) => c.claim_status === "Denied").length,
    }
  })

  return {
    totalClaims,
    approvedClaims,
    deniedClaims,
    highConfidenceClaims,
    confidenceDistribution,
    claimsTrend,
  }
}
