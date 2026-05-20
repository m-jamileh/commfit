"use client";
import { useState } from "react";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Input,
  useJobs,
  useParts,
  mockLocations,
} from "@commfit/ui";

const DEMO_TECH_ID = "tech-001";

export default function PartsRequestPage() {
  const router = useRouter();
  const { data: jobs = [] } = useJobs({ technicianId: DEMO_TECH_ID });
  const { data: parts = [] } = useParts();
  const locMap = new Map(mockLocations.map((l) => [l.id, l]));

  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [submitted, setSubmitted] = useState(false);

  const activeJobs = jobs.filter((j) => j.status !== "completed" && j.status !== "cancelled");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJobId || !selectedPartId) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-success mb-4" />
        <h1 className="font-display text-xl font-semibold text-text-primary mb-2">Request Submitted</h1>
        <p className="text-text-secondary mb-6">Your parts request has been logged.</p>
        <Button variant="primary" onClick={() => { setSubmitted(false); setSelectedJobId(""); setSelectedPartId(""); setQuantity("1"); }}>
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="bg-primary px-4 pt-10 pb-5">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-primary-foreground/70 text-sm mb-3">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="font-display text-xl font-semibold text-primary-foreground">Parts Request</h1>
        <p className="text-primary-foreground/70 text-sm mt-0.5">Request parts for a job</p>
      </div>

      <div className="px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <p className="text-sm font-semibold text-text-primary mb-3">Select Job</p>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger label="Job">
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent>
                {activeJobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {locMap.get(j.locationId)?.name ?? j.locationId} — {j.jobType.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card>
            <p className="text-sm font-semibold text-text-primary mb-3">Select Part</p>
            <Select value={selectedPartId} onValueChange={setSelectedPartId}>
              <SelectTrigger label="Part">
                <SelectValue placeholder="Select a part..." />
              </SelectTrigger>
              <SelectContent>
                {parts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPartId && (
              <div className="mt-3">
                <Input
                  label="Quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            )}
          </Card>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!selectedJobId || !selectedPartId}
          >
            Submit Request
          </Button>
        </form>
      </div>
    </div>
  );
}
