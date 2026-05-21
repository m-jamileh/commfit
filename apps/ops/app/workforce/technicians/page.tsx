"use client";
import { useState } from "react";
import {
  PageHeader,
  Card,
  Pill,
  StatusDot,
  UserAvatar,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  useTechnicians,
  useCreateTechnician,
} from "@commfit/ui";
import type { TechAvailabilityStatus } from "@commfit/shared-types";

const statusDotColor: Record<TechAvailabilityStatus, "success" | "warning" | "default"> = {
  available: "success",
  busy: "warning",
  offline: "default",
};

export default function TechniciansPage() {
  const { data: techs = [], isLoading } = useTechnicians();
  const createTech = useCreateTechnician();

  const [showCreate, setShowCreate] = useState(false);
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTechType, setNewTechType] = useState("in_house");
  const [newRegion, setNewRegion] = useState("");

  function handleCreate() {
    if (!newFirst || !newLast || !newEmail) return;
    createTech.mutate(
      { firstName: newFirst, lastName: newLast, email: newEmail, phone: newPhone || undefined, techType: newTechType, region: newRegion },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewFirst(""); setNewLast(""); setNewEmail(""); setNewPhone(""); setNewTechType("in_house"); setNewRegion("");
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Technicians"
        breadcrumbs={[{ label: "Workforce" }, { label: "Technicians" }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            + Add Technician
          </Button>
        }
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

      <Modal open={showCreate} onOpenChange={setShowCreate}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add Technician</ModalTitle>
          </ModalHeader>
          <div className="space-y-3 mt-2">
            <div className="flex gap-3">
              <Input label="First Name *" value={newFirst} onChange={(e) => setNewFirst(e.target.value)} className="flex-1" />
              <Input label="Last Name *" value={newLast} onChange={(e) => setNewLast(e.target.value)} className="flex-1" />
            </div>
            <Input label="Email *" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <Input label="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            <Select value={newTechType} onValueChange={setNewTechType}>
              <SelectTrigger label="Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_house">In-House</SelectItem>
                <SelectItem value="third_party">3rd Party</SelectItem>
              </SelectContent>
            </Select>
            <Input label="Region" value={newRegion} onChange={(e) => setNewRegion(e.target.value)} />
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={createTech.isPending}>
              {createTech.isPending ? "Adding..." : "Add Technician"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
