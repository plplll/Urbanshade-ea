import { useState, useEffect } from "react";
import { 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  BellOff, 
  Bell,
  Cloud,
  CloudOff,
  Loader2,
  Settings,
  Palette,
  X
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAutoSync } from "@/hooks/useAutoSync";
import { Button } from "@/components/ui/button";

interface QuickSettingsFlyoutProps {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const QuickSettingsFlyout = ({ open, onClose, onOpenSettings }: QuickSettingsFlyoutProps) => {
  const [brightness, setBrightness] = useState(() => {
    return parseInt(localStorage.getItem("settings_brightness") || "100");
  });
  const [nightLight, setNightLight] = useState(() => {
    return localStorage.getItem("settings_night_light") === "true";
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("settings_sound_enabled") !== "false";
  });
  const [doNotDisturb, setDoNotDisturb] = useState(() => {
    return localStorage.getItem("settings_dnd") === "true";
  });
  const [wifiEnabled, setWifiEnabled] = useState(true);

  const { isEnabled: syncEnabled, isSyncing, lastSyncTime, manualSync } = useAutoSync();

  useEffect(() => {
    localStorage.setItem("settings_brightness", brightness.toString());
    document.documentElement.style.filter = `brightness(${brightness / 100})`;
  }, [brightness]);

  useEffect(() => {
    localStorage.setItem("settings_night_light", nightLight.toString());
    if (nightLight) {
      document.documentElement.style.filter = `brightness(${brightness / 100}) sepia(0.3)`;
    } else {
      document.documentElement.style.filter = `brightness(${brightness / 100})`;
    }
  }, [nightLight, brightness]);

  useEffect(() => {
    localStorage.setItem("settings_sound_enabled", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("settings_dnd", doNotDisturb.toString());
  }, [doNotDisturb]);

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  if (!open) return null;

  const QuickToggle = ({ 
    active, 
    onClick, 
    icon: Icon, 
    activeIcon: ActiveIcon,
    label 
  }: { 
    active: boolean; 
    onClick: () => void; 
    icon: React.ElementType;
    activeIcon?: React.ElementType;
    label: string;
  }) => {
    const DisplayIcon = active && ActiveIcon ? ActiveIcon : Icon;
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${
          active 
            ? "bg-primary/20 text-primary border border-primary/30" 
            : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
        }`}
      >
        <DisplayIcon className="w-5 h-5" />
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div 
      className="fixed right-3 bottom-[78px] w-80 rounded-xl backdrop-blur-2xl bg-background/95 border border-border/50 z-[900] shadow-2xl overflow-hidden animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <h3 className="font-bold text-sm">Quick Settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="w-7 h-7">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Toggles Grid */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <QuickToggle
          active={wifiEnabled}
          onClick={() => setWifiEnabled(!wifiEnabled)}
          icon={WifiOff}
          activeIcon={Wifi}
          label="Wi-Fi"
        />
        <QuickToggle
          active={soundEnabled}
          onClick={() => setSoundEnabled(!soundEnabled)}
          icon={VolumeX}
          activeIcon={Volume2}
          label="Sound"
        />
        <QuickToggle
          active={doNotDisturb}
          onClick={() => setDoNotDisturb(!doNotDisturb)}
          icon={Bell}
          activeIcon={BellOff}
          label="DND"
        />
        <QuickToggle
          active={nightLight}
          onClick={() => setNightLight(!nightLight)}
          icon={Sun}
          activeIcon={Moon}
          label="Night Light"
        />
        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent transition-all"
        >
          <Palette className="w-5 h-5" />
          <span className="text-[10px] font-medium">Themes</span>
        </button>
        <button
          onClick={() => {
            onOpenSettings();
            onClose();
          }}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>

      {/* Brightness Slider */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
          <Sun className="w-4 h-4 text-muted-foreground shrink-0" />
          <Slider
            value={[brightness]}
            onValueChange={([val]) => setBrightness(val)}
            min={30}
            max={100}
            step={5}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8 text-right">{brightness}%</span>
        </div>
      </div>

      {/* Sync Status */}
      {syncEnabled && (
        <div className="px-4 pb-4">
          <button
            onClick={() => manualSync()}
            disabled={isSyncing}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              {isSyncing ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <Cloud className="w-4 h-4 text-blue-400" />
              )}
              <div className="text-left">
                <p className="text-xs font-medium text-foreground">
                  {isSyncing ? "Syncing..." : "Cloud Sync"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Last: {formatLastSync(lastSyncTime)}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-blue-400 font-medium">
              {isSyncing ? "" : "Sync Now"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
