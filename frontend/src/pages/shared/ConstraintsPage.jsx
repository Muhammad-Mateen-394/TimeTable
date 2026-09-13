import { useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Card, Badge } from "../../components/common/Card";
import Toggle from "../../components/common/Toggle";
import { Field, Input, Select, Textarea } from "../../components/common/FormControls";
import { Modal } from "../../components/common/Drawer";
import { useAppStore } from "../../store/useAppStore";

export default function ConstraintsPage({ role }) {
  const constraints = useAppStore((s) => s.constraints);
  const toggleConstraint = useAppStore((s) => s.toggleConstraint);
  const addConstraint = useAppStore((s) => s.addConstraint);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ group: "Schedule", title: "", description: "", severity: "soft" });

  const groups = [...new Set(constraints.map((c) => c.group))];
  const activeCount = constraints.filter((c) => c.enabled).length;
  const readOnly = role === "principal";

  const handleAdd = (e) => {
    e.preventDefault();
    addConstraint(form);
    setAddOpen(false);
    setForm({ group: "Schedule", title: "", description: "", severity: "soft" });
  };

  return (
    <div>
      <PageHeader
        title="Constraints"
        subtitle={`${activeCount} active`}
        actions={!readOnly && <Button icon={Plus} onClick={() => setAddOpen(true)}>Add</Button>}
      />

      <div className="flex items-center gap-4 text-xs text-ink-900/50 mb-5">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-clash-red" /> Hard — must be satisfied</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-clash-amber" /> Soft — optimised if possible</span>
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group}>
            <div className="text-xs uppercase tracking-wide text-ink-900/40 mb-2">{group}</div>
            <div className="space-y-2">
              {constraints.filter((c) => c.group === group).map((c) => (
                <Card key={c.id} className="!py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Toggle checked={c.enabled} onChange={() => !readOnly && toggleConstraint(c.id)} tone={c.severity === "hard" ? "red" : "amber"} disabled={readOnly} />
                    <div>
                      <div className="text-sm font-medium text-ink-900">{c.title}</div>
                      <div className="text-xs text-ink-900/45">{c.description}</div>
                    </div>
                  </div>
                  <Badge tone={c.severity === "hard" ? "red" : "amber"}>{c.severity === "hard" ? "Hard" : "Soft"}</Badge>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Constraint" subtitle="Create a new scheduling rule">
        <form onSubmit={handleAdd} className="space-y-4">
          <Field label="Group">
            <Select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
              {["Teacher", "Class", "Room", "Schedule"].map((g) => <option key={g}>{g}</option>)}
            </Select>
          </Field>
          <Field label="Title">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. No back-to-back labs" />
          </Field>
          <Field label="Description">
            <Textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Severity">
            <Select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              <option value="hard">Hard — must be satisfied</option>
              <option value="soft">Soft — optimised if possible</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" icon={SlidersHorizontal}>Add Constraint</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
