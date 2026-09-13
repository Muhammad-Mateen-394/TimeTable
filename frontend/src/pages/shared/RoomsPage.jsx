import { Building2, Plus, Pencil } from "lucide-react";
import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Card, Badge } from "../../components/common/Card";
import { Field, Input, Select } from "../../components/common/FormControls";
import { Modal } from "../../components/common/Drawer";
import { useAppStore } from "../../store/useAppStore";

export default function RoomsPage() {
  const rooms = useAppStore((s) => s.rooms);
  const createRoom = useAppStore((s) => s.createRoom);
  const updateRoom = useAppStore((s) => s.updateRoom);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "classroom",
    capacity: 30,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  return (
    <div>
      <PageHeader
        title="Rooms & Labs"
        subtitle={`${rooms.length} spaces across campus`}
        actions={
          <Button icon={Plus} onClick={() => setAddOpen(true)}>
            Add Room
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((r) => (
          <Card key={r.id}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-forest/10 text-forest flex items-center justify-center shrink-0">
                  <Building2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium text-ink-900">
                    {r.name}
                  </div>
                  <div className="text-xs text-ink-900/45">{r.type}</div>
                </div>
              </div>
              <button
                className="text-ink-900/40 hover:text-forest"
                onClick={() => {
                  setEditing(r);
                  setForm({
                    name: r.name,
                    code: r.code,
                    type: r.type || "classroom",
                    capacity: r.capacity || 1,
                  });
                  setFormError("");
                  setAddOpen(true);
                }}
              >
                <Pencil size={15} />
              </button>
            </div>
            <div className="text-xs text-ink-900/45 mb-1">
              Capacity: {r.capacity} students
            </div>
            <div className="flex items-center justify-between text-xs text-ink-900/45 mb-1">
              <span>Utilization</span>
              <span>{r.utilization}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full ${r.utilization > 80 ? "bg-clash-red" : r.utilization > 50 ? "bg-forest" : "bg-clash-amber"}`}
                style={{ width: `${r.utilization}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditing(null);
          setFormError("");
        }}
        title={editing ? "Edit Room" : "Add Room"}
        subtitle="Create or update a room or lab"
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setFormError("");
            try {
              const payload = { ...form, capacity: Number(form.capacity) };
              if (editing) await updateRoom(editing.id, payload);
              else await createRoom(payload);
              setForm({ name: "", code: "", type: "classroom", capacity: 30 });
              setEditing(null);
              setAddOpen(false);
            } catch (error) {
              setFormError(
                error.errors
                  ? Object.values(error.errors).flat().join(" ")
                  : error.message ||
                      "Could not save this room. Please try again.",
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          <Field label="Room name">
            <Input
              required
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </Field>
          <Field label="Code">
            <Input
              required
              value={form.code}
              onChange={(event) =>
                setForm({ ...form, code: event.target.value.toUpperCase() })
              }
            />
          </Field>
          <Field label="Type">
            <Select
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value })
              }
            >
              <option value="classroom">Classroom</option>
              <option value="lab">Laboratory</option>
              <option value="library">Library</option>
            </Select>
          </Field>
          <Field label="Capacity">
            <Input
              required
              type="number"
              min="1"
              value={form.capacity}
              onChange={(event) =>
                setForm({ ...form, capacity: event.target.value })
              }
            />
          </Field>
          {formError && (
            <p className="text-sm text-clash-red bg-clash-red/5 border border-clash-red/20 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save Room" : "Add Room"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
