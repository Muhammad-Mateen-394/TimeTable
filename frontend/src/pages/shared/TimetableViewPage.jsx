import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenSquare, Zap, Printer, Download, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Select } from "../../components/common/FormControls";
import TimetableGrid from "../../components/timetable/TimetableGrid";
import { Badge, Card } from "../../components/common/Card";
import { useAppStore } from "../../store/useAppStore";
import { useAuthStore } from "../../store/useAuthStore";
import { getTeacherSchedule } from "../../utils/getTeacherSchedule";
import { getRoomSchedule } from "../../utils/getRoomSchedule";

export default function TimetableViewPage({ role }) {
  const navigate = useNavigate();
  const timetables = useAppStore((s) => s.timetables);
  const allConflicts = useAppStore((s) => s.conflicts);
  const classes = useAppStore((s) => s.classes);
  const school = useAuthStore((s) => s.user?.school);
  const teachers = useAppStore((s) => s.teachers);
  const rooms = useAppStore((s) => s.rooms);

  const [mode, setMode] = useState("class");
  const [classId, setClassId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [roomName, setRoomName] = useState("");
  const conflicts = allConflicts.filter((c) => c.status === "Open");

  const classConflictCount = useMemo(
    () => conflicts.filter((c) => c.classId === classId).length,
    [conflicts, classId]
  );

  const canEdit = role === "manager";

  useEffect(() => {
    if (classes.length && !classes.some((item) => String(item.id) === String(classId))) setClassId(String(classes[0].id));
  }, [classes, classId]);

  const grid = mode === "teacher" ? getTeacherSchedule(timetables, teacherId) : mode === "room" ? getRoomSchedule(timetables, roomName) : null;

  return (
    <div>
      <PageHeader
        title="Timetable"
        subtitle={school?.name || "Timetable"}
        actions={
          <>
            {canEdit && (
              <Button variant="secondary" icon={PenSquare} onClick={() => navigate("/manager/editor")}>
                Edit
              </Button>
            )}
            {canEdit && (
              <Button icon={Zap} onClick={() => navigate("/manager/generate")}>
                Auto-Generate
              </Button>
            )}
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="secondary" icon={Download}>
              Export
            </Button>
          </>
        }
      />

      <Card className="mb-4 !p-3" padded={false}>
        <div className="flex flex-wrap items-center gap-2 p-3">
          <div className="flex bg-cream-dark rounded-lg p-1 gap-1 mr-2">
            {["class", "teacher", "room"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                  mode === m ? "bg-white shadow-card text-ink-900 font-medium" : "text-ink-900/50 hover:text-ink-900"
                }`}
              >
                {m} view
              </button>
            ))}
          </div>

          {mode === "class" && (
            <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-48">
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.grade} - Section {c.section}</option>
              ))}
            </Select>
          )}
          {mode === "teacher" && (
            <Select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-56">
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          )}
          {mode === "room" && (
            <Select value={roomName} onChange={(e) => setRoomName(e.target.value)} className="w-56">
              {rooms.map((r) => (
                <option key={r.id} value={r.name}>{r.name} · {r.type}</option>
              ))}
            </Select>
          )}

          {mode === "class" && classConflictCount > 0 && (
            <Badge tone="red" className="ml-auto">
              <AlertTriangle size={11} /> {classConflictCount} conflict{classConflictCount > 1 ? "s" : ""} in this timetable
            </Badge>
          )}
        </div>
      </Card>

      {mode === "class" && <TimetableGrid classId={classId} editable={false} />}
      {mode === "teacher" && <TimetableGrid grid={grid} editable={false} showClass />}
      {mode === "room" && <TimetableGrid grid={grid} editable={false} showClass />}
    </div>
  );
}
