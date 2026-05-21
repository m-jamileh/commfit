"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, CheckCircle2, PenLine } from "lucide-react";
import {
  Card,
  Button,
  useContract,
  useSignContract,
  useFireEsignWebhook,
} from "@commfit/ui";

export default function EsignSignPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const envelopeId = typeof params.envelopeId === "string" ? params.envelopeId : "";
  const contractId = searchParams.get("contractId") ?? envelopeId;

  const { data: contract, isLoading } = useContract(contractId);
  const signContract = useSignContract();
  const fireWebhook = useFireEsignWebhook();

  const [signerName, setSignerName] = useState("Sandra Kim");
  const [signed, setSigned] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isPending = signContract.isPending || fireWebhook.isPending;

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await fireWebhook.mutateAsync({ envelopeId, signerName });
      await signContract.mutateAsync({ id: contractId, signerName });
      setSigned(true);
      setTimeout(() => router.push("/contracts"), 2000);
    } catch (err) {
      setErrorMsg((err as Error)?.message ?? "Signing failed. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-12 text-sm text-text-muted text-center">
        Loading contract…
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-xl mx-auto py-12 text-sm text-danger text-center">
        Contract not found.
      </div>
    );
  }

  if (signed) {
    return (
      <div className="max-w-xl mx-auto py-12 flex flex-col items-center gap-4">
        <CheckCircle2 className="h-16 w-16 text-success" />
        <h1 className="text-xl font-semibold font-display text-text-primary">Contract Signed!</h1>
        <p className="text-sm text-text-secondary text-center">
          {contract.title} has been signed by {signerName}.
        </p>
        <p className="text-xs text-text-muted">Redirecting to contracts…</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5 py-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold font-display text-text-primary">{contract.title}</h1>
          <p className="text-xs text-text-muted">
            {contract.startDate} → {contract.endDate} · {contract.cadence.replace("_", " ")} {contract.serviceType.replace("_", " ")}
          </p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-text-muted mb-0.5">Contract Value</p>
            <p className="font-semibold text-text-primary">${(contract.totalValueCents / 100).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">Status</p>
            <p className="font-medium text-text-primary capitalize">{contract.status.replace("_", " ")}</p>
          </div>
          {contract.autoRenew && (
            <div>
              <p className="text-xs text-text-muted mb-0.5">Auto-renew</p>
              <p className="text-success text-sm font-medium">Enabled</p>
            </div>
          )}
          {contract.autoPay && (
            <div>
              <p className="text-xs text-text-muted mb-0.5">Auto-pay</p>
              <p className="text-info text-sm font-medium">Enabled</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <p className="text-xs text-text-muted mb-3">
          By signing below, you agree to the terms of this service agreement. This is a legally binding document.
        </p>
        <form onSubmit={(e) => { void handleSign(e); }} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-primary">Full Name (Signer)</label>
            <input
              className="rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              required
              placeholder="Your full name"
            />
          </div>

          <div className="rounded-lg border-2 border-dashed border-border bg-bg/50 flex items-center justify-center h-20 gap-2 text-text-muted">
            <PenLine className="h-4 w-4" />
            <span className="text-sm">Mock signature — click "Sign Contract" to proceed</span>
          </div>

          {errorMsg && (
            <p className="text-xs text-danger">{errorMsg}</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!signerName || isPending}
            >
              {isPending ? "Signing…" : "Sign Contract"}
            </Button>
          </div>
        </form>
      </Card>

      <p className="text-xs text-text-muted text-center">
        Envelope ID: <span className="font-mono">{envelopeId}</span>
      </p>
    </div>
  );
}
