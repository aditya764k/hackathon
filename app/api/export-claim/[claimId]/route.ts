import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'

// Mock claim data for server-side (in production, this would come from a database)
const mockClaims: any[] = [
  {
    id: 'CLM-MMFQ6KW6',
    payer: 'Medicare',
    patient_age: 52,
    ICD_10_code: 'M54.50',
    CPT_code: '99214,85025',
    modifier: 'None',
    documentation_quality_score: 0.8,
    prior_auth_obtained: 0,
    billed_amount: 150.0,
    submission_days_delay: 3,
    past_denial_count: 0,
    claim_status: 'Approved',
    denial_reason_code: 'Approved',
    denial_probability: 0.3,
    date: new Date().toISOString().split('T')[0],
    remediation: 'Claim appears compliant with standard billing rules.'
  },
  {
    id: 'CLM-MMFTJD23',
    payer: 'BlueCross',
    patient_age: 58,
    ICD_10_code: 'E11.9',
    CPT_code: '99213',
    modifier: 'None',
    documentation_quality_score: 0.9,
    prior_auth_obtained: 0,
    billed_amount: 120.0,
    submission_days_delay: 2,
    past_denial_count: 0,
    claim_status: 'Approved',
    denial_reason_code: 'Approved',
    denial_probability: 0.25,
    date: new Date().toISOString().split('T')[0],
    remediation: 'Claim appears compliant with standard billing rules.'
  }
]

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ claimId: string }> }
) {
  try {
    const { claimId } = await context.params
    
    // Find the claim (in production, this would query your database)
    const claim = mockClaims.find(c => c.id === claimId)
    
    if (!claim) {
      console.log('Claim not found:', claimId)
      console.log('Available claims:', mockClaims.map(c => c.id))
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }
    
    if (claim.claim_status !== 'Approved') {
      return NextResponse.json({ error: 'Only approved claims can be exported' }, { status: 400 })
    }

    console.log('Exporting claim:', claim.id)

    // Generate both files
    const [superbillPDF, edi837pText] = await Promise.all([
      generateSuperbillPDF(claim),
      generateEDI837P(claim)
    ])

    // Create ZIP file
    const zip = new JSZip()
    zip.file(`superbill-${claim.id}.html`, superbillPDF)
    zip.file(`edi-837p-${claim.id}.txt`, edi837pText)

    const zipBuffer = await zip.generateAsync({ type: 'uint8array' })

    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="claim-${claim.id}-export.zip"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export claim' },
      { status: 500 }
    )
  }
}

// Import the generators inline to avoid server-side issues
async function generateSuperbillPDF(claim: any): Promise<Buffer> {
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
                ${claim.ICD_10_code.split(',').map((code: string) => `
                <tr>
                    <td>${code.trim()}</td>
                    <td>Low back pain, unspecified</td>
                    <td>ABK</td>
                </tr>`).join('')}
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
                ${claim.CPT_code.split(',').map((code: string) => `
                <tr>
                    <td>${code.trim()}</td>
                    <td>${code.trim() === '99214' ? 'Extended office visit (25 min)' : 'Complete blood count (CBC)'}</td>
                    <td>${claim.modifier || 'None'}</td>
                    <td>$${claim.billed_amount.toFixed(2)}</td>
                </tr>`).join('')}
            </tbody>
        </table>
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

  return Buffer.from(html, 'utf-8')
}

async function generateEDI837P(claim: any): Promise<Buffer> {
  const currentDate = new Date().toISOString().replace(/-/g, '').substring(0, 8)
  const serviceDate = claim.date.replace(/-/g, '')
  
  const edi837p = `ISA*00*          *00*          *ZZ*SENDERID       *ZZ*RECEIVERID     *${currentDate}*1100*U*00401*000000001*0*P*>~
GS*HC*SENDERID*RECEIVERID*${currentDate}*${currentDate}*1*X*004010~
ST*837*0001~
BHT*0010*00*${claim.id}*${currentDate}*${currentDate}~
NM1*41*2*SENDERID*****46*SENDER NAME~
NM1*40*2*RECEIVERID*****46*RECEIVER NAME~
NM1*85*2***PI***${claim.id}~
N3*85*123 MAIN ST~
N4*85*ANYTOWN*ST*12345~
DMG*D8*${(new Date().getFullYear() - claim.patient_age).toString().padStart(8, '0')}*M~
NM1*IL*1***MI***${claim.id}~
N3*IL*456 PATIENT AVE~
N4*IL*ANYTOWN*ST*12345~
NM1*PR*2*${claim.payer}*****PI*${claim.payer}~
NM1*1P*2*PROVIDER NAME*****XX*1234567890~
CLM*${claim.id}*${claim.billed_amount.toFixed(2)}*HC*${claim.CPT_code}*${claim.modifier || ''}~
HI*ABK:${claim.ICD_10_code}~
SV1*HC*${claim.CPT_code}*${claim.billed_amount.toFixed(2)}***${claim.modifier || ''}~
DTM*473*${serviceDate}~
SE*18*0001~
GE*1*1~
IEA*1*000000001~`

  return Buffer.from(edi837p, 'utf-8')
}
