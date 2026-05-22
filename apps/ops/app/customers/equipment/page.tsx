"use client";
import { PageHeader, Card, EquipmentRow, useEquipment, useUpdateEquipment, useCreateJob, mockEquipment } from "@commfit/ui";

export default function EquipmentPage() {
  const { data: equipment = [], isLoading } = useEquipment();
  const updateEquipment = useUpdateEquipment();
  const createJob = useCreateJob();

  function handleService(id: string) {
    const eq = mockEquipment.find((e) => e.id === id);
    if (!eq) return;
    createJob.mutate({
      locationId: eq.locationId,
      accountId: eq.accountId,
      jobType: "sr",
      scheduledAt: new Date().toISOString(),
      priority: "normal",
    });
  }

  function handleArchive(id: string) {
    updateEquipment.mutate({ id, status: "archived" });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Equipment"
        breadcrumbs={[{ label: "Customers" }, { label: "Equipment" }]}
        description={`${equipment.length} units tracked`}
      />
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
            {isLoading ? (
              <tr><td colSpan={6} className="py-8 text-center text-sm text-text-muted">Loading...</td></tr>
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
                onService={handleService}
                onArchive={handleArchive}
              />
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
