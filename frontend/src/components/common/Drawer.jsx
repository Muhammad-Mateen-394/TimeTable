import { X } from "lucide-react";

export function Drawer({ open, onClose, title, subtitle, children, width = "max-w-md" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${width} bg-cream h-full shadow-pop flex flex-col animate-[slideIn_0.2s_ease-out]`}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-black/[0.06] bg-white">
          <div>
            <h2 className="font-serif text-xl text-ink-950">{title}</h2>
            {subtitle && <p className="text-sm text-ink-900/50 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-ink-900/40 hover:text-ink-900 p-1 focus-ring rounded">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, subtitle, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${width} bg-white rounded-xl shadow-pop max-h-[90vh] flex flex-col`}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-black/[0.06]">
          <div>
            <h2 className="font-serif text-xl text-ink-950">{title}</h2>
            {subtitle && <p className="text-sm text-ink-900/50 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-ink-900/40 hover:text-ink-900 p-1 focus-ring rounded">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
