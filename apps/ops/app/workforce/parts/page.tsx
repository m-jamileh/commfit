"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import {
  PageHeader,
  Card,
  Pill,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  useParts,
  useCreatePart,
} from "@commfit/ui";

export default function PartsPage() {
  const [search, setSearch] = useState("");
  const { data: parts = [], isLoading } = useParts(search);
  const createPart = useCreatePart();

  const [showCreate, setShowCreate] = useState(false);
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSupplier, setNewSupplier] = useState("");
  const [newCost, setNewCost] = useState("");

  function handleCreate() {
    if (!newSku || !newName || !newCost) return;
    createPart.mutate(
      { sku: newSku, name: newName, description: newDesc || undefined, supplier: newSupplier || undefined, unitCostCents: Math.round(parseFloat(newCost) * 100) },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewSku(""); setNewName(""); setNewDesc(""); setNewSupplier(""); setNewCost("");
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Parts & Inventory"
        breadcrumbs={[{ label: "Workforce" }, { label: "Parts & Inventory" }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            + Add Part
          </Button>
        }
      />
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search parts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 rounded border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"
          />
        </div>
        <span className="text-xs text-text-muted ml-auto">{parts.length} parts</span>
      </div>
      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">SKU</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Name</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Supplier</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Unit Cost</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-8 text-center text-sm text-text-muted">Loading...</td></tr>
            ) : parts.map((p) => (
              <tr key={p.id} className="border-b border-border hover:bg-bg/50 transition-colors">
                <td className="py-2.5 px-3 font-mono text-xs text-text-secondary">{p.sku}</td>
                <td className="py-2.5 px-3">
                  <p className="font-medium text-text-primary">{p.name}</p>
                  {p.description && <p className="text-xs text-text-muted">{p.description}</p>}
                </td>
                <td className="py-2.5 px-3 text-text-secondary">{p.supplier ?? "—"}</td>
                <td className="py-2.5 px-3 text-text-primary font-medium">
                  ${(p.unitCostCents / 100).toFixed(2)}
                </td>
                <td className="py-2.5 px-3">
                  <Pill color={p.status === "active" ? "success" : "default"}>{p.status}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showCreate} onOpenChange={setShowCreate}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add Part</ModalTitle>
          </ModalHeader>
          <div className="space-y-3 mt-2">
            <Input label="SKU *" value={newSku} onChange={(e) => setNewSku(e.target.value)} />
            <Input label="Name *" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input label="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            <Input label="Supplier" value={newSupplier} onChange={(e) => setNewSupplier(e.target.value)} />
            <Input label="Unit Cost ($) *" type="number" step="0.01" value={newCost} onChange={(e) => setNewCost(e.target.value)} />
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={createPart.isPending}>
              {createPart.isPending ? "Adding..." : "Add Part"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
