"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { UploadZone } from "@/components/upload-zone"
import { PredictionResultCard, PredictionResultSkeleton } from "@/components/prediction-result"
import { WorkflowProgress } from "@/components/workflow-steps"
import { runFullPipeline, saveClaim } from "@/services/api"
import type { FullPipelineResult, Claim } from "@/types/claim-types"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { PAYERS } from "@/types/claim-types"

export default function UploadPage() {
  const [payer, setPayer] = useState("Medicare")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<FullPipelineResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const handleFileSelect = async (file: File) => {
    setIsLoading(true)
    setResult(null)
    setCurrentStep(1)

    try {
      // Animate through steps as the real API processes
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => Math.min(prev + 1, 5))
      }, 800)

      const pipelineResult = await runFullPipeline(file, payer)
      
      clearInterval(stepInterval)
      setCurrentStep(6)
      setResult(pipelineResult)

      if (pipelineResult.validation_error) {
        toast.error("Invalid Document", {
          description: pipelineResult.validation_reason || "Please upload a valid medical document.",
        })
      } else {
        // Save claim to history for valid documents
        if (pipelineResult.predicted_status !== "Error") {
          const claim: Claim = {
            id: `CLM-${Date.now().toString(36).toUpperCase()}`,
            date: new Date().toISOString().split("T")[0],
            payer: payer,
            patient_age: pipelineResult.default_features?.patient_age || 45,
            ICD_10_code: pipelineResult.ocr?.icd10?.[0] || "Unknown",
            CPT_code: pipelineResult.ocr?.cpt?.[0] || "Unknown",
            modifier: "None",
            documentation_quality_score: 0.8,
            prior_auth_obtained: 0,
            billed_amount: pipelineResult.default_features?.billed_amount || 150,
            submission_days_delay: 0,
            past_denial_count: 0,
            denial_probability: pipelineResult.denial_probability,
            claim_status: pipelineResult.predicted_status as "Approved" | "Denied",
            denial_reason_code: pipelineResult.denial_reason_code,
            remediation: pipelineResult.remediation,
          }
          await saveClaim(claim)
        }

        if (pipelineResult.predicted_status === "Approved") {
          toast.success("Claim Analysis Complete", {
            description: "The claim is predicted to be approved.",
          })
        } else if (pipelineResult.predicted_status !== "Error") {
          toast.warning("Claim Analysis Complete", {
            description: `Confidence level: ${Math.round((1 - pipelineResult.denial_probability) * 100)}%`,
          })
        }
      }
    } catch (error) {
      console.error("Pipeline failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast.error("Analysis Failed", {
        description: errorMessage,
      })
      setResult({
        ocr: {
          icd10: [],
          cpt: [],
          notes: "API Error",
          remediation: errorMessage,
        },
        denial_probability: 0,
        predicted_status: "Error",
        denial_reason_code: "API_ERROR",
        remediation: errorMessage,
      })
      setCurrentStep(6)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar title="Upload Medical Note" subtitle="Process documents through the AI pipeline" />

      <div className="p-6 space-y-8">
        {/* Payer Selection */}
        <div className="max-w-xs">
          <Label htmlFor="payer" className="mb-2 block">
            Insurance Payer
          </Label>
          <Select value={payer} onValueChange={setPayer}>
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Select payer" />
            </SelectTrigger>
            <SelectContent>
              {PAYERS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload Zone */}
        <UploadZone onFileSelect={handleFileSelect} isLoading={isLoading} />

        {/* Progress Indicator */}
        {(isLoading || result) && (
          <div className="flex justify-center py-4">
            <WorkflowProgress currentStep={currentStep} isComplete={!!result} />
          </div>
        )}

        {/* Results */}
        {isLoading && !result && <PredictionResultSkeleton />}

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PredictionResultCard result={result} showOCR />
          </div>
        )}

        {/* Instructions */}
        {!isLoading && !result && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">How It Works</h3>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  1
                </span>
                <span>Upload a medical note, clinical document, or prescription image</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  2
                </span>
                <span>Our AI extracts ICD-10 diagnosis codes and CPT procedure codes</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  3
                </span>
                <span>Medical billing rules validate the code combinations</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  4
                </span>
                <span>Machine learning predicts the denial probability</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  5
                </span>
                <span>AI provides remediation suggestions to improve approval chances</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
