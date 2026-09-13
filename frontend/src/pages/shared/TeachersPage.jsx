import { useMemo, useState } from "react";
import { Search, Plus, Eye, Pencil } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Card, Badge, EmptyState } from "../../components/common/Card";
import { Input, Select, Field } from "../../components/common/FormControls";
import { Modal, Drawer } from "../../components/common/Drawer";
import AvailabilityGrid from "../../components/teachers/AvailabilityGrid";
import { useAppStore } from "../../store/useAppStore";

const AVAILABILITY_LABEL = { full: "Full week", partial: "Partial", unavailable: "Limited" };

export default function TeachersPage() {
  const teachers = useAppStore((s) => s.teachers);
  const subjects = useAppStore((s) => s.subjects);
  const addTeacher = useAppStore((s) => s.addTeacher);
  const updateTeacher = useAppStore((s) => s.updateTeacher);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", specialization: "", maximum_weekly_periods: 20, maximum_daily_periods: 5 });
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", weeklyPeriods: 20, maxDaily: 5 });

  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      const matchesQuery = t.name.toLowerCase().includes(query.toLowerCase()) || t.subjects.join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [teachers, query, statusFilter]);

  const handleAdd = (e) => {
    e.preventDefault();
    addTeacher({
      name: form.name,
      email: form.email,
      initials: form.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
      employee_code: `T-${Date.now()}`,
      specialization: form.subject || null,
      maximum_weekly_periods: Number(form.weeklyPeriods),
      maximum_daily_periods: Number(form.maxDaily),
    });
    setAddOpen(false);
    setForm({ name: "", email: "", subject: subjects[0]?.name || "", weeklyPeriods: 20, maxDaily: 5 });
  };

  return (
    <div>
      <PageHeader
        title="Teachers"
        subtitle={`${teachers.length} teachers on staff`}
        actions={<Button icon={Plus} onClick={() => setAddOpen(true)}>Add Teacher</Button>}
      />

      <Card className="mb-4 !p-3" padded={false}>
        <div className="flex flex-wrap gap-2 p-3">
          <div className="flex items-center gap-2 bg-cream-dark rounded-lg px-3 py-2 flex-1 min-w-[220px]">
            <Search size={15} className="text-ink-900/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teachers or subjects..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-ink-900/40"
            />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
          </Select>
        </div>
      </Card>

      <Card padded={false} className="overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState icon={Search} title="No teachers found" description="Try a different search term or filter." />
        ) : (
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-900/45 border-b border-black/[0.06]">
                <th className="px-5 py-3">Teacher</th>
                <th className="px-5 py-3">Subjects</th>
                <th className="px-5 py-3">Classes</th>
                <th className="px-5 py-3">Weekly Periods</th>
                <th className="px-5 py-3">Max Daily</th>
                <th className="px-5 py-3">Availability</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-black/[0.04] last:border-0 hover:bg-cream/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center text-xs font-semibold shrink-0">
                        {t.initials}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-ink-900">{t.name}</div>
                        <div className="text-xs text-ink-900/40">{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-ink-900/70">{t.subjects.join(", ")}</td>
                  <td className="px-5 py-3 text-sm text-ink-900/70">{t.classes.join(", ") || "—"}</td>
                  <td className="px-5 py-3 text-sm text-ink-900/70">{t.weeklyPeriods}</td>
                  <td className="px-5 py-3 text-sm text-ink-900/70">{t.maxDaily}</td>
                  <td className="px-5 py-3 text-sm text-ink-900/70">{AVAILABILITY_LABEL[t.availability]}</td>
                  <td className="px-5 py-3">
                    <Badge tone={t.status === "Active" ? "green" : "amber"}>{t.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => { setProfile(t); setEditing(true); setEditForm({ name: t.name, specialization: t.specialization || t.subjects?.[0] || "", maximum_weekly_periods: t.weeklyPeriods, maximum_daily_periods: t.maxDaily }); }} className="text-ink-900/40 hover:text-forest p-1.5" title="Edit teacher">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setProfile(t)} className="text-ink-900/40 hover:text-forest p-1.5">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Drawer open={!!profile} onClose={() => { setProfile(null); setEditing(false); }} title={profile?.name} subtitle={profile?.email}>
        {profile && (
          <div className="space-y-5">
            <div className="flex justify-end"><Button variant="secondary" size="sm" icon={Pencil} onClick={() => { setEditing(true); setEditForm({ name: profile.name, specialization: profile.specialization || profile.subjects?.[0] || "", maximum_weekly_periods: profile.weeklyPeriods, maximum_daily_periods: profile.maxDaily }); }}>Edit teacher</Button></div>
            {editing && <form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); const updated = await updateTeacher(profile.id, { name: editForm.name, specialization: editForm.specialization, maximum_weekly_periods: Number(editForm.maximum_weekly_periods), maximum_daily_periods: Number(editForm.maximum_daily_periods) }); setProfile({ ...profile, ...updated }); setEditing(false); }}>
              <Field label="Name"><Input required value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} /></Field>
              <Field label="Specialization"><Input value={editForm.specialization} onChange={(event) => setEditForm({ ...editForm, specialization: event.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3"><Field label="Weekly periods"><Input type="number" min="1" value={editForm.maximum_weekly_periods} onChange={(event) => setEditForm({ ...editForm, maximum_weekly_periods: event.target.value })} /></Field><Field label="Max daily"><Input type="number" min="1" value={editForm.maximum_daily_periods} onChange={(event) => setEditForm({ ...editForm, maximum_daily_periods: event.target.value })} /></Field></div>
              <Button type="submit">Save teacher</Button>
            </form>}
            <div className="flex flex-wrap gap-1.5">
              {profile.subjects.map((s) => <Badge key={s} tone="mint">{s}</Badge>)}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-cream rounded-lg p-3">
                <div className="text-ink-900/45 text-xs">Weekly Periods</div>
                <div className="font-serif text-lg">{profile.weeklyPeriods}</div>
              </div>
              <div className="bg-cream rounded-lg p-3">
                <div className="text-ink-900/45 text-xs">Max Daily Periods</div>
                <div className="font-serif text-lg">{profile.maxDaily}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-ink-900/45 mb-1">Assigned classes</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.classes.length ? profile.classes.map((c) => <Badge key={c}>Grade {c}</Badge>) : <span className="text-sm text-ink-900/40">No classes assigned yet</span>}
              </div>
            </div>
            <div>
              <div className="text-xs text-ink-900/45 mb-2">Weekly availability</div>
              <AvailabilityGrid editable={false} />
            </div>
          </div>
        )}
      </Drawer>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Teacher" subtitle="Create a new teacher record">
        <form onSubmit={handleAdd} className="space-y-4">
          <Field label="Full name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ms. Ayesha Tariq" />
          </Field>
          <Field label="Email">
            <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="a.tariq@alfalah.edu.pk" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary subject">
              <Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                <option value="">Select a subject</option>
                {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Weekly periods">
              <Input type="number" value={form.weeklyPeriods} onChange={(e) => setForm({ ...form, weeklyPeriods: e.target.value })} />
            </Field>
          </div>
          <Field label="Max daily periods">
            <Input type="number" value={form.maxDaily} onChange={(e) => setForm({ ...form, maxDaily: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit">Add Teacher</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
