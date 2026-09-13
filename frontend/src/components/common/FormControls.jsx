export function Field({ label, children, hint, error }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-ink-900/60 mb-1.5">{label}</span>}
      {children}
      {hint && !error && <span className="block text-xs text-ink-900/40 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-clash-red mt-1">{error}</span>}
    </label>
  );
}

export function Input({ className = "", error, ...props }) {
  return (
    <input
      className={`w-full rounded-lg border ${error ? "border-clash-red/50" : "border-black/10"} bg-white px-3 py-2 text-sm
        outline-none focus:border-forest focus:ring-1 focus:ring-forest/30 placeholder:text-ink-900/35 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none
        focus:border-forest focus:ring-1 focus:ring-forest/30 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none
        focus:border-forest focus:ring-1 focus:ring-forest/30 placeholder:text-ink-900/35 ${className}`}
      {...props}
    />
  );
}
