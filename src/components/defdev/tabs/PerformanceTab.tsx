import { useState, useEffect, useRef } from "react";
import { Cpu, HardDrive, Activity, Zap, Clock, TrendingUp, TrendingDown, MemoryStick, Layers, Timer } from "lucide-react";

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  jsHeapSize: number;
  jsHeapLimit: number;
  usedJSHeapSize: number;
  domNodes: number;
  layoutCount: number;
  renderTime: number;
}

interface PerformanceEntry {
  time: number;
  fps: number;
  memory: number;
  domNodes: number;
}

export const PerformanceTab = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    jsHeapSize: 0,
    jsHeapLimit: 0,
    usedJSHeapSize: 0,
    domNodes: 0,
    layoutCount: 0,
    renderTime: 0
  });

  const [history, setHistory] = useState<PerformanceEntry[]>([]);
  const [isRecording, setIsRecording] = useState(true);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number>(0);

  // Real performance monitoring
  useEffect(() => {
    if (!isRecording) return;

    let frameCount = 0;
    let lastSecond = performance.now();

    const measureFrame = (now: number) => {
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }
      
      frameCount++;

      // Update every second
      if (now - lastSecond >= 1000) {
        const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        const fps = Math.round(1000 / avgFrameTime);
        
        // Get memory info if available
        const memoryInfo = (performance as any).memory;
        const jsHeapSize = memoryInfo?.totalJSHeapSize || 0;
        const jsHeapLimit = memoryInfo?.jsHeapSizeLimit || 0;
        const usedJSHeapSize = memoryInfo?.usedJSHeapSize || 0;

        // DOM metrics
        const domNodes = document.querySelectorAll('*').length;

        // Get layout/paint metrics
        const entries = performance.getEntriesByType('measure');
        const layoutCount = entries.length;

        // Measure render time
        const renderStart = performance.now();
        requestAnimationFrame(() => {
          const renderTime = performance.now() - renderStart;
          
          setMetrics({
            fps,
            frameTime: avgFrameTime,
            jsHeapSize,
            jsHeapLimit,
            usedJSHeapSize,
            domNodes,
            layoutCount,
            renderTime
          });

          setHistory(prev => [...prev.slice(-59), {
            time: Date.now(),
            fps,
            memory: usedJSHeapSize / 1024 / 1024,
            domNodes
          }]);
        });

        frameCount = 0;
        lastSecond = now;
      }

      rafIdRef.current = requestAnimationFrame(measureFrame);
    };

    rafIdRef.current = requestAnimationFrame(measureFrame);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isRecording]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const memoryPercent = metrics.jsHeapLimit > 0 
    ? (metrics.usedJSHeapSize / metrics.jsHeapLimit) * 100 
    : 0;

  const MetricCard = ({ 
    label, 
    value, 
    unit,
    icon: Icon, 
    color = 'cyan',
    subValue
  }: { 
    label: string; 
    value: string | number; 
    unit?: string;
    icon: React.ElementType;
    color?: string;
    subValue?: string;
  }) => (
    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 text-${color}-400`} />
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-2xl font-mono font-bold text-${color}-400`}>
        {value}{unit && <span className="text-sm ml-1">{unit}</span>}
      </div>
      {subValue && <div className="text-xs text-slate-500 mt-1">{subValue}</div>}
    </div>
  );

  const MiniGraph = ({ data, dataKey, color = 'cyan', max }: { 
    data: PerformanceEntry[]; 
    dataKey: 'fps' | 'memory' | 'domNodes';
    color?: string;
    max?: number;
  }) => {
    if (data.length < 2) return <div className="h-16 flex items-center justify-center text-slate-600 text-xs">Collecting data...</div>;
    
    const values = data.map(d => d[dataKey]);
    const maxVal = max || Math.max(...values, 1);
    const minVal = Math.min(...values);
    
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - minVal) / (maxVal - minVal || 1)) * 80 - 10;
      return `${x},${y}`;
    }).join(' ');

    const gradientId = `grad-${dataKey}-${color}`;
    const colorVar = color === 'cyan' ? '#22d3ee' : color === 'purple' ? '#a855f7' : color === 'green' ? '#22c55e' : '#f59e0b';

    return (
      <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colorVar} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colorVar} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`url(#${gradientId})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={colorVar}
          strokeWidth="2"
          className="opacity-80"
        />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Performance Monitor</h2>
            <p className="text-xs text-slate-500">Real browser metrics via Performance API</p>
          </div>
        </div>
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
            isRecording 
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-xs font-medium">{isRecording ? 'Recording' : 'Paused'}</span>
        </button>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard 
          label="FPS" 
          value={metrics.fps} 
          icon={Zap} 
          color={metrics.fps >= 55 ? 'green' : metrics.fps >= 30 ? 'amber' : 'red'}
          subValue={`${metrics.frameTime.toFixed(1)}ms/frame`}
        />
        <MetricCard 
          label="Memory" 
          value={formatBytes(metrics.usedJSHeapSize)} 
          icon={MemoryStick} 
          color="purple"
          subValue={`${memoryPercent.toFixed(1)}% of limit`}
        />
        <MetricCard 
          label="DOM Nodes" 
          value={metrics.domNodes.toLocaleString()} 
          icon={Layers} 
          color="amber"
          subValue="Elements in document"
        />
        <MetricCard 
          label="Render" 
          value={metrics.renderTime.toFixed(1)} 
          unit="ms"
          icon={Timer} 
          color="cyan"
          subValue="Frame paint time"
        />
      </div>

      {/* FPS Graph */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-3 h-3" /> FPS History
          </span>
          <span className={`text-sm font-mono font-bold ${
            metrics.fps >= 55 ? 'text-green-400' : metrics.fps >= 30 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {metrics.fps} FPS
          </span>
        </div>
        <MiniGraph data={history} dataKey="fps" color={metrics.fps >= 55 ? 'green' : 'amber'} max={70} />
      </div>

      {/* Memory Graph */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <MemoryStick className="w-3 h-3" /> Memory Usage
          </span>
          <span className="text-sm font-mono font-bold text-purple-400">
            {formatBytes(metrics.usedJSHeapSize)}
          </span>
        </div>
        <MiniGraph data={history} dataKey="memory" color="purple" />
        {metrics.jsHeapLimit > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>0 MB</span>
              <span>{formatBytes(metrics.jsHeapLimit)}</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  memoryPercent > 80 ? 'bg-red-500' : memoryPercent > 60 ? 'bg-amber-500' : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(100, memoryPercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* DOM Nodes Graph */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3 h-3" /> DOM Complexity
          </span>
          <span className="text-sm font-mono font-bold text-amber-400">
            {metrics.domNodes.toLocaleString()} nodes
          </span>
        </div>
        <MiniGraph data={history} dataKey="domNodes" color="amber" />
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <Clock className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
          <div className="text-lg font-mono font-bold text-cyan-400">
            {(performance.now() / 1000).toFixed(0)}s
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Uptime</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          {metrics.fps >= 55 ? (
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 mx-auto mb-1 text-red-400" />
          )}
          <div className={`text-lg font-mono font-bold ${metrics.fps >= 55 ? 'text-green-400' : 'text-red-400'}`}>
            {metrics.fps >= 55 ? 'Smooth' : 'Laggy'}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Status</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <Activity className="w-4 h-4 mx-auto mb-1 text-purple-400" />
          <div className="text-lg font-mono font-bold text-purple-400">
            {history.length}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Samples</div>
        </div>
      </div>
    </div>
  );
};
