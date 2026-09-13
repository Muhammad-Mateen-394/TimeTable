import { Download } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Select } from "../../components/common/FormControls";
import WorkloadChart from "../../components/dashboard/WorkloadChart";
import SubjectDonut from "../../components/dashboard/SubjectDonut";
import { useAppStore } from "../../store/useAppStore";
import { computeWorkloadData, computeSubjectDistribution } from "../../utils/dashboardStats";

export default function ReportsPage() {
  const teachers = useAppStore((s) => s.teachers);
  const subjects = useAppStore((s) => s.subjects);
  const rooms = useAppStore((s) => s.rooms);
  const conflicts = useAppStore((s) => s.conflicts);

  const resolvedCount = conflicts.filter((c) => c.status !== "Open").length;
  const avgUtilization = Math.round(rooms.reduce((a, r) => a + r.utilization, 0) / rooms.length);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Insights into workload, utilization, and scheduling quality"
        actions={
          <>
            <Select className="w-40"><option>This term</option><option>Last term</option><option>Full year</option></Select>
            <Button variant="secondary" icon={Download}>Export</Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <h3 className="font-serif text-lg text-ink-950 mb-1">Teacher Workload</h3>
          <p className="text-xs text-ink-900/45 mb-2">Weekly assigned periods by teacher</p>
          <WorkloadChart data={computeWorkloadData(teachers)} />
        </Card>
        <Card>
          <h3 className="font-serif text-lg text-ink-950 mb-3">Subject Distribution</h3>
          <SubjectDonut data={computeSubjectDistribution(subjects)} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card>
          <h3 className="font-medium text-ink-900 mb-3">Room Utilization</h3>
          <div className="space-y-2.5">
            {rooms.slice(0, 6).map((r) => (
              <div key={r.id}>
                <div className="flex justify-between text-xs text-ink-900/60 mb-1">
                  <span>{r.name}</span><span>{r.utilization}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                  <div className="h-full bg-forest rounded-full" style={{ width: `${r.utilization}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-ink-900/45 mt-3">Average utilization: {avgUtilization}%</div>
        </Card>

        <Card>
          <h3 className="font-medium text-ink-900 mb-3">Conflict History</h3>
          <div className="flex items-end gap-6">
            <div>
              <div className="text-3xl font-serif text-ink-950">{conflicts.length}</div>
              <div className="text-xs text-ink-900/45">Total detected</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-clash-green">{resolvedCount}</div>
              <div className="text-xs text-ink-900/45">Resolved</div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-medium text-ink-900 mb-3">Timetable Quality</h3>
          <div className="text-3xl font-serif text-forest mb-1">96%</div>
          <p className="text-xs text-ink-900/45">
            Average quality score across the last auto-generation run, based on constraint satisfaction and workload balance.
          </p>
        </Card>
      </div>
    </div>
  );
}
