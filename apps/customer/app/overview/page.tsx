"use client";
import { Building2, Briefcase, Calendar, Activity } from "lucide-react";
import {
  Kpi,
  Card,
  PageHeader,
  Pill,
  ActivityFeed,
  useLocations,
  useJobs,
  useInvoices,
  type ActivityEvent,
} from "@commfit/ui";

// Demo account — Sunset Properties
const DEMO_ACCOUNT_ID = "acc-001";

const RECENT_ACTIVITY: ActivityEvent[] = [
  { id: "ra-01", timestamp: new Date(Date.now() - 2 * 60 * 60000), actor: "Jorge Ramirez", action: "completed PM at", entity: "Lofts at Watters Creek", entityType: "job" },
  { id: "ra-02", timestamp: new Date(Date.now() - 5 * 60 * 60000), actor: "Comm-Fit", action: "sent invoice", entity: "INV-2025-0142 ($1,382.40)", entityType: "invoice" },
  { id: "ra-03", timestamp: new Date(Date.now() - 24 * 60 * 60000), actor: "Aisha Johnson", action: "completed job at", entity: "Lofts at Watters Creek", entityType: "job" },
  { id: "ra-04", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000), actor: "Comm-Fit", action: "scheduled quarterly PM for", entity: "Vista Ridge", entityType: "job" },
];

export default function CustomerOverviewPage() {
  const { data: locations = [] } = useLocations(DEMO_ACCOUNT_ID);
  const { data: jobs = [] } = useJobs({ accountId: DEMO_ACCOUNT_ID });
  const { data: invoices = [] } = useInvoices({ accountId: DEMO_ACCOUNT_ID });

  const openSRs = jobs.filter((j) => j.jobType === "sr" && j.status !== "completed" && j.status !== "cancelled");
  const upcomingPMs = jobs.filter((j) => j.jobType === "pm" && j.status === "scheduled");
  const healthPct = 73; // calculated from equipment conditions

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Welcome back, Sandra"
        description="Sunset Properties LLC — Account Overview"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Total Properties" value={locations.length} icon={Building2} />
        <Kpi label="Open Service Requests" value={openSRs.length} icon={Briefcase} trend={openSRs.length > 0 ? "up" : "flat"} />
        <Kpi label="Upcoming PMs" value={upcomingPMs.length} icon={Calendar} />
        <Kpi label="Equipment Health" value={`${healthPct}%`} icon={Activity} trend="up" trendLabel="+5% this quarter" />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="lg">
          <h3 className="font-semibold text-text-primary mb-3">Recent Activity</h3>
          <ActivityFeed events={RECENT_ACTIVITY} />
        </Card>

        <Card padding="lg">
          <h3 className="font-semibold text-text-primary mb-3">Pending Invoices</h3>
          <div className="space-y-2">
            {invoices
              .filter((i) => i.status !== "paid" && i.status !== "void")
              .slice(0, 4)
              .map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{inv.invoiceNumber}</p>
                    <p className="text-xs text-text-muted">Due {inv.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      ${(inv.totalCents / 100).toLocaleString()}
                    </span>
                    <Pill color={inv.status === "overdue" ? "danger" : inv.status === "partially_paid" ? "warning" : "info"}>
                      {inv.status.replace("_", " ")}
                    </Pill>
                  </div>
                </div>
              ))}
            {invoices.filter((i) => i.status !== "paid" && i.status !== "void").length === 0 && (
              <p className="text-sm text-text-muted py-4 text-center">No pending invoices.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
