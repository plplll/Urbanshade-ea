import { useEffect, useState } from "react";
import { AlertTriangle, Copy, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export interface BugcheckData {
  code: string;
  description: string;
  timestamp: string;
  location?: string;
  stackTrace?: string;
  systemInfo?: Record<string, string>;
}

interface BugcheckScreenProps {
  bugcheck: BugcheckData;
  onRestart: () => void;
  onReportToDev: () => void;
}

export const BugcheckScreen = ({ bugcheck, onRestart, onReportToDev }: BugcheckScreenProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const copyReport = () => {
    const report = JSON.stringify(bugcheck, null, 2);
    navigator.clipboard.writeText(report);
    toast.success("Bugcheck report copied to clipboard");
  };

  const downloadReport = () => {
    const report = JSON.stringify(bugcheck, null, 2);
    const blob = new Blob([report], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bugcheck_${bugcheck.code}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save bugcheck to localStorage for DEF-DEV
  useEffect(() => {
    const existing = localStorage.getItem('urbanshade_bugchecks');
    const bugchecks = existing ? JSON.parse(existing) : [];
    bugchecks.push(bugcheck);
    localStorage.setItem('urbanshade_bugchecks', JSON.stringify(bugchecks.slice(-50)));
  }, [bugcheck]);

  return (
    <div className="fixed inset-0 bg-[#1a0a0a] text-gray-100 flex flex-col font-mono z-[9999]">
      {/* Scan lines effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 2px, rgba(255,0,0,0.1) 4px)'
        }}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/80 to-red-800/60 border-b border-red-500/50 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-400">SYSTEM BUGCHECK</h1>
            <p className="text-sm text-red-300/70">A fatal error has been detected</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Error Info */}
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Error Code */}
          <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="text-sm text-red-400/70 mb-2">Bugcheck Code</div>
            <div className="text-3xl font-bold text-red-400 font-mono">{bugcheck.code}</div>
          </div>

          {/* Description */}
          <div className="p-6 bg-black/40 border border-white/10 rounded-lg">
            <div className="text-sm text-gray-500 mb-2">Description</div>
            <div className="text-lg text-gray-200">{bugcheck.description}</div>
          </div>

          {/* Timestamp & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Timestamp</div>
              <div className="text-sm text-gray-300 font-mono">{bugcheck.timestamp}</div>
            </div>
            {bugcheck.location && (
              <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Location</div>
                <div className="text-sm text-gray-300 font-mono">{bugcheck.location}</div>
              </div>
            )}
          </div>

          {/* Technical Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-400 hover:bg-gray-800 transition-colors"
          >
            {showDetails ? "Hide" : "Show"} Technical Details
          </button>

          {showDetails && (
            <div className="p-4 bg-black/60 border border-white/10 rounded-lg space-y-4">
              {bugcheck.stackTrace && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">Stack Trace</div>
                  <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
                    {bugcheck.stackTrace}
                  </pre>
                </div>
              )}
              {bugcheck.systemInfo && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">System Information</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(bugcheck.systemInfo).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-500">{key}:</span>
                        <span className="text-gray-300 font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-300/80">
            <p>
              This error has been logged and can be viewed in the DEF-DEV Console under "Bugcheck Reports". 
              You can share this report with developers for analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-white/10 p-6 bg-black/40">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-3 justify-center">
          <button
            onClick={copyReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Report
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
          <button
            onClick={onReportToDev}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors text-white"
          >
            <AlertTriangle className="w-4 h-4" />
            Report to DEF-DEV
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg transition-colors text-white font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Restart System
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-black/60 text-center text-xs text-gray-600">
        URBANSHADE OS Bugcheck Handler • Build 22621.2428 • {new Date().toLocaleString()}
      </div>
    </div>
  );
};

// Helper to create bugcheck
export const createBugcheck = (
  code: string, 
  description: string, 
  location?: string,
  stackTrace?: string
): BugcheckData => ({
  code,
  description,
  timestamp: new Date().toISOString(),
  location,
  stackTrace,
  systemInfo: {
    userAgent: navigator.userAgent.slice(0, 100),
    localStorage: `${localStorage.length} entries`,
    memory: (performance as any).memory?.usedJSHeapSize 
      ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` 
      : 'N/A',
    url: window.location.pathname
  }
});

// Bugcheck codes
export const BUGCHECK_CODES = {
  ICON_COLLISION_FATAL: "ICON_COLLISION_FATAL",
  RENDER_LOOP_DETECTED: "RENDER_LOOP_DETECTED", 
  MEMORY_PRESSURE: "MEMORY_PRESSURE",
  UNHANDLED_EXCEPTION: "UNHANDLED_EXCEPTION",
  STATE_CORRUPTION: "STATE_CORRUPTION",
  INFINITE_LOOP: "INFINITE_LOOP"
} as const;