import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

if (!GOOGLE_API_KEY) {
  console.error("GOOGLE_API_KEY is not set in environment variables")
}

const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null

interface ClaimFeatures {
  payer: string
  patient_age: number
  ICD_10_code: string
  CPT_code: string
  modifier: string
  documentation_quality_score: number
  prior_auth_obtained: number
  billed_amount: number
  submission_days_delay: number
  past_denial_count: number
}

interface RulesEngineResult {
  denial_probability: number
  predicted_status: string
  denial_reason_code: string
  remediation: string
}

// Centralized Rules Engine (matches your Python backend exactly)
function applyRulesEngine(features: ClaimFeatures): RulesEngineResult | null {
  const icd = features.ICD_10_code
  const cpt = features.CPT_code
  const auth = features.prior_auth_obtained
  const docQ = features.documentation_quality_score

  // Rule A: Sinusitis + ECG (Medical Necessity Conflict)
  if (icd === "J01.90" && cpt === "93000") {
    return {
      denial_probability: 0.99,
      predicted_status: "Denied",
      denial_reason_code: "CO-50 (Medical Necessity)",
      remediation: "Remove CPT 93000. An ECG is not medically necessary for Acute Sinusitis."
    }
  }

  // Rule B: Back Pain + Blood Test (Michael Chen Case)
  if (icd === "M54.50" && cpt === "85025") {
    return {
      denial_probability: 0.98,
      predicted_status: "Denied",
      denial_reason_code: "CO-50 (Medical Necessity)",
      remediation: "Remove CPT 85025. Routine blood work (CBC) is not indicated for mechanical back pain."
    }
  }

  // Rule C: Level 5 Visit Without Prior Auth
  if (cpt === "99215" && auth === 0) {
    return {
      denial_probability: 0.85,
      predicted_status: "Denied",
      denial_reason_code: "Missing Prior Auth",
      remediation: "Level 5 complex visits require prior authorization. Please attach auth number."
    }
  }

  // Rule D: Upcoding Fraud Check
  if (icd === "J01.90" && cpt === "99215") {
    return {
      denial_probability: 0.95,
      predicted_status: "Denied",
      denial_reason_code: "CO-11 (Inconsistent with Diagnosis)",
      remediation: "Downcode to 99213. A routine sinus infection does not meet Level 5 criteria."
    }
  }

  // Rule E: Poor Documentation Quality
  if (docQ < 0.5) {
    return {
      denial_probability: 0.75,
      predicted_status: "Denied",
      denial_reason_code: "CO-16 (Insufficient Documentation)",
      remediation: "Documentation quality score is below threshold. Add clinical notes, examination findings, and medical necessity justification."
    }
  }

  // Rule F: Late Submission
  if (features.submission_days_delay > 30) {
    return {
      denial_probability: 0.80,
      predicted_status: "Denied",
      denial_reason_code: "CO-29 (Timely Filing)",
      remediation: `Claim submitted ${features.submission_days_delay} days after service. Most payers require submission within 30 days.`
    }
  }

  // Rule G: High Past Denial Count
  if (features.past_denial_count >= 3) {
    return {
      denial_probability: 0.70,
      predicted_status: "Denied",
      denial_reason_code: "Pattern Alert",
      remediation: "Patient has multiple prior denials. Review claim thoroughly and ensure all documentation is complete."
    }
  }

  return null // No rules triggered
}

// Simple reason code derivation (matches your Python backend)
function simpleReasonFromFeatures(features: ClaimFeatures, predictedStatus: string): string {
  if (predictedStatus === "Approved") {
    return "Approved"
  }
  if (features.modifier === "None" && ["99214", "99215"].includes(features.CPT_code)) {
    return "CO-4"
  }
  return "CO-45"
}

// Get remediation based on reason code
function getRemediation(reasonCode: string, status: string): string {
  if (status === "Approved") {
    return "Claim meets all requirements. No remediation needed."
  }
  
  const remediations: Record<string, string> = {
    "CO-4": "Add appropriate modifier to the CPT code. Review documentation for medical necessity.",
    "CO-45": "Verify procedure/diagnosis code combination. Ensure proper coding guidelines are followed.",
    "CO-50": "Medical necessity not established. Add supporting documentation or change procedure code.",
    "CO-11": "Diagnosis and procedure codes are inconsistent. Review and correct coding.",
    "CO-16": "Add additional clinical documentation to support the claim.",
    "CO-29": "Submit appeal with proof of timely filing or valid delay reason.",
  }
  
  return remediations[reasonCode] || "Review claim for accuracy and resubmit with corrections."
}

// ML-like prediction using Gemini LLM
async function predictWithLLM(features: ClaimFeatures): Promise<RulesEngineResult> {
  if (!genAI) {
    throw new Error("Google API key not configured")
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const prompt = `You are a medical billing AI assistant trained on insurance claim data.
Analyze this claim and predict if it will be approved or denied.

Claim Features:
- Payer: ${features.payer}
- Patient Age: ${features.patient_age}
- ICD-10 Code: ${features.ICD_10_code}
- CPT Code: ${features.CPT_code}
- Modifier: ${features.modifier}
- Documentation Quality Score: ${features.documentation_quality_score}
- Prior Authorization Obtained: ${features.prior_auth_obtained === 1 ? "Yes" : "No"}
- Billed Amount: $${features.billed_amount}
- Submission Days Delay: ${features.submission_days_delay}
- Past Denial Count: ${features.past_denial_count}

Based on medical billing best practices and common denial reasons, analyze this claim.
Consider:
1. Medical necessity - does the diagnosis support the procedure?
2. Prior authorization requirements
3. Documentation completeness
4. Coding accuracy
5. Timely filing

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{"denial_probability": 0.XX, "predicted_status": "Approved" or "Denied", "denial_reason_code": "code or Approved", "remediation": "specific actionable advice"}`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    // Clean the response - remove markdown code blocks if present
    let cleanText = text.trim()
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.slice(7)
    }
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.slice(3)
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.slice(0, -3)
    }
    cleanText = cleanText.trim()

    const parsed = JSON.parse(cleanText)
    
    return {
      denial_probability: Math.min(1, Math.max(0, parsed.denial_probability || 0.5)),
      predicted_status: parsed.predicted_status || "Unknown",
      denial_reason_code: parsed.denial_reason_code || "Unknown",
      remediation: parsed.remediation || "Unable to generate remediation advice."
    }
  } catch (error) {
    console.error("LLM prediction error:", error)
    throw new Error("Failed to get AI prediction")
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is not configured. Please set it in your environment variables." },
        { status: 500 }
      )
    }

    const features: ClaimFeatures = await request.json()

    // Validate required fields
    const requiredFields = [
      "payer", "patient_age", "ICD_10_code", "CPT_code", "modifier",
      "documentation_quality_score", "prior_auth_obtained", "billed_amount",
      "submission_days_delay", "past_denial_count"
    ]
    
    for (const field of requiredFields) {
      if (features[field as keyof ClaimFeatures] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // 1. Check Rules Engine First (Veto Power - matches Python backend)
    const ruleResult = applyRulesEngine(features)
    if (ruleResult) {
      return NextResponse.json(ruleResult)
    }

    // 2. Fallback to LLM-based prediction
    const llmResult = await predictWithLLM(features)
    return NextResponse.json(llmResult)

  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Prediction failed" },
      { status: 500 }
    )
  }
}
