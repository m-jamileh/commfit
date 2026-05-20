"use client";
import { PageHeader, Card, Pill, StatusDot, UserAvatar, Button, useTechnicians } from "@commfit/ui";
import type { TechAvailabilityStatus } from "@commfit/shared-types";

const statusDotColor: Record<TechAvailabilityStatus, "success" | "warning" | "default"> = {
  available: "success",
  busy: "warning",
  offline: "default",
};

export default function TechniciansPage() {
  const { data: techs = [], isLoading } = useTechnicians();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Technicians"
        breadcrumbs={[{ label: "Workforce" }, { label: "Technicians" }]}
        actions={<Button variant="primary" size="sm">+ Add Technician</Button>}
      />
      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <p className="text-sm text-text-muted">Loading...</p>
        ) : techs.map((tech) => (
          <Card key={tech.id} className="flex items-center gap-4">
            <UserAvatar name={`${tech.firstName} ${tech.lastName}`} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-text-primary">{tech.firstName} {tech.lastName}</p>
                <Pill color={tech.techType === "in_house" ? "primary" : "default"}>
                  {tech.techType === "in_house" ? "In-House" : "3rd Party"}
                </Pill>
              </div>
              <p className="text-xs text-text-secondary">{tech.email}</p>
              <p className="text-xs text-text-muted">{tech.region}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot
                color={statusDotColor[tech.availabilityStatus as TechAvailabilityStatus]}
                pulse={tech.availabilityStatus === "busy"}
                label={tech.availabilityStatus}
              />
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Performance</p>
              <p className="text-sm font-semibold text-text-primary">{tech.performanceScore ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Certifications</p>
              <div className="flex gap-1 flex-wrap mt-0.5">
                {tech.certifications.map((c, i) => (
                  <Pill key={i} color="info">{c.equipmentClass}</Pill>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
