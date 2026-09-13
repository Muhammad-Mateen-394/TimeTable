import { useMemo, useState } from "react";
import { useEffect } from "react";
import { Link2, Plus, CheckCircle2, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Card, Badge, EmptyState } from "../../components/common/Card";
import { Field, Select } from "../../components/common/FormControls";
import { useAppStore } from "../../store/useAppStore";
import { apiRequest } from "../../services/apiClient";

export default function AssignmentsPage() {
  const teachers = useAppStore((s) => s.teachers);
  const classes = useAppStore((s) => s.classes);
  const subjects = useAppStore((s) => s.subjects);
  const rooms = useAppStore((s) => s.rooms);
  const academicYears = useAppStore((s) => s.academicYears);
  const addAssignment = useAppStore((s) => s.addAssignment);
  const updateAssignment = useAppStore((s) => s.updateAssignment);
  const deleteAssignment = useAppStore((s) => s.deleteAssignment);

  const [teacherId, setTeacherId] = useState(teachers[0]?.id || "");
  const [subject, setSubject] = useState(subjects[0]?.name || "");
  const [classId, setClassId] = useState(classes[0]?.id || "");
  const [weeklyPeriods, setWeeklyPeriods] = useState(subjects[0]?.default_weekly_periods || 1);
  const [room, setRoom] = useState("");
  const [academicYearId, setAcademicYearId] = useState(academicYears[0]?.id || "");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    apiRequest("/assignments").then((response) => {
      setAssignments((response.data || []).map((assignment) => ({
        id: assignment.id,
        teacherId: assignment.teacher_id,
        subjectId: assignment.subject_id,
        subject: assignment.subject?.name || "",
        classId: assignment.class_id,
        academicYearId: assignment.academic_year_id,
        weeklyPeriods: assignment.weekly_periods,
        roomId: assignment.room_id,
        room: assignment.room?.name || "",
      })));
    }).catch(() => setAssignments([]));
  }, []);

  useEffect(() => {
    if (!teacherId && teachers[0]) setTeacherId(String(teachers[0].id));
    if (!subject && subjects[0]) setSubject(subjects[0].name);
    if (!classId && classes[0]) setClassId(String(classes[0].id));
    if (!academicYearId && academicYears[0]) setAcademicYearId(String(academicYears[0].id));
  }, [teachers, subjects, classes, academicYears, teacherId, subject, classId, academicYearId]);

  const teacher = teachers.find((t) => t.id === teacherId);
  const eligible = teacher?.subjects.includes(subject);

  const conflict = useMemo(
    () => assignments.find((a) => a.id !== editingId && String(a.teacherId) === String(teacherId) && String(a.classId) === String(classId) && String(a.academicYearId) === String(academicYearId) && a.subject === subject),
    [assignments, teacherId, classId, subject, editingId]
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload = { academic_year_id: academicYearId, teacher_id: teacherId, subject_id: subjects.find((item) => item.name === subject)?.id, class_id: classId, room_id: rooms.find((item) => item.name === room)?.id || null, weekly_periods: Number(weeklyPeriods) };
      const created = editingId ? await updateAssignment(editingId, payload) : await addAssignment(payload);
      setAssignments((prev) => [
        { id: created.id, teacherId, subjectId: payload.subject_id, subject, classId, academicYearId, weeklyPeriods: Number(weeklyPeriods), roomId: payload.room_id, room },
        ...prev.filter((assignment) => assignment.id !== editingId),
      ]);
      setEditingId(null);
    } catch (error) {
      setFormError(error.errors ? Object.values(error.errors).flat().join(" ") : error.message || "Could not save assignment.");
    } finally {
      setSaving(false);
    }
  };

  const editAssignment = (assignment) => {
    setEditingId(assignment.id);
    setTeacherId(String(assignment.teacherId));
    setSubject(assignment.subject);
    setClassId(String(assignment.classId));
    setAcademicYearId(String(assignment.academicYearId));
    setWeeklyPeriods(assignment.weeklyPeriods);
    setRoom(assignment.room);
  };

  const removeAssignment = async (id) => {
    await deleteAssignment(id);
    setAssignments((current) => current.filter((assignment) => assignment.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Link teachers, subjects, classes, and rooms" />

      {teachers.length === 0 || subjects.length === 0 || classes.length === 0 || academicYears.length === 0 ? (
        <Card><EmptyState icon={Link2} title="Assignment setup is incomplete" description="Create at least one teacher, subject, and class before adding an assignment." /></Card>
      ) : <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 h-fit">
          <h3 className="font-medium text-ink-900 mb-4 flex items-center gap-2">
            <Link2 size={16} className="text-forest" /> {editingId ? "Edit Assignment" : "New Assignment"}
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <Field label="Teacher">
              <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </Field>
            <Field label="Subject">
              <Select value={subject} onChange={(e) => { setSubject(e.target.value); const s = subjects.find(x=>x.name===e.target.value); if (s) setWeeklyPeriods(s.weeklyPeriods); }}>
                {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Class">
              <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.grade} - Section {c.section}</option>)}
              </Select>
            </Field>
            <Field label="Academic year">
              <Select value={String(academicYearId)} onChange={(e) => setAcademicYearId(e.target.value)}>
                {academicYears.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
              </Select>
            </Field>
            <Field label="Weekly periods">
              <Select value={weeklyPeriods} onChange={(e) => setWeeklyPeriods(e.target.value)}>
                {[2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
            <Field label="Room">
              <Select value={room} onChange={(e) => setRoom(e.target.value)}>
                <option value="">Select a room</option>
                {rooms.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </Select>
            </Field>

            {!eligible && (
              <div className="flex items-start gap-2 text-xs text-clash-amber bg-clash-amber/5 border border-clash-amber/20 rounded-lg px-3 py-2">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                {teacher?.name} does not currently teach {subject}. You can still assign, but consider updating their subjects.
              </div>
            )}
            {conflict && (
              <div className="flex items-start gap-2 text-xs text-clash-red bg-clash-red/5 border border-clash-red/20 rounded-lg px-3 py-2">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                This exact assignment already exists.
              </div>
            )}
            {formError && <p className="text-sm text-clash-red bg-clash-red/5 border border-clash-red/20 rounded-lg px-3 py-2">{formError}</p>}
            {!conflict && eligible && (
              <div className="flex items-start gap-2 text-xs text-clash-green bg-clash-green/5 border border-clash-green/20 rounded-lg px-3 py-2">
                <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                Looks good — no clashes detected.
              </div>
            )}

            <div className="flex gap-2">
              {editingId && <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>}
              <Button type="submit" icon={editingId ? Pencil : Plus} className="w-full" disabled={!!conflict || saving || !academicYearId}>{saving ? "Saving..." : editingId ? "Save Assignment" : "Add Assignment"}</Button>
            </div>
          </form>
        </Card>

        <Card padded={false} className="lg:col-span-2 overflow-x-auto h-fit">
          {assignments.length === 0 ? (
            <EmptyState icon={Link2} title="No assignments yet" description="Create your first teacher-subject-class assignment." />
          ) : (
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-900/45 border-b border-black/[0.06]">
                  <th className="px-5 py-3">Teacher</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Weekly</th>
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => {
                  const t = teachers.find((tt) => String(tt.id) === String(a.teacherId));
                  return (
                    <tr key={a.id} className="border-b border-black/[0.04] last:border-0 hover:bg-cream/50">
                      <td className="px-5 py-3 text-sm font-medium text-ink-900">{t?.name}</td>
                      <td className="px-5 py-3 text-sm text-ink-900/70">{a.subject}</td>
                      <td className="px-5 py-3 text-sm text-ink-900/70">Grade {a.classId}</td>
                      <td className="px-5 py-3 text-sm text-ink-900/70">{a.weeklyPeriods}</td>
                      <td className="px-5 py-3"><Badge>{a.room || "—"}</Badge></td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button className="text-ink-900/40 hover:text-forest p-1" title="Edit assignment" onClick={() => editAssignment(a)}><Pencil size={15} /></button>
                        <button className="text-ink-900/40 hover:text-clash-red p-1" title="Remove assignment" onClick={() => removeAssignment(a.id)}><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>}
    </div>
  );
}
