export default function PageHeader({ title, subtitle, actions, meta }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div>
        <h1 className="font-serif text-[28px] leading-tight text-ink-950">{title}</h1>
        {subtitle && <p className="text-sm text-ink-900/50 mt-1">{subtitle}</p>}
        {meta && <p className="text-sm text-ink-900/45 mt-1">{meta}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
