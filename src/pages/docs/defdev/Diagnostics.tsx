import { ArrowLeft, Activity, Cpu, HardDrive, Gauge, Wifi, Clock, MemoryStick, ExternalLink, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const DefDevDiagnostics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-amber-400">Diagnostics Tool</h1>
            <span className="text-xs text-muted-foreground">/ DEF-DEV Documentation</span>
          </div>
          <Link 
            to="/docs/def-dev" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to DEF-DEV
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Title */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Activity className="w-10 h-10 text-green-400" />
            <h2 className="text-4xl font-bold text-amber-400">Diagnostics Tool</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Real-time system health monitoring, performance metrics, and diagnostic utilities for UrbanShade OS.
          </p>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Real-Time</span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Performance</span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">Health Check</span>
          </div>
        </section>

        {/* Overview */}
        <section className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 text-green-400 mt-0.5" />
            <div>
              <h3 className="font-bold text-green-400 mb-2">What is the Diagnostics Tool?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Diagnostics Tool is a real-time system health monitor built into DEF-DEV. It provides insights into 
                localStorage usage, browser performance, memory consumption, and system state. Use it to identify issues, 
                monitor resource usage, and ensure optimal system operation.
              </p>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Available Metrics</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 bg-black/40 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="font-bold text-foreground">Storage Usage</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Total localStorage entries</li>
                <li>• Storage size in bytes/KB/MB</li>
                <li>• Largest entries by size</li>
                <li>• Quota usage percentage</li>
              </ul>
            </div>

            <div className="p-5 bg-black/40 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <MemoryStick className="w-5 h-5 text-purple-400" />
                </div>
                <h4 className="font-bold text-foreground">Memory Stats</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• JS heap size used</li>
                <li>• Total JS heap size</li>
                <li>• Heap limit</li>
                <li>• Memory pressure indicator</li>
              </ul>
            </div>

            <div className="p-5 bg-black/40 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-green-400" />
                </div>
                <h4 className="font-bold text-foreground">Performance</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Page load time</li>
                <li>• Time to interactive</li>
                <li>• DOM content loaded</li>
                <li>• Resource timing</li>
              </ul>
            </div>

            <div className="p-5 bg-black/40 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                </div>
                <h4 className="font-bold text-foreground">System State</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Active windows count</li>
                <li>• Registered event listeners</li>
                <li>• Console log count</li>
                <li>• Error count</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Health Checks */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Health Checks</h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-black/40 border border-green-500/30 rounded-xl flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <h4 className="font-bold text-green-400">Storage Integrity</h4>
                <p className="text-sm text-muted-foreground">Validates all JSON entries in localStorage can be parsed</p>
              </div>
            </div>

            <div className="p-4 bg-black/40 border border-green-500/30 rounded-xl flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <h4 className="font-bold text-green-400">Admin Account Valid</h4>
                <p className="text-sm text-muted-foreground">Checks admin account exists and has required fields</p>
              </div>
            </div>

            <div className="p-4 bg-black/40 border border-green-500/30 rounded-xl flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <h4 className="font-bold text-green-400">Settings Schema</h4>
                <p className="text-sm text-muted-foreground">Validates system settings match expected schema</p>
              </div>
            </div>

            <div className="p-4 bg-black/40 border border-amber-500/30 rounded-xl flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <div>
                <h4 className="font-bold text-amber-400">Storage Quota</h4>
                <p className="text-sm text-muted-foreground">Warns if localStorage usage exceeds 80% of quota</p>
              </div>
            </div>

            <div className="p-4 bg-black/40 border border-amber-500/30 rounded-xl flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <div>
                <h4 className="font-bold text-amber-400">Memory Pressure</h4>
                <p className="text-sm text-muted-foreground">Alerts if JS heap usage is critically high</p>
              </div>
            </div>
          </div>
        </section>

        {/* Terminal Commands */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Terminal Commands</h3>
          <div className="p-6 bg-black/60 border border-white/10 rounded-xl font-mono text-sm space-y-2">
            <p><span className="text-green-400">$</span> diag <span className="text-gray-500"># Run full diagnostics</span></p>
            <p><span className="text-green-400">$</span> diag storage <span className="text-gray-500"># Storage diagnostics only</span></p>
            <p><span className="text-green-400">$</span> diag memory <span className="text-gray-500"># Memory diagnostics only</span></p>
            <p><span className="text-green-400">$</span> diag health <span className="text-gray-500"># Run health checks</span></p>
            <p><span className="text-green-400">$</span> diag export <span className="text-gray-500"># Export diagnostic report</span></p>
          </div>
        </section>

        {/* Accessing Diagnostics */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2">Accessing Diagnostics</h3>
          <div className="p-6 bg-black/40 border border-white/10 rounded-xl">
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-amber-500/20 rounded text-center text-xs leading-6 text-amber-400 flex-shrink-0">1</span>
                <span>Navigate to <code className="px-1.5 py-0.5 bg-black/50 rounded text-amber-400">/def-dev</code></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-amber-500/20 rounded text-center text-xs leading-6 text-amber-400 flex-shrink-0">2</span>
                <span>Click the "Diagnostics" tab in the navigation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-amber-500/20 rounded text-center text-xs leading-6 text-amber-400 flex-shrink-0">3</span>
                <span>View real-time metrics and run health checks</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-amber-500/20 rounded text-center text-xs leading-6 text-amber-400 flex-shrink-0">4</span>
                <span>Use "Export Report" to save a diagnostic snapshot</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Navigation */}
        <section className="flex flex-wrap gap-4 pt-8 border-t border-white/10">
          <Link
            to="/docs/def-dev/api"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            API Reference
          </Link>
          <Link
            to="/docs/def-dev"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-sm text-amber-400 transition-colors ml-auto"
          >
            Back to Overview
            <ExternalLink className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
};

export default DefDevDiagnostics;