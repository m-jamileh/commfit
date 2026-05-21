"use client";
import { useState } from "react";
import {
  PageHeader,
  Card,
  Pill,
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
  useQuotes,
  useCreateQuote,
  useUpdateQuote,
  useSendQuote,
  mockLocations,
  mockAccounts,
} from "@commfit/ui";
import type { QuoteStatus } from "@commfit/shared-types";

const statusColors: Record<QuoteStatus, "default" | "info" | "success" | "warning" | "danger"> = {
  draft: "default",
  sent: "info",
  signed: "success",
  expired: "warning",
  cancelled: "danger",
};

export default function QuotesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: quotes = [], isLoading } = useQuotes();
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const sendQuote = useSendQuote();

  const locationMap = new Map(mockLocations.map((l) => [l.id, l]));
  const accountMap = new Map(mockAccounts.map((a) => [a.id, a]));
  const selected = selectedId ? quotes.find((q) => q.id === selectedId) : null;

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAccountId, setNewAccountId] = useState("");
  const [newLocationId, setNewLocationId] = useState("");
  const [newJobType, setNewJobType] = useState("pm");
  const [newSubtotal, setNewSubtotal] = useState("");
  const [newDiscount, setNewDiscount] = useState("0");
  const [newTax, setNewTax] = useState("0");

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDiscount, setEditDiscount] = useState("0");
  const [editTax, setEditTax] = useState("0");
  const [editNotes, setEditNotes] = useState("");

  const accountLocations = mockLocations.filter((l) => l.accountId === newAccountId);

  function handleCreate() {
    if (!newTitle || !newAccountId || !newSubtotal) return;
    createQuote.mutate(
      {
        title: newTitle,
        accountId: newAccountId,
        locationId: newLocationId || undefined,
        jobType: newJobType,
        subtotalCents: Math.round(parseFloat(newSubtotal) * 100),
        discountPct: parseFloat(newDiscount || "0"),
        taxPct: parseFloat(newTax || "0"),
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewTitle(""); setNewAccountId(""); setNewLocationId(""); setNewJobType("pm"); setNewSubtotal(""); setNewDiscount("0"); setNewTax("0");
        },
      }
    );
  }

  function openEdit() {
    if (!selected) return;
    setEditTitle(selected.title);
    setEditDiscount(String(selected.discountPct));
    setEditTax(String(selected.taxPct));
    setEditNotes(selected.notes ?? "");
    setShowEdit(true);
  }

  function handleUpdate() {
    if (!selectedId) return;
    updateQuote.mutate(
      { id: selectedId, title: editTitle, discountPct: parseFloat(editDiscount), taxPct: parseFloat(editTax), notes: editNotes || undefined },
      { onSuccess: () => setShowEdit(false) }
    );
  }

  function handleSend() {
    if (!selectedId) return;
    sendQuote.mutate(selectedId);
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Quotes"
        breadcrumbs={[{ label: "Operations" }, { label: "Quotes" }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            + New Quote
          </Button>
        }
      />

      <div className="flex gap-4">
        {/* Quote list */}
        <div className="flex-1">
          <Card padding="none">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Quote</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Account</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Type</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Total</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Valid Until</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-text-muted">Loading...</td></tr>
                ) : quotes.map((q) => (
                  <tr
                    key={q.id}
                    className={`border-b border-border hover:bg-bg/50 transition-colors cursor-pointer ${selectedId === q.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedId(q.id)}
                  >
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-text-primary truncate max-w-[200px]">{q.title}</p>
                      <p className="text-xs text-text-muted font-mono">{q.id}</p>
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary">{accountMap.get(q.accountId)?.name ?? q.accountId}</td>
                    <td className="py-2.5 px-3 text-text-secondary capitalize">{q.jobType}</td>
                    <td className="py-2.5 px-3 text-text-primary font-medium">
                      ${(q.totalCents / 100).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary text-xs">{q.validUntil ?? "—"}</td>
                    <td className="py-2.5 px-3">
                      <Pill color={statusColors[q.status]}>{q.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Detail pane */}
        {selected && (
          <div className="w-72 shrink-0">
            <Card padding="md" className="sticky top-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-text-primary text-sm leading-snug">{selected.title}</h3>
                <button onClick={() => setSelectedId(null)} className="text-text-muted hover:text-text-primary text-lg leading-none">×</button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-text-muted">Account</p>
                  <p className="text-text-primary">{accountMap.get(selected.accountId)?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Property</p>
                  <p className="text-text-primary">{locationMap.get(selected.locationId)?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Type</p>
                  <p className="text-text-primary capitalize">{selected.jobType}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Subtotal</p>
                  <p className="text-text-primary">${(selected.subtotalCents / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Discount</p>
                  <p className="text-text-primary">{selected.discountPct}%</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Tax</p>
                  <p className="text-text-primary">{selected.taxPct}%</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-text-muted">Total</p>
                  <p className="text-lg font-semibold text-text-primary">${(selected.totalCents / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Status</p>
                  <Pill color={statusColors[selected.status]}>{selected.status}</Pill>
                </div>
                {selected.notes && (
                  <div className="pt-2">
                    <p className="text-xs text-text-muted">Notes</p>
                    <p className="text-text-secondary text-xs">{selected.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" size="sm" className="flex-1" onClick={openEdit}>Edit</Button>
                {selected.status === "draft" && (
                  <Button variant="primary" size="sm" className="flex-1" onClick={handleSend} disabled={sendQuote.isPending}>
                    {sendQuote.isPending ? "Sending..." : "Send"}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Create quote modal */}
      <Modal open={showCreate} onOpenChange={setShowCreate}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>New Quote</ModalTitle>
          </ModalHeader>
          <div className="space-y-3 mt-2">
            <Input label="Quote Title *" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
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
            <Select value={newJobType} onValueChange={setNewJobType}>
              <SelectTrigger label="Job Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pm">PM</SelectItem>
                <SelectItem value="sr">Service Request</SelectItem>
                <SelectItem value="disinfecting">Disinfecting</SelectItem>
                <SelectItem value="install">Install</SelectItem>
              </SelectContent>
            </Select>
            <Input label="Subtotal ($) *" type="number" step="0.01" value={newSubtotal} onChange={(e) => setNewSubtotal(e.target.value)} />
            <div className="flex gap-3">
              <Input label="Discount (%)" type="number" step="0.1" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} className="flex-1" />
              <Input label="Tax (%)" type="number" step="0.1" value={newTax} onChange={(e) => setNewTax(e.target.value)} className="flex-1" />
            </div>
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={createQuote.isPending}>
              {createQuote.isPending ? "Creating..." : "Create Quote"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit quote modal */}
      <Modal open={showEdit} onOpenChange={(open) => !open && setShowEdit(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Quote</ModalTitle>
          </ModalHeader>
          <div className="space-y-3 mt-2">
            <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <div className="flex gap-3">
              <Input label="Discount (%)" type="number" step="0.1" value={editDiscount} onChange={(e) => setEditDiscount(e.target.value)} className="flex-1" />
              <Input label="Tax (%)" type="number" step="0.1" value={editTax} onChange={(e) => setEditTax(e.target.value)} className="flex-1" />
            </div>
            <Input label="Notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleUpdate} disabled={updateQuote.isPending}>
              {updateQuote.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
