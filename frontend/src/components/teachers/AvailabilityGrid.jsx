import { DAYS_SHORT, TEACHING_PERIODS } from "../../data/constants";

const STATE_STYLES = {
  available: "bg-clash-green/10 text-clash-green border-clash-green/30",
  preferred: "bg-forest/10 text-forest border-forest/30",
  unavailable: "bg-clash-red/10 text-clash-red border-clash-red/30",
};

const CYCLE = ["available", "preferred", "unavailable"];

export default function AvailabilityGrid({ value = {}, onChange, editable = false }) {
  const handleClick = (day, periodId) => {
    if (!editable) return;
    const key = `${day}-${periodId}`;
    const current = value[key] || "available";
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
    onChange?.({ ...value, [key]: next });
  };

  return (
    <div>
      <div className="grid grid-cols-[60px_repeat(6,1fr)] gap-1.5 mb-2">
        <div />
        {DAYS_SHORT.map((d) => (
          <div key={d} className="text-xs text-center text-ink-900/50 font-medium">{d}</div>
        ))}
      </div>
      {TEACHING_PERIODS.map((p) => (
        <div key={p.id} className="grid grid-cols-[60px_repeat(6,1fr)] gap-1.5 mb-1.5">
          <div className="text-xs text-ink-900/45 flex items-center">{p.label.replace("Period ", "P")}</div>
          {DAYS_SHORT.map((d) => {
            const key = `${d}-${p.id}`;
            const state = value[key] || "available";
            return (
              <button
                key={key}
                onClick={() => handleClick(d, p.id)}
                className={`h-7 rounded-md border text-[10px] flex items-center justify-center transition-colors ${STATE_STYLES[state]} ${editable ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                title={state}
              />
            );
          })}
        </div>
      ))}
      <div className="flex gap-4 mt-3 text-xs text-ink-900/50">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-clash-green/40 border border-clash-green/40" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-forest/40 border border-forest/40" /> Preferred</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-clash-red/40 border border-clash-red/40" /> Unavailable</span>
      </div>
    </div>
  );
}
