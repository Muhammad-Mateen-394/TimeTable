import { useState } from "react";
import { CheckCheck, CheckCircle2, AlertTriangle, Info, Trash2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Card, EmptyState } from "../../components/common/Card";
import { useAppStore } from "../../store/useAppStore";

const ICONS = { success: CheckCircle2, warning: AlertTriangle, info: Info };
const COLORS = { success: "text-clash-green", warning: "text-clash-amber", info: "text-clash-blue" };

export default function NotificationsPage() {
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);
  const remove = useAppStore((s) => s.deleteNotification);
    const [tab, setTab] = useState("all");
  const [actionError, setActionError] = useState("");

  const handleMarkRead = async (n) => {
    if (n.read) return;
    try {
      await markRead(n.id);
    } catch (error) {
      setActionError(error.message || "Could not update that notification. Please try again.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch (error) {
      setActionError(error.message || "Could not mark notifications as read. Please try again.");
    }
  };

  const handleRemove = async (id) => {
    try {
      await remove(id);
    } catch (error) {
      setActionError(error.message || "Could not delete that notification. Please try again.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const list = tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
                actions={
          <Button variant="secondary" icon={CheckCheck} onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
        }
      />

      {actionError && (
        <p className="text-sm text-clash-red bg-clash-red/5 border border-clash-red/20 rounded-lg px-3 py-2 mb-4">{actionError}</p>
      )}

      <div className="flex bg-cream-dark rounded-lg p-1 gap-1 mb-4 w-fit">
        {["all", "unread"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-md text-sm capitalize transition-colors ${
              tab === t ? "bg-white shadow-card text-ink-900 font-medium" : "text-ink-900/50 hover:text-ink-900"
            }`}
          >
            {t} {t === "unread" && unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card><EmptyState icon={CheckCheck} title="You're all caught up" description="No notifications to show here." /></Card>
      ) : (
        <div className="space-y-2.5">
          {list.map((n) => {
            const Icon = ICONS[n.type] || Info;
            return (
              <Card
                key={n.id}
                className={`flex items-start gap-3 !p-4 cursor-pointer ${!n.read ? "border-l-2 !border-l-forest" : ""}`}
                                onClick={() => handleMarkRead(n)}
              >
                <Icon size={18} className={`${COLORS[n.type]} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink-900">{n.title}</span>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-forest" />}
                  </div>
                  <p className="text-sm text-ink-900/55 mt-0.5">{n.message}</p>
                  {n.data?.actor && <p className="text-xs text-ink-900/45 mt-1">Changed by: {n.data.actor}</p>}
                  <p className="text-xs text-ink-900/35 mt-1">{n.time}</p>
                </div>
                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemove(n.id); }}
                  className="text-ink-900/30 hover:text-clash-red p-1"
                >
                  <Trash2 size={15} />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
