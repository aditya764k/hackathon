# 🛡️ ClaimShield AI
AI-Powered Healthcare Claim Denial Prevention System
<p align="center"> <img src="https://img.shields.io/badge/Healthcare-AI-blue?style=for-the-badge"> <img src="https://img.shields.io/badge/Machine%20Learning-Prediction-orange?style=for-the-badge"> <img src="https://img.shields.io/badge/Claim-Validation-green?style=for-the-badge"> </p>

## **📌 Overview**

ClaimShield AI is an intelligent healthcare claim analysis system that predicts insurance claim denials before submission.

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

Upload Clinical Document → OCR Code Extraction → Medical Billing Rule Engine → Machine Learning Prediction → Risk Classification → 
Remediation Suggestions → Claim History Storage

## ⭐ Key Features

📄 Clinical Document Processing

Extracts structured information from uploaded medical documents.

🤖 AI Denial Prediction

Predicts the probability of claim denial using machine learning.

⚖️ Billing Compliance Validation

Detects invalid combinations of diagnosis and procedure codes.

🛡️ Remediation Recommendations

Suggests corrective actions to reduce denial risk.

📊 Claim History Tracking

Maintains records of analyzed claims for auditing and analytics.

## 🧰 Tech Stack

<p>

<img src="https://img.shields.io/badge/Python-Backend-blue?style=for-the-badge&logo=python">
<img src="https://img.shields.io/badge/FastAPI-API-green?style=for-the-badge&logo=fastapi">
<img src="https://img.shields.io/badge/Streamlit-Dashboard-red?style=for-the-badge&logo=streamlit">
<img src="https://img.shields.io/badge/Scikit--Learn-ML-orange?style=for-the-badge&logo=scikit-learn">
<img src="https://img.shields.io/badge/Pandas-Data%20Processing-purple?style=for-the-badge&logo=pandas">
<img src="https://img.shields.io/badge/SQLite-Database-blue?style=for-the-badge&logo=sqlite">

</p>

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

1.Predict Claim Risk - 
POST /predict

   Returns denial probability and remediation suggestions.

2.Full AI Pipeline - 
POST /full_pipeline

   Processes uploaded clinical documents through:

- OCR extraction

- Rule validation

- ML prediction

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
