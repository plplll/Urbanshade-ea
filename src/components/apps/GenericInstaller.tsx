import { useState, useEffect } from "react";
import { Package, Check, Download, Shield, Sparkles, HardDrive, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface GenericInstallerProps {
  appName?: string;
  appId?: string;
  installerId?: string;
  onComplete?: () => void;
}

export const GenericInstaller = ({ appName, appId, installerId, onComplete }: GenericInstallerProps) => {
  // Load installer data from localStorage
  const installerData = (() => {
    const stored = localStorage.getItem('current_installer');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        appName: appName || parsed.appName || "Application",
        appId: appId || parsed.appId,
        installerId: installerId || parsed.id
      };
    }
    return { appName: appName || "Application", appId, installerId };
  })();

  const [stage, setStage] = useState<"welcome" | "license" | "configure" | "installing" | "complete">("welcome");
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [acceptLicense, setAcceptLicense] = useState(false);
  const [installLocation, setInstallLocation] = useState(`C:\\Program Files\\Urbanshade\\${installerData.appName}`);
  const [options, setOptions] = useState({
    desktopShortcut: true,
    startMenu: true,
    quickLaunch: false,
    fileAssociations: true,
  });

  const installTasks = [
    "Preparing installation...",
    "Extracting files...",
    "Installing core components...",
    "Registering DLL files...",
    "Configuring application...",
    "Creating shortcuts...",
    "Updating system registry...",
    "Finalizing installation..."
  ];

  useEffect(() => {
    if (stage === "installing") {
      let taskIndex = 0;
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1.5;
          
          // Update task based on progress
          const newTaskIndex = Math.floor((newProgress / 100) * installTasks.length);
          if (newTaskIndex !== taskIndex && newTaskIndex < installTasks.length) {
            taskIndex = newTaskIndex;
            setCurrentTask(installTasks[newTaskIndex]);
          }
          
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage("complete"), 800);
            return 100;
          }
          return newProgress;
        });
      }, 60);
      setCurrentTask(installTasks[0]);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleInstall = () => {
    setStage("installing");
  };

  const handleFinish = () => {
    // Add to installed apps
    if (installerData.appId) {
      const installed = JSON.parse(localStorage.getItem('urbanshade_installed_apps') || '[]');
      if (!installed.includes(installerData.appId)) {
        installed.push(installerData.appId);
        localStorage.setItem('urbanshade_installed_apps', JSON.stringify(installed));
      }
    }

    // Remove installer from downloads
    if (installerData.installerId) {
      const installers = JSON.parse(localStorage.getItem('downloads_installers') || '[]');
      const updated = installers.filter((i: any) => i.id !== installerData.installerId);
      localStorage.setItem('downloads_installers', JSON.stringify(updated));
    }

    // Clear current installer data
    localStorage.removeItem('current_installer');

    // Add notification
    const notifications = JSON.parse(localStorage.getItem('system_notifications') || '[]');
    notifications.unshift({
      id: Date.now().toString(),
      title: "Installation Complete",
      message: `${installerData.appName} has been installed successfully.`,
      time: new Date().toISOString(),
      read: false,
      type: "success"
    });
    localStorage.setItem('system_notifications', JSON.stringify(notifications));

    toast.success(`${installerData.appName} installed successfully!`);
    window.dispatchEvent(new Event('storage'));
    onComplete?.();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <div className="relative border-b border-white/10 bg-white/5 backdrop-blur-sm p-5 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/20 border border-primary/30 animate-scale-in">
          <Package className="w-8 h-8 text-primary" />
        </div>
        <div className="animate-fade-in">
          <h1 className="text-xl font-bold">{installerData.appName} Setup Wizard</h1>
          <p className="text-sm text-white/60">Urbanshade Installation System v2.4</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative border-b border-white/10 bg-white/5 px-6 py-4">
        <div className="flex justify-between items-center max-w-xl mx-auto">
          {["Welcome", "License", "Options", "Install", "Complete"].map((step, i) => {
            const stages = ["welcome", "license", "configure", "installing", "complete"];
            const currentIndex = stages.indexOf(stage);
            const isActive = i <= currentIndex;
            const isCurrent = i === currentIndex;
            
            return (
              <div key={step} className="flex items-center">
                <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? "opacity-100" : "opacity-40"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCurrent ? "bg-primary text-white scale-110 ring-4 ring-primary/30" : 
                    isActive ? "bg-green-500 text-white" : "bg-white/20 text-white/60"
                  }`}>
                    {isActive && i < currentIndex ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">{step}</span>
                </div>
                {i < 4 && <div className={`w-12 h-0.5 mx-2 transition-all duration-500 ${i < currentIndex ? "bg-green-500" : "bg-white/20"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 p-6 overflow-auto">
        {stage === "welcome" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/30 to-blue-500/30 rounded-2xl flex items-center justify-center border border-primary/30 animate-scale-in shadow-lg shadow-primary/20">
                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Welcome to {installerData.appName}
              </h2>
              <p className="text-white/70 leading-relaxed">
                This wizard will guide you through the installation of <span className="text-primary font-semibold">{installerData.appName}</span> on your Urbanshade system.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                Before you continue:
              </h3>
              <ul className="text-sm text-white/70 space-y-2 ml-6 list-disc">
                <li>Close all other applications</li>
                <li>Ensure you have administrator privileges</li>
                <li>Estimated installation time: 2-5 minutes</li>
              </ul>
            </div>
          </div>
        )}

        {stage === "license" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">License Agreement</h2>
            
            <div className="bg-black/30 border border-white/10 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs text-white/70">
              <p className="mb-4">URBANSHADE SOFTWARE LICENSE AGREEMENT</p>
              <p className="mb-2">Version 2.4.0 - Last Updated: 2025</p>
              <p className="mb-4">By installing this software, you agree to the following terms:</p>
              <p className="mb-2">1. GRANT OF LICENSE</p>
              <p className="mb-4 ml-4">Urbanshade Corporation grants you a non-exclusive license to use this software within the Urbanshade OS environment.</p>
              <p className="mb-2">2. RESTRICTIONS</p>
              <p className="mb-4 ml-4">You may not reverse engineer, decompile, or disassemble this software. Unauthorized access to restricted facility systems is prohibited.</p>
              <p className="mb-2">3. SECURITY NOTICE</p>
              <p className="mb-4 ml-4">This software may collect usage data for system optimization and security monitoring purposes.</p>
              <p className="mb-2">4. DISCLAIMER</p>
              <p className="ml-4">THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. URBANSHADE CORPORATION ASSUMES NO LIABILITY FOR ANY DAMAGES.</p>
            </div>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all group">
              <input
                type="checkbox"
                checked={acceptLicense}
                onChange={(e) => setAcceptLicense(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <span className="group-hover:text-primary transition-colors">I accept the terms of the License Agreement</span>
            </label>
          </div>
        )}

        {stage === "configure" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Installation Options</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-primary" />
                  Install Location
                </label>
                <input
                  type="text"
                  value={installLocation}
                  onChange={(e) => setInstallLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                {[
                  { key: "desktopShortcut", label: "Create desktop shortcut", desc: "Add an icon to your desktop for quick access" },
                  { key: "startMenu", label: "Add to Start Menu", desc: "Create an entry in the Start Menu" },
                  { key: "quickLaunch", label: "Pin to taskbar", desc: "Add to the taskbar for instant access" },
                  { key: "fileAssociations", label: "Register file associations", desc: "Open supported files with this application" },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all group">
                    <input
                      type="checkbox"
                      checked={options[key as keyof typeof options]}
                      onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                      className="w-5 h-5 accent-primary mt-0.5"
                    />
                    <div>
                      <div className="font-medium group-hover:text-primary transition-colors">{label}</div>
                      <div className="text-xs text-white/50">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === "installing" && (
          <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative w-full h-full bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Installing {installerData.appName}</h2>
              <p className="text-white/60">Please wait while the installation completes...</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">{currentTask}</span>
                <span className="font-mono text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-xl p-4 font-mono text-xs text-white/50 h-32 overflow-y-auto">
              <p>[INFO] Starting installation process...</p>
              {progress > 10 && <p>[INFO] Creating directory structure...</p>}
              {progress > 25 && <p>[INFO] Extracting {installerData.appName}.dll...</p>}
              {progress > 40 && <p>[INFO] Installing dependencies...</p>}
              {progress > 55 && <p>[INFO] Registering COM components...</p>}
              {progress > 70 && <p>[INFO] Configuring application settings...</p>}
              {progress > 85 && <p>[INFO] Creating shortcuts...</p>}
              {progress >= 100 && <p className="text-green-400">[SUCCESS] Installation completed!</p>}
            </div>
          </div>
        )}

        {stage === "complete" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-2xl flex items-center justify-center border border-green-500/30 animate-scale-in shadow-lg shadow-green-500/20">
                <Check className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-green-400">Installation Complete!</h2>
              <p className="text-white/70">
                <span className="text-white font-semibold">{installerData.appName}</span> has been successfully installed on your system.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold">Installation Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-4 h-4" />
                  <span>Program files installed to <span className="font-mono text-xs">{installLocation}</span></span>
                </div>
                {options.desktopShortcut && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Desktop shortcut created</span>
                  </div>
                )}
                {options.startMenu && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Added to Start Menu</span>
                  </div>
                )}
                {options.quickLaunch && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Pinned to taskbar</span>
                  </div>
                )}
                {options.fileAssociations && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4" />
                    <span>File associations registered</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative bg-white/5 border-t border-white/10 p-4 flex justify-between items-center backdrop-blur-sm">
        <div className="text-xs text-white/40">
          Urbanshade Installation System v2.4
        </div>
        <div className="flex gap-3">
          {stage === "welcome" && (
            <>
              <button onClick={onComplete} className="px-5 py-2.5 rounded-lg hover:bg-white/10 transition-all text-white/70 hover:text-white">
                Cancel
              </button>
              <button onClick={() => setStage("license")} className="px-5 py-2.5 bg-primary hover:bg-primary/80 rounded-lg transition-all font-medium">
                Next →
              </button>
            </>
          )}

          {stage === "license" && (
            <>
              <button onClick={() => setStage("welcome")} className="px-5 py-2.5 rounded-lg hover:bg-white/10 transition-all text-white/70 hover:text-white">
                ← Back
              </button>
              <button 
                onClick={() => setStage("configure")} 
                disabled={!acceptLicense}
                className={`px-5 py-2.5 rounded-lg transition-all font-medium ${acceptLicense ? "bg-primary hover:bg-primary/80" : "bg-white/10 text-white/30 cursor-not-allowed"}`}
              >
                Next →
              </button>
            </>
          )}

          {stage === "configure" && (
            <>
              <button onClick={() => setStage("license")} className="px-5 py-2.5 rounded-lg hover:bg-white/10 transition-all text-white/70 hover:text-white">
                ← Back
              </button>
              <button onClick={handleInstall} className="px-5 py-2.5 bg-primary hover:bg-primary/80 rounded-lg transition-all font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Install
              </button>
            </>
          )}

          {stage === "complete" && (
            <button onClick={handleFinish} className="px-6 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg transition-all font-medium">
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
