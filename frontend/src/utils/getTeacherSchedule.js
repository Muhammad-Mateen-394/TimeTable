import { DAYS } from "../data/constants";

export function getTeacherSchedule(timetables, teacherId) {
  const schedule = {};
  DAYS.forEach((day) => (schedule[day] = {}));

  Object.entries(timetables).forEach(([classId, dayGrid]) => {
    Object.entries(dayGrid).forEach(([day, periods]) => {
      Object.entries(periods).forEach(([periodId, entry]) => {
        if (entry.teacherId === teacherId) {
          schedule[day][periodId] = { ...entry, classId };
        }
      });
    });
  });

  return schedule;
}
