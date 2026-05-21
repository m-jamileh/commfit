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
  ModalDescription,
  ModalFooter,
  useContracts,
  useCreateContract,
  useSendContract,
  mockAccounts,
} from "@commfit/ui";
import type { ContractStatus } from "@commfit/shared-types";

const statusColors: Record<ContractStatus, "default" | "info" | "warning" | "success" | "danger"> = {
  draft: "default",
  sent: "info",
  partially_signed: "warning",
  signed: "success",
  terminated: "danger",
};

export default function ContractsPage() {
  const { data: contracts = [], isLoading } = useContracts();
  const createContract = useCreateContract();
  const sendContract = useSendContract();
  const accountMap = new Map(mockAccounts.map((a) => [a.id, a]));

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [newAccountId, setNewAccountId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newServiceType, setNewServiceType] = useState("pm");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newTotalValue, setNewTotalValue] = useState("");

  // Detail modal
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const selectedContract = selectedContractId ? contracts.find((c) => c.id === selectedContractId) : null;

  function handleCreate() {
    if (!newAccountId || !newTitle || !newStartDate || !newEndDate || !newTotalValue) return;
    createContract.mutate(
      {
        accountId: newAccountId,
        title: newTitle,
        serviceType: newServiceType,
        startDate: newStartDate,
        endDate: newEndDate,
        totalValueCents: Math.round(parseFloat(newTotalValue) * 100),
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewAccountId(""); setNewTitle(""); setNewServiceType("pm"); setNewStartDate(""); setNewEndDate(""); setNewTotalValue("");
        },
      }
    );
  }

  function handleSend(id: string) {
    sendContract.mutate(id, { onSuccess: () => setSelectedContractId(null) });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Contracts"
        breadcrumbs={[{ label: "Finance" }, { label: "Contracts" }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            + New Contract
          </Button>
        }
      />
      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Title</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Account</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Service</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Term</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Value</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-text-muted uppercase tracking-wide">E-Sign Status</th>
              <th className="py-2.5 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-8 text-center text-sm text-text-muted">Loading...</td></tr>
            ) : contracts.map((c) => (
              <tr key={c.id} className="border-b border-border hover:bg-bg/50 transition-colors">
                <td className="py-2.5 px-3">
                  <p className="font-medium text-text-primary max-w-[220px] truncate">{c.title}</p>
                </td>
                <td className="py-2.5 px-3 text-text-secondary">{accountMap.get(c.accountId)?.name ?? c.accountId}</td>
                <td className="py-2.5 px-3 text-text-secondary capitalize">{c.serviceType.replace("_", " ")}</td>
                <td className="py-2.5 px-3 text-text-secondary text-xs">
                  {c.startDate} → {c.endDate}
                </td>
                <td className="py-2.5 px-3 text-text-primary font-medium">
                  ${(c.totalValueCents / 100).toLocaleString()}
                </td>
                <td className="py-2.5 px-3">
                  <Pill color={statusColors[c.status]}>{c.status.replace("_", " ")}</Pill>
                </td>
                <td className="py-2.5 px-3">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedContractId(c.id)}>View PDF</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Create contract modal */}
      <Modal open={showCreate} onOpenChange={setShowCreate}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>New Contract</ModalTitle>
          </ModalHeader>
          <div className="space-y-3 mt-2">
            <Select value={newAccountId} onValueChange={setNewAccountId}>
              <SelectTrigger label="Account *">
                <SelectValue placeholder="Select account..." />
              </SelectTrigger>
              <SelectContent>
                {mockAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input label="Contract Title *" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Select value={newServiceType} onValueChange={setNewServiceType}>
              <SelectTrigger label="Service Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pm">PM Only</SelectItem>
                <SelectItem value="combined">PM + Service</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-3">
              <Input label="Start Date *" type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} className="flex-1" />
              <Input label="End Date *" type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} className="flex-1" />
            </div>
            <Input label="Total Value ($) *" type="number" step="0.01" value={newTotalValue} onChange={(e) => setNewTotalValue(e.target.value)} />
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={createContract.isPending}>
              {createContract.isPending ? "Creating..." : "Create Contract"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Contract detail modal */}
      <Modal open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContractId(null)}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>{selectedContract?.title}</ModalTitle>
            <ModalDescription>{accountMap.get(selectedContract?.accountId ?? "")?.name}</ModalDescription>
          </ModalHeader>
          {selectedContract && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-text-muted">Service Type</p>
                  <p className="text-text-primary capitalize">{selectedContract.serviceType.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">E-Sign Status</p>
                  <Pill color={statusColors[selectedContract.status]}>{selectedContract.status.replace("_", " ")}</Pill>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Term</p>
                  <p className="text-text-primary">{selectedContract.startDate} → {selectedContract.endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Total Value</p>
                  <p className="text-lg font-semibold text-text-primary">${(selectedContract.totalValueCents / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Cadence</p>
                  <p className="text-text-primary capitalize">{selectedContract.cadence?.replace("_", " ") ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Auto-Renew</p>
                  <p className="text-text-primary">{selectedContract.autoRenew ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedContractId(null)}>Close</Button>
                {selectedContract.status === "draft" && (
                  <Button variant="primary" size="sm" onClick={() => handleSend(selectedContract.id)} disabled={sendContract.isPending}>
                    {sendContract.isPending ? "Sending..." : "Send for Signature"}
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
