import PageHeader from "../../components/common/PageHeader";
import { Card, Badge } from "../../components/common/Card";
import AvailabilityGrid from "../../components/teachers/AvailabilityGrid";
import { useAppStore } from "../../store/useAppStore";
import { useAuthStore } from "../../store/useAuthStore";

export default function TeacherProfile() {
  const { user } = useAuthStore();
  const teachers = useAppStore((s) => s.teachers);
  const me = teachers.find((t) => t.id === user?.teacherId);

  if (!me) return null;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your personal information, subjects, and availability" />
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <div className="w-14 h-14 rounded-full bg-forest text-white flex items-center justify-center text-lg font-semibold mb-3">
            {me.initials}
          </div>
          <div className="font-serif text-lg text-ink-950">{me.name}</div>
          <div className="text-sm text-ink-900/50 mb-3">{me.email}</div>
          <div className="text-sm text-ink-900/50 mb-4">{me.phone}</div>
          <div className="flex flex-wrap gap-1.5 mb-1">
            {me.subjects.map((s) => <Badge key={s} tone="mint">{s}</Badge>)}
          </div>
          <div className="text-xs text-ink-900/40 mt-4 space-y-1">
            <div>Weekly periods: {me.weeklyPeriods}</div>
            <div>Max daily periods: {me.maxDaily}</div>
            <div>Classes: {me.classes.join(", ")}</div>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-serif text-lg text-ink-950 mb-4">Weekly Availability</h3>
          <AvailabilityGrid editable={false} />
        </Card>
      </div>
    </div>
  );
}
