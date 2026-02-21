import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Trash2, X, TrendingUp, ShoppingCart, Radio, Award, Settings } from "lucide-react";
import { useNotificationStore, type AppNotification, type NotificationType } from "../../store/notificationStore";
import { useNavigate } from "react-router-dom";

const ICON_MAP: Record<NotificationType, React.ReactNode> = {
  trade: <ShoppingCart className="w-4 h-4" />,
  price_alert: <TrendingUp className="w-4 h-4" />,
  market: <Radio className="w-4 h-4" />,
  system: <Settings className="w-4 h-4" />,
  achievement: <Award className="w-4 h-4" />,
};

const COLOR_MAP: Record<NotificationType, string> = {
  trade: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
  price_alert: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
  market: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
  system: "bg-slate-100 text-slate-600 dark:bg-slate-700",
  achievement: "bg-purple-50 text-purple-600 dark:bg-purple-900/20",
};

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const NotificationBell = () => {
  const { unreadCount } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && <NotificationPanel onClose={() => setOpen(false)} />}
    </div>
  );
};

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const { notifications, markRead, markAllRead, clearAll, removeNotification } = useNotificationStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const handleClick = (n: AppNotification) => {
    markRead(n.id);
    if (n.actionUrl) {
      navigate(n.actionUrl);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-slide-down">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={markAllRead}
            className="p-1.5 rounded-lg text-slate-400 hover:text-mero-teal hover:bg-mero-teal/5 transition-colors"
            title="Mark all read"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
          <button
            onClick={clearAll}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors sm:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 px-4 pt-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              filter === f
                ? "bg-mero-teal/10 text-mero-teal"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            {f === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No notifications yet</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${
                !n.read ? "bg-mero-teal/[0.03]" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${COLOR_MAP[n.type]}`}>
                {ICON_MAP[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs font-semibold truncate ${
                    !n.read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                  }`}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-mero-teal" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                      className="p-0.5 text-slate-300 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">{timeAgo(n.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
