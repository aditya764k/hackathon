import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

if (!GOOGLE_API_KEY) {
  console.error("GOOGLE_API_KEY is not set in environment variables")
}

const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null

interface OCRResult {
  icd10: string[]
  cpt: string[]
  notes: string
  remediation: string
  validation_error: boolean
  validation_reason: string
}

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

// Extract ICD-10 and CPT codes from medical note image (combined validation + extraction)
async function extractFromNote(imageBase64: string, mimeType: string): Promise<OCRResult> {
  if (!genAI) {
    throw new Error("Google API key not configured")
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const prompt = `You are a medical document validator and billing assistant.

FIRST: Validate if this is a medical document. Be STRICT - only ACCEPT if it contains clear healthcare-related content.

ACCEPT the document if it contains ANY of these:
- Clinical encounter notes (SOAP format: Subjective, Objective, Assessment, Plan)
- Hospital or clinic names, patient information (name, age, ID, DOB)
- Medical terminology (diagnosis, symptoms, vitals, prescriptions, medications)
- Healthcare procedures, tests, treatments mentioned
- Doctor's notes, clinical documentation, medical forms
- Lab results, medical imaging reports

REJECT the document if it's clearly:
- Photos of food, landscapes, animals, objects, people
- Non-medical receipts, invoices, shopping lists
- Random screenshots, social media posts
- Text documents unrelated to healthcare
- Completely blank or illegible documents

SECOND: Only if this is a valid medical document, extract billing codes.

IMPORTANT: Read the ENTIRE document carefully and extract ALL relevant codes. Focus on the PRIMARY diagnosis and procedures mentioned.

EXTRACT DIAGNOSIS (ICD-10) - Match the ASSESSMENT/diagnosis to these codes:
- 'M54.50' = Low Back Pain, Back Pain, Lumbar Pain, Mechanical Strain
- 'J01.90' = Acute Sinusitis, Sinus Infection  
- 'E11.9' = Type 2 Diabetes, Diabetes Mellitus
- 'I10' = Hypertension, High Blood Pressure, Elevated BP
- 'J44.9' = COPD, Chronic Obstructive Pulmonary Disease

EXTRACT PROCEDURES (CPT) - Match the PLAN/procedures to these codes:
- '99213' = Office Visit Level 3 (routine visit, established patient, 15 minutes)
- '99214' = Office Visit Level 4 (moderate complexity) 
- '99215' = Office Visit Level 5 (high complexity)
- '93000' = ECG, EKG, Electrocardiogram
- '85025' = CBC, Complete Blood Count, Blood Test

KEYWORD MAPPING (use these exact matches):
- "low back pain", "back pain", "lumbar pain", "mechanical strain" → M54.50
- "acute sinusitis", "sinus infection", "sinusitis", "facial pressure", "nasal congestion" → J01.90
- "blood pressure", "hypertension", "elevated BP", "142/88" → I10
- "diabetes", "diabetes mellitus" → E11.9
- "COPD", "chronic obstructive" → J44.9
- "ECG", "EKG", "electrocardiogram" → 93000
- "CBC", "blood count", "blood test", "lab work", "complete blood count" → 85025
- "routine visit", "established patient", "15 minutes" → 99213
- Physical exam with detailed assessment → 99214

PRIORITY: If multiple diagnoses exist, prioritize the PRIMARY/MAIN complaint first.

Return ONLY valid JSON (no markdown, no code blocks):
{"is_medical_note": true/false, "confidence": 0.0-1.0, "reason": "validation explanation", "icd10": ["code1", "code2"], "cpt": ["code1", "code2"], "notes": "brief clinical summary", "remediation": "billing advice - mention specific billing concerns"}`

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64
        }
      },
      prompt
    ])
    
    const response = result.response
    let text = response.text().trim()
    
    console.log("Raw AI Response:", text)
    
    // Clean markdown if present
    if (text.startsWith("```json")) text = text.slice(7)
    if (text.startsWith("```")) text = text.slice(3)
    if (text.endsWith("```")) text = text.slice(0, -3)
    text = text.trim()

    console.log("Cleaned AI Response:", text)

    const parsed = JSON.parse(text)
    
    console.log("Parsed JSON:", parsed)
    
    // Check validation - be strict about non-medical documents
    const isMedical = parsed.is_medical_note ?? false
    const confidence = parsed.confidence ?? 0.0
    
    // If clearly not a medical document, reject immediately
    if (!isMedical) {
      return {
        icd10: [],
        cpt: [],
        notes: `Invalid document: ${parsed.reason || "Not a medical document"}`,
        remediation: "Please upload a valid medical clinical note or doctor's documentation.",
        validation_error: true,
        validation_reason: parsed.reason || "Not a medical document"
      }
    }
    
    return {
      icd10: Array.isArray(parsed.icd10) ? parsed.icd10 : [],
      cpt: Array.isArray(parsed.cpt) ? parsed.cpt : [],
      notes: parsed.notes || "",
      remediation: parsed.remediation || "",
      validation_error: false,
      validation_reason: ""
    }
  } catch (error) {
    console.error("Extraction error:", error)
    
    // If it's a model/API error, provide a helpful error message
    if (error instanceof Error && error.message.includes("404")) {
      return {
        icd10: [],
        cpt: [],
        notes: "AI model not available. Please check your API key and model access.",
        remediation: "Contact support to verify your Google AI API configuration.",
        validation_error: true,
        validation_reason: "Model configuration error"
      }
    }
    
    return {
      icd10: [],
      cpt: [],
      notes: "Error during extraction.",
      remediation: "Unable to generate remediation due to extraction error.",
      validation_error: false,
      validation_reason: ""
    }
  }
}

// Rules Engine (same as predict endpoint)
function applyRulesEngine(features: ClaimFeatures): {
  denial_probability: number
  predicted_status: string
  denial_reason_code: string
  remediation: string
} | null {
  const icd = features.ICD_10_code
  const cpt = features.CPT_code
  const auth = features.prior_auth_obtained

  // Rule A: Sinusitis + ECG
  if (icd === "J01.90" && cpt === "93000") {
    return {
      denial_probability: 0.99,
      predicted_status: "Denied",
      denial_reason_code: "CO-50 (Medical Necessity)",
      remediation: "Remove CPT 93000. An ECG is not medically necessary for Acute Sinusitis."
    }
  }

  // Rule B: Back Pain + Blood Test
  if (icd === "M54.50" && cpt === "85025") {
    return {
      denial_probability: 0.98,
      predicted_status: "Denied",
      denial_reason_code: "CO-50 (Medical Necessity)",
      remediation: "Remove CPT 85025. Routine blood work (CBC) is not indicated for mechanical back pain."
    }
  }

  // Rule C: Level 5 Without Prior Auth
  if (cpt === "99215" && auth === 0) {
    return {
      denial_probability: 0.85,
      predicted_status: "Denied",
      denial_reason_code: "Missing Prior Auth",
      remediation: "Level 5 complex visits require prior authorization. Please attach auth number."
    }
  }

  // Rule D: Upcoding
  if (icd === "J01.90" && cpt === "99215") {
    return {
      denial_probability: 0.95,
      predicted_status: "Denied",
      denial_reason_code: "CO-11 (Inconsistent with Diagnosis)",
      remediation: "Downcode to 99213. A routine sinus infection does not meet Level 5 criteria."
    }
  }

  return null
}


export async function POST(request: NextRequest) {
  try {
    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is not configured. Please set it in your environment variables." },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const payer = (formData.get("payer") as string) || "Medicare"

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Please upload an image (JPEG, PNG, WebP, HEIC).` },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Extract codes from the medical note
    const ocrResult = await extractFromNote(base64, file.type)

    // Check for validation errors
    if (ocrResult.validation_error) {
      return NextResponse.json({
        ocr: ocrResult,
        validation_error: true,
        validation_reason: ocrResult.validation_reason,
        denial_probability: 1.0,
        predicted_status: "Rejected",
        denial_reason_code: "Invalid Document",
        remediation: ocrResult.remediation
      })
    }

    // Use extracted codes or defaults
    const icdList = ocrResult.icd10.length > 0 ? ocrResult.icd10 : ["J01.90"]
    const cptList = ocrResult.cpt.length > 0 ? ocrResult.cpt : ["99213"]

    let worstProb = -1.0
    let finalOutput: Record<string, unknown> = {}

    // Test all ICD/CPT combinations (matches Python backend)
    for (const icd of icdList) {
      for (const cpt of cptList) {
        const features: ClaimFeatures = {
          payer,
          patient_age: 45,
          ICD_10_code: icd,
          CPT_code: cpt,
          modifier: "None",
          documentation_quality_score: 0.8,
          prior_auth_obtained: 0,
          billed_amount: 150.0,
          submission_days_delay: 3,
          past_denial_count: 0
        }

        // Use rules engine only (no LLM calls to save API usage)
        let currentResult = applyRulesEngine(features)
        
        // If no rules matched, use default prediction
        if (!currentResult) {
          currentResult = {
            denial_probability: 0.3,
            predicted_status: "Approved",
            denial_reason_code: "Approved",
            remediation: "Claim appears compliant with standard billing rules."
          }
        }

        // Use LLM-generated remediation from OCR
        currentResult.remediation = ocrResult.remediation || currentResult.remediation

        if (currentResult.denial_probability > worstProb) {
          worstProb = currentResult.denial_probability
          finalOutput = {
            ocr: ocrResult,
            default_features: features,
            ...currentResult
          }
        }
      }
    }

    return NextResponse.json(finalOutput)

  } catch (error) {
    console.error("Pipeline error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pipeline failed" },
      { status: 500 }
    )
  }
}
