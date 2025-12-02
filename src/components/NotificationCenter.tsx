import { Bell, Check, Trash2, X, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { useNotifications, SystemNotification } from "@/hooks/useNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationCenter = ({ open, onClose }: NotificationCenterProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();

  const getIcon = (type: SystemNotification["type"]) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "error": return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (!open) return null;

  return (
    <div className="fixed right-3 bottom-[78px] w-96 h-[500px] rounded-xl backdrop-blur-2xl bg-background/95 border border-border/50 z-[900] shadow-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="border-b border-border/50 p-4 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {notifications.length > 0 && (
            <>
              <Button variant="ghost" size="icon" onClick={markAllAsRead} title="Mark all read">
                <Check className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={clearAll} title="Clear all">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[calc(100%-60px)]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bell className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                  notification.read 
                    ? "bg-muted/30 border-border/30" 
                    : "bg-primary/5 border-primary/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-semibold truncate ${!notification.read && "text-primary"}`}>
                        {notification.title}
                      </h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {formatTime(notification.time)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
