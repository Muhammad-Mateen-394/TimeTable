import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Card } from "../common/Card";

const ICONS = { success: CheckCircle2, warning: AlertTriangle, info: Info };
const COLORS = { success: "text-clash-green", warning: "text-clash-amber", info: "text-clash-blue" };

export default function ActivityFeed({ items, title = "Recent Activity" }) {
  return (
    <Card>
      <h3 className="font-serif text-lg text-ink-950 mb-3">{title}</h3>
      <ul className="space-y-3">
        {items.slice(0, 6).map((n) => {
          const Icon = ICONS[n.type] || Info;
          return (
            <li key={n.id} className="flex gap-3">
              <Icon size={16} className={`${COLORS[n.type]} shrink-0 mt-0.5`} />
              <div className="min-w-0">
                <p className="text-sm text-ink-900">{n.title}</p>
                <p className="text-xs text-ink-900/45 mt-0.5">{n.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
