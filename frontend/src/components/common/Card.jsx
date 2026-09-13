export function Card({ children, className = "", padded = true, ...rest }) {
  return (
    <div className={`bg-white rounded-xl border border-black/[0.06] shadow-card ${padded ? "p-5" : ""} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint, tone = "default" }) {
  const tones = {
    default: "text-ink-900 bg-forest/10",
    danger: "text-clash-red bg-clash-red/10",
    warning: "text-clash-amber bg-clash-amber/10",
    success: "text-clash-green bg-clash-green/10",
  };
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-ink-900/45">{label}</span>
        {Icon && (
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="text-3xl font-serif text-ink-950">{value}</div>
      {hint && <div className="text-xs text-ink-900/45">{hint}</div>}
    </Card>
  );
}

export function Badge({ children, tone = "default", className = "" }) {
  const tones = {
    default: "bg-black/[0.05] text-ink-900/70 border-black/10",
    green: "bg-clash-green/10 text-clash-green border-clash-green/20",
    red: "bg-clash-red/10 text-clash-red border-clash-red/20",
    amber: "bg-clash-amber/10 text-clash-amber border-clash-amber/20",
    blue: "bg-clash-blue/10 text-clash-blue border-clash-blue/20",
    mint: "bg-mint/15 text-forest-dark border-mint/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mb-4">
          <Icon size={22} />
        </div>
      )}
      <div className="font-medium text-ink-900">{title}</div>
      {description && <p className="text-sm text-ink-900/50 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
