export const CLASSES = [];
/*
  { id: "6A", grade: "Grade 6", section: "A", students: 35, classTeacher: "Ms. Fatima Khan", room: "Room 101", status: "Complete" },
  { id: "6B", grade: "Grade 6", section: "B", students: 33, classTeacher: "Ms. Ayesha Malik", room: "Room 102", status: "Complete" },
  { id: "6C", grade: "Grade 6", section: "C", students: 31, classTeacher: "Ms. Zainab Siddiqui", room: "Room 103", status: "Incomplete" },
  { id: "7A", grade: "Grade 7", section: "A", students: 34, classTeacher: "Mr. Muhammad Ahmed", room: "Room 201", status: "Complete" },
  { id: "7B", grade: "Grade 7", section: "B", students: 36, classTeacher: "Mr. Ali Hassan", room: "Room 202", status: "Complete" },
  { id: "7C", grade: "Grade 7", section: "C", students: 32, classTeacher: "Ms. Sana Qureshi", room: "Room 203", status: "Complete" },
  { id: "8A", grade: "Grade 8", section: "A", students: 35, classTeacher: "Ms. Nadia Hussain", room: "Room 204", status: "Complete" },
  { id: "8B", grade: "Grade 8", section: "B", students: 34, classTeacher: "Mr. Usman Raza", room: "Room 205", status: "Complete" },
  { id: "8C", grade: "Grade 8", section: "C", students: 33, classTeacher: "Mr. Bilal Akhtar", room: "Room 206", status: "In Progress" },
  { id: "9A", grade: "Grade 9", section: "A", students: 30, classTeacher: "Ms. Hina Tariq", room: "Room 301", status: "Complete" },
  { id: "9B", grade: "Grade 9", section: "B", students: 29, classTeacher: "Mr. Tariq Javed", room: "Room 302", status: "Complete" },
  { id: "10A", grade: "Grade 10", section: "A", students: 28, classTeacher: "Ms. Sadia Aslam", room: "Room 401", status: "Incomplete" },
  { id: "10B", grade: "Grade 10", section: "B", students: 27, classTeacher: "Ms. Mahnoor Farooq", room: "Room 402", status: "In Progress" },
]; */

export const getClassById = (id) => CLASSES.find((c) => c.id === id);
