"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Card, Button, Input, useJob, mockLocations, useUpdateJobStatus } from "@commfit/ui";

export default function SignOffPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params.id === "string" ? params.id : "";
  const { data: job, isLoading } = useJob(jobId);
  const updateStatus = useUpdateJobStatus();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [signed, setSigned] = useState(false);
  const [completed, setCompleted] = useState(false);

  const locMap = new Map(mockLocations.map((l) => [l.id, l]));
  const loc = job ? locMap.get(job.locationId) : null;

  async function handleConfirm() {
    if (!customerName) return;
    await updateStatus.mutateAsync({ id: jobId, status: "completed" });
    setCompleted(true);
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-text-muted">Loading...</div>;
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-success mb-4" />
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-2">Job Complete!</h1>
        <p className="text-text-secondary mb-6">
          Sign-off recorded for {customerName}. A confirmation has been noted.
        </p>
        <Button variant="primary" size="lg" onClick={() => router.push("/today")}>
          Back to Today
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 pt-10 pb-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-primary-foreground/70 text-sm mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="font-display text-xl font-semibold text-primary-foreground">Customer Sign-Off</h1>
        <p className="text-primary-foreground/70 text-sm mt-0.5">
          {loc?.name ?? job?.locationId}
        </p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <Card>
          <p className="text-sm font-semibold text-text-primary mb-3">Customer Information</p>
          <div className="space-y-3">
            <Input
              label="Customer Name"
              name="customer-name"
              placeholder="Full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Customer Email (optional)"
              type="email"
              name="customer-email"
              placeholder="email@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
        </Card>

        {/* Signature placeholder */}
        <Card>
          <p className="text-sm font-semibold text-text-primary mb-3">Signature</p>
          <div
            className={`h-28 rounded border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
              signed ? "border-success bg-success/5" : "border-border bg-bg hover:border-primary/30"
            }`}
            onClick={() => setSigned(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSigned(true)}
          >
            {signed ? (
              <div className="text-center">
                <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-1" />
                <p className="text-xs text-success font-medium">Signature captured</p>
              </div>
            ) : (
              <p className="text-sm text-text-muted">Tap here to sign</p>
            )}
          </div>
        </Card>

        {/* Job summary */}
        {job && (
          <Card padding="sm">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Job Summary</p>
            <div className="space-y-1 text-sm text-text-secondary">
              <p>Type: <span className="text-text-primary capitalize">{job.jobType.replace("_", " ")}</span></p>
              <p>Scheduled: <span className="text-text-primary">{new Date(job.scheduledAt).toLocaleString()}</span></p>
              {job.notes && <p className="text-xs text-text-muted mt-1">{job.notes}</p>}
            </div>
          </Card>
        )}
      </div>

      <div className="sticky bottom-16 px-4 pb-4 pt-2 bg-bg/95 backdrop-blur-sm border-t border-border">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!customerName || !signed || updateStatus.isPending}
          onClick={handleConfirm}
        >
          {updateStatus.isPending ? "Confirming..." : "Confirm Sign-Off & Complete Job"}
        </Button>
      </div>
    </div>
  );
}
