import { useEffect, useState } from "react";
import { Undo2, Redo2, Save, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Select } from "../../components/common/FormControls";
import { Badge, Card } from "../../components/common/Card";
import TimetableGrid from "../../components/timetable/TimetableGrid";
import CellEditorDrawer from "../../components/timetable/CellEditorDrawer";
import { useAppStore } from "../../store/useAppStore";
import { PERIOD_SLOTS } from "../../data/constants";
import { apiRequest } from "../../services/apiClient";

export default function Editor() {
  const classes = useAppStore((s) => s.classes);
  const [classId, setClassId] = useState("");
  const timetables = useAppStore((s) => s.timetables);
  const setClassGrid = useAppStore((s) => s.setClassGrid);
  const allConflicts = useAppStore((s) => s.conflicts);
  const subjects = useAppStore((s) => s.subjects);
  const teachers = useAppStore((s) => s.teachers);
  const rooms = useAppStore((s) => s.rooms);
  const academicYears = useAppStore((s) => s.academicYears);
  const periods = useAppStore((s) => s.periods);
  const [timetableId, setTimetableId] = useState(null);
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const missingResources = [
    academicYears.length === 0 && "academic year",
    subjects.length === 0 && "subject",
    teachers.length === 0 && "teacher",
    rooms.length === 0 && "room",
    periods.length === 0 && "period",
  ].filter(Boolean);

  useEffect(() => {
    if (!classes.some((item) => String(item.id) === String(classId))) {
      setClassId(classes[0] ? String(classes[0].id) : "");
    }
  }, [classes, classId]);

  useEffect(() => {
    let active = true;
    apiRequest("/timetables").then(async (response) => {
      if (!active) return;
      const existing = response.data?.[0];
      if (existing) setTimetableId(existing.id);
      else if (academicYears[0]) {
        const created = await apiRequest("/timetables", { method: "POST", body: JSON.stringify({ academic_year_id: academicYears[0].id, name: `${academicYears[0].name} Manual Timetable` }) });
        if (active) setTimetableId(created.data.id);
      }
    }).catch((error) => active && setApiError(error.message || "Unable to load timetable."));
    return () => { active = false; };
  }, [academicYears]);

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const [cell, setCell] = useState(null); // { day, periodId, entry }
  const conflicts = allConflicts.filter((c) => c.status === "Open" && c.classId === classId);

  useEffect(() => {
    setHistory([]);
    setFuture([]);
    setDirty(false);
  }, [classId]);

  const commit = (nextGrid) => {
    setHistory((h) => [...h, timetables[classId]]);
    setFuture([]);
    setClassGrid(classId, nextGrid);
    setDirty(true);
  };

  const handleCellClick = (day, periodId, entry) => {
    const periodLabel = PERIOD_SLOTS.find((p) => p.id === periodId)?.label;
    setCell({ day, periodId, entry, periodLabel });
  };

  const handleDrawerClassChange = (nextClassId) => {
    setClassId(nextClassId);
    setCell(null);
  };

  const handleSaveCell = async (patch) => {
    setApiError("");
    const subject = useAppStore.getState().subjects.find((item) => item.name === patch.subject);
    const teacher = useAppStore.getState().teachers.find((item) => String(item.id) === String(patch.teacherId));
    const room = useAppStore.getState().rooms.find((item) => item.name === patch.room);
    const period = periods.find((item) => `p${item.period_number}` === cell.periodId);
    if (!timetableId || !subject || !teacher || !period) {
      setApiError(`Before editing, create: ${missingResources.join(", ") || "a timetable setup"}. Use Settings, Subjects, Rooms, Teachers, and Classes.`);
      return;
    }
    try {
      const payload = { class_id: classId, subject_id: subject.id, teacher_id: teacher.id, room_id: room?.id || null, period_id: period.id, day_of_week: cell.day.toLowerCase() };
      const response = cell.entry?.entryId
        ? await apiRequest(`/timetable-entries/${cell.entry.entryId}`, { method: "PUT", body: JSON.stringify(payload) })
        : await apiRequest(`/timetables/${timetableId}/entries`, { method: "POST", body: JSON.stringify(payload) });
      patch = { ...patch, entryId: response.data.id };
    } catch (error) {
      setApiError(error.message || "Unable to save timetable entry.");
      return;
    }
    const grid = { ...timetables[classId] };
    const dayGrid = { ...(grid[cell.day] || {}) };
    dayGrid[cell.periodId] = patch;
    grid[cell.day] = dayGrid;
    commit(grid);
    setCell(null);
    setDirty(false);
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2500);
  };

  const handleClearCell = async () => {
    if (cell?.entry?.entryId) await apiRequest(`/timetable-entries/${cell.entry.entryId}`, { method: "DELETE" });
    const grid = { ...timetables[classId] };
    const dayGrid = { ...(grid[cell.day] || {}) };
    delete dayGrid[cell.periodId];
    grid[cell.day] = dayGrid;
    commit(grid);
    setCell(null);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [timetables[classId], ...f]);
    setHistory((h) => h.slice(0, -1));
    setClassGrid(classId, prev);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, timetables[classId]]);
    setFuture((f) => f.slice(1));
    setClassGrid(classId, next);
  };

  const handleSave = () => {
    setDirty(false);
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2500);
  };

  const handleSubmit = async () => {
    if (!timetableId) return;
    setSubmitting(true);
    try {
      await apiRequest(`/timetables/${timetableId}/submit`, { method: "POST" });
      setSavedNote(true);
      setApiError("");
    } catch (error) {
      setApiError(error.message || "Unable to submit timetable for approval.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Timetable Editor"
        subtitle={classId ? `Grade ${classes.find((item) => String(item.id) === classId)?.grade || ""} – Section ${classes.find((item) => String(item.id) === classId)?.section || ""}` : "No classes available"}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={Undo2} onClick={handleUndo} disabled={history.length === 0}>Undo</Button>
            <Button variant="secondary" size="sm" icon={Redo2} onClick={handleRedo} disabled={future.length === 0}>Redo</Button>
            {conflicts.length > 0 && (
              <Button variant="outlineDanger" size="sm" icon={AlertTriangle}>{conflicts.length} Conflicts</Button>
            )}
            <Button icon={Save} onClick={handleSave} disabled={!dirty}>Save</Button>
            <Button onClick={handleSubmit} disabled={submitting || !timetableId}>{submitting ? "Submitting..." : "Submit for Approval"}</Button>
          </>
        }
      />
      {apiError && <p className="mb-4 text-sm text-clash-red">{apiError}</p>}

      <Card className="mb-4 !p-3" padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-3">
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-56" disabled={classes.length === 0}>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>{item.grade} - Section {item.section}</option>
            ))}
          </Select>
          {dirty && <Badge tone="amber">Unsaved changes</Badge>}
          {savedNote && <Badge tone="green">Saved</Badge>}
          <span className="text-xs text-ink-900/40 ml-auto">Click any cell in the grid to edit that time slot</span>
        </div>
      </Card>

      {classes.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-900/60">No classes are available yet. Create a class and add the required subjects, teachers, rooms, and periods before editing a timetable.</p>
        </Card>
      ) : (
        <TimetableGrid classId={classId} editable onCellClick={handleCellClick} />
      )}

      <CellEditorDrawer
        open={!!cell}
        onClose={() => setCell(null)}
        classId={classId}
        classes={classes}
        onClassChange={handleDrawerClassChange}
        day={cell?.day}
        periodId={cell?.periodId}
        periodLabel={cell?.periodLabel}
        entry={cell?.entry}
        onSave={handleSaveCell}
        onClear={handleClearCell}
      />
    </div>
  );
}
