import { useState } from "react";
import { AlertTriangle, Users2, GraduationCap, Building2, Wand2, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { Card, StatCard, Badge, EmptyState } from "../../components/common/Card";
import Button from "../../components/common/Button";
import { Drawer } from "../../components/common/Drawer";
import { useAppStore } from "../../store/useAppStore";
import { CLASSES } from "../../data/classes";

const SEVERITY_TONE = { High: "red", Medium: "amber", Low: "default" };

export default function ConflictsPage({ role }) {
  const navigate = useNavigate();
  const allConflicts = useAppStore((s) => s.conflicts);
  const resolveConflict = useAppStore((s) => s.resolveConflict);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("Open");

  const open = allConflicts.filter((c) => c.status === "Open");
  const teacherCount = open.filter((c) => c.type === "Teacher Clash").length;
  const classCount = open.filter((c) => c.type === "Class Clash").length;
  const roomCount = open.filter((c) => c.type === "Room Clash").length;

  const list = filter === "all" ? allConflicts : allConflicts.filter((c) => c.status === filter);

  const handleResolve = (method) => {
    resolveConflict(selected.id, method);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Conflicts"
        subtitle="Review and resolve scheduling clashes before publishing"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={AlertTriangle} label="Total Conflicts" value={open.length} tone={open.length ? "danger" : "success"} />
        <StatCard icon={Users2} label="Teacher Conflicts" value={teacherCount} tone="danger" />
        <StatCard icon={GraduationCap} label="Class Conflicts" value={classCount} tone="warning" />
        <StatCard icon={Building2} label="Room Conflicts" value={roomCount} tone="warning" />
      </div>

      <div className="flex bg-cream-dark rounded-lg p-1 gap-1 mb-4 w-fit">
        {["Open", "Resolved", "Ignored", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-md text-sm capitalize transition-colors ${
              filter === f ? "bg-white shadow-card text-ink-900 font-medium" : "text-ink-900/50 hover:text-ink-900"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card padded={false} className="overflow-x-auto">
        {list.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No conflicts to show" description="Everything is clear for this filter." />
        ) : (
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-900/45 border-b border-black/[0.06]">
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Day / Period</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Teacher</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const cls = CLASSES.find((cl) => cl.id === c.classId);
                return (
                  <tr key={c.id} className="border-b border-black/[0.04] last:border-0 hover:bg-cream/50">
                    <td className="px-5 py-3"><Badge tone={SEVERITY_TONE[c.severity]}>{c.severity}</Badge></td>
                    <td className="px-5 py-3 text-sm text-ink-900/80">{c.type}</td>
                    <td className="px-5 py-3 text-sm text-ink-900/70">{c.day} · {c.periodLabel}</td>
                    <td className="px-5 py-3 text-sm text-ink-900/70">{cls?.grade} - {cls?.section}</td>
                    <td className="px-5 py-3 text-sm text-ink-900/70">{c.teacherName}</td>
                    <td className="px-5 py-3 text-sm text-ink-900/60 max-w-xs truncate">{c.description}</td>
                    <td className="px-5 py-3 text-right">
                      {c.status === "Open" ? (
                        <Button size="sm" variant="secondary" onClick={() => setSelected(c)}>Review</Button>
                      ) : (
                        <Badge tone={c.status === "Resolved" ? "green" : "default"}>{c.status}</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.type} subtitle={selected && `${selected.day} · ${selected.periodLabel}`}>
        {selected && (
          <div className="space-y-5">
            <Badge tone={SEVERITY_TONE[selected.severity]}>{selected.severity} severity</Badge>
            <p className="text-sm text-ink-900/70 leading-relaxed">{selected.description}</p>

            <div>
              <div className="text-xs text-ink-900/45 mb-2">Current assignment</div>
              <div className="border border-black/[0.06] rounded-lg p-3 text-sm">
                <div className="font-medium text-ink-900">Grade {selected.classId} · {selected.teacherName}</div>
                <div className="text-ink-900/50 text-xs mt-0.5">{selected.day}, {selected.periodLabel}{selected.room ? ` · ${selected.room}` : ""}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-ink-900/45 mb-2">Conflicting assignment</div>
              <div className="border border-clash-red/25 bg-clash-red/5 rounded-lg p-3 text-sm">
                <div className="font-medium text-ink-900">Grade {selected.conflictingClassId} · {selected.teacherName}</div>
                <div className="text-ink-900/50 text-xs mt-0.5">Same day and period</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-ink-900/45 mb-2">Recommended action</div>
              <div className="border border-forest/20 bg-forest/5 rounded-lg p-3 text-sm text-forest-dark">
                Move one of the two sessions to a free period, or assign an alternate teacher qualified for this subject.
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button icon={Wand2} onClick={() => handleResolve("auto")}>Auto Resolve</Button>
              {role === "manager" ? (
                <Button variant="secondary" onClick={() => navigate("/manager/editor")}>View in Timetable Editor</Button>
              ) : (
                <Button variant="secondary" onClick={() => navigate(`/${role}/timetable`)}>View Timetable</Button>
              )}
              <Button variant="ghost" icon={EyeOff} onClick={() => handleResolve("ignore")}>Ignore this conflict</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
