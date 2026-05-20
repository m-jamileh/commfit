"use client";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
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
} from "@commfit/ui";

export default function CommissionPage() {
  const { data: rules = [], isLoading } = useCommissionRules();
  const updateRule = useUpdateCommissionRule();
  const createRule = useCreateCommissionRule();
  const [showAdd, setShowAdd] = useState(false);
  const [testAmount, setTestAmount] = useState("10000");
  const [testJobType, setTestJobType] = useState("pm");
  const [testResult, setTestResult] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newJobType, setNewJobType] = useState("pm");

  function handleTest() {
    const amount = parseFloat(testAmount);
    const matchingRule = rules.find((r) => r.active && (!r.jobTypeFilter || r.jobTypeFilter === testJobType));
    if (matchingRule) {
      const commission = amount * (matchingRule.ratePct / 100);
      setTestResult(`Applied rule: "${matchingRule.name}" (${matchingRule.ratePct}%) → Commission: $${commission.toFixed(2)}`);
    } else {
      setTestResult("No matching commission rule found for these parameters.");
    }
  }

  function handleCreate() {
    if (!newName || !newRate) return;
    createRule.mutate({ name: newName, ratePct: parseFloat(newRate), jobTypeFilter: newJobType });
    setShowAdd(false);
    setNewName("");
    setNewRate("");
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
            <Button variant="ghost" size="sm">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </Card>
        ))}
      </div>

      {/* Commission tester */}
      <Card padding="lg">
        <h3 className="font-semibold text-text-primary mb-3">Commission Calculator</h3>
        <div className="flex items-end gap-3 flex-wrap">
          <Input
            label="Job Amount ($)"
            value={testAmount}
            onChange={(e) => setTestAmount(e.target.value)}
            type="number"
            className="w-36"
          />
          <div>
            <Select value={testJobType} onValueChange={setTestJobType}>
              <SelectTrigger label="Job Type" className="w-36">
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
          <Button variant="secondary" size="md" onClick={handleTest}>
            Calculate
          </Button>
        </div>
        {testResult && (
          <div className="mt-3 p-3 rounded bg-success/10 border border-success/20 text-sm text-success">
            {testResult}
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
            <Button variant="primary" size="sm" onClick={handleCreate}>Create Rule</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
