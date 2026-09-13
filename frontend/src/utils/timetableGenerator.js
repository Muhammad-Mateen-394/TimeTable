import { DAYS, TEACHING_PERIODS } from "../data/constants";
import { TEACHERS } from "../data/teachers";
import { CLASSES } from "../data/classes";

const GRADE_SUBJECTS = {
  "Grade 6": ["Mathematics", "English", "Urdu", "Islamiat", "Pakistan Studies", "Art", "Physical Education"],
  "Grade 7": ["Mathematics", "English", "Urdu", "Islamiat", "Physics", "Chemistry", "Biology", "Physical Education"],
  "Grade 8": ["Mathematics", "English", "Urdu", "Islamiat", "Physics", "Chemistry", "Biology", "Pakistan Studies", "Computer Science"],
  "Grade 9": ["Mathematics", "English", "Urdu", "Islamiat", "Physics", "Chemistry", "Biology", "Pakistan Studies", "Computer Science"],
  "Grade 10": ["Mathematics", "English", "Urdu", "Islamiat", "Physics", "Chemistry", "Biology", "Computer Science", "Economics"],
};

const LAB_ROOMS = {
  Physics: "Physics Lab",
  Chemistry: "Chemistry Lab",
  Biology: "Biology Lab",
  "Computer Science": "Computer Lab",
};

function findTeacher(subject, classId) {
  const direct = TEACHERS.find((t) => t.subjects.includes(subject) && t.classes.includes(classId));
  if (direct) return direct;
  const anyTeacher = TEACHERS.find((t) => t.subjects.includes(subject));
  return anyTeacher || TEACHERS[0];
}

// Builds a deterministic weekly grid for one class: { [day]: { [periodId]: entry } }
export function generateClassTimetable(classId) {
  const cls = CLASSES.find((c) => c.id === classId);
  const subjects = GRADE_SUBJECTS[cls.grade] || GRADE_SUBJECTS["Grade 8"];
  const grid = {};
  let cursor = 0;

  DAYS.forEach((day, dayIdx) => {
    grid[day] = {};
    const periodsToday = dayIdx === 5 ? TEACHING_PERIODS.slice(0, 4) : TEACHING_PERIODS; // Saturday half-day
    periodsToday.forEach((period, periodIdx) => {
      // rotate subject list with an offset per day so the week looks varied but stable
      const subject = subjects[(cursor + periodIdx + dayIdx) % subjects.length];
      const teacher = findTeacher(subject, classId);
      const room = LAB_ROOMS[subject] || cls.room;
      grid[day][period.id] = {
        subject,
        teacherId: teacher.id,
        teacherName: teacher.name.replace(/^Mr\.|^Ms\./, "").trim(),
        room,
        conflict: false,
      };
    });
    cursor += 2;
  });

  return grid;
}

export function generateAllTimetables() {
  const all = {};
  CLASSES.forEach((c) => {
    all[c.id] = generateClassTimetable(c.id);
  });
  return all;
}
