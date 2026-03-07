"use client"

import { Navbar } from "@/components/navbar"
import { WorkflowSteps } from "@/components/workflow-steps"
import { Brain, Sparkles, ShieldCheck, TrendingUp } from "lucide-react"

export default function WorkflowPage() {
  return (
    <div className="min-h-screen">
      <Navbar title="AI Workflow" subtitle="Understand how ClaimShield processes your claims" />

      <div className="p-6 space-y-8">
        {/* Hero Section */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-accent/5 to-background p-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-foreground">
              Intelligent Claim Processing Pipeline
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              ClaimShield uses a multi-stage AI pipeline to analyze medical claims,
              predict denial risks, and provide actionable remediation suggestions.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg bg-card/50 p-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">ML Model</p>
                <p className="text-sm text-muted-foreground">XGBoost</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-card/50 p-4">
              <div className="rounded-lg bg-accent/10 p-2">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">LLM</p>
                <p className="text-sm text-muted-foreground">Gemini AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-card/50 p-4">
              <div className="rounded-lg bg-success/10 p-2">
                <ShieldCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Rules</p>
                <p className="text-sm text-muted-foreground">Medical Billing</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-card/50 p-4">
              <div className="rounded-lg bg-warning/10 p-2">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-foreground">Accuracy</p>
                <p className="text-sm text-muted-foreground">94%+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="max-w-3xl mx-auto">
          <WorkflowSteps />
        </div>

        {/* Technical Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">ML Model Details</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>
                  <strong className="text-foreground">XGBoost Classifier</strong> trained on 5,000+ historical claims
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>
                  <strong className="text-foreground">Features:</strong> Payer, ICD-10, CPT, modifiers, documentation quality, prior auth, billing amount
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>
                  <strong className="text-foreground">One-Hot Encoding</strong> for categorical features with unknown handling
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>
              <strong className="text-foreground">Probability calibration</strong> for accurate confidence scoring
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Rules Engine</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>
                  <strong className="text-foreground">Medical Necessity:</strong> Validates ICD-10 and CPT combinations for clinical appropriateness
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>
                  <strong className="text-foreground">Prior Authorization:</strong> Checks complex procedures (99215) for required auth
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>
                  <strong className="text-foreground">Upcoding Detection:</strong> Identifies potential billing fraud patterns
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>
                  <strong className="text-foreground">Payer Rules:</strong> Applies payer-specific denial criteria
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
