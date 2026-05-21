"use client";
import { useRouter } from "next/navigation";
import { FileText, Download, CheckCircle2, Clock } from "lucide-react";
import { PageHeader, Card, Pill, Button, useContracts } from "@commfit/ui";
import type { ContractStatus } from "@commfit/shared-types";

const DEMO_ACCOUNT_ID = "acc-001";

const statusColors: Record<ContractStatus, "default" | "info" | "warning" | "success" | "danger"> = {
  draft: "default",
  sent: "info",
  partially_signed: "warning",
  signed: "success",
  terminated: "danger",
};

export default function CustomerContractsPage() {
  const router = useRouter();
  const { data: contracts = [], isLoading } = useContracts({ accountId: DEMO_ACCOUNT_ID });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Contracts"
        description="Your service agreements and renewals"
      />

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-text-muted">Loading...</p>
        ) : contracts.length === 0 ? (
          <Card><p className="text-sm text-text-muted text-center py-8">No contracts found.</p></Card>
        ) : contracts.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{c.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {c.startDate} → {c.endDate} · {c.cadence.replace("_", " ")} {c.serviceType.replace("_", " ")}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-medium text-text-primary">${(c.totalValueCents / 100).toLocaleString()}</span>
                    {c.autoRenew && <span className="text-xs text-success">Auto-renew</span>}
                    {c.autoPay && <span className="text-xs text-info">Auto-pay</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Pill color={statusColors[c.status]}>
                  {c.status === "signed" ? (
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Signed</span>
                  ) : c.status === "partially_signed" ? (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending Signature</span>
                  ) : (
                    c.status.replace("_", " ")
                  )}
                </Pill>
                {c.status === "signed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => alert("PDF download — M5 scope.")}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                )}
                {(c.status === "sent" || c.status === "partially_signed") && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push(`/esign/sign/${c.docusignEnvelopeId ?? c.id}?contractId=${c.id}`)}
                  >
                    Sign Now
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
