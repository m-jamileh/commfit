"use client";
import { useState } from "react";
import { FileText, Download } from "lucide-react";
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
  useInvoices,
  useRecordInvoicePayment,
  useToast,
} from "@commfit/ui";
import type { InvoiceStatus, InvoiceResponseDto } from "@commfit/shared-types";

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
  const { data: invoices = [], isLoading, refetch } = useInvoices({ accountId: DEMO_ACCOUNT_ID });
  const recordPayment = useRecordInvoicePayment();
  const { toast } = useToast();

  const [payInvoice, setPayInvoice] = useState<InvoiceResponseDto | null>(null);
  const [amountInput, setAmountInput] = useState("");

  function openPayModal(inv: InvoiceResponseDto) {
    const outstanding = (inv.totalCents - inv.paidCents) / 100;
    setAmountInput(outstanding.toFixed(2));
    setPayInvoice(inv);
  }

  function closePayModal() {
    setPayInvoice(null);
    setAmountInput("");
    recordPayment.reset();
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!payInvoice) return;
    const amountCents = Math.round(parseFloat(amountInput) * 100);
    await recordPayment.mutateAsync({ id: payInvoice.id, amountCents, notes: "Customer portal payment" });
    toast({ variant: "success", title: "Payment recorded", description: `$${amountInput} applied to ${payInvoice.invoiceNumber}` });
    void refetch();
    closePayModal();
  }

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
                onClick={() => alert("PDF view — M5 scope.")}
              >
                <FileText className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert("PDF download — M5 scope.")}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              {inv.status !== "paid" && inv.status !== "void" && (
                <Button variant="primary" size="sm" onClick={() => openPayModal(inv)}>Pay Now</Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Pay Now modal */}
      <Modal open={!!payInvoice} onOpenChange={(open) => { if (!open) closePayModal(); }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Record Payment — {payInvoice?.invoiceNumber}</ModalTitle>
          </ModalHeader>
          <form onSubmit={(e) => { void handlePay(e); }} className="space-y-4 mt-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-text-primary">Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={payInvoice ? ((payInvoice.totalCents - payInvoice.paidCents) / 100).toFixed(2) : undefined}
                className="rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                required
              />
              {payInvoice && (
                <p className="text-xs text-text-muted">
                  Outstanding: ${((payInvoice.totalCents - payInvoice.paidCents) / 100).toFixed(2)}
                </p>
              )}
            </div>

            {recordPayment.isError && (
              <p className="text-xs text-danger">
                {(recordPayment.error as Error)?.message ?? "Payment failed. Please try again."}
              </p>
            )}

            <ModalFooter>
              <Button type="button" variant="secondary" size="sm" onClick={closePayModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!amountInput || recordPayment.isPending}
              >
                {recordPayment.isPending ? "Processing…" : "Confirm Payment"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
