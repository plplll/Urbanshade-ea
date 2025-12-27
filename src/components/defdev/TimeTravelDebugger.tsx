import { useState, useEffect } from "react";
import { Clock, Camera, RotateCcw, Play, Trash2, ChevronLeft, ChevronRight, Download, Upload, History, Pause, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface StateSnapshot {
  id: string;
  name: string;
  timestamp: Date;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  url: string;
  size: number;
}

export const TimeTravelDebugger = () => {
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<StateSnapshot | null>(null);
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [autoInterval, setAutoInterval] = useState(30);
  const [snapshotName, setSnapshotName] = useState('');

  // Load saved snapshots
  useEffect(() => {
    const saved = localStorage.getItem('defdev_time_travel_snapshots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSnapshots(parsed.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        })));
      } catch {}
    }
  }, []);

  // Save snapshots
  useEffect(() => {
    if (snapshots.length > 0) {
      localStorage.setItem('defdev_time_travel_snapshots', JSON.stringify(snapshots));
    }
  }, [snapshots]);

  // Auto capture
  useEffect(() => {
    if (!isAutoCapturing) return;

    const interval = setInterval(() => {
      captureSnapshot(`Auto-${new Date().toLocaleTimeString()}`);
    }, autoInterval * 1000);

    return () => clearInterval(interval);
  }, [isAutoCapturing, autoInterval]);

  const captureSnapshot = (name?: string) => {
    const localStorageData: Record<string, string> = {};
    const sessionStorageData: Record<string, string> = {};

    // Capture localStorage (excluding our own snapshots)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('defdev_time_travel')) {
        localStorageData[key] = localStorage.getItem(key) || '';
      }
    }

    // Capture sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        sessionStorageData[key] = sessionStorage.getItem(key) || '';
      }
    }

    const snapshot: StateSnapshot = {
      id: `snap-${Date.now()}`,
      name: name || snapshotName || `Snapshot ${snapshots.length + 1}`,
      timestamp: new Date(),
      localStorage: localStorageData,
      sessionStorage: sessionStorageData,
      url: window.location.href,
      size: JSON.stringify(localStorageData).length + JSON.stringify(sessionStorageData).length
    };

    setSnapshots(prev => [snapshot, ...prev].slice(0, 50));
    setSnapshotName('');
    toast.success(`Snapshot "${snapshot.name}" captured`);
  };

  const restoreSnapshot = (snapshot: StateSnapshot) => {
    // Clear current storage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('defdev_time_travel')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Restore localStorage
    Object.entries(snapshot.localStorage).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // Clear and restore sessionStorage
    sessionStorage.clear();
    Object.entries(snapshot.sessionStorage).forEach(([key, value]) => {
      sessionStorage.setItem(key, value);
    });

    toast.success(`Restored to "${snapshot.name}"`);
    
    // Optional: Reload to apply changes
    if (window.confirm('Reload page to fully apply restored state?')) {
      window.location.reload();
    }
  };

  const deleteSnapshot = (id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
    if (selectedSnapshot?.id === id) {
      setSelectedSnapshot(null);
    }
    toast.success('Snapshot deleted');
  };

  const exportSnapshots = () => {
    const data = JSON.stringify(snapshots, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `defdev-snapshots-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Snapshots exported');
  };

  const importSnapshots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setSnapshots(prev => [...imported.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        })), ...prev].slice(0, 50));
        toast.success(`Imported ${imported.length} snapshots`);
      } catch {
        toast.error('Failed to import snapshots');
      }
    };
    reader.readAsText(file);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
        <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
          <History className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold">Time Travel Debugger</h2>
          <p className="text-xs text-slate-500">{snapshots.length} snapshots saved</p>
        </div>
      </div>

      {/* Capture controls */}
      <div className="p-3 border-b border-slate-800 space-y-3 bg-slate-900/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Snapshot name (optional)"
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={() => captureSnapshot()}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm">Capture</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoCapturing(!isAutoCapturing)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              isAutoCapturing 
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isAutoCapturing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="text-xs">{isAutoCapturing ? 'Stop Auto' : 'Auto Capture'}</span>
          </button>

          {isAutoCapturing && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Every</span>
              <select
                value={autoInterval}
                onChange={(e) => setAutoInterval(Number(e.target.value))}
                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            </div>
          )}

          <div className="flex-1" />

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors">
            <Upload className="w-3 h-3" />
            <span className="text-xs">Import</span>
            <input type="file" className="hidden" accept=".json" onChange={importSnapshots} />
          </label>

          <button
            onClick={exportSnapshots}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <Download className="w-3 h-3" />
            <span className="text-xs">Export</span>
          </button>
        </div>
      </div>

      {/* Snapshots list */}
      <div className="flex-1 overflow-auto">
        {snapshots.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No snapshots yet</p>
            <p className="text-xs mt-1">Capture a snapshot to start time traveling</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {snapshots.map((snapshot, index) => (
              <div
                key={snapshot.id}
                className={`p-3 hover:bg-slate-800/30 cursor-pointer transition-colors ${
                  selectedSnapshot?.id === snapshot.id ? 'bg-cyan-500/10' : ''
                }`}
                onClick={() => setSelectedSnapshot(selectedSnapshot?.id === snapshot.id ? null : snapshot)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">
                    {snapshots.length - index}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-300 truncate">
                      {snapshot.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {snapshot.timestamp.toLocaleString()} • {formatBytes(snapshot.size)}
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); restoreSnapshot(snapshot); }}
                    className="p-2 hover:bg-amber-500/20 rounded transition-colors"
                    title="Restore this snapshot"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSnapshot(snapshot.id); }}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                {/* Expanded details */}
                {selectedSnapshot?.id === snapshot.id && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500">localStorage keys:</span>
                        <span className="ml-2 text-cyan-400">{Object.keys(snapshot.localStorage).length}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">sessionStorage keys:</span>
                        <span className="ml-2 text-purple-400">{Object.keys(snapshot.sessionStorage).length}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">URL:</span>
                      <span className="ml-2 text-slate-300 font-mono">{snapshot.url}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); restoreSnapshot(snapshot); }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore to this point
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="p-3 border-t border-slate-800 bg-amber-500/5">
        <div className="flex items-start gap-2 text-xs text-amber-400/70">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Restoring a snapshot will overwrite current storage. Some changes may require a page reload.</span>
        </div>
      </div>
    </div>
  );
};

export default TimeTravelDebugger;
