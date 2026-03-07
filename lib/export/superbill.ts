import type { Claim } from '@/types/claim-types'
import { ICD_CODES, CPT_CODES } from '@/types/claim-types'

export async function generateSuperbillPDF(claim: Claim): Promise<Buffer> {
  // Generate HTML for the superbill
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Medical Superbill - ${claim.id}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .provider-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 2px;
        }
        .patient-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
        }
        .codes-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .codes-table th,
        .codes-table td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }
        .codes-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .signature {
            margin-top: 40px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>MEDICAL SUPERBILL</h1>
        <h2>CITY GENERAL HOSPITAL</h2>
        <p>123 Medical Center Drive, Anytown, USA 12345</p>
        <p>Tel: (555) 123-4567 | Fax: (555) 123-4568</p>
    </div>

    <div class="provider-info">
        <div>
            <div class="section-title">PROVIDER INFORMATION</div>
            <p><strong>Provider:</strong> Dr. Sarah Johnson</p>
            <p><strong>NPI:</strong> 1234567890</p>
            <p><strong>Tax ID:</strong> 12-3456789</p>
        </div>
        <div>
            <div class="section-title">SERVICE INFORMATION</div>
            <p><strong>Date of Service:</strong> ${claim.date}</p>
            <p><strong>Place of Service:</strong> Office (11)</p>
            <p><strong>Payer:</strong> ${claim.payer}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">PATIENT INFORMATION</div>
        <div class="patient-info">
            <div>
                <p><strong>Patient ID:</strong> ${claim.id}</p>
                <p><strong>Patient Age:</strong> ${claim.patient_age}</p>
            </div>
            <div>
                <p><strong>Gender:</strong> [Not Specified]</p>
                <p><strong>Phone:</strong> [Not Specified]</p>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">DIAGNOSIS CODES (ICD-10)</div>
        <table class="codes-table">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Qualifier</th>
                </tr>
            </thead>
            <tbody>
                ${claim.ICD_10_code.split(',').map((code, index) => {
                  const icdInfo = ICD_CODES.find(icd => icd.code === code.trim())
                  return `
                <tr>
                    <td>${code.trim()}</td>
                    <td>${icdInfo?.description || 'Unknown diagnosis'}</td>
                    <td>ABK</td>
                </tr>`
                }).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">PROCEDURE CODES (CPT)</div>
        <table class="codes-table">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Modifier</th>
                    <th>Charge</th>
                </tr>
            </thead>
            <tbody>
                ${claim.CPT_code.split(',').map((code, index) => {
                  const cptInfo = CPT_CODES.find(cpt => cpt.code === code.trim())
                  return `
                <tr>
                    <td>${code.trim()}</td>
                    <td>${cptInfo?.description || 'Unknown procedure'}</td>
                    <td>${claim.modifier || 'None'}</td>
                    <td>$${claim.billed_amount.toFixed(2)}</td>
                </tr>`
                }).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">ADDITIONAL INFORMATION</div>
        <p><strong>Documentation Quality Score:</strong> ${(claim.documentation_quality_score * 100).toFixed(0)}%</p>
        <p><strong>Prior Authorization:</strong> ${claim.prior_auth_obtained ? 'Yes' : 'No'}</p>
        <p><strong>Submission Delay:</strong> ${claim.submission_days_delay} days</p>
    </div>

    <div class="signature">
        <p><strong>Provider Signature:</strong> _________________________</p>
        <p><strong>Date:</strong> _________________________</p>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
            This superbill is generated electronically and is valid for billing purposes.
            Generated on ${new Date().toLocaleDateString()} by ClaimShield AI.
        </p>
    </div>
</body>
</html>
  `

  // For now, return HTML as buffer (in production, you'd use a PDF library like puppeteer)
  return Buffer.from(html, 'utf-8')
}
