import { useState } from "react";
import { Search, BookOpen, Plus, Pencil } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Card, Badge, EmptyState } from "../../components/common/Card";
import { Field, Input } from "../../components/common/FormControls";
import { Modal } from "../../components/common/Drawer";
import { useAppStore } from "../../store/useAppStore";

const PRIORITY_TONE = { High: "red", Medium: "amber", Low: "default" };

export default function SubjectsPage() {
  const subjects = useAppStore((s) => s.subjects);
  const createSubject = useAppStore((s) => s.createSubject);
  const updateSubject = useAppStore((s) => s.updateSubject);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", default_weekly_periods: 4 });
  const filtered = subjects.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader title="Subjects" subtitle={`${subjects.length} subjects configured`} actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>Add Subject</Button>} />

      <Card className="mb-4 !p-3" padded={false}>
        <div className="flex items-center gap-2 bg-cream-dark rounded-lg px-3 py-2 m-3">
          <Search size={15} className="text-ink-900/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-ink-900/40"
          />
        </div>
      </Card>

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setEditing(null); }} title={editing ? "Edit Subject" : "Add Subject"} subtitle="Create or update a subject">
        <form className="space-y-4" onSubmit={async (event) => { event.preventDefault(); const payload = { ...form, default_weekly_periods: Number(form.default_weekly_periods) }; if (editing) await updateSubject(editing.id, payload); else await createSubject(payload); setForm({ name: "", code: "", default_weekly_periods: 4 }); setEditing(null); setAddOpen(false); }}>
          <Field label="Subject name"><Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Code"><Input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} /></Field>
          <Field label="Weekly periods"><Input required type="number" min="1" max="20" value={form.default_weekly_periods} onChange={(event) => setForm({ ...form, default_weekly_periods: event.target.value })} /></Field>
          <div className="flex justify-end"><Button type="submit">Add Subject</Button></div>
        </form>
      </Modal>

      <Card padded={false} className="overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState icon={BookOpen} title="No subjects found" />
        ) : (
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-900/45 border-b border-black/[0.06]">
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Classes</th>
                <th className="px-5 py-3">Weekly Periods</th>
                <th className="px-5 py-3">Requirements</th>
                <th className="px-5 py-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-black/[0.04] last:border-0 hover:bg-cream/50">
                  <td className="px-5 py-3 text-sm font-medium text-ink-900">{s.name}</td>
                  <td className="px-5 py-3 text-sm text-ink-900/60">{s.code}</td>
                  <td className="px-5 py-3 text-sm text-ink-900/70">{s.classes}</td>
                  <td className="px-5 py-3 text-sm text-ink-900/70">{s.weeklyPeriods} / week</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.requiresLab && <Badge tone="blue">Requires lab</Badge>}
                      {s.doublePeriod && <Badge>Double period</Badge>}
                      {s.morningPreferred && <Badge tone="mint">Morning preferred</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge tone={PRIORITY_TONE[s.priority]}>{s.priority}</Badge></td>
                  <td className="px-5 py-3 text-right"><button className="text-ink-900/40 hover:text-forest" onClick={() => { setEditing(s); setForm({ name: s.name, code: s.code, default_weekly_periods: s.default_weekly_periods || 4 }); setAddOpen(true); }}><Pencil size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
