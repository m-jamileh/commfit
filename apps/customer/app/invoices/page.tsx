"use client";
import { FileText, Download } from "lucide-react";
import { PageHeader, Card, Pill, Button, useInvoices } from "@commfit/ui";
import type { InvoiceStatus } from "@commfit/shared-types";

const DEMO_ACCOUNT_ID = "acc-001";

const statusColors: Record<InvoiceStatus, "default" | "info" | "success" | "warning" | "danger"> = {
  draft: "default",
  sent: "info",
  paid: "success",
  partially_paid: "warning",
  overdue: "danger",
  void: "default",
};

export default function CustomerInvoicesPage() {
  const { data: invoices = [], isLoading } = useInvoices({ accountId: DEMO_ACCOUNT_ID });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Invoices"
        description="View and download your invoices"
      />

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-text-muted">Loading...</p>
        ) : invoices.length === 0 ? (
          <Card><p className="text-sm text-text-muted text-center py-8">No invoices found.</p></Card>
        ) : invoices.map((inv) => (
          <Card key={inv.id} className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary">{inv.invoiceNumber}</p>
              <p className="text-xs text-text-muted">Due {inv.dueDate}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-text-primary">${(inv.totalCents / 100).toLocaleString()}</p>
              {inv.paidCents > 0 && inv.paidCents < inv.totalCents && (
                <p className="text-xs text-text-muted">Paid: ${(inv.paidCents / 100).toLocaleString()}</p>
              )}
            </div>
            <Pill color={statusColors[inv.status]}>{inv.status.replace("_", " ")}</Pill>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert("PDF view — backend integration pending.")}
              >
                <FileText className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert("PDF download — backend integration pending.")}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              {inv.status !== "paid" && inv.status !== "void" && (
                <Button variant="primary" size="sm">Pay Now</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
