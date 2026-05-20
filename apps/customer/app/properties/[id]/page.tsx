"use client";
import { useParams } from "next/navigation";
import {
  PropertyHero,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  VisitTimeline,
  EquipmentRow,
  HealthBarCard,
  CycleDotsCard,
  SpendChartCard,
  Card,
  Pill,
  useLocation,
  useEquipment,
  useJobs,
  useInvoices,
  useContracts,
  mockEquipment,
  type VisitCardData,
} from "@commfit/ui";
import type { EquipmentCondition } from "@commfit/shared-types";

export default function PropertyDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { data: location } = useLocation(id);
  const { data: equipment = [] } = useEquipment({ locationId: id });
  const { data: jobs = [] } = useJobs({ locationId: id });
  const { data: invoices = [] } = useInvoices();
  const { data: contracts = [] } = useContracts();

  if (!location) return <div className="p-6 text-sm text-text-muted">Loading property...</div>;

  // Build visits from completed jobs
  const visits: VisitCardData[] = jobs
    .filter((j) => j.status === "completed")
    .map((j) => ({
      id: j.id,
      date: j.completedAt ?? j.scheduledAt,
      techName: "Jorge Ramirez",
      serviceType: j.jobType.replace("_", " ").toUpperCase(),
      equipmentCount: equipment.length,
      notes: j.notes,
      signedOff: true,
    }));

  // Equipment health
  const healthData = {
    excellent: equipment.filter((e) => e.condition === "excellent").length,
    good: equipment.filter((e) => e.condition === "good").length,
    fair: equipment.filter((e) => e.condition === "fair").length,
    poor: equipment.filter((e) => e.condition === "poor").length,
  };

  // Spend chart: 12 months mock
  const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  const spendData = MONTHS.map((month, i) => ({
    month,
    amount: [1280, 450, 960, 1280, 450, 750, 1280, 450, 960, 1280, 450, 1280][i],
  }));

  const propContracts = contracts.filter(
    (c) => c.propertyIds?.includes(id) && c.status === "signed"
  );
  const locInvoices = invoices.filter((i) => i.locationId === id);

  return (
    <div className="flex flex-col gap-5">
      <PropertyHero
        property={{
          name: location.name,
          address: location.address,
          city: location.city,
          state: location.state,
          contactName: location.contactName,
          equipmentCount: equipment.length,
          activeContractsCount: propContracts.length,
        }}
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 text-center">
        {[
          { label: "Equipment", value: equipment.length },
          { label: "Completed Jobs", value: jobs.filter((j) => j.status === "completed").length },
          { label: "Open Invoices", value: locInvoices.filter((i) => i.status !== "paid").length },
          { label: "Active Contracts", value: propContracts.length },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-xl font-semibold font-display text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Snapshot cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthBarCard data={healthData} />
        <CycleDotsCard total={4} completed={3} label="Quarterly PM Cycle" />
        <SpendChartCard data={spendData} label="12-Month Spend" />
      </div>

      {/* Detail tabs */}
      <Tabs defaultValue="service-history">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="service-history">Service History</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming PMs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <p className="text-sm text-text-secondary">
              <strong>{location.name}</strong> is located at {location.address}, {location.city}, {location.state} {location.zip}.
              {location.notes && ` Notes: ${location.notes}`}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="service-history">
          <VisitTimeline visits={visits} />
        </TabsContent>

        <TabsContent value="equipment">
          <Card padding="none">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Serial #</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Model</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Supplier</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Condition</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Last Service</th>
                  <th className="py-2.5 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {equipment.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-text-muted">No equipment recorded.</td></tr>
                ) : equipment.map((eq) => (
                  <EquipmentRow
                    key={eq.id}
                    equipment={{
                      id: eq.id,
                      serialNumber: eq.serialNumber,
                      model: eq.model,
                      supplier: eq.supplier,
                      equipmentClass: eq.equipmentClass,
                      condition: eq.condition,
                      lastServiceDate: eq.lastServiceDate,
                      status: eq.status,
                    }}
                  />
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card padding="none">
            {locInvoices.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">No invoices for this property.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Invoice #</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Total</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Due</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {locInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border hover:bg-bg/50">
                      <td className="py-2.5 px-3 font-mono text-xs text-text-primary">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-text-primary">${(inv.totalCents / 100).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-text-secondary text-xs">{inv.dueDate}</td>
                      <td className="py-2.5 px-3">
                        <Pill color={inv.status === "paid" ? "success" : inv.status === "overdue" ? "danger" : "info"}>
                          {inv.status.replace("_", " ")}
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            {jobs.filter((j) => j.jobType === "pm" && j.status === "scheduled").length === 0 ? (
              <p className="text-sm text-text-muted">No upcoming PMs scheduled.</p>
            ) : (
              <div className="space-y-2">
                {jobs
                  .filter((j) => j.jobType === "pm" && j.status === "scheduled")
                  .map((j) => (
                    <div key={j.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-text-primary">Preventive Maintenance</p>
                        <p className="text-xs text-text-muted">
                          {new Date(j.scheduledAt).toLocaleDateString("en-US", {
                            weekday: "long", month: "long", day: "numeric", year: "numeric",
                          })}
                        </p>
                      </div>
                      <Pill color="info">Scheduled</Pill>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
