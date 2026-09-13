export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Ordered list of slots for a school day. type: 'period' | 'break' | 'prayer'
export const PERIOD_SLOTS = [
  { id: "p1", type: "period", label: "Period 1", time: "07:45 - 08:30" },
  { id: "p2", type: "period", label: "Period 2", time: "08:30 - 09:15" },
  { id: "p3", type: "period", label: "Period 3", time: "09:15 - 10:00" },
  { id: "recess", type: "break", label: "Recess", time: "10:00 - 10:15" },
  { id: "p4", type: "period", label: "Period 4", time: "10:15 - 11:00" },
  { id: "p5", type: "period", label: "Period 5", time: "11:00 - 11:45" },
  { id: "p6", type: "period", label: "Period 6", time: "11:45 - 12:30" },
  { id: "prayer", type: "break", label: "Zuhr & Lunch", time: "12:30 - 13:15" },
  { id: "p7", type: "period", label: "Period 7", time: "13:15 - 14:00" },
  { id: "p8", type: "period", label: "Period 8", time: "14:00 - 14:45" },
];

export const TEACHING_PERIODS = PERIOD_SLOTS.filter((s) => s.type === "period");

export const SUBJECT_COLORS = {
  Mathematics: { bg: "#eef0fb", border: "#c3c9f0", text: "#3c4592" },
  English: { bg: "#eaf3fb", border: "#bcdcf5", text: "#2b6693" },
  Physics: { bg: "#fdf3e4", border: "#f2d9a8", text: "#93650f" },
  Chemistry: { bg: "#fdeee9", border: "#f3c8b7", text: "#9c4a26" },
  Biology: { bg: "#eaf6ee", border: "#bfe4cb", text: "#2d7a45" },
  Urdu: { bg: "#f3eefb", border: "#dccbf2", text: "#6a3999" },
  Islamiat: { bg: "#eef8f2", border: "#c3e8d3", text: "#1f7a4d" },
  "Computer Science": { bg: "#e9f3fb", border: "#b9d9f0", text: "#215d8f" },
  "Pakistan Studies": { bg: "#fbf0ea", border: "#f0d2ba", text: "#a3591f" },
  "Physical Education": { bg: "#f6f6ee", border: "#e2e2bd", text: "#7a7a2d" },
  Art: { bg: "#fbeef6", border: "#f0c6df", text: "#a32a76" },
  Geography: { bg: "#eafaf7", border: "#bdeee3", text: "#12806b" },
  History: { bg: "#f6f1ea", border: "#e1d1ba", text: "#7a5a2d" },
  Economics: { bg: "#eef4fb", border: "#c3d9f2", text: "#2f5f99" },
  "Computer Lab": { bg: "#e9f3fb", border: "#b9d9f0", text: "#215d8f" },
};

export const STATUS_COLORS = {
  Complete: "bg-clash-green/10 text-clash-green border-clash-green/30",
  Incomplete: "bg-clash-red/10 text-clash-red border-clash-red/30",
  "In Progress": "bg-clash-amber/10 text-clash-amber border-clash-amber/30",
};
