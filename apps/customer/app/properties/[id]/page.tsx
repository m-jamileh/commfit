"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Pencil } from "lucide-react";
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
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  useLocation,
  useEquipment,
  useJobs,
  useInvoices,
  useContracts,
  useUpdateLocation,
  useToast,
  type VisitCardData,
} from "@commfit/ui";

export default function PropertyDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { data: location, refetch: refetchLocation } = useLocation(id);
  const { data: equipment = [] } = useEquipment({ locationId: id });
  const { data: jobs = [] } = useJobs({ locationId: id });
  const { data: invoices = [] } = useInvoices();
  const { data: contracts = [] } = useContracts();
  const updateLocation = useUpdateLocation();
  const { toast } = useToast();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  function openEditModal() {
    setEditForm({
      contactName: location?.contactName ?? "",
      contactEmail: location?.contactEmail ?? "",
      contactPhone: location?.contactPhone ?? "",
      address: location?.address ?? "",
    });
    setShowEditModal(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateLocation.mutateAsync({
      id,
      contactName: editForm.contactName || undefined,
      contactEmail: editForm.contactEmail || undefined,
      contactPhone: editForm.contactPhone || undefined,
      address: editForm.address || undefined,
    });
    toast({ variant: "success", title: "Contact info updated" });
    void refetchLocation();
    setShowEditModal(false);
    updateLocation.reset();
  }

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
        actions={
          <Button variant="secondary" size="sm" onClick={openEditModal}>
            <Pencil className="h-3.5 w-3.5" /> Edit Contact Info
          </Button>
        }
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
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {location.contactName && (
                <div><span className="text-text-muted">Contact:</span> <span className="text-text-primary">{location.contactName}</span></div>
              )}
              {location.contactEmail && (
                <div><span className="text-text-muted">Email:</span> <span className="text-text-primary">{location.contactEmail}</span></div>
              )}
              {location.contactPhone && (
                <div><span className="text-text-muted">Phone:</span> <span className="text-text-primary">{location.contactPhone}</span></div>
              )}
            </div>
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

      {/* Edit Contact Info modal */}
      <Modal open={showEditModal} onOpenChange={(open) => { if (!open) { setShowEditModal(false); updateLocation.reset(); } }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Contact Info</ModalTitle>
          </ModalHeader>
          <form onSubmit={(e) => { void handleEditSubmit(e); }} className="space-y-4 mt-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-primary">Contact Name</label>
              <input
                className="rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={editForm.contactName}
                onChange={(e) => setEditForm((f) => ({ ...f, contactName: e.target.value }))}
                placeholder="Sandra Kim"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-primary">Contact Email</label>
              <input
                type="email"
                className="rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={editForm.contactEmail}
                onChange={(e) => setEditForm((f) => ({ ...f, contactEmail: e.target.value }))}
                placeholder="contact@property.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-primary">Contact Phone</label>
              <input
                type="tel"
                className="rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={editForm.contactPhone}
                onChange={(e) => setEditForm((f) => ({ ...f, contactPhone: e.target.value }))}
                placeholder="214-555-0100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-primary">Street Address</label>
              <input
                className="rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={editForm.address}
                onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="123 Main St"
              />
            </div>

            {updateLocation.isError && (
              <p className="text-xs text-danger">
                {(updateLocation.error as Error)?.message ?? "Update failed. Please try again."}
              </p>
            )}

            <ModalFooter>
              <Button type="button" variant="secondary" size="sm" onClick={() => { setShowEditModal(false); updateLocation.reset(); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={updateLocation.isPending}>
                {updateLocation.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
