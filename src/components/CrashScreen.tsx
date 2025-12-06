import { useEffect, useState } from "react";
import { AlertTriangle, Bug, RefreshCw, Terminal, Cpu, HardDrive, Activity } from "lucide-react";

export type CrashType = 
  | "KERNEL_PANIC" 
  | "CRITICAL_PROCESS_DIED" 
  | "SYSTEM_SERVICE_EXCEPTION" 
  | "MEMORY_MANAGEMENT" 
  | "IRQL_NOT_LESS_OR_EQUAL"
  | "PAGE_FAULT_IN_NONPAGED_AREA"
  | "DRIVER_IRQL_NOT_LESS_OR_EQUAL"
  | "SYSTEM_THREAD_EXCEPTION_NOT_HANDLED"
  | "UNEXPECTED_KERNEL_MODE_TRAP"
  | "KMODE_EXCEPTION_NOT_HANDLED"
  | "INACCESSIBLE_BOOT_DEVICE"
  | "VIDEO_TDR_FAILURE"
  | "WHEA_UNCORRECTABLE_ERROR"
  | "DPC_WATCHDOG_VIOLATION"
  | "CLOCK_WATCHDOG_TIMEOUT"
  | "custom";

export interface CrashData {
  stopCode: CrashType;
  process?: string;
  module?: string;
  address?: string;
  description?: string;
  collectingData?: boolean;
}

interface CrashScreenProps {
  onReboot: () => void;
  crashData?: CrashData;
  killedProcess?: string;
  crashType?: "kernel" | "virus" | "bluescreen" | "memory" | "corruption" | "overload";
  customData?: { title: string; message: string } | null;
}

const STOP_CODES: Record<CrashType, { description: string; whatFailed?: string }> = {
  KERNEL_PANIC: {
    description: "The system kernel encountered a fatal error and cannot continue.",
    whatFailed: "urbanshade.core"
  },
  CRITICAL_PROCESS_DIED: {
    description: "A critical system process has terminated unexpectedly.",
    whatFailed: "system.service"
  },
  SYSTEM_SERVICE_EXCEPTION: {
    description: "An exception occurred in a system service routine.",
    whatFailed: "svc.handler"
  },
  MEMORY_MANAGEMENT: {
    description: "A memory allocation or management error has occurred.",
    whatFailed: "mem.allocator"
  },
  IRQL_NOT_LESS_OR_EQUAL: {
    description: "A process attempted to access memory at an invalid address.",
    whatFailed: "ptr.deref"
  },
  PAGE_FAULT_IN_NONPAGED_AREA: {
    description: "Invalid system memory was referenced during execution.",
    whatFailed: "page.handler"
  },
  DRIVER_IRQL_NOT_LESS_OR_EQUAL: {
    description: "A driver accessed paged memory at an invalid level.",
    whatFailed: "driver.io"
  },
  SYSTEM_THREAD_EXCEPTION_NOT_HANDLED: {
    description: "A system thread generated an exception that was not handled.",
    whatFailed: "thread.exec"
  },
  UNEXPECTED_KERNEL_MODE_TRAP: {
    description: "The system encountered an unexpected kernel mode trap.",
    whatFailed: "trap.handler"
  },
  KMODE_EXCEPTION_NOT_HANDLED: {
    description: "A kernel mode exception was not properly handled.",
    whatFailed: "exception.dispatch"
  },
  INACCESSIBLE_BOOT_DEVICE: {
    description: "The boot device is inaccessible or corrupted.",
    whatFailed: "boot.loader"
  },
  VIDEO_TDR_FAILURE: {
    description: "The display driver failed to respond in time.",
    whatFailed: "display.driver"
  },
  WHEA_UNCORRECTABLE_ERROR: {
    description: "A fatal hardware error has occurred in the system.",
    whatFailed: "hardware.check"
  },
  DPC_WATCHDOG_VIOLATION: {
    description: "A deferred procedure call exceeded the system watchdog timeout.",
    whatFailed: "dpc.queue"
  },
  CLOCK_WATCHDOG_TIMEOUT: {
    description: "A processor clock interrupt was not received within the allocated interval.",
    whatFailed: "clock.timer"
  },
  custom: {
    description: "The system encountered a critical error and cannot continue."
  }
};

export const CrashScreen = ({ 
  onReboot, 
  crashData,
  killedProcess, 
  crashType = "kernel", 
  customData 
}: CrashScreenProps) => {
  const [phase, setPhase] = useState<"collecting" | "analyzing" | "ready">("collecting");
  const [progress, setProgress] = useState(0);
  const [memDump, setMemDump] = useState<string[]>([]);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  useEffect(() => {
    // Phase progression
    const collectTimer = setTimeout(() => setPhase("analyzing"), 2000);
    const analyzeTimer = setTimeout(() => setPhase("ready"), 4000);

    return () => {
      clearTimeout(collectTimer);
      clearTimeout(analyzeTimer);
    };
  }, []);

  useEffect(() => {
    if (phase !== "ready") {
      const interval = setInterval(() => {
        setProgress(prev => {
          const target = phase === "collecting" ? 45 : 100;
          if (prev >= target) return target;
          return prev + Math.random() * 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Generate fake memory dump
  useEffect(() => {
    const generateHex = () => {
      const lines: string[] = [];
      for (let i = 0; i < 8; i++) {
        const addr = (0x7FFE0000 + i * 16).toString(16).toUpperCase().padStart(8, '0');
        const bytes = Array.from({ length: 16 }, () => 
          Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
        ).join(' ');
        lines.push(`${addr}  ${bytes}`);
      }
      return lines;
    };

    const interval = setInterval(() => {
      setMemDump(generateHex());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Glitch effect for virus type
  useEffect(() => {
    if (crashType === "virus") {
      const interval = setInterval(() => {
        setGlitchIntensity(Math.random());
      }, 100);
      return () => clearInterval(interval);
    }
  }, [crashType]);

  // Convert legacy props to new format
  const resolvedCrashData: CrashData = crashData || {
    stopCode: crashType === "bluescreen" ? "CRITICAL_PROCESS_DIED" :
              crashType === "memory" ? "MEMORY_MANAGEMENT" :
              crashType === "overload" ? "DPC_WATCHDOG_VIOLATION" :
              crashType === "virus" ? "SYSTEM_SERVICE_EXCEPTION" :
              "KERNEL_PANIC",
    process: killedProcess || customData?.title,
    description: customData?.message
  };

  const stopInfo = STOP_CODES[resolvedCrashData.stopCode] || STOP_CODES.KERNEL_PANIC;
  const displayProgress = Math.min(100, Math.floor(progress));

  // Generate error code
  const errorCode = `US-${resolvedCrashData.stopCode.replace(/_/g, '-')}-${Date.now().toString(16).slice(-6).toUpperCase()}`;

  return (
    <div 
      className="fixed inset-0 bg-[#0a0a12] text-white font-mono overflow-hidden flex flex-col"
      style={crashType === "virus" ? {
        filter: `hue-rotate(${glitchIntensity * 30}deg)`,
        transform: `translate(${(glitchIntensity - 0.5) * 4}px, ${(glitchIntensity - 0.5) * 2}px)`
      } : undefined}
    >
      {/* Scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' 
        }} 
      />

      {/* Header Bar */}
      <div className="bg-red-900/90 border-b border-red-600/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SYSTEM CRASH</h1>
              <p className="text-xs text-red-300">UrbanShade OS has encountered a fatal error</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-red-300">Error Reference</div>
            <div className="text-sm font-mono text-white">{errorCode}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* CRITICAL WARNING */}
          <div className="p-5 bg-gradient-to-r from-red-950/80 to-red-900/60 border-2 border-red-500/50 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-500/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-red-400">⚠️ THIS IS NOT A SIMULATION</h2>
                <p className="text-sm text-red-200/90 leading-relaxed">
                  A <strong>real error</strong> occurred in the UrbanShade OS application. This crash screen 
                  indicates an actual unrecoverable error - not a themed or simulated one. The system halted 
                  to prevent data corruption or further instability.
                </p>
                <div className="pt-2 border-t border-red-500/30 text-xs text-red-300/80 space-y-1">
                  <p><strong>Why this happened:</strong> An unhandled exception, invalid state, or critical failure occurred.</p>
                  <p><strong>What to do:</strong> Click "Restart System" below. If this repeats, try Recovery Mode (F2 during boot) or clear localStorage.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Details Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Stop Code */}
            <div className="p-5 bg-slate-900/80 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span className="text-xs text-slate-400 uppercase tracking-wider">Stop Code</span>
              </div>
              <div className="text-2xl font-bold text-red-400 mb-2">
                {resolvedCrashData.stopCode.replace(/_/g, ' ')}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                0x{(resolvedCrashData.stopCode.length * 0x1234).toString(16).toUpperCase().padStart(8, '0')}
              </div>
            </div>

            {/* What Failed */}
            <div className="p-5 bg-slate-900/80 border border-slate-700 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <HardDrive className="w-5 h-5 text-amber-400" />
                <span className="text-xs text-slate-400 uppercase tracking-wider">What Failed</span>
              </div>
              <div className="text-lg font-bold text-amber-400 mb-2">
                {resolvedCrashData.module || stopInfo.whatFailed || 'unknown.module'}
              </div>
              {resolvedCrashData.process && (
                <div className="text-xs text-slate-500">
                  Process: <span className="text-slate-400">{resolvedCrashData.process}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-5 bg-slate-900/60 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Error Description</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {resolvedCrashData.description || stopInfo.description}
            </p>
          </div>

          {/* Memory Dump (Visual Effect) */}
          <div className="p-4 bg-black/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500">Memory Dump</span>
              <span className="text-xs text-slate-600">
                {phase === "collecting" ? "Collecting..." : phase === "analyzing" ? "Analyzing..." : "Complete"}
              </span>
            </div>
            <div className="font-mono text-[10px] text-slate-600 space-y-0.5 h-24 overflow-hidden">
              {memDump.map((line, i) => (
                <div key={i} className={phase === "ready" ? "" : "animate-pulse"}>{line}</div>
              ))}
            </div>
          </div>

          {/* Progress */}
          {phase !== "ready" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {phase === "collecting" ? "Collecting crash data..." : "Analyzing error..."}
                </span>
                <span className="text-slate-500">{displayProgress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-150"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-slate-600 text-center">
            Crashed at: {new Date().toLocaleString()} | Build: US-2.2.0-{Date.now().toString(36).slice(-4).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-slate-800 bg-slate-950/90 p-4">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => {
              localStorage.setItem('urbanshade_crash_entry', JSON.stringify({
                stopCode: resolvedCrashData.stopCode,
                process: resolvedCrashData.process,
                module: resolvedCrashData.module || stopInfo.whatFailed,
                timestamp: new Date().toISOString(),
                fromError: true
              }));
              window.location.href = "/def-dev?from=crash";
            }}
            className="flex items-center gap-2 px-5 py-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg border border-amber-500/30 transition-colors"
          >
            <Bug className="w-5 h-5" />
            Debug Error
          </button>
          <button
            onClick={onReboot}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-red-600/30"
          >
            <RefreshCw className="w-5 h-5" />
            Restart System
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to trigger crashes programmatically
export const triggerCrash = (type: CrashType, options?: Partial<CrashData>) => {
  return {
    stopCode: type,
    ...options
  } as CrashData;
};