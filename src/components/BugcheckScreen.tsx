import { useEffect, useState } from "react";
import { AlertTriangle, Copy, Download, RefreshCw, Bug, Terminal, Shield, Cpu, Clock } from "lucide-react";

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

// Real bugcheck codes with detailed descriptions
export const BUGCHECK_CODES: Record<string, { 
  hex: string; 
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO"; 
  category: string;
  userDescription: string;
  technicalDescription: string;
  possibleCauses: string[];
  suggestedFixes: string[];
}> = {
  DESKTOP_MALFUNC: { 
    hex: "0x00000001", 
    severity: "HIGH", 
    category: "Desktop",
    userDescription: "The desktop display system has malfunctioned",
    technicalDescription: "Desktop component failed to render or entered an invalid state",
    possibleCauses: ["Icon collision", "Layout corruption", "Render loop"],
    suggestedFixes: ["Restart the system", "Clear desktop layout", "Reset to defaults"]
  },
  RENDER_FAILURE: { 
    hex: "0x00000002", 
    severity: "HIGH", 
    category: "Rendering",
    userDescription: "A visual component failed to display correctly",
    technicalDescription: "React component threw an unhandled exception during render",
    possibleCauses: ["Invalid props", "Missing data", "Component crash"],
    suggestedFixes: ["Refresh the page", "Check for corrupted data", "Report to developers"]
  },
  ICON_COLLISION: { 
    hex: "0x00000003", 
    severity: "MEDIUM", 
    category: "Desktop",
    userDescription: "Desktop icons overlapped in an unrecoverable way",
    technicalDescription: "Multiple icons assigned to same position, conflict resolution failed",
    possibleCauses: ["Drag-drop error", "Layout save failure", "Position corruption"],
    suggestedFixes: ["Reset icon positions", "Clear desktop cache"]
  },
  WINDOW_OVERFLOW: { 
    hex: "0x00000004", 
    severity: "MEDIUM", 
    category: "Window Manager",
    userDescription: "Too many windows were open or window state became invalid",
    technicalDescription: "Window manager exceeded maximum window count or z-index overflow",
    possibleCauses: ["Window leak", "Unclosed modals", "Z-index overflow"],
    suggestedFixes: ["Close all windows", "Restart system"]
  },
  DATA_INCORRECT: { 
    hex: "0x00000010", 
    severity: "CRITICAL", 
    category: "Data Integrity",
    userDescription: "Saved data was found to be corrupted or invalid",
    technicalDescription: "Data validation failed - stored data does not match expected schema",
    possibleCauses: ["Storage corruption", "Incomplete save", "Version mismatch"],
    suggestedFixes: ["Factory reset", "Restore from backup", "Clear localStorage"]
  },
  STATE_CORRUPTION: { 
    hex: "0x00000011", 
    severity: "CRITICAL", 
    category: "State",
    userDescription: "The application's internal state became inconsistent",
    technicalDescription: "React state entered an impossible combination of values",
    possibleCauses: ["Race condition", "Improper state update", "Memory issue"],
    suggestedFixes: ["Restart immediately", "Report bug with steps to reproduce"]
  },
  STORAGE_OVERFLOW: { 
    hex: "0x00000012", 
    severity: "HIGH", 
    category: "Storage",
    userDescription: "Storage space has been exhausted",
    technicalDescription: "localStorage quota exceeded - cannot save any more data",
    possibleCauses: ["Too many files", "Large file stored", "Quota limit reached"],
    suggestedFixes: ["Delete unnecessary files", "Clear old data", "Use recovery mode"]
  },
  PARSE_FAILURE: { 
    hex: "0x00000013", 
    severity: "HIGH", 
    category: "Data",
    userDescription: "Could not read saved data - it appears corrupted",
    technicalDescription: "JSON.parse threw an exception on stored data",
    possibleCauses: ["Incomplete write", "Manual edit error", "Encoding issue"],
    suggestedFixes: ["Clear corrupted key", "Factory reset if critical data"]
  },
  KERNEL_PANIC: { 
    hex: "0x00000020", 
    severity: "CRITICAL", 
    category: "Kernel",
    userDescription: "The core system encountered a fatal error",
    technicalDescription: "Core system module threw an unrecoverable exception",
    possibleCauses: ["Critical module failure", "Memory exhaustion", "Infinite loop"],
    suggestedFixes: ["Restart required", "May need factory reset"]
  },
  MEMORY_EXHAUSTED: { 
    hex: "0x00000021", 
    severity: "CRITICAL", 
    category: "Memory",
    userDescription: "The system ran out of available memory",
    technicalDescription: "Browser memory limit reached - allocation failed",
    possibleCauses: ["Memory leak", "Too many open apps", "Large data set"],
    suggestedFixes: ["Close browser tabs", "Restart browser", "Reduce open apps"]
  },
  INFINITE_LOOP: { 
    hex: "0x00000022", 
    severity: "HIGH", 
    category: "Process",
    userDescription: "A process got stuck in an endless loop",
    technicalDescription: "Detected infinite re-render or processing loop",
    possibleCauses: ["useEffect dependency error", "Recursive call", "Logic error"],
    suggestedFixes: ["Restart system", "Report bug to developers"]
  },
  STACK_OVERFLOW: { 
    hex: "0x00000023", 
    severity: "CRITICAL", 
    category: "Stack",
    userDescription: "Too many nested operations caused a stack overflow",
    technicalDescription: "Maximum call stack size exceeded",
    possibleCauses: ["Deep recursion", "Circular reference", "Infinite recursion"],
    suggestedFixes: ["Restart required", "Report to developers with reproduction steps"]
  },
  DEV_ERR: { 
    hex: "0x000000FF", 
    severity: "INFO", 
    category: "Developer",
    userDescription: "This is a developer-triggered test error",
    technicalDescription: "Manually triggered via DEF-DEV console for testing",
    possibleCauses: ["Developer testing", "DEF-DEV command"],
    suggestedFixes: ["No action needed - this was intentional"]
  },
  DEV_TEST: { 
    hex: "0x000000FE", 
    severity: "INFO", 
    category: "Developer",
    userDescription: "This is a test bugcheck for debugging purposes",
    technicalDescription: "Test bugcheck triggered via DEF-DEV admin panel",
    possibleCauses: ["Intentional test"],
    suggestedFixes: ["Click restart to continue"]
  },
  UNHANDLED_EXCEPTION: { 
    hex: "0x00000099", 
    severity: "HIGH", 
    category: "Exception",
    userDescription: "An unexpected error occurred that wasn't handled",
    technicalDescription: "Uncaught exception propagated to top level error boundary",
    possibleCauses: ["Unhandled promise rejection", "Uncaught throw", "Async error"],
    suggestedFixes: ["Restart system", "Report bug with console logs"]
  },
  UNKNOWN_FATAL: { 
    hex: "0x000000DE", 
    severity: "CRITICAL", 
    category: "Unknown",
    userDescription: "An unknown fatal error occurred",
    technicalDescription: "Unrecognized error type triggered system halt",
    possibleCauses: ["Unknown"],
    suggestedFixes: ["Factory reset may be required", "Contact developers"]
  },
};

export const BugcheckScreen = ({ bugcheck, onRestart, onReportToDev }: BugcheckScreenProps) => {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const copyReport = () => {
    const report = JSON.stringify(bugcheck, null, 2);
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    bugchecks.push({ ...bugcheck, fromError: true });
    localStorage.setItem('urbanshade_bugchecks', JSON.stringify(bugchecks.slice(-50)));
  }, [bugcheck]);

  const codeInfo = BUGCHECK_CODES[bugcheck.code] || {
    hex: "0x000000DE",
    severity: "CRITICAL" as const,
    category: "Unknown",
    userDescription: "An unknown error occurred",
    technicalDescription: bugcheck.description,
    possibleCauses: ["Unknown cause"],
    suggestedFixes: ["Restart the system"]
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#080810] text-gray-100 flex flex-col font-mono z-[9999] overflow-hidden">
      {/* Animated border */}
      <div className="absolute inset-0 border-4 border-red-600/40 pointer-events-none" />
      <div className="absolute inset-2 border border-red-600/20 pointer-events-none animate-pulse" style={{ animationDuration: '3s' }} />

      {/* Header */}
      <div className="bg-gradient-to-r from-red-950/90 to-red-900/70 border-b border-red-600/40 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-600/30 rounded-xl flex items-center justify-center border border-red-500/30">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-400">SYSTEM BUGCHECK</h1>
              <p className="text-xs text-red-300/60">The system has been halted to prevent damage</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-red-400/60">Reference</div>
            <div className="text-sm font-mono text-red-300">{codeInfo.hex}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-5">
          
          {/* CRITICAL: Not a simulation warning - Bugchecks are REAL errors */}
          <div className="p-5 bg-gradient-to-r from-red-950/60 to-red-900/40 border-2 border-red-500/40 rounded-xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-7 h-7 text-red-400 flex-shrink-0 animate-pulse" />
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-red-400">⚠ REAL SYSTEM ERROR - NOT A SIMULATION</h2>
                <p className="text-sm text-red-200/80 leading-relaxed">
                  This is a <strong>genuine bugcheck</strong> - a real unrecoverable error in the UrbanShade OS application. 
                  Unlike themed crash screens, bugchecks indicate actual code failures. The system force-halted to prevent 
                  data corruption or cascading failures.
                </p>
              </div>
            </div>
          </div>

          {/* Error Info Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Stop Code */}
            <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400 uppercase">Stop Code</span>
              </div>
              <div className="text-xl font-bold text-red-400">{bugcheck.code}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">{codeInfo.hex}</div>
            </div>

            {/* Severity */}
            <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-400 uppercase">Severity</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border ${getSeverityColor(codeInfo.severity)}`}>
                {codeInfo.severity}
              </span>
              <div className="text-xs text-slate-500 mt-2">{codeInfo.category}</div>
            </div>

            {/* Timestamp */}
            <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400 uppercase">Occurred At</span>
              </div>
              <div className="text-sm text-slate-300">{new Date(bugcheck.timestamp).toLocaleString()}</div>
            </div>
          </div>

          {/* User-Friendly Description */}
          <div className="p-5 bg-slate-900/60 border border-slate-700/50 rounded-xl">
            <h3 className="font-bold text-slate-200 mb-3">What Happened</h3>
            <p className="text-slate-300 leading-relaxed">{codeInfo.userDescription}</p>
            {bugcheck.description && bugcheck.description !== codeInfo.userDescription && (
              <p className="text-sm text-slate-400 mt-2 pt-2 border-t border-slate-700/50">
                Details: {bugcheck.description}
              </p>
            )}
          </div>

          {/* Possible Causes & Fixes */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/50 border border-orange-500/20 rounded-xl">
              <h4 className="font-bold text-orange-400 mb-3 text-sm">Possible Causes</h4>
              <ul className="space-y-1.5">
                {codeInfo.possibleCauses.map((cause, i) => (
                  <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-slate-900/50 border border-green-500/20 rounded-xl">
              <h4 className="font-bold text-green-400 mb-3 text-sm">Suggested Fixes</h4>
              <ul className="space-y-1.5">
                {codeInfo.suggestedFixes.map((fix, i) => (
                  <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    {fix}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Details (Collapsible) */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-sm"
            >
              <span className="text-slate-400">Technical Details</span>
              <span className="text-slate-500">{showDetails ? '▼' : '▶'}</span>
            </button>
            {showDetails && (
              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500">Technical Description:</span>
                  <p className="text-slate-400 mt-1">{codeInfo.technicalDescription}</p>
                </div>
                {bugcheck.location && (
                  <div>
                    <span className="text-slate-500">Location:</span>
                    <p className="text-slate-400 font-mono mt-1">{bugcheck.location}</p>
                  </div>
                )}
                {bugcheck.stackTrace && (
                  <div>
                    <span className="text-slate-500">Stack Trace:</span>
                    <pre className="text-slate-500 mt-1 overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto bg-black/50 p-2 rounded">
                      {bugcheck.stackTrace}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DEF-DEV Notice */}
          <div className="p-3 bg-amber-950/30 border border-amber-600/30 rounded-lg text-xs text-amber-300/80 flex items-center gap-3">
            <Bug className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>This bugcheck has been logged. Open DEF-DEV Console to view full details and share with developers.</span>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="border-t border-slate-800 bg-slate-950/90 p-4">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-3 justify-center">
          <button
            onClick={copyReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy Report"}
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => {
              localStorage.setItem('urbanshade_crash_entry', JSON.stringify({
                ...bugcheck,
                fromError: true,
                isBugcheck: true
              }));
              onReportToDev();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-700/80 hover:bg-amber-600 rounded-lg text-sm border border-amber-600/50 transition-colors"
          >
            <Terminal className="w-4 h-4" />
            Open DEF-DEV
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-bold border border-red-500 shadow-lg shadow-red-600/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            RESTART
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper to create bugcheck
export const createBugcheck = (
  code: keyof typeof BUGCHECK_CODES | string, 
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
    userAgent: navigator.userAgent.slice(0, 80),
    localStorage: `${localStorage.length} entries`,
    url: window.location.pathname,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  }
});