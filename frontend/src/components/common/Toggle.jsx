export default function Toggle({ checked, onChange, tone = "green", disabled = false }) {
  const on = tone === "amber" ? "bg-clash-amber" : tone === "red" ? "bg-clash-red" : "bg-forest";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative w-10 h-5.5 h-[22px] rounded-full transition-colors focus-ring shrink-0
        ${checked ? on : "bg-black/15"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform
          ${checked ? "translate-x-[18px]" : "translate-x-0"}`}
      />
    </button>
  );
}
