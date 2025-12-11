import { useState, useEffect } from "react";
import { Bell, Volume2, VolumeX, Power, Cloud, CloudOff, Loader2, BellOff, WifiOff } from "lucide-react";
import { App } from "./Desktop";
import { NotificationCenter } from "./NotificationCenter";
import { ShutdownOptionsDialog } from "./ShutdownOptionsDialog";
import { QuickSettingsFlyout } from "./QuickSettingsFlyout";
import { useNotifications } from "@/hooks/useNotifications";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useDoNotDisturb } from "@/hooks/useDoNotDisturb";
import { useSyncHistory } from "@/hooks/useSyncHistory";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WindowData {
  id: string;
  app: App;
  zIndex: number;
  minimized?: boolean;
}

interface TaskbarProps {
  onStartClick: () => void;
  pinnedApps: App[];
  onPinnedClick: (app: App) => void;
  windows?: WindowData[];
  onRestoreWindow?: (id: string) => void;
  onShutdown?: () => void;
  onReboot?: () => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
}

export const Taskbar = ({ 
  onStartClick, 
  pinnedApps, 
  onPinnedClick, 
  windows = [], 
  onRestoreWindow,
  onShutdown,
  onReboot,
  onLogout,
  onOpenSettings
}: TaskbarProps) => {
  const [time, setTime] = useState(new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [powerMenuOpen, setPowerMenuOpen] = useState(false);
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { isDndEnabled } = useDoNotDisturb();
  const { pendingChanges, isOnline } = useSyncHistory();
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('settings_sound_enabled') !== 'false');
  
  // Auto-sync status
  const { isEnabled: syncEnabled, isSyncing, lastSyncTime, manualSync } = useAutoSync();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('settings_sound_enabled', String(newValue));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const openWindows = windows.filter(w => !w.minimized);
  const minimizedWindows = windows.filter(w => w.minimized);

  // Group windows by app type
  const groupedWindows = windows.reduce((acc, win) => {
    const key = win.app.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(win);
    return acc;
  }, {} as Record<string, typeof windows>);

  return (
    <>
      <div className="fixed left-0 right-0 bottom-0 h-[60px] flex justify-between items-center px-5 z-[800] bg-black/60 backdrop-blur-sm border-t border-white/5 animate-slide-in-right">
        <div className="flex items-center gap-3">
          <button
            onClick={onStartClick}
            data-start-button
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass-panel hover:bg-white/5 transition-all duration-200 hover-scale"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-b from-primary to-primary/20 flex items-center justify-center text-black font-extrabold text-lg">
              U
            </div>
            <div className="text-sm font-bold text-muted-foreground">Urbanshade</div>
          </button>

          <div className="flex gap-2">
            {pinnedApps.map(app => (
              <button
                key={app.id}
                onClick={() => onPinnedClick(app)}
                className="w-11 h-11 rounded-lg flex items-center justify-center text-primary hover:bg-white/5 transition-all duration-200 hover-scale"
                title={app.name}
              >
                <div className="w-6 h-6 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
                  {app.icon}
                </div>
              </button>
            ))}
          </div>

          {/* Grouped Windows */}
          {Object.keys(groupedWindows).length > 0 && (
            <div className="flex gap-2 ml-2 pl-2 border-l border-white/10">
              {Object.entries(groupedWindows).map(([appId, wins]) => {
                const firstWin = wins[0];
                const hasMinimized = wins.some(w => w.minimized);
                const hasOpen = wins.some(w => !w.minimized);
                
                return (
                  <TooltipProvider key={appId}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onRestoreWindow?.(firstWin.id)}
                          className={`relative w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200 hover-scale ${
                            hasOpen 
                              ? "text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30"
                              : "text-primary/60 hover:text-primary hover:bg-white/5"
                          }`}
                        >
                          <div className="w-6 h-6 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
                            {firstWin.app.icon}
                          </div>
                          {wins.length > 1 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                              {wins.length}
                            </span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs font-medium">{firstWin.app.name}</p>
                        {wins.length > 1 && (
                          <p className="text-xs text-muted-foreground">{wins.length} windows</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Offline / Pending Sync Indicator */}
          {syncEnabled && (!isOnline || pendingChanges.length > 0) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs">
                    {!isOnline ? (
                      <>
                        <WifiOff className="w-3 h-3" />
                        <span>Offline</span>
                      </>
                    ) : (
                      <>
                        <CloudOff className="w-3 h-3" />
                        <span>{pendingChanges.length} pending</span>
                      </>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {!isOnline 
                      ? "You're offline. Changes will sync when reconnected."
                      : `${pendingChanges.length} changes waiting to sync`
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Cloud Sync Indicator */}
          {syncEnabled && isOnline && pendingChanges.length === 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => manualSync()}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      isSyncing 
                        ? "text-blue-400 bg-blue-500/10" 
                        : "text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10"
                    }`}
                    title="Cloud sync"
                  >
                    {isSyncing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Cloud className="w-4 h-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {isSyncing ? "Syncing..." : `Last sync: ${formatLastSync(lastSyncTime)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Click to sync now</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-white/5 transition-all"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setQuickSettingsOpen(false);
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-white/5 transition-all relative"
            title="Notifications"
          >
            {isDndEnabled ? (
              <BellOff className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {unreadCount > 0 && !isDndEnabled && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Power Button */}
          <button
            onClick={() => setPowerMenuOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Power options"
          >
            <Power className="w-4 h-4" />
          </button>

          {/* Clock - Click to open Quick Settings */}
          <button
            onClick={() => {
              setQuickSettingsOpen(!quickSettingsOpen);
              setNotificationsOpen(false);
            }}
            className="flex flex-col items-end text-right hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all"
          >
            <div className="text-sm font-mono text-foreground">
              {formatTime(time)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {formatDate(time)}
            </div>
          </button>
        </div>

        {/* Notification Center */}
        <NotificationCenter open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        
        {/* Quick Settings Flyout */}
        <QuickSettingsFlyout 
          open={quickSettingsOpen} 
          onClose={() => setQuickSettingsOpen(false)}
          onOpenSettings={onOpenSettings || (() => {})}
        />
      </div>

      {/* Power Options Dialog */}
      {powerMenuOpen && onShutdown && onReboot && onLogout && (
        <ShutdownOptionsDialog
          onClose={() => setPowerMenuOpen(false)}
          onShutdown={onShutdown}
          onSignOut={onLogout}
          onLock={() => {
            onLogout();
          }}
          onRestart={onReboot}
        />
      )}
    </>
  );
};
