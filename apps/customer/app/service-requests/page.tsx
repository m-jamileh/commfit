"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  PageHeader,
  Card,
  Pill,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  useJobs,
  useCreateJob,
  mockLocations,
} from "@commfit/ui";

const DEMO_ACCOUNT_ID = "acc-001";

export default function ServiceRequestsPage() {
  const { data: jobs = [], refetch } = useJobs({ accountId: DEMO_ACCOUNT_ID });
  const createJob = useCreateJob();
  const locMap = new Map(mockLocations.map((l) => [l.id, l]));
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  const srs = jobs.filter((j) => j.jobType === "sr");
  const open = srs.filter((j) => j.status !== "completed" && j.status !== "cancelled");
  const closed = srs.filter((j) => j.status === "completed" || j.status === "cancelled");

  const accountLocations = mockLocations.filter((l) => l.accountId === DEMO_ACCOUNT_ID);

  function handleClose() {
    setShowModal(false);
    setCreatedJobId(null);
    setDescription("");
    setLocation("");
    setUrgency("normal");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await createJob.mutateAsync({
      accountId: DEMO_ACCOUNT_ID,
      locationId: location,
      jobType: "sr",
      scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
      notes: description,
      priority: urgency,
    });
    const id = (result as { id?: string })?.id ?? "submitted";
    setCreatedJobId(id);
    void refetch();
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Service Requests"
        description="Submit and track service requests for your properties"
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="h-3.5 w-3.5" /> Submit SR
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Open ({open.length})</h3>
          <div className="space-y-3">
            {open.length === 0 ? (
              <Card><p className="text-sm text-text-muted text-center py-4">No open service requests.</p></Card>
            ) : open.map((sr) => (
              <Card key={sr.id}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-text-primary text-sm">{locMap.get(sr.locationId)?.name ?? sr.locationId}</p>
                  <Pill color={sr.priority === "urgent" ? "danger" : sr.status === "en_route" ? "warning" : sr.status === "on_site" ? "accent" : "info"}>
                    {sr.status.replace("_", " ")}
                  </Pill>
                </div>
                {sr.notes && <p className="text-xs text-text-secondary line-clamp-2">{sr.notes}</p>}
                <p className="text-xs text-text-muted mt-1">
                  {new Date(sr.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {sr.priority === "urgent" && <span className="ml-2 text-danger font-medium">Urgent</span>}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Closed ({closed.length})</h3>
          <div className="space-y-3">
            {closed.length === 0 ? (
              <Card><p className="text-sm text-text-muted text-center py-4">No closed SRs.</p></Card>
            ) : closed.map((sr) => (
              <Card key={sr.id} className="opacity-70">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-text-secondary text-sm">{locMap.get(sr.locationId)?.name ?? sr.locationId}</p>
                  <Pill color="success">Completed</Pill>
                </div>
                {sr.completedAt && (
                  <p className="text-xs text-text-muted">
                    Completed {new Date(sr.completedAt).toLocaleDateString()}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Submit SR modal */}
      <Modal open={showModal} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Submit Service Request</ModalTitle>
          </ModalHeader>
          {createdJobId ? (
            <div className="py-6 text-center">
              <div className="text-success text-3xl mb-2">✓</div>
              <p className="font-medium text-text-primary">Request submitted!</p>
              <p className="text-xs text-text-muted mt-1 font-mono">{createdJobId}</p>
              <p className="text-sm text-text-secondary mt-2">Our team will reach out shortly.</p>
              <div className="mt-4">
                <Button variant="primary" size="sm" onClick={handleClose}>Close</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4 mt-3">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger label="Property">
                  <SelectValue placeholder="Select property..." />
                </SelectTrigger>
                <SelectContent>
                  {accountLocations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-primary">Description</label>
                <textarea
                  className="rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={4}
                  name="description"
                  placeholder="Describe the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Select value={urgency} onValueChange={(v) => setUrgency(v as "normal" | "urgent")}>
                <SelectTrigger label="Urgency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              {createJob.isError && (
                <p className="text-xs text-danger">
                  {(createJob.error as Error)?.message ?? "Failed to submit. Please try again."}
                </p>
              )}

              <ModalFooter>
                <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!location || !description || createJob.isPending}
                >
                  {createJob.isPending ? "Submitting…" : "Submit Request"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
