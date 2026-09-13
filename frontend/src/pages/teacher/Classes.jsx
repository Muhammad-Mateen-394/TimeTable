import PageHeader from "../../components/common/PageHeader";
import { Card, Badge } from "../../components/common/Card";
import { useAppStore } from "../../store/useAppStore";
import { useAuthStore } from "../../store/useAuthStore";

export default function TeacherClasses() {
  const { user } = useAuthStore();
  const teachers = useAppStore((s) => s.teachers);
  const classes = useAppStore((s) => s.classes);
  const me = teachers.find((t) => t.id === user?.teacherId);
  const myClasses = classes.filter((c) => me?.classes.includes(c.id));

  return (
    <div>
      <PageHeader title="My Classes" subtitle={`${myClasses.length} classes assigned to you this year`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {myClasses.map((c) => (
          <Card key={c.id}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-serif text-lg text-ink-950">{c.grade} - {c.section}</div>
              <Badge tone="mint">{c.room}</Badge>
            </div>
            <div className="text-sm text-ink-900/60 space-y-1">
              <div>{c.students} students</div>
              <div>Class teacher: {c.classTeacher}</div>
              <div>Subjects taught: {me.subjects.join(", ")}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
