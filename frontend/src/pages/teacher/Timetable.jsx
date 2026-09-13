import PageHeader from "../../components/common/PageHeader";
import TimetableGrid from "../../components/timetable/TimetableGrid";
import { useAppStore } from "../../store/useAppStore";
import { useAuthStore } from "../../store/useAuthStore";
import { getTeacherSchedule } from "../../utils/getTeacherSchedule";

export default function TeacherTimetable() {
  const { user } = useAuthStore();
  const timetables = useAppStore((s) => s.timetables);
  const schedule = getTeacherSchedule(timetables, user?.teacherId);

  return (
    <div>
      <PageHeader title="My Timetable" subtitle={user?.name} />
      <TimetableGrid grid={schedule} editable={false} showClass />
    </div>
  );
}
