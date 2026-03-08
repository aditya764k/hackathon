# 🛡️ ClaimShield AI
AI-Powered Healthcare Claim Denial Prevention System
<p align="center"> <img src="https://img.shields.io/badge/Healthcare-AI-blue?style=for-the-badge"> <img src="https://img.shields.io/badge/Machine%20Learning-Prediction-orange?style=for-the-badge"> <img src="https://img.shields.io/badge/Claim-Validation-green?style=for-the-badge"> </p>

## **📌 Overview**

ClaimShield AI is an intelligent medical claim auditing platform that uses AI to predict claim approval likelihood, extract medical codes from clinical notes, and generate compliant billing documentation in real-time.

The platform combines:

📄 Clinical document processing

🤖 Machine learning prediction

⚖️ Medical billing rule validation

📊 Interactive analytics dashboard

to help healthcare providers detect claim issues early and avoid financial losses.

## ⚠️ Problem

Healthcare providers often face claim denials due to:

❌ incorrect ICD-10 and CPT code combinations

❌ missing prior authorization

❌ medical necessity conflicts

❌ incomplete clinical documentation

These issues lead to:

- delayed reimbursements

- administrative workload

- revenue loss

## 🎯 Solution

ClaimShield AI analyzes claims before they are submitted and provides:

✔ denial probability prediction

✔ billing rule validation

✔ automated remediation guidance

✔ claim history monitoring

## ⚙️ Workflow

 Medical Note Upload → AI OCR → Code Extraction → Rules Engine → Confidence Scoring → Export Ready

## Core Features

1. Medical Note Analysis

    * OCR processing of handwritten or typed clinical notes
      
    * Smart validation to reject non-medical documents
      
    * ICD‑10 diagnosis code extraction
      
    * CPT procedure code detection
      
    * AI-based confidence scoring
  
2. Claim Management
      
    * Real-time analytics dashboard
      
    * Claims history with search and filtering
      
    * Confidence level categorization
      
    * Claim approval/denial status tracking
      
3. Professional Export System
   
    * Medical superbill generation
      
    * EDI 837P ANSI X12 export files
      
    * ZIP download containing all billing documents
      
    * HIPAA-compliant workflow
  
4. Professional UI/UX
   
    * Dark mode healthcare dashboard
      
    * Responsive design
      
    * Accessibility compliance
      
    * Real-time updates


## 🧰 Tech Stack

<p align="center"> <img src="https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=next.js"> <img src="https://img.shields.io/badge/React-UI-blue?style=for-the-badge&logo=react"> <img src="https://img.shields.io/badge/TypeScript-Language-blue?style=for-the-badge&logo=typescript"> <img src="https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?style=for-the-badge&logo=tailwind-css"> <img src="https://img.shields.io/badge/Shadcn-UI%20Components-black?style=for-the-badge"> <img src="https://img.shields.io/badge/PostCSS-Styling-DD3A0A?style=for-the-badge&logo=postcss"> <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js"> </p>

## 📂 Project Structure

    HACKATHON
    
    │
    
    ├── app/   # Next.js App Router
    
    │   │
    
    │   ├── analyzer/                      # Claim analyzer dashboard
    
    │   │   └── page.tsx
    
    │   │
    
    │   ├── upload/                        # Upload clinical document page
    
    │   │   └── page.tsx
    
    │   │
    
    │   ├── workflow/                      # AI workflow visualization
    
    │   │   └── page.tsx
    
    │   │
    
    │   ├── history/                       # Claim history dashboard
    
    │   │   └── page.tsx
    
    │   │
    
    │   ├── api/                           # Backend API routes
    
    │   │   │
    
    │   │   ├── predict/                   # Claim denial prediction API
    
    │   │   │   └── route.ts
    
    │   │   │
    
    │   │   ├── full-pipeline/             # OCR + AI pipeline
    
    │   │   │   └── route.ts
    
    │   │   │
    
    │   │   └── export-claim/[claimId]/    # Claim export endpoint
    
    │   │       └── route.ts
    
    │   │
    
    │   ├── layout.tsx                     # Global layout
    
    │   ├── page.tsx                       # Landing dashboard
    
    │   └── globals.css                    # Global styling
    
    │
    
    ├── components/                        # Reusable UI components
    
    │   │
    
    │   ├── ui/                            # Base UI primitives
    
    │   │   ├── accordion.tsx
    
    │   │   ├── alert.tsx
    
    │   │   ├── avatar.tsx
    
    │   │   ├── badge.tsx
    
    │   │   ├── button.tsx
    
    │   │   ├── card.tsx
    
    │   │   ├── dialog.tsx
    
    │   │   ├── drawer.tsx
    
    │   │   ├── input.tsx
    
    │   │   ├── label.tsx
    
    │   │   ├── progress.tsx
    
    │   │   ├── select.tsx
    
    │   │   ├── table.tsx
    
    │   │   ├── tabs.tsx
    
    │   │   ├── toast.tsx
    
    │   │   └── tooltip.tsx
    
    │   │
    
    │   ├── claim-analyzer-form.tsx        # Claim input form
    
    │   ├── claims-table.tsx               # Claim history table
    
    │   ├── prediction-result.tsx          # AI prediction display
    
    │   ├── navbar.tsx                     # Navigation bar
    
    │   ├── sidebar.tsx                    # Dashboard sidebar
    
    │   ├── stat-card.tsx                  # Metrics cards
    
    │   └── upload-zone.tsx                # Document upload component
    
    │
    
    ├── hooks/                             # Custom React hooks
    
    │   ├── use-mobile.ts
    
    │   └── use-toast.ts
    
    │
    
    ├── lib/                               # Utility functions
    
    │   ├── utils.ts
    
    │   │
    
    │   └── export/                        # Healthcare export formats
    
    │       ├── edi837p.ts                 # Insurance EDI claim export
    
    │       └── superbill.ts               # Superbill generation
    
    │
    
    ├── services/
    
    │   └── api.ts                         # API request handler
    
    │
    
    ├── styles/
    
    │   └── globals.css                    # Global styling
    
    │
    
    ├── types/
    
    │   ├── claim-types.ts                 # Claim TypeScript interfaces
    
    │   └── env.d.ts                       # Environment types
    
    │
    
    ├── components.json                    # UI component configuration
    
    ├── next.config.mjs                    # Next.js configuration
    
    ├── tsconfig.json                      # TypeScript configuration
    
    ├── package.json                       # Dependencies
    
    └── README.md

## 🚀 API Endpoints

1. Predict Claim Risk - 
POST /api/predict

Returns:

Denial probability

Predicted claim status

Remediation suggestion

2. Full AI Pipeline -
POST /api/full-pipeline

Processes uploaded clinical documents through:

OCR extraction

Rule validation

Machine learning prediction

## 📊 Example Output

    Claim ID: CLM-2026-001
    
    Denial Probability: 12.0%
    
    Status: Approved
    
    Reason Code: N/A
    
    Remediation: Claim meets all billing requirements

## 🔮 Future Improvements

- integration with Electronic Health Records (EHR)

- advanced clinical NLP models

- automated fraud detection

- real-time healthcare analytics dashboard

## 📜 License

This project is developed for educational and research purposes.
