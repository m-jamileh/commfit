"use client";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Briefcase,
  DollarSign,
  FileCheck,
  Users,
  TrendingUp,
  Package,
} from "lucide-react";
import {
  Kpi,
  Card,
  PageHeader,
  AccentRail,
  useMonthlyJobsReport,
  useRevenueReport,
} from "@commfit/ui";

export default function OverviewPage() {
  const { data: monthlyJobs } = useMonthlyJobsReport();
  const { data: revenueData } = useRevenueReport();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Overview"
        breadcrumbs={[{ label: "Operations" }, { label: "Overview" }]}
        description="Business performance at a glance"
      />

      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Total Jobs (MTD)" value="47" icon={Briefcase} trend="up" trendLabel="+12% vs last month" />
        <Kpi label="Revenue (MTD)" value="$84,200" icon={DollarSign} trend="up" trendLabel="+8% vs last month" />
        <Kpi label="Invoices Sent" value="23" icon={FileCheck} trend="flat" trendLabel="Same as avg" />
        <Kpi label="Active Technicians" value="4 / 5" icon={Users} trend="flat" trendLabel="1 offline today" />
        <Kpi label="Open Contracts" value="4" icon={TrendingUp} trend="up" trendLabel="+1 new this month" />
        <Kpi label="Parts Requests" value="12" icon={Package} trend="down" trendLabel="-3 vs last week" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card padding="lg">
          <AccentRail label="Monthly Jobs by Type" className="mb-4" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyJobs ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B6560" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6B6560" }} />
              <Tooltip
                contentStyle={{ fontSize: 12, border: "1px solid #E2DDD6", borderRadius: 6 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="pm" name="PM" fill="#16314D" radius={[2, 2, 0, 0]} />
              <Bar dataKey="sr" name="SR" fill="#C3551A" radius={[2, 2, 0, 0]} />
              <Bar dataKey="disinfecting" name="Disinfecting" fill="#2A5780" radius={[2, 2, 0, 0]} />
              <Bar dataKey="install" name="Install" fill="#2C6A45" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="lg">
          <AccentRail label="Revenue & Invoiced (Monthly)" className="mb-4" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B6560" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B6560" }}
                tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, border: "1px solid #E2DDD6", borderRadius: 6 }}
                formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#16314D"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="invoiced"
                name="Invoiced"
                stroke="#C3551A"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
