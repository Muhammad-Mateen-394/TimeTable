import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, PenSquare, AlertTriangle, Send, GraduationCap, Users2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { Card, StatCard } from "../../components/common/Card";
import Button from "../../components/common/Button";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import { useAppStore } from "../../store/useAppStore";
import { computeCompletion } from "../../utils/dashboardStats";
import { apiRequest } from "../../services/apiClient";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const classes = useAppStore((s) => s.classes);
  const allConflicts = useAppStore((s) => s.conflicts);
  const notifications = useAppStore((s) => s.notifications);
  const approvals = useAppStore((s) => s.approvals);
  const [timetables, setTimetables] = useState([]);

  useEffect(() => {
    apiRequest("/timetables").then((response) => setTimetables(response.data || [])).catch(() => setTimetables([]));
  }, []);

  const conflicts = allConflicts.filter((c) => c.status === "Open");
  const completion = computeCompletion(classes);
  const unassigned = classes.filter((c) => c.status !== "Complete").length;
  const pendingReview = timetables.filter((timetable) => ["draft", "under_review"].includes(timetable.status)).length || Object.values(approvals).filter((s) => s === "Under Review" || s === "Draft").length;
  const currentTimetable = timetables.find((timetable) => ["draft", "under_review"].includes(timetable.status)) || timetables[0];
  const currentTitle = currentTimetable?.name || (classes[0] ? `${classes[0].grade} ${classes[0].section}` : "your timetable");

  return (
    <div>
      <PageHeader
        title="Manager Workspace"
        subtitle="Operational overview for building this term's timetable."
        actions={
          <>
            <Button variant="secondary" icon={PenSquare} onClick={() => navigate("/manager/editor")}>Edit Timetable</Button>
            <Button icon={Zap} onClick={() => navigate("/manager/generate")}>Generate Timetable</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={GraduationCap} label="Completion" value={`${completion}%`} tone="success" hint={`${classes.length} classes total`} />
        <StatCard icon={AlertTriangle} label="Pending Conflicts" value={conflicts.length} tone={conflicts.length ? "danger" : "success"} />
        <StatCard icon={Users2} label="Unassigned Periods" value={unassigned} tone="warning" hint="Classes needing attention" />
        <StatCard icon={Send} label="Awaiting Approval" value={pendingReview} hint="Draft or under review" />
      </div>

      <Card className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-sm font-medium text-ink-900">Ready to submit {currentTitle} for approval?</div>
          <div className="text-xs text-ink-900/50 mt-0.5">{conflicts.length ? `Resolve the ${conflicts.length} open conflict${conflicts.length === 1 ? "" : "s"} first so the principal can review a clean timetable.` : "No open conflicts. Your principal can review this timetable."}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={AlertTriangle} onClick={() => navigate("/manager/conflicts")}>Resolve Conflicts</Button>
          <Button size="sm" icon={Send} onClick={() => navigate("/manager/editor")} disabled={!currentTimetable}>Submit for Approval</Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h3 className="font-serif text-lg text-ink-950 mb-3">Class Timetable Status</h3>
            <div className="space-y-2">
              {classes.slice(0, 7).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b border-black/[0.04] last:border-0">
                  <span className="text-ink-900/80">{c.grade} – Section {c.section}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    c.status === "Complete" ? "bg-clash-green/10 text-clash-green border-clash-green/20" :
                    c.status === "In Progress" ? "bg-clash-amber/10 text-clash-amber border-clash-amber/20" :
                    "bg-clash-red/10 text-clash-red border-clash-red/20"
                  }`}>{c.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <ActivityFeed items={notifications} />
      </div>
    </div>
  );
}
