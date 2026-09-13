import { create } from "zustand";
import { apiEnabled, apiRequest } from "../services/apiClient";

let idCounter = 1000;
const nextId = (prefix) => `${prefix}-${idCounter++}`;

const normalizeTeacher = (teacher) => ({
  ...teacher,
  initials:
    teacher.initials ||
    teacher.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    "?",
  subjects:
    teacher.subjects ||
    (teacher.specialization ? [teacher.specialization] : []),
  classes: teacher.classes || [],
  weeklyPeriods: teacher.weeklyPeriods ?? teacher.maximum_weekly_periods ?? 0,
  maxDaily: teacher.maxDaily ?? teacher.maximum_daily_periods ?? 0,
  availability: teacher.availability || "full",
  status: teacher.status === "active" ? "Active" : teacher.status || "Active",
});

const normalizeNotification = (notification) => ({
  ...notification,
  read: Boolean(notification.read_at || notification.read),
  time: notification.created_at
    ? new Date(notification.created_at).toLocaleString()
    : notification.time || "Just now",
});

const timetableGrid = (timetable) =>
  (timetable.entries || []).reduce((grid, entry) => {
    const classId = String(entry.class_id);
    const day =
      entry.day_of_week.charAt(0).toUpperCase() + entry.day_of_week.slice(1);
    const periodId = `p${entry.period?.period_number || entry.period_id}`;
    grid[classId] ||= {};
    grid[classId][day] ||= {};
    grid[classId][day][periodId] = {
      entryId: entry.id,
      subject: entry.subject?.name || "",
      teacherId: String(entry.teacher_id),
      teacherName: entry.teacher?.name || "",
      room: entry.room?.name || "",
      conflict: false,
    };
    return grid;
  }, {});

export const useAppStore = create((set, get) => ({
  // ---------- reference data ----------
  teachers: [],
  classes: [],
  subjects: [],
  rooms: [],
  academicYears: [],
  periods: [],
  hydrated: false,

  hydrateFromApi: async () => {
    if (!apiEnabled) return;
    const keys = [
      "teachers",
      "classes",
      "subjects",
      "rooms",
      "academicYears",
      "periods",
      "notifications",
      "conflicts",
      "timetableList",
    ];
    const results = await Promise.allSettled([
      apiRequest("/teachers"),
      apiRequest("/classes"),
      apiRequest("/subjects"),
      apiRequest("/rooms"),
      apiRequest("/academic-years"),
      apiRequest("/periods"),
      apiRequest("/notifications"),
      apiRequest("/conflicts"),
      apiRequest("/timetables"),
    ]);
    const values = {};
      results.forEach((result, index) => {
        const key = keys[index];
      if (result.status === "fulfilled") {
    values[key] = result.value;
} else {
  console.error(`Failed to load ${key}:`, result.reason);
  }
  });

    const patch = { hydrated: true };
    if (values.teachers) patch.teachers = values.teachers.data.map(normalizeTeacher);
    if (values.classes) patch.classes = values.classes.data;
    if (values.subjects) patch.subjects = values.subjects.data;
    if (values.rooms) patch.rooms = values.rooms.data;
    if (values.academicYears) patch.academicYears = values.academicYears.data;
    if (values.periods) patch.periods = values.periods.data;
    if (values.notifications) patch.notifications = (values.notifications.data.data || []).map(normalizeNotification);
    if (values.conflicts) patch.conflicts = values.conflicts.data.data || [];
 
    if (values.timetableList) {
      const timetableDetails = await Promise.allSettled((values.timetableList.data || []).map((item) => apiRequest(`/timetables/${item.id}`)));
      patch.timetables = timetableDetails.reduce((all, result) => {
        if (result.status === "fulfilled") return { ...all, ...timetableGrid(result.value.data) };
        console.error("Failed to load a timetable:", result.reason);
        return all;
      }, {});
    }
 
    set(patch);

   },

  addTeacher: async (teacher) => {
    if (apiEnabled) {
      const response = await apiRequest("/teachers", {
        method: "POST",
        body: JSON.stringify(teacher),
      });
      const created = normalizeTeacher(response.data);
      set((s) => ({ teachers: [created, ...s.teachers] }));
      return created;
    }
    const created = normalizeTeacher({ id: nextId("t"), ...teacher });
    set((s) => ({ teachers: [created, ...s.teachers] }));
    return created;
  },
  updateTeacher: async (id, patch) => {
    const response = await apiRequest(`/teachers/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    set((s) => ({
      teachers: s.teachers.map((t) =>
        t.id === id ? normalizeTeacher(response.data) : t,
      ),
    }));
    return response.data;
  },

  updateSubject: async (id, subject) => {
    const response = await apiRequest(`/subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify(subject),
    });
    set((s) => ({
      subjects: s.subjects.map((item) =>
        item.id === id ? response.data : item,
      ),
    }));
    return response.data;
  },

  updateRoom: async (id, room) => {
    const response = await apiRequest(`/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(room),
    });
    set((s) => ({
      rooms: s.rooms.map((item) => (item.id === id ? response.data : item)),
    }));
    return response.data;
  },

  addClass: async (cls) => {
    const response = await apiRequest("/classes", {
      method: "POST",
      body: JSON.stringify(cls),
    });
    set((s) => ({ classes: [response.data, ...s.classes] }));
    return response.data;
  },

  updateClass: async (id, cls) => {
    const response = await apiRequest(`/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(cls),
    });
    set((s) => ({
      classes: s.classes.map((item) => (item.id === id ? response.data : item)),
    }));
    return response.data;
  },

  addAssignment: async (assignment) => {
    const response = await apiRequest("/assignments", {
      method: "POST",
      body: JSON.stringify(assignment),
    });
    return response.data;
  },

  updateAssignment: async (id, assignment) => {
    const response = await apiRequest(`/assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify(assignment),
    });
    return response.data;
  },

  deleteAssignment: async (id) => {
    await apiRequest(`/assignments/${id}`, { method: "DELETE" });
  },

  createSubject: async (subject) => {
    const response = await apiRequest("/subjects", {
      method: "POST",
      body: JSON.stringify(subject),
    });
    set((s) => ({ subjects: [response.data, ...s.subjects] }));
    return response.data;
  },

  createRoom: async (room) => {
    const response = await apiRequest("/rooms", {
      method: "POST",
      body: JSON.stringify(room),
    });
    set((s) => ({ rooms: [response.data, ...s.rooms] }));
    return response.data;
  },

  createAcademicYear: async (year) => {
    const response = await apiRequest("/academic-years", {
      method: "POST",
      body: JSON.stringify(year),
    });
    set((s) => ({ academicYears: [response.data, ...s.academicYears] }));
    return response.data;
  },

  createPeriod: async (period) => {
    const response = await apiRequest("/periods", {
      method: "POST",
      body: JSON.stringify(period),
    });
    set((s) => ({
      periods: [...s.periods, response.data].sort(
        (a, b) => a.period_number - b.period_number,
      ),
    }));
    return response.data;
  },

  // ---------- timetable ----------
  timetables: {},

  getEntry: (classId, day, periodId) => {
    const tt = get().timetables[classId];
    return tt?.[day]?.[periodId] || null;
  },

  updateEntry: (classId, day, periodId, patch) =>
    set((s) => {
      const tt = { ...s.timetables };
      const classGrid = { ...(tt[classId] || {}) };
      const dayGrid = { ...(classGrid[day] || {}) };
      dayGrid[periodId] = { ...(dayGrid[periodId] || {}), ...patch };
      classGrid[day] = dayGrid;
      tt[classId] = classGrid;
      return { timetables: tt };
    }),

  setClassGrid: (classId, grid) =>
    set((s) => ({ timetables: { ...s.timetables, [classId]: grid } })),

  clearEntry: (classId, day, periodId) =>
    set((s) => {
      const tt = { ...s.timetables };
      const classGrid = { ...(tt[classId] || {}) };
      const dayGrid = { ...(classGrid[day] || {}) };
      delete dayGrid[periodId];
      classGrid[day] = dayGrid;
      tt[classId] = classGrid;
      return { timetables: tt };
    }),

  // ---------- conflicts ----------
  conflicts: [],

  resolveConflict: (conflictId, method = "manual") =>
    set((s) => {
      const conflict = s.conflicts.find((c) => c.id === conflictId);
      if (!conflict) return {};
      const tt = { ...s.timetables };
      const classGrid = { ...(tt[conflict.classId] || {}) };
      const dayGrid = { ...(classGrid[conflict.day] || {}) };
      const entry = dayGrid[conflict.periodId];
      if (entry) {
        dayGrid[conflict.periodId] = {
          ...entry,
          conflict: false,
          conflictReason: undefined,
        };
        classGrid[conflict.day] = dayGrid;
        tt[conflict.classId] = classGrid;
      }
      return {
        timetables: tt,
        conflicts: s.conflicts.map((c) =>
          c.id === conflictId
            ? { ...c, status: method === "ignore" ? "Ignored" : "Resolved" }
            : c,
        ),
      };
    }),

  addConflict: (conflict) =>
    set((s) => ({
      conflicts: [
        { id: nextId("c"), status: "Open", ...conflict },
        ...s.conflicts,
      ],
    })),

  // ---------- notifications ----------
  notifications: [],

  markNotificationRead: async (id) => {
    await apiRequest(`/notifications/${id}/read`, { method: "POST" });
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
  },

  markAllNotificationsRead: async () => {
    await apiRequest("/notifications/read-all", { method: "POST" });
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  deleteNotification: async (id) => {
    await apiRequest(`/notifications/${id}`, { method: "DELETE" });
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
  },

  pushNotification: (n) =>
    set((s) => ({
      notifications: [
        { id: nextId("n"), time: "Just now", read: false, ...n },
        ...s.notifications,
      ],
    })),

  // ---------- constraints ----------
  constraints: [],

  toggleConstraint: (id) =>
    set((s) => ({
      constraints: s.constraints.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c,
      ),
    })),

  addConstraint: (constraint) =>
    set((s) => ({
      constraints: [
        ...s.constraints,
        { id: nextId("cn"), enabled: true, ...constraint },
      ],
    })),

  // ---------- approval workflow ----------
  approvals: {},

  setApprovalStatus: (classId, status) =>
    set((s) => ({ approvals: { ...s.approvals, [classId]: status } })),

  // ---------- generation wizard ----------
  generation: {
    isRunning: false,
    isComplete: false,
    result: null,
  },
  setGenerationState: (patch) =>
    set((s) => ({ generation: { ...s.generation, ...patch } })),
  resetGeneration: () =>
    set({ generation: { isRunning: false, isComplete: false, result: null } }),
}));
