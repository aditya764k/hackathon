"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Upload,
  ScanText,
  Scale,
  Brain,
  Sparkles,
  Lightbulb,
  ArrowDown,
  CheckCircle2,
} from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Upload Document",
    description: "Upload a medical note, clinical document, or prescription image.",
    icon: Upload,
    color: "bg-primary/10 text-primary border-primary/30",
  },
  {
    id: 2,
    title: "OCR Extraction",
    description: "AI-powered optical character recognition extracts text and codes from the document.",
    icon: ScanText,
    color: "bg-accent/10 text-accent border-accent/30",
  },
  {
    id: 3,
    title: "Rules Engine",
    description: "Medical billing rules validate ICD-10 and CPT code combinations for compliance.",
    icon: Scale,
    color: "bg-warning/10 text-warning border-warning/30",
  },
  {
    id: 4,
    title: "ML Prediction",
    description: "XGBoost machine learning model predicts claim denial probability.",
    icon: Brain,
    color: "bg-chart-1/10 text-chart-1 border-chart-1/30",
  },
  {
    id: 5,
    title: "LLM Reasoning",
    description: "Gemini AI provides detailed reasoning and explanation for the prediction.",
    icon: Sparkles,
    color: "bg-chart-2/10 text-chart-2 border-chart-2/30",
  },
  {
    id: 6,
    title: "Remediation",
    description: "Actionable suggestions to improve claim approval chances.",
    icon: Lightbulb,
    color: "bg-success/10 text-success border-success/30",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

export function WorkflowSteps() {
  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {steps.map((step, index) => (
        <motion.div key={step.id} variants={itemVariants}>
          <div
            className={cn(
              "group relative rounded-xl border bg-card p-6 transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
            )}
          >
            <div className="flex items-start gap-5">
              {/* Step Number */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-colors",
                    step.color
                  )}
                >
                  <step.icon className="h-6 w-6" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Step {step.id}
                  </span>
                </div>
                <h3 className="mt-1 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Completion indicator */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>

          {/* Arrow connector */}
          {index < steps.length - 1 && (
            <motion.div
              className="flex justify-center py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 * index + 0.2 }}
            >
              <ArrowDown className="h-6 w-6 text-muted-foreground/50" />
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}

interface WorkflowProgressProps {
  currentStep: number
  isComplete?: boolean
}

export function WorkflowProgress({ currentStep, isComplete = false }: WorkflowProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
              index < currentStep
                ? "border-success bg-success text-success-foreground"
                : index === currentStep
                ? "border-primary bg-primary text-primary-foreground animate-pulse"
                : "border-muted bg-muted text-muted-foreground"
            )}
          >
            {index < currentStep || isComplete ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <step.icon className="h-5 w-5" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-8 transition-colors",
                index < currentStep ? "bg-success" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
