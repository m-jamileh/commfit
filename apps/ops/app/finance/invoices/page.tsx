"use client";
import { useState } from "react";
import {
  PageHeader,
  Card,
  Pill,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
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
  ModalDescription,
  ModalFooter,
  useInvoices,
  useCreateInvoice,
  useSendInvoice,
  mockAccounts,
  mockLocations,
} from "@commfit/ui";
import type { InvoiceStatus } from "@commfit/shared-types";

const statusColors: Record<InvoiceStatus, "default" | "info" | "success" | "warning" | "danger" | "accent"> = {
  draft: "default",
  sent: "info",
  paid: "success",
  partially_paid: "warning",
  overdue: "danger",
  void: "default",
};

const TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "draft", label: "Draft" },
];

export default function InvoicesPage() {
  const [tab, setTab] = useState("all");
  const { data: invoices = [], isLoading } = useInvoices(
    tab !== "all" ? { status: tab as InvoiceStatus } : undefined
  );
  const createInvoice = useCreateInvoice();
  const sendInvoice = useSendInvoice();
  const accountMap = new Map(mockAccounts.map((a) => [a.id, a]));

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newAccountId, setNewAccountId] = useState("");
  const [newLocationId, setNewLocationId] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newSubtotal, setNewSubtotal] = useState("");
  const [newTax, setNewTax] = useState("0");

  // Detail modal state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const selectedInvoice = selectedInvoiceId ? invoices.find((i) => i.id === selectedInvoiceId) : null;

  const accountLocations = mockLocations.filter((l) => l.accountId === newAccountId);

  function handleCreate() {
    if (!newAccountId || !newDueDate || !newSubtotal) return;
    createInvoice.mutate(
      {
        accountId: newAccountId,
        locationId: newLocationId || undefined,
        dueDate: newDueDate,
        subtotalCents: Math.round(parseFloat(newSubtotal) * 100),
        taxCents: Math.round(parseFloat(newTax || "0") * 100),
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewAccountId(""); setNewLocationId(""); setNewDueDate(""); setNewSubtotal(""); setNewTax("0");
        },
      }
    );
  }

  function handleSend(id: string) {
    sendInvoice.mutate(id, { onSuccess: () => setSelectedInvoiceId(null) });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Invoices"
        breadcrumbs={[{ label: "Finance" }, { label: "Invoices" }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            + New Invoice
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <Card padding="none">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Invoice #</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Account</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Due Date</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Total</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Paid</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                    <th className="py-2.5 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={7} className="py-8 text-center text-sm text-text-muted">Loading...</td></tr>
                  ) : invoices.length === 0 ? (
                    <tr><td colSpan={7} className="py-8 text-center text-sm text-text-muted">No invoices</td></tr>
                  ) : invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border hover:bg-bg/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-xs text-text-primary">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{accountMap.get(inv.accountId)?.name ?? inv.accountId}</td>
                      <td className="py-2.5 px-3 text-text-secondary text-xs">{inv.dueDate}</td>
                      <td className="py-2.5 px-3 text-text-primary font-medium">
                        ${(inv.totalCents / 100).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-text-secondary">
                        ${(inv.paidCents / 100).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <Pill color={statusColors[inv.status]}>{inv.status.replace("_", " ")}</Pill>
                      </td>
                      <td className="py-2.5 px-3">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedInvoiceId(inv.id)}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create invoice modal */}
      <Modal open={showCreate} onOpenChange={setShowCreate}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>New Invoice</ModalTitle>
          </ModalHeader>
          <div className="space-y-3 mt-2">
            <Select value={newAccountId} onValueChange={(v) => { setNewAccountId(v); setNewLocationId(""); }}>
              <SelectTrigger label="Account *">
                <SelectValue placeholder="Select account..." />
              </SelectTrigger>
              <SelectContent>
                {mockAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {accountLocations.length > 0 && (
              <Select value={newLocationId} onValueChange={setNewLocationId}>
                <SelectTrigger label="Property">
                  <SelectValue placeholder="Select property..." />
                </SelectTrigger>
                <SelectContent>
                  {accountLocations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input label="Due Date *" type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
            <Input label="Subtotal ($) *" type="number" step="0.01" value={newSubtotal} onChange={(e) => setNewSubtotal(e.target.value)} />
            <Input label="Tax ($)" type="number" step="0.01" value={newTax} onChange={(e) => setNewTax(e.target.value)} />
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={createInvoice.isPending}>
              {createInvoice.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Invoice detail modal */}
      <Modal open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoiceId(null)}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>Invoice {selectedInvoice?.invoiceNumber}</ModalTitle>
            <ModalDescription>{accountMap.get(selectedInvoice?.accountId ?? "")?.name}</ModalDescription>
          </ModalHeader>
          {selectedInvoice && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-text-muted">Due Date</p>
                  <p className="text-text-primary">{selectedInvoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Status</p>
                  <Pill color={statusColors[selectedInvoice.status]}>{selectedInvoice.status.replace("_", " ")}</Pill>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Subtotal</p>
                  <p className="text-text-primary">${(selectedInvoice.subtotalCents / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Tax</p>
                  <p className="text-text-primary">${(selectedInvoice.taxCents / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total</p>
                  <p className="text-lg font-semibold text-text-primary">${(selectedInvoice.totalCents / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Paid</p>
                  <p className="text-text-primary">${(selectedInvoice.paidCents / 100).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedInvoiceId(null)}>Close</Button>
                {selectedInvoice.status === "draft" && (
                  <Button variant="primary" size="sm" onClick={() => handleSend(selectedInvoice.id)} disabled={sendInvoice.isPending}>
                    {sendInvoice.isPending ? "Sending..." : "Send Invoice"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
