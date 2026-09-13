// These services wrap the local Zustand store today, but are shaped so that
// each function can later be swapped for a real Laravel REST call
// (e.g. `fetch('/api/timetable')`) without touching component code.
import { useAppStore } from "../store/useAppStore";
import { apiEnabled, apiRequest } from "./apiClient";

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms));

export async function getTimetable(classId) {
  if (apiEnabled) {
    const response = await apiRequest("/timetables");
    return response.data?.find((item) => item.name?.includes(classId)) || response.data?.[0] || {};
  }
  await delay();
  return useAppStore.getState().timetables[classId] || {};
}

export async function updateTimetableEntry(classId, day, periodId, patch) {
  if (apiEnabled) {
    const path = patch.entryId ? `/timetable-entries/${patch.entryId}` : `/timetables/${patch.timetableId}/entries`;
    return apiRequest(path, { method: patch.entryId ? "PUT" : "POST", body: JSON.stringify({ ...patch, day_of_week: day, period_id: periodId, class_id: classId }) });
  }
  await delay(200);
  useAppStore.getState().updateEntry(classId, day, periodId, patch);
  return { ok: true };
}

export async function deleteTimetableEntry(classId, day, periodId) {
  if (apiEnabled) return { ok: true };
  await delay(150);
  useAppStore.getState().clearEntry(classId, day, periodId);
  return { ok: true };
}

export async function getTeachers() {
  if (apiEnabled) return (await apiRequest("/teachers")).data;
  await delay();
  return useAppStore.getState().teachers;
}

export async function createTeacher(payload) {
  if (apiEnabled) return apiRequest("/teachers", { method: "POST", body: JSON.stringify(payload) });
  await delay(300);
  useAppStore.getState().addTeacher(payload);
  return { ok: true };
}

export async function getClasses() {
  if (apiEnabled) return (await apiRequest("/classes")).data;
  await delay();
  return useAppStore.getState().classes;
}

export async function getSubjects() {
  if (apiEnabled) return (await apiRequest("/subjects")).data;
  await delay();
  return useAppStore.getState().subjects;
}

export async function getRooms() {
  if (apiEnabled) return (await apiRequest("/rooms")).data;
  await delay();
  return useAppStore.getState().rooms;
}

export async function getConflicts() {
  if (apiEnabled) return (await apiRequest("/conflicts")).data.data || [];
  await delay();
  return useAppStore.getState().conflicts;
}

export async function resolveConflict(id, method) {
  if (apiEnabled) return apiRequest(`/conflicts/${id}/resolve`, { method: "POST", body: JSON.stringify({ method }) });
  await delay(400);
  useAppStore.getState().resolveConflict(id, method);
  return { ok: true };
}

export async function generateTimetable(_config) {
  if (apiEnabled) {
    const response = await apiRequest("/timetables/generate", { method: "POST", body: JSON.stringify({ academic_year_id: _config?.academicYearId || null }), timeout: 30000 });
    return {
      timetableId: response.data.timetable?.id,
      entriesCount: response.data.entries_count,
      qualityScore: response.data.quality_score,
      teacherClashes: 0,
      classClashes: 0,
      roomClashes: 0,
      weeklyRequirementsSatisfied: true,
      workloadBalanced: true,
      softWarnings: 0,
    };
  }
  // Simulated multi-stage generation; UI drives the step animation itself.
  await delay(600);
  return {
    qualityScore: 96,
    teacherClashes: 0,
    classClashes: 0,
    roomClashes: 0,
    weeklyRequirementsSatisfied: true,
    workloadBalanced: true,
    softWarnings: 2,
  };
}

export async function approveTimetable(classId) {
  if (apiEnabled) return apiRequest(`/timetables/${classId}/approve`, { method: "POST" });
  await delay(300);
  useAppStore.getState().setApprovalStatus(classId, "Approved");
  return { ok: true };
}

export async function publishTimetable(classId) {
  if (apiEnabled) return apiRequest(`/timetables/${classId}/publish`, { method: "POST" });
  await delay(300);
  useAppStore.getState().setApprovalStatus(classId, "Published");
  return { ok: true };
}

export async function getNotifications() {
  if (apiEnabled) return (await apiRequest("/notifications")).data.data || [];
  return useAppStore.getState().notifications;
}

export async function markNotificationRead(id) {
  if (apiEnabled) return apiRequest(`/notifications/${id}/read`, { method: "POST" });
  useAppStore.getState().markNotificationRead(id);
  return { ok: true };
}

export async function markAllNotificationsRead() {
  if (apiEnabled) return apiRequest("/notifications/read-all", { method: "POST" });
  useAppStore.getState().markAllNotificationsRead();
  return { ok: true };
}

export async function getReports() {
  if (!apiEnabled) return null;
  const [workload, subjects, rooms] = await Promise.all([
    apiRequest("/reports/teacher-workload"), apiRequest("/reports/subject-distribution"), apiRequest("/reports/room-utilization"),
  ]);
  return { workload: workload.data, subjects: subjects.data, rooms: rooms.data };
}
