import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Plus, CalendarDays, Pencil } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Card, Badge, EmptyState } from "../../components/common/Card";
import { Field, Input, Select } from "../../components/common/FormControls";
import { Modal } from "../../components/common/Drawer";
import { useAppStore } from "../../store/useAppStore";

const STATUS_TONE = {
  Complete: "green",
  Incomplete: "red",
  "In Progress": "amber",
};

export default function ClassesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const rolePrefix = location.pathname.split("/")[1];
  const classes = useAppStore((s) => s.classes);
  const addClass = useAppStore((s) => s.addClass);
  const updateClass = useAppStore((s) => s.updateClass);
  const academicYears = useAppStore((s) => s.academicYears);
  const teachers = useAppStore((s) => s.teachers);
  const rooms = useAppStore((s) => s.rooms);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form, setForm] = useState({
    grade: "Grade 1",
    section: "D",
    students: 30,
    academic_year_id: academicYears[0]?.id || "",
    class_teacher_id: "",
    room_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const filtered = useMemo(
    () =>
      classes.filter((c) =>
        `${c.grade} ${c.section}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [classes, query],
  );
  const completeCount = classes.filter((c) => c.status === "Complete").length;

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        academic_year_id: form.academic_year_id,
        grade: form.grade,
        section: form.section,
        student_count: Number(form.students),
        class_teacher_id: form.class_teacher_id || null,
        room_id: form.room_id || null,
      };
      if (editingClass) await updateClass(editingClass.id, payload);
      else await addClass(payload);
      setAddOpen(false);
      setEditingClass(null);
      setForm({
        grade: "Grade 1",
        section: "D",
        students: 30,
        academic_year_id: academicYears[0]?.id || "",
        class_teacher_id: "",
        room_id: "",
      });
    } catch (error) {
      setFormError(
        error.errors
          ? Object.values(error.errors).flat().join(" ")
          : error.message || "Could not save this class. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle={`${classes.length} classes · ${completeCount} timetables complete`}
        actions={
          <Button icon={Plus} onClick={() => setAddOpen(true)}>
            Add Class
          </Button>
        }
      />

      <Card className="mb-4 !p-3" padded={false}>
        <div className="flex items-center gap-2 bg-cream-dark rounded-lg px-3 py-2 m-3">
          <Search size={15} className="text-ink-900/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classes..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-ink-900/40"
          />
        </div>
      </Card>

      <Card padded={false} className="overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No classes found"
            description="Try a different search term."
          />
        ) : (
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-900/45 border-b border-black/[0.06]">
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Students</th>
                <th className="px-5 py-3">Class Teacher</th>
                <th className="px-5 py-3">Room</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-black/[0.04] last:border-0 hover:bg-cream/50"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-forest/10 text-forest flex items-center justify-center text-xs font-semibold shrink-0">
                        {c.id}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-ink-900">
                          {c.grade}
                        </div>
                        <div className="text-xs text-ink-900/40">
                          Section {c.section}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-ink-900/70">
                    {c.student_count ?? c.students ?? "-"}
                  </td>
                  <td className="px-5 py-3 text-sm text-ink-900/70">
                    {c.class_teacher?.name ||
                      c.classTeacher?.name ||
                      c.classTeacher ||
                      "-"}
                  </td>
                  <td className="px-5 py-3 text-sm text-ink-900/70">
                    {c.room?.name || c.room || "-"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingClass(c);
                        setForm({
                          grade: c.grade,
                          section: c.section,
                          students: c.student_count ?? c.students ?? 0,
                          academic_year_id:
                            c.academic_year_id || c.academicYear?.id || "",
                          class_teacher_id:
                            c.class_teacher_id || c.classTeacher?.id || "",
                          room_id: c.room_id || c.room?.id || "",
                        });
                        setFormError("");
                        setAddOpen(true);
                      }}
                      className="text-ink-900/40 hover:text-forest p-1.5"
                      title="Edit class"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/${rolePrefix}/timetable`)}
                      className="text-ink-900/40 hover:text-forest p-1.5"
                      title="View timetable"
                    >
                      <CalendarDays size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditingClass(null);
          setFormError("");
        }}
        title={editingClass ? "Edit Class" : "Add Class"}
        subtitle={
          editingClass ? "Update class details" : "Create a new class section"
        }
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Grade">
              <Select
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              >
                {Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`).map(
                  (g) => (
                    <option key={g}>{g}</option>
                  ),
                )}
              </Select>
            </Field>
            <Field label="Section">
              <Input
                value={form.section}
                onChange={(e) =>
                  setForm({ ...form, section: e.target.value.toUpperCase() })
                }
                maxLength={1}
              />
            </Field>
          </div>
          <Field label="Number of students">
            <Input
              type="number"
              value={form.students}
              onChange={(e) => setForm({ ...form, students: e.target.value })}
            />
          </Field>
          <Field label="Academic year">
            <Select
              required
              value={form.academic_year_id}
              onChange={(e) =>
                setForm({ ...form, academic_year_id: e.target.value })
              }
            >
              <option value="">Select an academic year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Class teacher">
            <Select
              value={form.class_teacher_id}
              onChange={(e) =>
                setForm({ ...form, class_teacher_id: e.target.value })
              }
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Home room">
            <Select
              value={form.room_id}
              onChange={(e) => setForm({ ...form, room_id: e.target.value })}
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Select>
          </Field>
          {formError && (
            <p className="text-sm text-clash-red bg-clash-red/5 border border-clash-red/20 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setAddOpen(false);
                setFormError("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingClass ? "Save Class" : "Add Class"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
