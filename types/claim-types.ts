export interface ClaimFeatures {
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

export interface PredictionResult {
  denial_probability: number
  predicted_status: "Approved" | "Denied" | "Rejected" | "Error" | "Unknown"
  denial_reason_code: string
  remediation: string
}

export interface OCRResult {
  icd10: string[]
  cpt: string[]
  notes: string
  remediation: string
  validation_error?: boolean
  validation_reason?: string
}

export interface FullPipelineResult extends PredictionResult {
  ocr: OCRResult
  default_features?: ClaimFeatures
  validation_error?: boolean
  validation_reason?: string
}

export interface Claim {
  id: string
  payer: string
  patient_age: number
  ICD_10_code: string
  ICD_10_description?: string
  CPT_code: string
  CPT_description?: string
  modifier: string
  documentation_quality_score: number
  prior_auth_obtained: number
  billed_amount: number
  submission_days_delay: number
  past_denial_count: number
  claim_status: "Approved" | "Denied"
  denial_reason_code: string
  denial_probability: number
  date: string
  remediation?: string
}

export interface AnalyticsData {
  totalClaims: number
  approvedClaims: number
  deniedClaims: number
  highConfidenceClaims: number
  confidenceDistribution: {
    range: string
    count: number
  }[]
  claimsTrend: {
    date: string
    approved: number
    denied: number
  }[]
}

export const ICD_CODES = [
  { code: "J01.90", description: "Acute sinusitis, unspecified" },
  { code: "M54.50", description: "Low back pain, unspecified" },
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
  { code: "I10", description: "Essential (primary) hypertension" },
  { code: "J44.9", description: "Chronic obstructive pulmonary disease, unspecified" },
]

export const CPT_CODES = [
  { code: "99213", description: "Standard office visit (15 min)" },
  { code: "99214", description: "Extended office visit (25 min)" },
  { code: "99215", description: "Complex office visit (40 min)" },
  { code: "93000", description: "Electrocardiogram (ECG)" },
  { code: "85025", description: "Complete blood count (CBC)" },
]

export const PAYERS = ["Medicare", "BlueCross", "Aetna"]

export const MODIFIERS = ["25", "59", "None"]
