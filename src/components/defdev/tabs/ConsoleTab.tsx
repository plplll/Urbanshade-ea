import { useState, useMemo } from "react";
import { Eye, EyeOff, Copy, Download, Trash2, Info, AlertTriangle, AlertCircle, CheckCircle, Bug, Cpu, Search, X, Filter } from "lucide-react";
import { LogEntry } from "../hooks/useDefDevState";

interface ConsoleTabProps {
  logs: LogEntry[];
  filter: "all" | "error" | "warn" | "info" | "system";
  onFilterChange: (filter: "all" | "error" | "warn" | "info" | "system") => void;
  showTechnical: boolean;
  onShowTechnicalChange: (show: boolean) => void;
  filteredLogs: LogEntry[];
  onClearLogs: () => void;
  logsEndRef: React.RefObject<HTMLDivElement>;
}

const ConsoleTab = ({
  logs,
  filter,
  onFilterChange,
  showTechnical,
  onShowTechnicalChange,
  filteredLogs,
  onClearLogs,
  logsEndRef,
}: ConsoleTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [regexMode, setRegexMode] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [invertMatch, setInvertMatch] = useState(false);

  // Apply search filter
  const searchFilteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return filteredLogs;

    return filteredLogs.filter(log => {
      let matches = false;
      const text = showTechnical ? log.message : (log.simplified || log.message);
      
      try {
        if (regexMode) {
          const regex = new RegExp(searchQuery, caseSensitive ? '' : 'i');
          matches = regex.test(text);
        } else {
          const query = caseSensitive ? searchQuery : searchQuery.toLowerCase();
          const target = caseSensitive ? text : text.toLowerCase();
          matches = target.includes(query);
        }
      } catch {
        // Invalid regex, fall back to plain text
        const query = caseSensitive ? searchQuery : searchQuery.toLowerCase();
        const target = caseSensitive ? text : text.toLowerCase();
        matches = target.includes(query);
      }

      return invertMatch ? !matches : matches;
    });
  }, [filteredLogs, searchQuery, regexMode, caseSensitive, invertMatch, showTechnical]);

  const getIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "error": return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "warn": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "success": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "system": return <Cpu className="w-4 h-4 text-purple-400" />;
      case "debug": return <Bug className="w-4 h-4 text-gray-400" />;
      default: return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const exportLogs = () => {
    const data = JSON.stringify(searchFilteredLogs.map(l => ({
      type: l.type,
      timestamp: l.timestamp.toISOString(),
      message: l.message
    })), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `defdev-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highlightMatch = (text: string): React.ReactNode => {
    if (!searchQuery.trim() || invertMatch) return text;

    try {
      let regex: RegExp;
      if (regexMode) {
        regex = new RegExp(`(${searchQuery})`, caseSensitive ? 'g' : 'gi');
      } else {
        const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(`(${escaped})`, caseSensitive ? 'g' : 'gi');
      }

      const parts = text.split(regex);
      return parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-500/30 text-yellow-300 px-0.5 rounded">
            {part}
          </mark>
        ) : part
      );
    } catch {
      return text;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900/50">
        {/* Filter buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            {(["all", "error", "warn", "info", "system"] as const).map(f => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`px-3 py-1.5 rounded text-xs capitalize font-medium transition-colors ${
                  filter === f 
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" 
                    : "bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-700"
                }`}
              >
                {f} {f !== "all" && `(${logs.filter(l => l.type === f).length})`}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <button 
            onClick={() => onShowTechnicalChange(!showTechnical)} 
            className="p-2 hover:bg-slate-800 rounded border border-slate-700 transition-colors" 
            title="Toggle technical view"
          >
            {showTechnical ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
          </button>
          <button 
            onClick={() => navigator.clipboard.writeText(searchFilteredLogs.map(l => `[${l.type}] ${l.message}`).join("\n"))} 
            className="p-2 hover:bg-slate-800 rounded border border-slate-700 transition-colors"
            title="Copy logs"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button 
            onClick={exportLogs} 
            className="p-2 hover:bg-slate-800 rounded border border-slate-700 transition-colors"
            title="Export logs"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={onClearLogs} 
            className="p-2 hover:bg-red-500/20 rounded border border-red-500/30 text-red-400 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs... (supports regex)"
              className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search options */}
          <div className="flex gap-1">
            <button
              onClick={() => setRegexMode(!regexMode)}
              className={`px-2 py-1.5 rounded text-xs font-mono transition-colors ${
                regexMode 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
              }`}
              title="Regex mode"
            >
              .*
            </button>
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              className={`px-2 py-1.5 rounded text-xs font-mono transition-colors ${
                caseSensitive 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
              }`}
              title="Case sensitive"
            >
              Aa
            </button>
            <button
              onClick={() => setInvertMatch(!invertMatch)}
              className={`px-2 py-1.5 rounded text-xs transition-colors ${
                invertMatch 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
              }`}
              title="Invert match (exclude)"
            >
              <Filter className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Search stats */}
        {searchQuery && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Showing {searchFilteredLogs.length} of {filteredLogs.length} logs
            </span>
            {regexMode && <span className="text-purple-400">• Regex</span>}
            {caseSensitive && <span className="text-cyan-400">• Case sensitive</span>}
            {invertMatch && <span className="text-red-400">• Inverted</span>}
          </div>
        )}
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-auto p-3 space-y-1.5 text-xs font-mono">
        {searchFilteredLogs.length === 0 ? (
          <div className="text-center text-slate-600 py-12">
            <Cpu className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>{searchQuery ? 'No matching logs found' : 'Waiting for system events...'}</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-cyan-400 hover:text-cyan-300"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          searchFilteredLogs.map(log => (
            <div key={log.id} className={`p-3 rounded-lg border transition-colors ${
              log.type === "error" ? "bg-red-500/5 border-red-500/30 hover:border-red-500/50" :
              log.type === "warn" ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50" :
              log.type === "system" ? "bg-purple-500/5 border-purple-500/30 hover:border-purple-500/50" :
              "bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50"
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                {getIcon(log.type)}
                <span className="text-slate-600">{log.timestamp.toLocaleTimeString()}</span>
                <span className={`uppercase font-bold text-xs px-1.5 py-0.5 rounded ${
                  log.type === "error" ? "text-red-400 bg-red-500/10" :
                  log.type === "warn" ? "text-amber-400 bg-amber-500/10" :
                  log.type === "system" ? "text-purple-400 bg-purple-500/10" : "text-cyan-400 bg-cyan-500/10"
                }`}>{log.type}</span>
              </div>
              {showTechnical ? (
                <pre className="whitespace-pre-wrap break-all text-slate-300">
                  {highlightMatch(log.message)}
                </pre>
              ) : (
                <div className="text-slate-300">
                  {highlightMatch(log.simplified || log.message)}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Stats bar */}
      <div className="p-3 border-t border-slate-800 flex gap-6 text-xs text-slate-500 bg-slate-900/50">
        <span>Total: <span className="text-slate-400">{logs.length}</span></span>
        <span className="text-red-400">Errors: {logs.filter(l => l.type === "error").length}</span>
        <span className="text-amber-400">Warnings: {logs.filter(l => l.type === "warn").length}</span>
        <span className="text-purple-400">System: {logs.filter(l => l.type === "system").length}</span>
        {searchQuery && (
          <span className="text-cyan-400 ml-auto">Filtered: {searchFilteredLogs.length}</span>
        )}
      </div>
    </div>
  );
};

export default ConsoleTab;
