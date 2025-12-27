import { useState, useRef, useEffect } from "react";
import { X, Minimize2, Maximize2, Move, Bug, Terminal, Activity, Globe, Layers, Database, Settings } from "lucide-react";
import { PerformanceTab } from "./tabs/PerformanceTab";
import { NetworkTab } from "./tabs/NetworkTab";
import ConsoleTab from "./tabs/ConsoleTab";
import { LogEntry } from "./hooks/useDefDevState";

interface FloatingDefDevProps {
  isOpen: boolean;
  onClose: () => void;
}

type MiniTab = 'console' | 'performance' | 'network';

const FloatingDefDev = ({ isOpen, onClose }: FloatingDefDevProps) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 500, height: 400 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState<MiniTab>('console');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "error" | "warn" | "info" | "system">("all");
  const [showTechnical, setShowTechnical] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);

  // Console capture
  useEffect(() => {
    if (!isOpen) return;

    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
    };

    const addLog = (type: LogEntry["type"], ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(" ");
      
      setLogs(prev => [...prev.slice(-200), {
        id: logIdRef.current++,
        type,
        timestamp: new Date(),
        message,
        raw: message,
      }]);
    };

    console.log = (...args) => { originalConsole.log(...args); addLog("info", ...args); };
    console.warn = (...args) => { originalConsole.warn(...args); addLog("warn", ...args); };
    console.error = (...args) => { originalConsole.error(...args); addLog("error", ...args); };
    console.info = (...args) => { originalConsole.info(...args); addLog("info", ...args); };

    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
    };
  }, [isOpen]);

  // Dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStartRef.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragStartRef.current.y))
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, size.width]);

  // Resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      setSize({
        width: Math.max(300, e.clientX - position.x),
        height: Math.max(200, e.clientY - position.y)
      });
    };

    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, position]);

  const handleDragStart = (e: React.MouseEvent) => {
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    setIsDragging(true);
  };

  if (!isOpen) return null;

  const filteredLogs = filter === "all" ? logs : logs.filter(l => l.type === filter);

  const tabs: { id: MiniTab; icon: React.ElementType; label: string }[] = [
    { id: 'console', icon: Terminal, label: 'Console' },
    { id: 'performance', icon: Activity, label: 'Perf' },
    { id: 'network', icon: Globe, label: 'Network' },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed z-[9999] bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-2xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 200 : size.width,
        height: isMinimized ? 40 : size.height,
      }}
    >
      {/* Header */}
      <div
        className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-3 cursor-move select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-cyan-400">DEF-DEV</span>
          <span className="text-[10px] text-slate-500">Floating</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tab bar */}
          <div className="h-8 bg-slate-850 border-b border-slate-700 flex items-center px-2 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden" style={{ height: size.height - 80 }}>
            {activeTab === 'console' && (
              <ConsoleTab
                logs={logs}
                filter={filter}
                onFilterChange={setFilter}
                showTechnical={showTechnical}
                onShowTechnicalChange={setShowTechnical}
                filteredLogs={filteredLogs}
                onClearLogs={() => setLogs([])}
                logsEndRef={logsEndRef}
              />
            )}
            {activeTab === 'performance' && <PerformanceTab />}
            {activeTab === 'network' && <NetworkTab />}
          </div>

          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
          >
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-slate-600" />
          </div>
        </>
      )}
    </div>
  );
};

export default FloatingDefDev;
