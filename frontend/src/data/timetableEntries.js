import { generateAllTimetables } from "../utils/timetableGenerator";

// Hand-authored Grade 8 - Section A grid, matching the reference product design exactly,
// including the two seeded scheduling conflicts.
const GRADE_8A = {
  Monday: {
    p1: { subject: "Mathematics", teacherName: "M. Ahmed", teacherId: "t01", room: "Room 204" },
    p2: { subject: "English", teacherName: "F. Khan", teacherId: "t02", room: "Room 204" },
    p3: { subject: "Physics", teacherName: "A. Hassan", teacherId: "t09", room: "Physics Lab" },
    p4: { subject: "Urdu", teacherName: "A. Malik", teacherId: "t04", room: "Room 204" },
    p5: { subject: "Chemistry", teacherName: "S. Qureshi", teacherId: "t06", room: "Chem Lab", conflict: true, conflictReason: "Ms. Sana Qureshi double-booked with Grade 8C at this time." },
    p6: { subject: "Islamiat", teacherName: "A. Malik", teacherId: "t04", room: "Room 204" },
    p7: { subject: "Computer Science", teacherName: "U. Raza", teacherId: "t05", room: "Computer Lab" },
  },
  Tuesday: {
    p1: { subject: "English", teacherName: "F. Khan", teacherId: "t02", room: "Room 204" },
    p2: { subject: "Mathematics", teacherName: "M. Ahmed", teacherId: "t01", room: "Room 204" },
    p3: { subject: "Biology", teacherName: "B. Akhtar", teacherId: "t07", room: "Biology Lab" },
    p4: { subject: "Mathematics", teacherName: "M. Ahmed", teacherId: "t01", room: "Room 204" },
    p5: { subject: "Pakistan Studies", teacherName: "Z. Siddiqui", teacherId: "t08", room: "Room 204" },
    p6: { subject: "Physics", teacherName: "A. Hassan", teacherId: "t09", room: "Physics Lab" },
    p7: { subject: "Urdu", teacherName: "A. Malik", teacherId: "t04", room: "Room 204" },
  },
  Wednesday: {
    p1: { subject: "Mathematics", teacherName: "N. Hussain", teacherId: "t03", room: "Room 204" },
    p2: { subject: "Chemistry", teacherName: "S. Qureshi", teacherId: "t06", room: "Chem Lab" },
    p3: { subject: "English", teacherName: "F. Khan", teacherId: "t02", room: "Room 204" },
    p4: { subject: "Biology", teacherName: "B. Akhtar", teacherId: "t07", room: "Biology Lab" },
    p5: { subject: "Mathematics", teacherName: "N. Hussain", teacherId: "t03", room: "Room 204" },
    p6: { subject: "Urdu", teacherName: "A. Malik", teacherId: "t04", room: "Room 204" },
    p7: { subject: "Pakistan Studies", teacherName: "Z. Siddiqui", teacherId: "t08", room: "Room 204" },
  },
  Thursday: {
    p1: { subject: "Physics", teacherName: "A. Hassan", teacherId: "t09", room: "Physics Lab", conflict: true, conflictReason: "Mr. Ali Hassan double-booked with Grade 7B at this time." },
    p2: { subject: "English", teacherName: "F. Khan", teacherId: "t02", room: "Room 204" },
    p3: { subject: "Mathematics", teacherName: "M. Ahmed", teacherId: "t01", room: "Room 204" },
    p4: { subject: "Chemistry", teacherName: "S. Qureshi", teacherId: "t06", room: "Chem Lab" },
    p5: { subject: "Urdu", teacherName: "A. Malik", teacherId: "t04", room: "Room 204" },
    p6: { subject: "Biology", teacherName: "B. Akhtar", teacherId: "t07", room: "Biology Lab" },
    p7: { subject: "Islamiat", teacherName: "A. Malik", teacherId: "t04", room: "Room 204" },
  },
  Friday: {
    p1: { subject: "English", teacherName: "F. Khan", teacherId: "t02", room: "Room 204" },
    p2: { subject: "Mathematics", teacherName: "M. Ahmed", teacherId: "t01", room: "Room 204" },
    p3: { subject: "Urdu", teacherName: "A. Malik", teacherId: "t04", room: "Room 204" },
    p4: { subject: "Physics", teacherName: "A. Hassan", teacherId: "t09", room: "Physics Lab" },
    p5: { subject: "Chemistry", teacherName: "S. Qureshi", teacherId: "t06", room: "Chem Lab" },
    p6: { subject: "Mathematics", teacherName: "N. Hussain", teacherId: "t03", room: "Room 204" },
    p7: { subject: "Pakistan Studies", teacherName: "Z. Siddiqui", teacherId: "t08", room: "Room 204" },
  },
  Saturday: {
    p1: { subject: "Mathematics", teacherName: "M. Ahmed", teacherId: "t01", room: "Room 204" },
    p2: { subject: "English", teacherName: "F. Khan", teacherId: "t02", room: "Room 204" },
    p3: { subject: "Islamiat", teacherName: "A. Malik", teacherId: "t04", room: "Room 204" },
    p4: { subject: "Computer Science", teacherName: "U. Raza", teacherId: "t05", room: "Computer Lab" },
  },
};

export function buildInitialTimetables() {
  const all = generateAllTimetables();
  all["8A"] = GRADE_8A;
  return all;
}
