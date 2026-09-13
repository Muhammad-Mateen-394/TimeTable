import { useNavigate } from "react-router-dom";
import { CalendarDays, GraduationCap, Bell, ArrowRight } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { Card, Badge } from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAppStore } from "../../store/useAppStore";
import { useAuthStore } from "../../store/useAuthStore";
import { getTeacherSchedule } from "../../utils/getTeacherSchedule";
import { DAYS, PERIOD_SLOTS, SUBJECT_COLORS } from "../../data/constants";

function getTodayName() {
  const name = new Date().toLocaleDateString("en-US", { weekday: "long" });
  return DAYS.includes(name) ? name : "Monday"; // fall back for demo on Sundays
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const timetables = useAppStore((s) => s.timetables);
  const notifications = useAppStore((s) => s.notifications);
  const today = getTodayName();

  const schedule = getTeacherSchedule(timetables, user?.teacherId);
  const todaysPeriods = PERIOD_SLOTS.filter((p) => p.type === "period" && schedule[today]?.[p.id]);
  const myClasses = new Set(Object.values(schedule).flatMap((d) => Object.values(d).map((e) => e.classId)));

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name.split(" ").slice(-1)[0]}`} subtitle={`Today is ${today}. Here's your schedule.`} />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-ink-950">Today's Timetable</h3>
              <Button variant="secondary" size="sm" icon={CalendarDays} onClick={() => navigate("/teacher/timetable")}>
                Full week
              </Button>
            </div>

            {todaysPeriods.length === 0 ? (
              <p className="text-sm text-ink-900/50 py-8 text-center">No classes scheduled today. Enjoy the break!</p>
            ) : (
              <div className="space-y-2">
                {PERIOD_SLOTS.filter((p) => p.type === "period").map((p) => {
                  const entry = schedule[today]?.[p.id];
                  const color = entry ? SUBJECT_COLORS[entry.subject] : null;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${entry ? "border-black/[0.06]" : "border-dashed border-black/[0.06] opacity-60"}`}
                      style={entry ? { background: color.bg, borderColor: color.border } : {}}
                    >
                      <div className="w-24 shrink-0 text-xs text-ink-900/50">{p.time}</div>
                      {entry ? (
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold" style={{ color: color.text }}>{entry.subject}</div>
                            <div className="text-xs text-ink-900/50">Grade {entry.classId}</div>
                          </div>
                          <Badge>{entry.room}</Badge>
                        </div>
                      ) : (
                        <div className="text-sm text-ink-900/40">Free Period</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={16} className="text-forest" />
              <h3 className="font-serif text-lg text-ink-950">My Classes</h3>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[...myClasses].map((c) => (
                <Badge key={c} tone="mint">Grade {c}</Badge>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-3 -ml-2.5" icon={ArrowRight} onClick={() => navigate("/teacher/classes")}>
              View details
            </Button>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Bell size={16} className="text-forest" />
              <h3 className="font-serif text-lg text-ink-950">Notifications</h3>
            </div>
            <ul className="space-y-2.5">
              {notifications.slice(0, 4).map((n) => (
                <li key={n.id} className="text-sm">
                  <div className="text-ink-900">{n.title}</div>
                  <div className="text-xs text-ink-900/40">{n.time}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
