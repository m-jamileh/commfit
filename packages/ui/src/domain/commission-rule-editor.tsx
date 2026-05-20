"use client";
import * as React from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Switch } from "../components/switch";
import { Pill } from "../components/pill";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/select";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "../components/modal";

export interface CommissionRule {
  id: string;
  name: string;
  ratePct: number;
  bonusRatePct?: number;
  bonusThresholdJobs?: number;
  jobTypeFilter?: string;
  techTypeFilter?: string;
  priority: number;
  active: boolean;
  description?: string;
}

interface CommissionRuleEditorProps {
  rules: CommissionRule[];
  onToggle?: (id: string, active: boolean) => void;
  onAdd?: (rule: Omit<CommissionRule, "id" | "priority">) => void;
  onEdit?: (rule: CommissionRule) => void;
  onDelete?: (id: string) => void;
  onReorder?: (ids: string[]) => void;
  isLoading?: boolean;
}

const JOB_TYPES = ["pm", "sr", "disinfecting", "install"];

export function CommissionRuleEditor({
  rules,
  onToggle,
  onAdd,
  onDelete,
  isLoading,
}: CommissionRuleEditorProps) {
  const [showAdd, setShowAdd] = React.useState(false);
  const [name, setName] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [jobType, setJobType] = React.useState("pm");

  function handleCreate() {
    if (!name.trim() || !rate) return;
    onAdd?.({ name: name.trim(), ratePct: parseFloat(rate), jobTypeFilter: jobType, active: true });
    setShowAdd(false);
    setName("");
    setRate("");
  }

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading rules...</p>;
  }

  return (
    <>
      <div className="space-y-2">
        {rules.map((rule) => (
          <Card key={rule.id} className="flex items-center gap-3 py-3">
            <GripVertical className="h-4 w-4 text-text-muted shrink-0 cursor-grab" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-text-primary">{rule.name}</span>
                {rule.jobTypeFilter && (
                  <Pill color="info">{rule.jobTypeFilter.toUpperCase()}</Pill>
                )}
              </div>
              {rule.description && (
                <p className="text-xs text-text-secondary mt-0.5">{rule.description}</p>
              )}
              <p className="text-xs text-text-muted">Priority: {rule.priority}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-semibold text-text-primary">{rule.ratePct}%</p>
              {rule.bonusRatePct && (
                <p className="text-xs text-success">
                  +{rule.bonusRatePct}% after {rule.bonusThresholdJobs} jobs
                </p>
              )}
            </div>
            <Switch
              checked={rule.active}
              onCheckedChange={(checked) => onToggle?.(rule.id, checked)}
            />
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(rule.id)}>
                <Trash2 className="h-3.5 w-3.5 text-danger" />
              </Button>
            )}
          </Card>
        ))}

        {rules.length === 0 && (
          <p className="text-sm text-text-muted text-center py-6">No commission rules yet.</p>
        )}
      </div>

      <Button variant="secondary" size="sm" onClick={() => setShowAdd(true)} className="mt-3">
        <Plus className="h-3.5 w-3.5" /> Add Rule
      </Button>

      <Modal open={showAdd} onOpenChange={setShowAdd}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add Commission Rule</ModalTitle>
          </ModalHeader>
          <div className="space-y-3 mt-2">
            <Input label="Rule Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Commission Rate (%)"
              type="number"
              min={0}
              max={100}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger label="Job Type Filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ModalFooter>
            <Button variant="secondary" size="sm" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={!name || !rate}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
