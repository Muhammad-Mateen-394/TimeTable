export const CONSTRAINTS_SEED = [];
/*
  { id: "cn01", group: "Teacher", title: "No teacher double booking", description: "A teacher cannot be assigned to two classes in the same period.", severity: "hard", enabled: true },
  { id: "cn02", group: "Teacher", title: "Max consecutive periods", description: "A teacher should not teach more than 4 consecutive periods without a break.", severity: "hard", enabled: true },
  { id: "cn03", group: "Teacher", title: "No scheduling during absence", description: "Do not schedule a teacher during a period they've marked as unavailable.", severity: "hard", enabled: true },
  { id: "cn04", group: "Teacher", title: "Balance weekly workload", description: "Distribute periods evenly across the week for each teacher where possible.", severity: "soft", enabled: true },
  { id: "cn05", group: "Teacher", title: "Minimize teacher gaps", description: "Reduce idle periods between a teacher's classes on the same day.", severity: "soft", enabled: true },
  { id: "cn06", group: "Class", title: "No class double booking", description: "A class cannot have two subjects scheduled in the same period.", severity: "hard", enabled: true },
  { id: "cn07", group: "Class", title: "Required weekly periods", description: "Each subject must receive its configured number of periods per week.", severity: "hard", enabled: true },
  { id: "cn08", group: "Class", title: "Avoid repeating subjects", description: "Avoid scheduling the same subject more than twice a day for one class.", severity: "soft", enabled: true },
  { id: "cn09", group: "Room", title: "Lab subjects in lab rooms", description: "Physics, Chemistry, Biology and Computer Science must be scheduled in their respective labs.", severity: "hard", enabled: true },
  { id: "cn10", group: "Room", title: "Capacity check", description: "A class cannot be assigned to a room with less capacity than its student count.", severity: "hard", enabled: true },
  { id: "cn11", group: "Room", title: "No room double booking", description: "A room cannot be used by two classes in the same period.", severity: "hard", enabled: true },
  { id: "cn12", group: "Schedule", title: "Zuhr prayer break", description: "Reserve 12:30 - 13:15 daily for Zuhr prayer and lunch across all classes.", severity: "hard", enabled: true },
  { id: "cn13", group: "Schedule", title: "Saturday half-day", description: "Schedule only the first 4 periods on Saturday for all classes.", severity: "hard", enabled: true },
  { id: "cn14", group: "Schedule", title: "Core subjects in morning slots", description: "Prefer scheduling Mathematics, English, Physics and Chemistry before Period 5.", severity: "soft", enabled: true },
  { id: "cn15", group: "Schedule", title: "Allow double periods", description: "Permit consecutive double periods for lab-based subjects when needed.", severity: "soft", enabled: true },
]; */
