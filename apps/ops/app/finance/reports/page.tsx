"use client";
import { useState } from "react";
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
} from "recharts";
import { Download } from "lucide-react";
import {
  PageHeader,
  Card,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  useMonthlyJobsReport,
  useRevenueReport,
  useTechPerformanceReport,
  useEquipmentHealthReport,
  downloadCsv,
} from "@commfit/ui";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last-12");
  const { data: monthlyJobs } = useMonthlyJobsReport();
  const { data: revenue } = useRevenueReport();
  const { data: techPerf } = useTechPerformanceReport();
  const { data: equipHealth } = useEquipmentHealthReport();

  function handleExport(reportName: string) {
    const slug = reportName.toLowerCase().replace(/\s+/g, "-");
    const filename = `commfit-${slug}-${dateRange}.csv`;
    if (reportName === "Jobs by Month" && monthlyJobs) {
      downloadCsv(monthlyJobs, filename);
    } else if (reportName === "Revenue" && revenue) {
      downloadCsv(revenue, filename);
    } else if (reportName === "Tech Performance" && techPerf) {
      downloadCsv(techPerf, filename);
    } else if (reportName === "Equipment Health" && equipHealth) {
      downloadCsv([equipHealth], filename);
    } else if (reportName === "PM Compliance") {
      downloadCsv([
        { account: "Sunset Properties LLC", compliance_pct: 92 },
        { account: "Marriott/Hilton Hotels DFW", compliance_pct: 88 },
        { account: "Plano ISD", compliance_pct: 79 },
      ], filename);
    } else if (reportName === "Warranty Claims") {
      downloadCsv([
        { year: 2025, claims: 2, recovered_usd: 600 },
      ], filename);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Reports"
        breadcrumbs={[{ label: "Finance" }, { label: "Reports" }]}
        actions={
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-8 rounded border border-border bg-surface text-sm text-text-primary px-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="last-12">Last 12 Months</option>
            <option value="ytd">Year to Date</option>
            <option value="q1">Q1 2025</option>
            <option value="q2">Q2 2025</option>
          </select>
        }
      />

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Jobs by Month</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="tech">Tech Performance</TabsTrigger>
          <TabsTrigger value="equipment">Equipment Health</TabsTrigger>
          <TabsTrigger value="pm-compliance">PM Compliance</TabsTrigger>
          <TabsTrigger value="warranty">Warranty Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Jobs by Month & Type</h3>
              <Button variant="ghost" size="sm" onClick={() => handleExport("Jobs by Month")}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyJobs ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B6560" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6B6560" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Bar dataKey="pm" name="PM" fill="#16314D" radius={[2, 2, 0, 0]} />
                <Bar dataKey="sr" name="SR" fill="#C3551A" radius={[2, 2, 0, 0]} />
                <Bar dataKey="disinfecting" name="Disinfecting" fill="#2A5780" radius={[2, 2, 0, 0]} />
                <Bar dataKey="install" name="Install" fill="#2C6A45" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Revenue vs Invoiced</h3>
              <Button variant="ghost" size="sm" onClick={() => handleExport("Revenue")}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenue ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B6560" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6B6560" }} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#16314D" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="invoiced" name="Invoiced" stroke="#C3551A" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="tech">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Technician Performance</h3>
              <Button variant="ghost" size="sm" onClick={() => handleExport("Tech Performance")}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
            <div className="space-y-3">
              {(techPerf ?? []).map((t, i) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                  <div className="w-40 font-medium text-text-primary text-sm">{t.techName}</div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min((t.jobsCompleted / 40) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-text-primary w-20 text-right">
                    {t.jobsCompleted} jobs
                  </div>
                  <div className="text-sm text-text-secondary w-16 text-right">
                    ★ {t.avgRating}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="equipment">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Equipment Health Distribution</h3>
              <Button variant="ghost" size="sm" onClick={() => handleExport("Equipment Health")}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
            {equipHealth && (
              <div className="space-y-3">
                {[
                  { label: "Excellent", count: equipHealth.excellent, color: "bg-success", pct: Math.round(equipHealth.excellent / 15 * 100) },
                  { label: "Good", count: equipHealth.good, color: "bg-info", pct: Math.round(equipHealth.good / 15 * 100) },
                  { label: "Fair", count: equipHealth.fair, color: "bg-warning", pct: Math.round(equipHealth.fair / 15 * 100) },
                  { label: "Poor", count: equipHealth.poor, color: "bg-danger", pct: Math.round(equipHealth.poor / 15 * 100) },
                ].map((seg) => (
                  <div key={seg.label} className="flex items-center gap-3">
                    <div className="w-20 text-sm text-text-secondary">{seg.label}</div>
                    <div className="flex-1 h-4 rounded-full bg-border overflow-hidden">
                      <div className={`h-full rounded-full ${seg.color}`} style={{ width: `${seg.pct}%` }} />
                    </div>
                    <div className="w-12 text-sm font-medium text-right text-text-primary">{seg.count} units</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="pm-compliance">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">PM Compliance Rate</h3>
              <Button variant="ghost" size="sm" onClick={() => handleExport("PM Compliance")}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
            <p className="text-sm text-text-secondary">Overall PM compliance this quarter: <strong className="text-text-primary">87%</strong></p>
            <div className="mt-4 space-y-2 text-sm text-text-secondary">
              <p>Sunset Properties LLC — 92%</p>
              <p>Marriott/Hilton Hotels DFW — 88%</p>
              <p>Plano ISD — 79%</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="warranty">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Warranty Claims</h3>
              <Button variant="ghost" size="sm" onClick={() => handleExport("Warranty Claims")}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
            <p className="text-sm text-text-secondary">2 warranty claims filed this year totaling <strong className="text-text-primary">$600</strong> recovered from suppliers.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
