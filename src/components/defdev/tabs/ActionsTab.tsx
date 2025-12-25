import { RefreshCw, Trash2, Activity, Shield, Folder, User, Monitor, Zap } from "lucide-react";
import { toast } from "sonner";
import { actionDispatcher } from "@/lib/actionDispatcher";
import { ActionEntry } from "../hooks/useDefDevState";

interface ActionsTabProps {
  actions: ActionEntry[];
  setActions: React.Dispatch<React.SetStateAction<ActionEntry[]>>;
  actionFilter: "ALL" | "SYSTEM" | "APP" | "FILE" | "USER" | "SECURITY" | "WINDOW";
  onFilterChange: (filter: "ALL" | "SYSTEM" | "APP" | "FILE" | "USER" | "SECURITY" | "WINDOW") => void;
  actionPersistenceEnabled: boolean;
  filteredActions: ActionEntry[];
}

const ActionsTab = ({
  actions,
  setActions,
  actionFilter,
  onFilterChange,
  actionPersistenceEnabled,
  filteredActions,
}: ActionsTabProps) => {
  const getActionTypeColor = (type: ActionEntry["type"]) => {
    switch (type) {
      case "SYSTEM": return "text-purple-400 bg-purple-500/10 border-purple-500/30";
      case "APP": return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "FILE": return "text-green-400 bg-green-500/10 border-green-500/30";
      case "USER": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
      case "SECURITY": return "text-red-400 bg-red-500/10 border-red-500/30";
      case "WINDOW": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getActionIcon = (type: ActionEntry["type"]) => {
    switch (type) {
      case "SYSTEM": return <Zap className="w-4 h-4" />;
      case "APP": return <Activity className="w-4 h-4" />;
      case "FILE": return <Folder className="w-4 h-4" />;
      case "USER": return <User className="w-4 h-4" />;
      case "SECURITY": return <Shield className="w-4 h-4" />;
      case "WINDOW": return <Monitor className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const refreshFromStorage = () => {
    const stored = actionDispatcher.refreshFromStorage();
    const converted = stored.map((a, idx) => ({
      id: idx,
      type: a.type as ActionEntry["type"],
      timestamp: a.timestamp,
      message: a.message
    }));
    setActions(converted);
    toast.success(`Loaded ${stored.length} actions from storage`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filter toolbar */}
      <div className="p-3 border-b border-slate-800 flex items-center gap-2 flex-wrap bg-slate-900/50">
        <span className="text-xs text-slate-500 font-medium">Filter:</span>
        {(["ALL", "SYSTEM", "APP", "FILE", "USER", "SECURITY", "WINDOW"] as const).map(type => (
          <button
            key={type}
            onClick={() => onFilterChange(type)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
              actionFilter === type 
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
                : "bg-slate-800 text-slate-500 hover:text-slate-300 border-slate-700"
            }`}
          >
            {type}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2 mr-2">
          <span className={`text-xs font-mono ${actionPersistenceEnabled ? 'text-green-400' : 'text-slate-500'}`}>
            {actionPersistenceEnabled ? '● PERSISTING' : '○ NOT PERSISTING'}
          </span>
        </div>
        <button 
          onClick={refreshFromStorage}
          className="p-2 hover:bg-cyan-500/20 rounded border border-cyan-500/30 text-cyan-400 transition-colors"
          title="Refresh from localStorage"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setActions([])} 
          className="p-2 hover:bg-red-500/20 rounded border border-red-500/30 text-red-400 transition-colors"
          title="Clear actions"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Actions list */}
      <div className="flex-1 overflow-auto p-3 space-y-1.5 text-xs font-mono">
        {filteredActions.length === 0 ? (
          <div className="text-center text-slate-600 py-12">
            <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No actions recorded yet...</p>
            {actionPersistenceEnabled && (
              <button 
                onClick={refreshFromStorage}
                className="mt-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 transition-colors"
              >
                <RefreshCw className="w-3 h-3 inline mr-2" />Load from storage
              </button>
            )}
          </div>
        ) : (
          filteredActions.map(action => (
            <div 
              key={action.id} 
              className={`p-3 rounded-lg border transition-colors hover:brightness-110 ${getActionTypeColor(action.type)}`}
            >
              <div className="flex items-center gap-2">
                {getActionIcon(action.type)}
                <span className="text-slate-500">{action.timestamp.toLocaleTimeString()}</span>
                <span className={`uppercase font-bold text-xs px-2 py-0.5 rounded border ${getActionTypeColor(action.type)}`}>
                  {action.type}
                </span>
                <span className="text-slate-300 flex-1">{action.message}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="p-3 border-t border-slate-800 flex gap-6 text-xs text-slate-500 bg-slate-900/50">
        <span>Total: <span className="text-slate-400">{actions.length}</span></span>
        <span className="text-purple-400">System: {actions.filter(a => a.type === "SYSTEM").length}</span>
        <span className="text-red-400">Security: {actions.filter(a => a.type === "SECURITY").length}</span>
      </div>
    </div>
  );
};

export default ActionsTab;
