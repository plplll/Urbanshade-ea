import { useState, useEffect } from "react";
import { Database, RefreshCw, Search, Copy, Trash2, Eye, EyeOff, ChevronRight, ChevronDown, HardDrive, Layers } from "lucide-react";
import { toast } from "sonner";

interface StorageItem {
  key: string;
  value: string;
  size: number;
  type: 'string' | 'json' | 'number' | 'boolean';
  parsedValue?: any;
}

type StorageType = 'localStorage' | 'sessionStorage';

export const StateInspector = () => {
  const [activeStorage, setActiveStorage] = useState<StorageType>('localStorage');
  const [items, setItems] = useState<StorageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [showRaw, setShowRaw] = useState(false);

  const loadStorage = () => {
    const storage = activeStorage === 'localStorage' ? localStorage : sessionStorage;
    const loadedItems: StorageItem[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;
      
      const value = storage.getItem(key) || '';
      let type: StorageItem['type'] = 'string';
      let parsedValue: any = value;

      try {
        parsedValue = JSON.parse(value);
        type = 'json';
      } catch {
        if (!isNaN(Number(value))) {
          type = 'number';
          parsedValue = Number(value);
        } else if (value === 'true' || value === 'false') {
          type = 'boolean';
          parsedValue = value === 'true';
        }
      }

      loadedItems.push({
        key,
        value,
        size: new Blob([value]).size,
        type,
        parsedValue
      });
    }

    setItems(loadedItems.sort((a, b) => a.key.localeCompare(b.key)));
  };

  useEffect(() => {
    loadStorage();
  }, [activeStorage]);

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const copyValue = (item: StorageItem) => {
    navigator.clipboard.writeText(item.value);
    toast.success(`Copied "${item.key}" to clipboard`);
  };

  const deleteItem = (key: string) => {
    const storage = activeStorage === 'localStorage' ? localStorage : sessionStorage;
    storage.removeItem(key);
    loadStorage();
    toast.success(`Deleted "${key}"`);
  };

  const clearAll = () => {
    const storage = activeStorage === 'localStorage' ? localStorage : sessionStorage;
    storage.clear();
    loadStorage();
    toast.success(`Cleared all ${activeStorage}`);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getTypeColor = (type: StorageItem['type']) => {
    switch (type) {
      case 'json': return 'text-cyan-400';
      case 'number': return 'text-amber-400';
      case 'boolean': return 'text-purple-400';
      default: return 'text-green-400';
    }
  };

  const filteredItems = items.filter(item =>
    item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSize = items.reduce((acc, item) => acc + item.size, 0);

  const renderValue = (item: StorageItem) => {
    if (showRaw || item.type === 'string') {
      return (
        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all max-h-48 overflow-auto">
          {item.value}
        </pre>
      );
    }

    if (item.type === 'json' && typeof item.parsedValue === 'object') {
      return (
        <pre className="text-xs text-cyan-400 font-mono whitespace-pre-wrap break-all max-h-48 overflow-auto">
          {JSON.stringify(item.parsedValue, null, 2)}
        </pre>
      );
    }

    return (
      <span className={`text-sm font-mono ${getTypeColor(item.type)}`}>
        {String(item.parsedValue)}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
        <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
          <Database className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold">State Inspector</h2>
          <p className="text-xs text-slate-500">{items.length} items • {formatBytes(totalSize)}</p>
        </div>
        <button
          onClick={loadStorage}
          className="p-2 hover:bg-slate-800 rounded transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900/30">
        {/* Storage type tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveStorage('localStorage')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeStorage === 'localStorage'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <HardDrive className="w-3 h-3" />
            localStorage
          </button>
          <button
            onClick={() => setActiveStorage('sessionStorage')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeStorage === 'sessionStorage'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <Layers className="w-3 h-3" />
            sessionStorage
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowRaw(!showRaw)}
            className={`p-2 rounded border transition-colors ${
              showRaw ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={showRaw ? 'Show parsed' : 'Show raw'}
          >
            {showRaw ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={clearAll}
            className="p-2 rounded border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keys or values..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Database className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{searchQuery ? 'No matching items' : 'Storage is empty'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filteredItems.map(item => (
              <div key={item.key} className="hover:bg-slate-800/30">
                {/* Key row */}
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                  onClick={() => toggleExpand(item.key)}
                >
                  {item.type === 'json' && typeof item.parsedValue === 'object' ? (
                    expandedKeys.has(item.key) ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )
                  ) : (
                    <div className="w-4" />
                  )}
                  
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${getTypeColor(item.type)} bg-slate-800`}>
                    {item.type}
                  </span>
                  
                  <span className="flex-1 text-sm font-mono text-slate-300 truncate">
                    {item.key}
                  </span>
                  
                  <span className="text-xs text-slate-600 font-mono">
                    {formatBytes(item.size)}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); copyValue(item); }}
                    className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                    title="Copy value"
                  >
                    <Copy className="w-3 h-3 text-slate-500" />
                  </button>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.key); }}
                    className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>

                {/* Value row (expanded) */}
                {expandedKeys.has(item.key) && (
                  <div className="px-3 py-2 pl-10 bg-slate-900/50 border-t border-slate-800/50">
                    {renderValue(item)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-3 border-t border-slate-800 flex gap-6 text-xs text-slate-500 bg-slate-900/50">
        <span>Items: <span className="text-slate-400">{filteredItems.length}</span></span>
        <span>Total size: <span className="text-slate-400">{formatBytes(totalSize)}</span></span>
        <span className="text-cyan-400">JSON: {items.filter(i => i.type === 'json').length}</span>
        <span className="text-green-400">String: {items.filter(i => i.type === 'string').length}</span>
      </div>
    </div>
  );
};

export default StateInspector;
