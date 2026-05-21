"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  PageHeader,
  Card,
  Pill,
  Switch,
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
  useCommissionRules,
  useUpdateCommissionRule,
  useCreateCommissionRule,
  useDeleteCommissionRule,
  useComputeCommissionPreview,
  useInvoices,
} from "@commfit/ui";

export default function CommissionPage() {
  const { data: rules = [], isLoading } = useCommissionRules();
  const updateRule = useUpdateCommissionRule();
  const createRule = useCreateCommissionRule();
  const deleteRule = useDeleteCommissionRule();
  const previewCommission = useComputeCommissionPreview();
  const { data: invoices = [] } = useInvoices();

  // Add rule state
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newJobType, setNewJobType] = useState("pm");

  // Edit rule state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const editingRule = rules.find((r) => r.id === editingRuleId);
  const [editName, setEditName] = useState("");
  const [editRate, setEditRate] = useState("");
  const [editJobType, setEditJobType] = useState("pm");

  // Commission preview state
  const [previewInvoiceId, setPreviewInvoiceId] = useState("");

  function openEdit(rule: (typeof rules)[0]) {
    setEditingRuleId(rule.id);
    setEditName(rule.name);
    setEditRate(String(rule.ratePct));
    setEditJobType(rule.jobTypeFilter ?? "pm");
  }

  function handleCreate() {
    if (!newName || !newRate) return;
    createRule.mutate(
      { name: newName, ratePct: parseFloat(newRate), jobTypeFilter: newJobType },
      {
        onSuccess: () => {
          setShowAdd(false);
          setNewName(""); setNewRate("");
        },
      }
    );
  }

  function handleEdit() {
    if (!editingRuleId || !editName || !editRate) return;
    updateRule.mutate(
      { id: editingRuleId, name: editName, ratePct: parseFloat(editRate), jobTypeFilter: editJobType },
      { onSuccess: () => setEditingRuleId(null) }
    );
  }

  function handleDelete(ruleId: string) {
    deleteRule.mutate(ruleId);
  }

  function handlePreview() {
    if (!previewInvoiceId) return;
    previewCommission.mutate({ invoiceId: previewInvoiceId });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Commission Rules"
        breadcrumbs={[{ label: "Settings" }, { label: "Commission Rules" }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Rule
          </Button>
        }
      />

      {/* Rules list */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-text-muted">Loading rules...</p>
        ) : rules.map((rule) => (
          <Card key={rule.id} className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-text-primary text-sm">{rule.name}</p>
                {rule.jobTypeFilter && <Pill color="info">{rule.jobTypeFilter.toUpperCase()}</Pill>}
                {rule.techTypeFilter && <Pill color="primary">{rule.techTypeFilter.replace("_", " ")}</Pill>}
              </div>
              {rule.description && (
                <p className="text-xs text-text-secondary">{rule.description}</p>
              )}
              <p className="text-xs text-text-muted mt-0.5">Priority: {rule.priority}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-semibold text-text-primary">{rule.ratePct}%</p>
              {rule.bonusRatePct && (
                <p className="text-xs text-success">Bonus: {rule.bonusRatePct}% after {rule.bonusThresholdJobs} jobs</p>
              )}
            </div>
            <Switch
              checked={rule.active}
              onCheckedChange={(checked) => updateRule.mutate({ id: rule.id, active: checked })}
            />
            <Button variant="ghost" size="sm" onClick={() => openEdit(rule)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)}>
              <Trash2 className="h-3.5 w-3.5 text-danger" />
            </Button>
          </Card>
        ))}
      </div>

      {/* Commission preview (replaces client-side calculator) */}
      <Card padding="lg">
        <h3 className="font-semibold text-text-primary mb-3">Commission Preview</h3>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Select value={previewInvoiceId} onValueChange={setPreviewInvoiceId}>
              <SelectTrigger label="Invoice">
                <SelectValue placeholder="Select invoice..." />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — ${(inv.totalCents / 100).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="secondary" size="md" onClick={handlePreview} disabled={previewCommission.isPending || !previewInvoiceId}>
            {previewCommission.isPending ? "Computing..." : "Calculate"}
          </Button>
        </div>
        {previewCommission.isSuccess && (
          <div className="mt-3 p-3 rounded bg-success/10 border border-success/20 text-sm text-success">
            {typeof previewCommission.data === "object"
              ? JSON.stringify(previewCommission.data, null, 2)
              : String(previewCommission.data)}
          </div>
        )}
        {previewCommission.isError && (
          <div className="mt-3 p-3 rounded bg-danger/10 border border-danger/20 text-sm text-danger">
            Preview unavailable — API not connected
          </div>
        )}
      </Card>

      {/* Add rule modal */}
      <Modal open={showAdd} onOpenChange={setShowAdd}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add Commission Rule</ModalTitle>
          </ModalHeader>
          <div className="space-y-3 mt-2">
            <Input label="Rule Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input label="Rate (%)" type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} />
            <Select value={newJobType} onValueChange={setNewJobType}>
              <SelectTrigger label="Job Type Filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pm">PM</SelectItem>
                <SelectItem value="sr">Service Request</SelectItem>
                <SelectItem value="disinfecting">Disinfecting</SelectItem>
                <SelectItem value="install">Install</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={createRule.isPending}>
              {createRule.isPending ? "Creating..." : "Create Rule"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit rule modal */}
      <Modal open={!!editingRuleId} onOpenChange={(open) => !open && setEditingRuleId(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Rule — {editingRule?.name}</ModalTitle>
          </ModalHeader>
          <div className="space-y-3 mt-2">
            <Input label="Rule Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input label="Rate (%)" type="number" value={editRate} onChange={(e) => setEditRate(e.target.value)} />
            <Select value={editJobType} onValueChange={setEditJobType}>
              <SelectTrigger label="Job Type Filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pm">PM</SelectItem>
                <SelectItem value="sr">Service Request</SelectItem>
                <SelectItem value="disinfecting">Disinfecting</SelectItem>
                <SelectItem value="install">Install</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setEditingRuleId(null)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleEdit} disabled={updateRule.isPending}>
              {updateRule.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
