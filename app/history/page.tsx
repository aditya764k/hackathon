"use client"

import { useEffect, useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { ClaimsTable, ClaimsTableSkeleton } from "@/components/claims-table"
import { getClaims } from "@/services/api"
import type { Claim } from "@/types/claim-types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 15

export default function HistoryPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function loadClaims() {
      try {
        const data = await getClaims()
        setClaims(data)
      } catch (error) {
        console.error("Failed to load claims:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadClaims()
  }, [])

  const filteredClaims = useMemo(() => {
    let result = claims

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (claim) =>
          claim.id.toLowerCase().includes(query) ||
          claim.ICD_10_code.toLowerCase().includes(query) ||
          claim.CPT_code.toLowerCase().includes(query) ||
          claim.payer.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "high-confidence") {
        result = result.filter((claim) => claim.denial_probability >= 0.7)
      } else {
        result = result.filter(
          (claim) => claim.claim_status.toLowerCase() === statusFilter
        )
      }
    }

    return result
  }, [claims, searchQuery, statusFilter])

  const totalPages = Math.ceil(filteredClaims.length / ITEMS_PER_PAGE)
  const paginatedClaims = filteredClaims.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  return (
    <div className="min-h-screen">
      <Navbar title="Claim History" subtitle="Browse and search all processed claims" />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by ID, ICD-10, CPT, or payer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-secondary">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Claims</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="high-confidence">High Confidence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 text-sm">
          <div className="text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {paginatedClaims.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {filteredClaims.length}
            </span>{" "}
            claims
          </div>
          {statusFilter !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="text-primary hover:text-primary"
            >
              Clear filter
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <ClaimsTableSkeleton rows={10} />
        ) : filteredClaims.length > 0 ? (
          <ClaimsTable claims={paginatedClaims} />
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">No claims found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery
                ? `No claims match "${searchQuery}"`
                : "Try adjusting your filters"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-9"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
