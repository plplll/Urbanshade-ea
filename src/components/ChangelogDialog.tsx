import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Check, Cloud, PartyPopper, Rocket, Zap, Shield, Settings, Monitor, Bell, Layout, Palette } from "lucide-react";

export const ChangelogDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("2.8");
  const currentVersion = "2.8";

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("urbanshade_last_seen_version");
    if (lastSeenVersion !== currentVersion) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("urbanshade_last_seen_version", currentVersion);
    setOpen(false);
  };

  const changelogs: Record<string, { icon: React.ReactNode; color: string; sections: Record<string, string[]> }> = {
    "2.8": {
      icon: <Rocket className="w-6 h-6" />,
      color: "from-cyan-500 to-blue-600",
      sections: {
        "Quality & Polish": [
          "Complete changelog redesign with modern UI",
          "Enhanced sync system with 2-minute intervals",
          "Do Not Disturb mode for notifications",
          "Quick Settings flyout from taskbar"
        ],
        "Window Management": [
          "Window snap zones - drag to edges for quick positioning",
          "Visual snap indicators when dragging",
          "Improved window controls and animations"
        ],
        "Desktop Enhancements": [
          "Enhanced right-click context menu with more options",
          "View options (Large/Medium/Small icons)",
          "Sort icons by name, type, or date",
          "Personalize and display settings shortcuts"
        ],
        "Start Menu": [
          "Recent files section showing last opened items",
          "Improved search functionality",
          "Better app grid layout"
        ],
        "Online Experience": [
          "Welcome notification for new users",
          "Offline indicator with pending sync count",
          "Device name tracking for synced settings",
          "Theme presets for quick customization"
        ]
      }
    },
    "2.7": {
      icon: <Cloud className="w-6 h-6" />,
      color: "from-blue-500 to-purple-600",
      sections: {
        "Quality of Life": [
          "Updated version numbers throughout the system to v2.7",
          "Start Menu now shows your actual username and role",
          "Cloud sync indicator in Start Menu when online",
          "Copyright year updated to 2025"
        ],
        "Online Accounts": [
          "UUR submissions now sync to Supabase cloud storage",
          "Better visual feedback for sync status",
          "Connected email displayed in Settings"
        ],
        "UUR Manager Redesign": [
          "Complete visual overhaul with advanced UI",
          "New sidebar navigation with category filters",
          "Enhanced package cards with detailed info",
          "Statistics dashboard showing package counts"
        ]
      }
    },
    "2.6": {
      icon: <Shield className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600",
      sections: {
        "Online Accounts": [
          "Full Supabase-powered online account system",
          "Sign up and sign in with email and password",
          "Automatic settings sync every 2 minutes",
          "Cloud backup of desktop icons, installed apps, and system settings"
        ],
        "Settings Improvements": [
          "New 'Online Account' section (visible when signed in)",
          "View account info, email, and sync status",
          "Sign out and switch to local mode"
        ]
      }
    },
    "2.5": {
      icon: <Zap className="w-6 h-6" />,
      color: "from-yellow-500 to-orange-600",
      sections: {
        "UUR Manager": [
          "New UUR Manager app accessible from Desktop and Terminal",
          "Real built-in packages: Hello World and System Info",
          "Package submission system for community contributions"
        ],
        "CrashScreen Redesign": [
          "Styled crash screen with different colors per crash type",
          "Clear labeling for testing purposes"
        ]
      }
    },
    "2.0": {
      icon: <Monitor className="w-6 h-6" />,
      color: "from-gray-500 to-slate-600",
      sections: {
        "Major Changes": [
          "Complete rewrite using React and Tailwind CSS",
          "Modern component-based architecture",
          "TypeScript for better code quality"
        ]
      }
    }
  };

  const versionData = changelogs[selectedVersion];
  const isLatestVersion = selectedVersion === currentVersion;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden animate-scale-in bg-background/95 backdrop-blur-2xl border-primary/20">
        {/* Hero Header */}
        <div className={`relative px-8 py-10 bg-gradient-to-br ${versionData?.color || "from-primary to-primary/60"} overflow-hidden`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTQgMC00IDQtNCA0czAgNCA0IDRjMiAwIDItMiAyLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                {versionData?.icon || <Sparkles className="w-8 h-8 text-white" />}
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">URBANSHADE OS</h1>
                <p className="text-white/80 font-mono">Version {selectedVersion}</p>
              </div>
            </div>
            {isLatestVersion && (
              <div className="flex items-center gap-2 mt-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-bold text-white flex items-center gap-2">
                  <PartyPopper className="w-4 h-4" /> Latest Release
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Version Selector */}
        <div className="flex gap-2 px-6 py-4 border-b border-border/50 overflow-x-auto">
          {Object.keys(changelogs).map((version) => (
            <button
              key={version}
              onClick={() => setSelectedVersion(version)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                selectedVersion === version
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              v{version}
              {version === currentVersion && (
                <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">NEW</span>
              )}
            </button>
          ))}
        </div>

        {/* Special Announcement for Latest */}
        {isLatestVersion && (
          <div className="mx-6 mt-4 p-5 rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Rocket className="w-6 h-6 text-primary animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">Quality & Polish Update</h3>
                <p className="text-sm text-muted-foreground">
                  This update focuses on improving the overall user experience with better window management, 
                  enhanced sync reliability, and tons of quality-of-life improvements!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Changelog Content */}
        <ScrollArea className="flex-1 px-6 py-4 h-[calc(90vh-350px)]">
          <div className="space-y-6 pb-6">
            {Object.entries(versionData?.sections || {}).map(([section, items], sectionIndex) => (
              <div 
                key={section} 
                className="rounded-xl border border-border/50 overflow-hidden animate-fade-in"
                style={{ animationDelay: `${sectionIndex * 100}ms` }}
              >
                <div className="px-5 py-3 bg-muted/30 border-b border-border/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">{section}</h3>
                  <span className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    {items.length} changes
                  </span>
                </div>
                <ul className="p-4 space-y-3">
                  {items.map((text, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm animate-fade-in"
                      style={{ animationDelay: `${(sectionIndex * 100) + (i * 50)}ms` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-foreground/90">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 bg-muted/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Thank you for using URBANSHADE OS! 🎉
          </p>
          <Button onClick={handleClose} size="lg" className="px-8 font-bold">
            Let's Go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
