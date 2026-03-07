"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts"

interface DenialDistributionChartProps {
  data: { range: string; count: number }[]
}

export function DenialDistributionChart({ data }: { data: { range: string; count: number }[] }) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' }}>
      <h3 className="mb-4 text-lg font-semibold" style={{ color: '#f0f0f0' }}>Confidence Level Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
            <XAxis
              dataKey="range"
              tick={{ fill: '#f0f0f0', fontSize: 12 }}
              axisLine={{ stroke: '#404040' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#f0f0f0', fontSize: 12 }}
              axisLine={{ stroke: '#404040' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #404040',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              }}
              labelStyle={{ color: '#f0f0f0' }}
              itemStyle={{ color: '#00d4ff' }}
            />
            <Bar
              dataKey="count"
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              name="Claims"
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity={1} />
                <stop offset="100%" stopColor="#0066cc" stopOpacity={1} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface ClaimsTrendChartProps {
  data: { date: string; approved: number; denied: number }[]
}

export function ClaimsTrendChart({ data }: ClaimsTrendChartProps) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' }}>
      <h3 className="mb-4 text-lg font-semibold" style={{ color: '#f0f0f0' }}>Claims Trend (Last 7 Days)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDenied" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#f0f0f0', fontSize: 12 }}
              axisLine={{ stroke: '#404040' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#f0f0f0', fontSize: 12 }}
              axisLine={{ stroke: '#404040' }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #404040',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              }}
              labelStyle={{ color: '#f0f0f0' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span style={{ color: value === 'Approved' ? '#10b981' : '#dc2626' }}>{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="approved"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#colorApproved)"
              name="Approved"
            />
            <Area
              type="monotone"
              dataKey="denied"
              stroke="#dc2626"
              strokeWidth={3}
              fill="url(#colorDenied)"
              name="Denied"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
      <div className="mb-4 h-6 w-48 rounded bg-muted" />
      <div className="h-64 rounded bg-muted/50" />
    </div>
  )
}
