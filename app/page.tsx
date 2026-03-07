"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { StatCard, StatCardSkeleton } from "@/components/stat-card"
import { DenialDistributionChart, ClaimsTrendChart, ChartSkeleton } from "@/components/charts"
import { ClaimsTable, ClaimsTableSkeleton } from "@/components/claims-table"
import { getAnalytics, getRecentClaims } from "@/services/api"
import type { AnalyticsData, Claim } from "@/types/claim-types"
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [recentClaims, setRecentClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [analyticsData, claimsData] = await Promise.all([
          getAnalytics(),
          getRecentClaims(5),
        ])
        setAnalytics(analyticsData)
        setRecentClaims(claimsData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar title="Dashboard" subtitle="Overview of claim analytics and recent activity" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : analytics ? (
            <>
              <StatCard
                title="Total Claims"
                value={analytics.totalClaims.toLocaleString()}
                change="+12% from last month"
                changeType="positive"
                icon={FileText}
                iconColor="bg-primary/10 text-primary"
              />
              <StatCard
                title="Approved Claims"
                value={analytics.approvedClaims.toLocaleString()}
                change={`${((analytics.approvedClaims / analytics.totalClaims) * 100).toFixed(1)}% approval rate`}
                changeType="positive"
                icon={CheckCircle2}
                iconColor="bg-success/10 text-success"
              />
              <StatCard
                title="Denied Claims"
                value={analytics.deniedClaims.toLocaleString()}
                change={`${((analytics.deniedClaims / analytics.totalClaims) * 100).toFixed(1)}% denial rate`}
                changeType="negative"
                icon={XCircle}
                iconColor="bg-destructive/10 text-destructive"
              />
              <StatCard
                title="High Confidence Claims"
                value={analytics.highConfidenceClaims?.toLocaleString() || "0"}
                change="Confidence level > 70%"
                changeType="neutral"
                icon={AlertTriangle}
                iconColor="bg-warning/10 text-warning"
              />
            </>
          ) : null}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {isLoading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : analytics ? (
            <>
              <DenialDistributionChart data={analytics.confidenceDistribution} />
              <ClaimsTrendChart data={analytics.claimsTrend} />
            </>
          ) : null}
        </div>

        {/* Recent Claims */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Recent Claims</h2>
              <p className="text-sm text-muted-foreground">Latest processed claims from the system</p>
            </div>
            <Link href="/history">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <ClaimsTableSkeleton rows={5} />
          ) : recentClaims.length > 0 ? (
            <ClaimsTable claims={recentClaims} compact />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">No Claims Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Analyze your first claim to see it appear here.
              </p>
              <Link href="/analyzer">
                <Button className="mt-4" size="sm">
                  Analyze First Claim
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/upload" className="group">
            <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Upload Medical Note
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Process a new document through the AI pipeline
              </p>
            </div>
          </Link>

          <Link href="/analyzer" className="group">
            <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                Analyze Claim
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Manually test a claim for denial risk
              </p>
            </div>
          </Link>

          <Link href="/workflow" className="group">
            <div className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-success/50 hover:shadow-lg hover:shadow-success/5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground transition-colors">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-success transition-colors">
                View AI Workflow
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Understand how the system processes claims
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
