import { useNavigate } from "react-router-dom";
import { GraduationCap, Users2, Building2, CheckCircle2, AlertTriangle, Zap, ArrowRight } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { Card, StatCard } from "../../components/common/Card";
import Button from "../../components/common/Button";
import WorkloadChart from "../../components/dashboard/WorkloadChart";
import SubjectDonut from "../../components/dashboard/SubjectDonut";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import { useAppStore } from "../../store/useAppStore";
import { useAuthStore } from "../../store/useAuthStore";
import { computeCompletion, computeWorkloadData, computeSubjectDistribution } from "../../utils/dashboardStats";

export default function PrincipalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const classes = useAppStore((s) => s.classes);
  const teachers = useAppStore((s) => s.teachers);
  const rooms = useAppStore((s) => s.rooms);
  const allConflicts = useAppStore((s) => s.conflicts);
  const notifications = useAppStore((s) => s.notifications);

  const conflicts = allConflicts.filter((c) => c.status === "Open");
  const completion = computeCompletion(classes);
  const teacherConflicts = conflicts.filter((c) => c.type === "Teacher Clash").length;
  const roomConflicts = conflicts.filter((c) => c.type === "Room Clash").length;
  const classConflicts = conflicts.length - teacherConflicts - roomConflicts;

  return (
    <div>
      <PageHeader
        title={`Good Morning, ${user?.name.split(" ").slice(-1)[0]}`}
        subtitle="Here is your school's timetable overview."
        actions={
          <Button icon={Zap} onClick={() => navigate("/principal/approval")}>
            Review Approvals
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={GraduationCap} label="Total Classes" value={classes.length} hint={`${classes.filter(c=>c.status==='Complete').length} complete`} />
        <StatCard icon={Users2} label="Total Teachers" value={teachers.length} hint={`${teachers.filter(t=>t.status==='Active').length} active`} />
        <StatCard icon={Building2} label="Total Rooms" value={rooms.length} hint="Classrooms & labs" />
        <StatCard icon={CheckCircle2} label="Completion" value={`${completion}%`} tone="success" hint="Timetable readiness" />
        <StatCard icon={AlertTriangle} label="Active Conflicts" value={conflicts.length} tone={conflicts.length ? "danger" : "success"} hint="Need resolution" />
      </div>

      {conflicts.length > 0 && (
        <Card className="mb-6 !bg-clash-red/5 !border-clash-red/20 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-clash-red" size={20} />
            <div>
              <div className="text-sm font-medium text-ink-900">
                {conflicts.length} scheduling conflicts require attention before publishing
              </div>
              <div className="text-xs text-ink-900/50 mt-0.5">
                {teacherConflicts} teacher · {roomConflicts} room · {Math.max(classConflicts,0)} other
              </div>
            </div>
          </div>
          <Button variant="outlineDanger" size="sm" icon={ArrowRight} onClick={() => navigate("/principal/conflicts")}>
            Resolve
          </Button>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="font-serif text-lg text-ink-950 mb-1">Teacher Weekly Workload</h3>
          <p className="text-xs text-ink-900/45 mb-2">Assigned periods vs. maximum capacity</p>
          <WorkloadChart data={computeWorkloadData(teachers)} />
        </Card>
        <Card>
          <h3 className="font-serif text-lg text-ink-950 mb-3">Subject Distribution</h3>
          <SubjectDonut data={computeSubjectDistribution(useAppStore.getState().subjects)} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-serif text-lg text-ink-950 mb-3">Conflict Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <SummaryTile label="Teacher Conflicts" value={teacherConflicts} />
              <SummaryTile label="Class Conflicts" value={Math.max(classConflicts, 0)} />
              <SummaryTile label="Room Conflicts" value={roomConflicts} />
            </div>
          </Card>
        </div>
        <ActivityFeed items={notifications} />
      </div>
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-lg border border-black/[0.06] bg-cream/60 px-3 py-3 text-center">
      <div className="text-2xl font-serif text-ink-950">{value}</div>
      <div className="text-xs text-ink-900/45 mt-1">{label}</div>
    </div>
  );
}
