"use client"

import { cn } from "@/lib/utils"
import type { FullPipelineResult, PredictionResult } from "@/types/claim-types"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  Brain,
  Lightbulb,
  Percent,
  AlertCircle,
} from "lucide-react"

interface PredictionResultCardProps {
  result: FullPipelineResult | PredictionResult
  showOCR?: boolean
}

export function PredictionResultCard({ result, showOCR = false }: PredictionResultCardProps) {
  const isApproved = result.predicted_status === "Approved"
  const isError = result.predicted_status === "Error"
  const probability = Math.round(result.denial_probability * 100)

  const fullResult = result as FullPipelineResult
  const hasOCR = showOCR && "ocr" in result && fullResult.ocr

  // Handle error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl p-3 bg-destructive/20">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">API Error</h3>
              <p className="mt-2 text-muted-foreground">{result.remediation}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Please check that the GOOGLE_API_KEY is configured correctly in your environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <div
        className={cn(
          "rounded-xl border-2 p-6",
          isApproved
            ? "border-success/30 bg-success/5"
            : "border-destructive/30 bg-destructive/5"
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "rounded-xl p-3",
              isApproved ? "bg-success/20" : "bg-destructive/20"
            )}
          >
            {isApproved ? (
              <CheckCircle2 className="h-8 w-8 text-success" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-foreground">
                {result.predicted_status}
              </h3>
              <Badge
                variant={isApproved ? "secondary" : "destructive"}
                className={cn(
                  "text-sm font-medium",
                  isApproved
                    ? "bg-success/20 text-success"
                    : "bg-destructive/20 text-destructive"
                )}
              >
                {probability}% Confidence Level
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground">
              Reason Code: <span className="font-medium text-foreground">{result.denial_reason_code}</span>
            </p>
          </div>
        </div>
      </div>

      {/* OCR Results */}
      {hasOCR && fullResult.ocr && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Extracted ICD-10 Codes</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {fullResult.ocr.icd10.length > 0 ? (
                fullResult.ocr.icd10.map((code) => (
                  <Badge key={code} variant="outline" className="font-mono">
                    {code}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No ICD-10 codes detected</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileCode className="h-5 w-5 text-accent" />
              <h4 className="font-semibold text-foreground">Extracted CPT Codes</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {fullResult.ocr.cpt.length > 0 ? (
                fullResult.ocr.cpt.map((code) => (
                  <Badge key={code} variant="outline" className="font-mono">
                    {code}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No CPT codes detected</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Notes */}
      {hasOCR && fullResult.ocr?.notes && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            <h4 className="font-semibold text-foreground">AI Analysis</h4>
          </div>
          <p className="text-muted-foreground leading-relaxed">{fullResult.ocr.notes}</p>
        </div>
      )}

      {/* Remediation Suggestion */}
      <div
        className={cn(
          "rounded-xl border p-5",
          isApproved ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className={cn("h-5 w-5", isApproved ? "text-success" : "text-warning")} />
          <h4 className="font-semibold text-foreground">
            {isApproved ? "Confirmation" : "Remediation Suggestion"}
          </h4>
        </div>
        <p className="text-foreground leading-relaxed">{result.remediation}</p>
      </div>

      {/* Denial Probability Gauge */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-foreground">Denial Probability</h4>
          </div>
          <span className="text-2xl font-bold text-foreground">{probability}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              probability >= 70
                ? "bg-destructive"
                : probability >= 40
                ? "bg-warning"
                : "bg-success"
            )}
            style={{ width: `${probability}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Low Confidence</span>
          <span>Medium Confidence</span>
          <span>High Confidence</span>
        </div>
      </div>
    </div>
  )
}

export function PredictionResultSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-xl border-2 border-border p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-8 w-32 rounded bg-muted" />
            <div className="h-4 w-48 rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
      <div className="h-24 rounded-xl bg-muted" />
    </div>
  )
}
