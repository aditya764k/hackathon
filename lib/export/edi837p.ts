import type { Claim } from '@/types/claim-types'

export async function generateEDI837P(claim: Claim): Promise<Buffer> {
  const currentDate = new Date().toISOString().replace(/-/g, '').substring(0, 8)
  const serviceDate = claim.date.replace(/-/g, '')
  
  // EDI 837P Professional Claim Format
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
