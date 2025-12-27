import { useState, useEffect, useRef } from "react";
import { Wifi, Globe, ArrowDown, ArrowUp, Clock, Trash2, AlertTriangle, X, Pause, Play, Search, Zap } from "lucide-react";

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  duration: number;
  size: string;
  timestamp: Date;
  type: 'fetch' | 'xhr';
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  initiator?: string;
}

// Global interceptor state
let isIntercepting = false;
let requestQueue: NetworkRequest[] = [];
let requestListeners: ((req: NetworkRequest) => void)[] = [];

const originalFetch = window.fetch;
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

const interceptNetwork = () => {
  if (isIntercepting) return;
  isIntercepting = true;

  // Intercept fetch
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const startTime = performance.now();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    const method = init?.method || 'GET';
    const id = `fetch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const response = await originalFetch.call(this, input, init);
      const duration = Math.round(performance.now() - startTime);
      const clone = response.clone();
      
      let responseBody = '';
      let size = '0 B';
      try {
        const text = await clone.text();
        responseBody = text.slice(0, 5000);
        size = formatBytes(new Blob([text]).size);
      } catch {}

      const req: NetworkRequest = {
        id,
        url,
        method,
        status: response.status,
        duration,
        size,
        timestamp: new Date(),
        type: 'fetch',
        requestBody: init?.body?.toString(),
        responseBody,
        initiator: new Error().stack?.split('\n')[3]?.trim()
      };

      requestListeners.forEach(fn => fn(req));
      return response;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const req: NetworkRequest = {
        id,
        url,
        method,
        status: 0,
        duration,
        size: '0 B',
        timestamp: new Date(),
        type: 'fetch',
        initiator: new Error().stack?.split('\n')[3]?.trim()
      };
      requestListeners.forEach(fn => fn(req));
      throw error;
    }
  };

  // Intercept XHR
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL) {
    (this as any)._defdev = { method, url: url.toString(), startTime: 0 };
    return originalXHROpen.apply(this, arguments as any);
  };

  XMLHttpRequest.prototype.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
    const xhr = this;
    const meta = (xhr as any)._defdev;
    if (meta) {
      meta.startTime = performance.now();
      meta.requestBody = body?.toString();
    }

    xhr.addEventListener('loadend', function() {
      if (!meta) return;
      const duration = Math.round(performance.now() - meta.startTime);
      const id = `xhr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const req: NetworkRequest = {
        id,
        url: meta.url,
        method: meta.method,
        status: xhr.status,
        duration,
        size: formatBytes(xhr.responseText?.length || 0),
        timestamp: new Date(),
        type: 'xhr',
        requestBody: meta.requestBody,
        responseBody: xhr.responseText?.slice(0, 5000),
        initiator: new Error().stack?.split('\n')[3]?.trim()
      };

      requestListeners.forEach(fn => fn(req));
    });

    return originalXHRSend.apply(this, arguments as any);
  };
};

const stopIntercepting = () => {
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHROpen;
  XMLHttpRequest.prototype.send = originalXHRSend;
  isIntercepting = false;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const NetworkTab = () => {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'fetch' | 'xhr' | 'error'>('all');
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    interceptNetwork();
    
    const listener = (req: NetworkRequest) => {
      if (!pausedRef.current) {
        setRequests(prev => [req, ...prev].slice(0, 100));
      }
    };
    
    requestListeners.push(listener);
    
    return () => {
      requestListeners = requestListeners.filter(fn => fn !== listener);
      if (requestListeners.length === 0) {
        stopIntercepting();
      }
    };
  }, []);

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'all' || 
      (filter === 'error' ? r.status >= 400 || r.status === 0 : r.type === filter);
    const matchesSearch = !searchQuery || 
      r.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.method.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: number) => {
    if (status === 0) return 'text-red-400 bg-red-500/10';
    if (status >= 500) return 'text-red-400 bg-red-500/10';
    if (status >= 400) return 'text-amber-400 bg-amber-500/10';
    if (status >= 300) return 'text-blue-400 bg-blue-500/10';
    return 'text-green-400 bg-green-500/10';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-cyan-400';
      case 'POST': return 'text-green-400';
      case 'PUT': return 'text-amber-400';
      case 'DELETE': return 'text-red-400';
      case 'PATCH': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
        <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <Globe className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold">Network Inspector</h2>
          <p className="text-xs text-slate-500">{requests.length} requests • Real-time interception</p>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-green-500/10 border border-green-500/30">
          <Zap className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400">Live</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-3 border-b border-slate-800 flex items-center gap-2 flex-wrap bg-slate-900/30">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter requests..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {(['all', 'fetch', 'xhr', 'error'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {f === 'error' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Controls */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`p-2 rounded border transition-colors ${
            isPaused 
              ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setRequests([])}
          className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
          title="Clear"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Request list */}
      <div className="flex-1 overflow-auto">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Wifi className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Waiting for network requests...</p>
            <p className="text-xs mt-1 text-slate-600">Real fetch/XHR requests will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(selectedRequest?.id === req.id ? null : req)}
                className={`p-3 cursor-pointer transition-colors ${
                  selectedRequest?.id === req.id
                    ? 'bg-cyan-500/10'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold w-12 ${getMethodColor(req.method)}`}>
                    {req.method}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${getStatusColor(req.status)}`}>
                    {req.status || 'ERR'}
                  </span>
                  <span className="flex-1 text-sm text-slate-300 truncate font-mono">
                    {req.url}
                  </span>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {req.duration}ms
                  </span>
                  <span className="text-xs text-slate-500 font-mono w-16 text-right">
                    {req.size}
                  </span>
                </div>

                {/* Expanded details */}
                {selectedRequest?.id === req.id && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-slate-500">Type:</span>
                        <span className="ml-2 text-slate-300">{req.type.toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Time:</span>
                        <span className="ml-2 text-slate-300">{req.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Size:</span>
                        <span className="ml-2 text-slate-300">{req.size}</span>
                      </div>
                    </div>
                    
                    {req.initiator && (
                      <div>
                        <span className="text-slate-500">Initiator:</span>
                        <div className="mt-1 p-2 rounded bg-slate-900 font-mono text-slate-400 text-[10px] truncate">
                          {req.initiator}
                        </div>
                      </div>
                    )}

                    {req.responseBody && (
                      <div>
                        <span className="text-slate-500">Response Preview:</span>
                        <pre className="mt-1 p-2 rounded bg-slate-900 font-mono text-cyan-400 text-[10px] max-h-32 overflow-auto whitespace-pre-wrap">
                          {req.responseBody.slice(0, 1000)}
                          {req.responseBody.length > 1000 && '...'}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-3 border-t border-slate-800 grid grid-cols-4 gap-3 bg-slate-900/50">
        <div className="text-center">
          <ArrowDown className="w-4 h-4 mx-auto mb-1 text-green-400" />
          <div className="text-sm font-bold text-green-400">
            {requests.filter(r => r.status >= 200 && r.status < 400).length}
          </div>
          <div className="text-[10px] text-slate-500">Success</div>
        </div>
        <div className="text-center">
          <X className="w-4 h-4 mx-auto mb-1 text-red-400" />
          <div className="text-sm font-bold text-red-400">
            {requests.filter(r => r.status >= 400 || r.status === 0).length}
          </div>
          <div className="text-[10px] text-slate-500">Errors</div>
        </div>
        <div className="text-center">
          <Clock className="w-4 h-4 mx-auto mb-1 text-amber-400" />
          <div className="text-sm font-bold text-amber-400">
            {requests.length > 0 ? Math.round(requests.reduce((a, b) => a + b.duration, 0) / requests.length) : 0}ms
          </div>
          <div className="text-[10px] text-slate-500">Avg Time</div>
        </div>
        <div className="text-center">
          <ArrowUp className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
          <div className="text-sm font-bold text-cyan-400">{requests.length}</div>
          <div className="text-[10px] text-slate-500">Total</div>
        </div>
      </div>
    </div>
  );
};
