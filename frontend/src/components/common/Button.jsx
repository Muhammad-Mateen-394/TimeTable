const VARIANTS = {
  primary: "bg-forest text-white hover:bg-forest-dark disabled:bg-forest/40",
  secondary: "bg-white text-ink-900 border border-black/10 hover:bg-cream-dark disabled:opacity-50",
  ghost: "text-ink-900/70 hover:bg-black/[0.04] disabled:opacity-40",
  danger: "bg-clash-red text-white hover:bg-red-700 disabled:bg-clash-red/40",
  outlineDanger: "bg-white text-clash-red border border-clash-red/30 hover:bg-red-50",
};

const SIZES = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-sm px-3.5 py-2 gap-2",
  lg: "text-sm px-5 py-2.5 gap-2",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors
        focus-ring disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}
