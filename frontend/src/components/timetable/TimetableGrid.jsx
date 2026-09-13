import { AlertTriangle, Plus } from "lucide-react";
import { DAYS, PERIOD_SLOTS, SUBJECT_COLORS } from "../../data/constants";
import { useAppStore } from "../../store/useAppStore";

const DEFAULT_COLOR = { bg: "#f3f3ee", border: "#e0ddd0", text: "#5a5646" };

export default function TimetableGrid({ classId, editable = false, onCellClick, activeDays = DAYS, grid: gridOverride, showClass = false, slots = PERIOD_SLOTS }) {
  const timetables = useAppStore((s) => s.timetables);
  const grid = gridOverride || timetables[classId] || {};

  return (
    <div className="overflow-x-auto rounded-xl border border-black/[0.07] bg-white">
      <table className="w-full border-collapse min-w-[860px]">
        <thead>
          <tr className="bg-cream-dark/60">
            <th className="text-left text-xs font-medium text-ink-900/50 uppercase tracking-wide px-3 py-3 w-32 sticky left-0 bg-cream-dark/60 z-10">
              Period
            </th>
            {activeDays.map((day) => (
              <th key={day} className="text-left text-xs font-medium text-ink-900/50 uppercase tracking-wide px-3 py-3 min-w-[130px]">
                {day.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => {
            if (slot.type !== "period") {
              return (
                <tr key={slot.id} className="bg-cream/70">
                  <td className="px-3 py-2 text-xs text-ink-900/40 sticky left-0 bg-cream/70 whitespace-nowrap">
                    {slot.time}
                    <div className="text-[11px]">{slot.label}</div>
                  </td>
                  <td colSpan={activeDays.length} className="px-3 py-2 text-center text-[11px] text-ink-900/30 tracking-wide">
                    — {slot.label} —
                  </td>
                </tr>
              );
            }

            return (
              <tr key={slot.id} className="border-t border-black/[0.05]">
                <td className="px-3 py-3 text-xs text-ink-900/60 sticky left-0 bg-white whitespace-nowrap align-top">
                  <div className="font-medium text-ink-900/80">{slot.label}</div>
                  <div className="text-ink-900/40">{slot.time}</div>
                </td>
                {activeDays.map((day) => {
                  const entry = grid[day]?.[slot.id];
                  const saturdayLimited = day === "Saturday" && !entry;
                  const color = entry ? SUBJECT_COLORS[entry.subject] || DEFAULT_COLOR : null;

                  return (
                    <td key={day} className="px-1.5 py-1.5 align-top">
                      {entry ? (
                        <button
                          disabled={!editable}
                          onClick={() => onCellClick?.(day, slot.id, entry)}
                          style={{ background: color.bg, borderColor: entry.conflict ? "#dc4c4c" : color.border }}
                          className={`w-full text-left rounded-lg border px-2.5 py-2 transition-transform
                            ${editable ? "hover:scale-[1.02] hover:shadow-sm cursor-pointer" : "cursor-default"}
                            ${entry.conflict ? "ring-1 ring-clash-red/50" : ""}`}
                        >
                          <div className="text-[12.5px] font-semibold flex items-center gap-1" style={{ color: color.text }}>
                            {entry.subject}
                          </div>
                          <div className="text-[11px] text-ink-900/60 mt-0.5">{showClass ? entry.classId : entry.teacherName}</div>
                          <div className="text-[11px] text-ink-900/40">{entry.room}</div>
                          {entry.conflict && (
                            <div className="flex items-center gap-1 text-[10px] text-clash-red mt-1 font-medium">
                              <AlertTriangle size={10} /> Conflict
                            </div>
                          )}
                        </button>
                      ) : saturdayLimited ? (
                        <div className="w-full h-full min-h-[64px] flex items-center justify-center text-ink-900/20 text-xs">—</div>
                      ) : editable ? (
                        <button
                          onClick={() => onCellClick?.(day, slot.id, null)}
                          className="w-full min-h-[64px] rounded-lg border border-dashed border-black/10 text-ink-900/30 hover:text-forest hover:border-forest/40 flex items-center justify-center gap-1 text-xs"
                        >
                          <Plus size={13} /> Add
                        </button>
                      ) : (
                        <div className="w-full min-h-[64px] flex items-center justify-center text-ink-900/20 text-xs">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
