"use client"

import { cn } from "@/lib/utils"
import type { Claim } from "@/types/claim-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ClaimsTableProps {
  claims: Claim[]
  compact?: boolean
}

export function ClaimsTable({ claims, compact = false }: ClaimsTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium">Claim ID</TableHead>
            <TableHead className="text-muted-foreground font-medium">ICD-10</TableHead>
            <TableHead className="text-muted-foreground font-medium">CPT</TableHead>
            {!compact && <TableHead className="text-muted-foreground font-medium">Payer</TableHead>}
            <TableHead className="text-muted-foreground font-medium">Confidence</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            {!compact && <TableHead className="text-muted-foreground font-medium">Date</TableHead>}
            {!compact && <TableHead className="text-muted-foreground font-medium">Export</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((claim) => (
            <TableRow
              key={claim.id}
              className="border-border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <TableCell className="font-mono text-sm">{claim.id}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{claim.ICD_10_code}</span>
                  {!compact && (
                    <span className="text-xs text-muted-foreground truncate max-w-32">
                      {claim.ICD_10_description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{claim.CPT_code}</span>
                  {!compact && (
                    <span className="text-xs text-muted-foreground truncate max-w-32">
                      {claim.CPT_description}
                    </span>
                  )}
                </div>
              </TableCell>
              {!compact && <TableCell className="text-foreground">{claim.payer}</TableCell>}
              <TableCell>
                <ConfidenceBadge probability={claim.denial_probability} />
              </TableCell>
              <TableCell>
                <StatusBadge status={claim.claim_status} />
              </TableCell>
              {!compact && (
                <TableCell className="text-muted-foreground">{claim.date}</TableCell>
              )}
              {!compact && (
                <TableCell>
                  <ExportButton claim={claim} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ConfidenceBadge({ probability }: { probability: number }) {
  const percentage = Math.round(probability * 100)
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
  let label = "Low"

  if (percentage >= 70) {
    variant = "destructive"
    label = "High"
  } else if (percentage >= 40) {
    variant = "default"
    label = "Medium"
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        "font-medium",
        variant === "destructive" && "bg-destructive/20 text-destructive hover:bg-destructive/30",
        variant === "default" && "bg-warning/20 text-warning-foreground hover:bg-warning/30",
        variant === "secondary" && "bg-success/20 text-success hover:bg-success/30"
      )}
    >
      {percentage}% {label}
    </Badge>
  )
}

function ExportButton({ claim }: { claim: Claim }) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (claim.claim_status !== "Approved") {
      return
    }

    setIsExporting(true)
    try {
      const response = await fetch(`/api/export-claim/${claim.id}`)
      if (!response.ok) throw new Error("Export failed")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `claim-${claim.id}-export.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  if (claim.claim_status !== "Approved") {
    return <span className="text-xs text-muted-foreground">-</span>
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className="text-xs"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-3 w-3 mr-1" />
          Download Pack
        </>
      )}
    </Button>
  )
}

function StatusBadge({ status }: { status: "Approved" | "Denied" }) {
  return (
    <Badge
      variant={status === "Approved" ? "secondary" : "destructive"}
      className={cn(
        "font-medium",
        status === "Approved" && "bg-success/20 text-success hover:bg-success/30",
        status === "Denied" && "bg-destructive/20 text-destructive hover:bg-destructive/30"
      )}
    >
      {status}
    </Badge>
  )
}

export function ClaimsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="p-4 space-y-4">
        <div className="h-8 bg-muted rounded" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded" />
        ))}
      </div>
    </div>
  )
}
