"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { ClaimAnalyzerForm } from "@/components/claim-analyzer-form"
import { PredictionResultCard, PredictionResultSkeleton } from "@/components/prediction-result"
import { predictClaim, saveClaim } from "@/services/api"
import type { ClaimFeatures, PredictionResult, Claim } from "@/types/claim-types"
import { toast } from "sonner"

export default function AnalyzerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)

  const handleSubmit = async (data: ClaimFeatures) => {
    setIsLoading(true)
    setResult(null)

    try {
      const predictionResult = await predictClaim(data)
      setResult(predictionResult)

      // Save claim to history (only for successful predictions)
      if (predictionResult.predicted_status !== "Error") {
        const claim: Claim = {
          id: `CLM-${Date.now().toString(36).toUpperCase()}`,
          date: new Date().toISOString().split("T")[0],
          payer: data.payer,
          patient_age: data.patient_age,
          ICD_10_code: data.ICD_10_code,
          CPT_code: data.CPT_code,
          modifier: data.modifier,
          documentation_quality_score: data.documentation_quality_score,
          prior_auth_obtained: data.prior_auth_obtained,
          billed_amount: data.billed_amount,
          submission_days_delay: data.submission_days_delay,
          past_denial_count: data.past_denial_count,
          denial_probability: predictionResult.denial_probability,
          claim_status: predictionResult.predicted_status as "Approved" | "Denied",
          denial_reason_code: predictionResult.denial_reason_code,
          remediation: predictionResult.remediation,
        }
        await saveClaim(claim)
      }

      if (predictionResult.predicted_status === "Approved") {
        toast.success("Analysis Complete", {
          description: "This claim is predicted to be approved.",
        })
      } else if (predictionResult.predicted_status !== "Error") {
        toast.warning("Analysis Complete", {
          description: `Confidence level: ${Math.round((1 - predictionResult.denial_probability) * 100)}%`,
        })
      }
    } catch (error) {
      console.error("Prediction failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast.error("Analysis Failed", {
        description: errorMessage,
      })
      setResult({
        denial_probability: 0,
        predicted_status: "Error",
        denial_reason_code: "API_ERROR",
        remediation: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar title="Claim Analyzer" subtitle="Test claim parameters for confidence prediction" />

      <div className="p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Enter Claim Details
              </h2>
              <ClaimAnalyzerForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Prediction Results
              </h2>
              
              {isLoading && <PredictionResultSkeleton />}
              
              {result && !isLoading && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <PredictionResultCard result={result} />
                </div>
              )}

              {!result && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-xl bg-muted p-6 mb-4">
                    <svg
                      className="h-12 w-12 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground">No Results Yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    Fill out the claim form and click Analyze to see the prediction results.
                  </p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Tips for Approval</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                  Ensure ICD-10 codes match the procedure being billed
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                  Obtain prior authorization for Level 5 visits (99215)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                  Maintain documentation quality above 65% for high-level visits
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                  Submit claims within 30 days of service
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                  Use appropriate modifiers for separate procedures
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
