import { DAYS } from "../data/constants";

export function getRoomSchedule(timetables, roomName) {
  const schedule = {};
  DAYS.forEach((day) => (schedule[day] = {}));

  Object.entries(timetables).forEach(([classId, dayGrid]) => {
    Object.entries(dayGrid).forEach(([day, periods]) => {
      Object.entries(periods).forEach(([periodId, entry]) => {
        if (entry.room === roomName) {
          schedule[day][periodId] = { ...entry, classId };
        }
      });
    });
  });

  return schedule;
}
