import { useEffect, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Drawer } from "../common/Drawer";
import { Field, Select } from "../common/FormControls";
import Button from "../common/Button";
import { useAppStore } from "../../store/useAppStore";

const LAB_ROOMS = {
  Physics: "Physics Lab",
  Chemistry: "Chemistry Lab",
  Biology: "Biology Lab",
  "Computer Science": "Computer Lab",
};

export default function CellEditorDrawer({ open, onClose, classId, classes = [], onClassChange, day, periodId, periodLabel, entry, onSave, onClear }) {
  const timetables = useAppStore((s) => s.timetables);
  const subjects = useAppStore((s) => s.subjects);
  const teachers = useAppStore((s) => s.teachers);
  const rooms = useAppStore((s) => s.rooms);
  const [subject, setSubject] = useState(entry?.subject || "");
  const [teacherId, setTeacherId] = useState(entry?.teacherId || "");
  const [room, setRoom] = useState(entry?.room || "");

  useEffect(() => {
    if (open) {
      const nextSubject = entry?.subject || subjects[0]?.name || "";
      setSubject(nextSubject);
      setTeacherId(entry?.teacherId || teachers.find((t) => t.specialization === nextSubject)?.id || teachers[0]?.id || "");
      setRoom(entry?.room || LAB_ROOMS[entry?.subject] || "");
    }
  }, [open, entry, subjects, teachers]);

  const eligibleTeachers = teachers.filter((t) => !t.specialization || t.specialization === subject);
  const teacher = teachers.find((t) => String(t.id) === String(teacherId));

  // Mock clash check: does this teacher already teach another class at this day/period?
  const clash = Object.entries(timetables).find(([cId, grid]) => {
    if (cId === classId) return false;
    const other = grid[day]?.[periodId];
    return other && other.teacherId === teacherId;
  });

  const handleSave = () => {
    const finalRoom = room || LAB_ROOMS[subject] || "Room —";
    onSave({
      subject,
      teacherId,
      teacherName: teacher?.name.replace(/^Mr\.|^Ms\./, "").trim(),
      room: finalRoom,
      conflict: !!clash,
      conflictReason: clash ? `${teacher?.name} is already teaching Grade ${clash[0]} at this time.` : undefined,
    });
  };

  return (
    <Drawer open={open} onClose={onClose} title="Edit time slot" subtitle={`Grade ${classId} · ${day} · ${periodLabel}`}>
      <div className="space-y-4">
        <Field label="Subject">
          <Select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setRoom(LAB_ROOMS[e.target.value] || "");
              const t = teachers.find((tt) => tt.specialization === e.target.value);
              setTeacherId(t ? String(t.id) : "");
            }}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Teacher">
          <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
            {eligibleTeachers.length === 0 && <option value="">No teacher assigned to this subject</option>}
            {eligibleTeachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Class">
          <Select value={String(classId)} onChange={(event) => onClassChange?.(event.target.value)}>
            {classes.map((item) => (
              <option key={item.id} value={String(item.id)}>Grade {item.grade} - Section {item.section}</option>
            ))}
          </Select>
        </Field>

        <Field label="Room">
          <Select value={room} onChange={(e) => setRoom(e.target.value)}>
            <option value="">Select a room</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.name}>{r.name} · {r.type}</option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Day"><Select disabled value={day}><option>{day}</option></Select></Field>
          <Field label="Period"><Select disabled value={periodId}><option>{periodLabel}</option></Select></Field>
        </div>

        {clash && (
          <div className="flex gap-2 bg-clash-red/5 border border-clash-red/25 rounded-lg px-3 py-2.5">
            <AlertTriangle size={16} className="text-clash-red shrink-0 mt-0.5" />
            <div className="text-xs text-clash-red leading-relaxed">
              <span className="font-semibold">Teacher Clash — </span>
              {teacher?.name} is already teaching Grade {clash[0]} on {day} at {periodLabel}. Saving will flag this slot as a conflict.
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {entry && (
            <Button variant="outlineDanger" size="sm" icon={Trash2} onClick={onClear}>
              Remove
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!teacherId}>Save changes</Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
