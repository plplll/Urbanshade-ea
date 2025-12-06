import { ArrowLeft, Code, Zap, Activity, Terminal, ExternalLink, ChevronRight, Info, Radio, Send, Database, Shield, Cpu } from "lucide-react";
import { Link } from "react-router-dom";

const DefDevAPI = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-amber-400">API Reference</h1>
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
            <Code className="w-10 h-10 text-amber-400" />
            <h2 className="text-4xl font-bold text-amber-400">API Reference</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Complete technical documentation for UrbanShade OS internal APIs: Action Dispatcher, Command Queue, and System Bus.
          </p>
          <div className="flex gap-3 flex-wrap">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">Action Dispatcher</span>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">Command Queue</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">System Bus</span>
          </div>
        </section>

        {/* Overview */}
        <section className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-400 mb-2">API Architecture Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                UrbanShade OS uses a layered API architecture for communication between components. The <strong className="text-amber-300">Action Dispatcher</strong> handles 
                event logging and persistence. The <strong className="text-cyan-300">Command Queue</strong> enables cross-page communication between DEF-DEV and the main OS. 
                The <strong className="text-green-300">System Bus</strong> provides real-time publish/subscribe for same-page component communication.
              </p>
            </div>
          </div>
        </section>

        {/* Action Dispatcher */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-400" />
            Action Dispatcher
          </h3>
          <div className="p-6 bg-black/40 border border-purple-500/30 rounded-xl space-y-6">
            <p className="text-muted-foreground">
              The Action Dispatcher is the central event bus for UrbanShade OS. It manages action logging, persistence to localStorage, 
              and subscriber notifications for system-wide event tracking.
            </p>
            
            <div className="space-y-4">
              <h4 className="font-bold text-foreground">Core Methods</h4>
              
              <div className="space-y-3">
                <div className="p-4 bg-black/60 rounded-lg border border-purple-500/20">
                  <code className="text-green-400 text-sm">dispatch(action: Action): void</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Dispatch an action to all subscribers. Automatically adds timestamp, ID, and persistence if enabled.
                  </p>
                  <pre className="text-xs text-slate-400 mt-3 bg-black/50 p-3 rounded overflow-x-auto">
{`actionDispatcher.dispatch({
  type: 'SYSTEM',
  action: 'boot_complete',
  details: { version: '2.2.0', mode: 'normal' }
});`}
                  </pre>
                </div>

                <div className="p-4 bg-black/60 rounded-lg border border-purple-500/20">
                  <code className="text-green-400 text-sm">subscribe(callback: (action) =&gt; void): () =&gt; void</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Subscribe to all action events. Returns an unsubscribe function for cleanup.
                  </p>
                  <pre className="text-xs text-slate-400 mt-3 bg-black/50 p-3 rounded overflow-x-auto">
{`const unsubscribe = actionDispatcher.subscribe((action) => {
  console.log('Action:', action.type, action.action);
});

// Later: unsubscribe();`}
                  </pre>
                </div>

                <div className="p-4 bg-black/60 rounded-lg border border-purple-500/20">
                  <code className="text-green-400 text-sm">setPersistence(enabled: boolean): void</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enable or disable action persistence to localStorage. When enabled, actions are saved to <code className="text-amber-400">def-dev-actions</code>.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-4 bg-black/60 rounded-lg border border-purple-500/20">
                    <code className="text-green-400 text-sm">loadFromStorage(): Action[]</code>
                    <p className="text-xs text-muted-foreground mt-2">Load persisted actions from localStorage.</p>
                  </div>
                  <div className="p-4 bg-black/60 rounded-lg border border-purple-500/20">
                    <code className="text-green-400 text-sm">clearStorage(): void</code>
                    <p className="text-xs text-muted-foreground mt-2">Clear all persisted actions.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Convenience Methods</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div className="p-3 bg-black/40 rounded flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                  <code className="text-purple-400">system(action, details?)</code>
                </div>
                <div className="p-3 bg-black/40 rounded flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                  <code className="text-purple-400">user(action, details?)</code>
                </div>
                <div className="p-3 bg-black/40 rounded flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                  <code className="text-purple-400">app(action, details?)</code>
                </div>
                <div className="p-3 bg-black/40 rounded flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                  <code className="text-purple-400">file(action, details?)</code>
                </div>
                <div className="p-3 bg-black/40 rounded flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                  <code className="text-purple-400">error(action, details?)</code>
                </div>
                <div className="p-3 bg-black/40 rounded flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                  <code className="text-purple-400">security(action, details?)</code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Command Queue */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2 flex items-center gap-2">
            <Send className="w-6 h-6 text-cyan-400" />
            Command Queue
          </h3>
          <div className="p-6 bg-black/40 border border-cyan-500/30 rounded-xl space-y-6">
            <p className="text-muted-foreground">
              The Command Queue enables <strong className="text-cyan-300">cross-page communication</strong> between DEF-DEV and the main OS. 
              Commands are stored in localStorage and polled by the main page for execution. This is how DEF-DEV triggers crashes, 
              bugchecks, reboots, and other system actions on the main OS instance.
            </p>
            
            <div className="space-y-4">
              <h4 className="font-bold text-foreground">Core Methods</h4>
              
              <div className="space-y-3">
                <div className="p-4 bg-black/60 rounded-lg border border-cyan-500/20">
                  <code className="text-green-400 text-sm">enqueue(command: QueuedCommand): void</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add a command to the queue for execution on the main OS page. Commands are timestamped and given unique IDs.
                  </p>
                  <pre className="text-xs text-slate-400 mt-3 bg-black/50 p-3 rounded overflow-x-auto">
{`commandQueue.enqueue({
  type: 'CRASH',
  payload: { type: 'KERNEL_PANIC', process: 'defdev.exe' },
  source: 'DEF-DEV Admin'
});`}
                  </pre>
                </div>

                <div className="p-4 bg-black/60 rounded-lg border border-cyan-500/20">
                  <code className="text-green-400 text-sm">dequeue(): QueuedCommand | null</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Get and remove the next pending command. Returns null if queue is empty.
                  </p>
                </div>

                <div className="p-4 bg-black/60 rounded-lg border border-cyan-500/20">
                  <code className="text-green-400 text-sm">onAny(callback: (cmd) =&gt; void): () =&gt; void</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Subscribe to all queued commands. The callback is invoked for each command as it's processed.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-4 bg-black/60 rounded-lg border border-cyan-500/20">
                    <code className="text-green-400 text-sm">startPolling(interval: number)</code>
                    <p className="text-xs text-muted-foreground mt-2">Start polling queue at interval (ms).</p>
                  </div>
                  <div className="p-4 bg-black/60 rounded-lg border border-cyan-500/20">
                    <code className="text-green-400 text-sm">stopPolling()</code>
                    <p className="text-xs text-muted-foreground mt-2">Stop polling the queue.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Command Types</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded">
                  <ChevronRight className="w-3 h-3 text-red-400" />
                  <code className="text-red-400">CRASH</code>
                  <span className="text-muted-foreground text-xs">- Trigger crash screen</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded">
                  <ChevronRight className="w-3 h-3 text-red-400" />
                  <code className="text-red-400">BUGCHECK</code>
                  <span className="text-muted-foreground text-xs">- Trigger bugcheck</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded">
                  <ChevronRight className="w-3 h-3 text-amber-400" />
                  <code className="text-amber-400">REBOOT</code>
                  <span className="text-muted-foreground text-xs">- System reboot</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded">
                  <ChevronRight className="w-3 h-3 text-amber-400" />
                  <code className="text-amber-400">SHUTDOWN</code>
                  <span className="text-muted-foreground text-xs">- System shutdown</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded">
                  <ChevronRight className="w-3 h-3 text-orange-400" />
                  <code className="text-orange-400">LOCKDOWN</code>
                  <span className="text-muted-foreground text-xs">- Facility lockdown</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded">
                  <ChevronRight className="w-3 h-3 text-blue-400" />
                  <code className="text-blue-400">RECOVERY</code>
                  <span className="text-muted-foreground text-xs">- Recovery mode</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded">
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                  <code className="text-purple-400">WRITE_STORAGE</code>
                  <span className="text-muted-foreground text-xs">- Write localStorage</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded">
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                  <code className="text-purple-400">DELETE_STORAGE</code>
                  <span className="text-muted-foreground text-xs">- Delete key</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded">
                  <ChevronRight className="w-3 h-3 text-green-400" />
                  <code className="text-green-400">TOAST</code>
                  <span className="text-muted-foreground text-xs">- Show notification</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/40 rounded">
                  <ChevronRight className="w-3 h-3 text-red-400" />
                  <code className="text-red-400">WIPE</code>
                  <span className="text-muted-foreground text-xs">- Factory reset</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Bus */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2 flex items-center gap-2">
            <Radio className="w-6 h-6 text-green-400" />
            System Bus
          </h3>
          <div className="p-6 bg-black/40 border border-green-500/30 rounded-xl space-y-6">
            <p className="text-muted-foreground">
              The System Bus provides a publish/subscribe mechanism for <strong className="text-green-300">real-time, same-page communication</strong> between OS components. 
              Unlike the Command Queue, events are processed immediately without localStorage intermediary.
            </p>
            
            <div className="space-y-4">
              <h4 className="font-bold text-foreground">Core Methods</h4>
              
              <div className="space-y-3">
                <div className="p-4 bg-black/60 rounded-lg border border-green-500/20">
                  <code className="text-green-400 text-sm">emit(type: SystemEventType, payload?: any): void</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Emit an event to all subscribers of that event type.
                  </p>
                  <pre className="text-xs text-slate-400 mt-3 bg-black/50 p-3 rounded overflow-x-auto">
{`systemBus.emit('TRIGGER_CRASH', { 
  crashType: 'KERNEL_PANIC', 
  process: 'example.exe' 
});`}
                  </pre>
                </div>

                <div className="p-4 bg-black/60 rounded-lg border border-green-500/20">
                  <code className="text-green-400 text-sm">on(type: SystemEventType, callback: (event) =&gt; void): () =&gt; void</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Subscribe to a specific event type. Returns an unsubscribe function.
                  </p>
                </div>

                <div className="p-4 bg-black/60 rounded-lg border border-green-500/20">
                  <code className="text-green-400 text-sm">onAny(callback: (event) =&gt; void): () =&gt; void</code>
                  <p className="text-sm text-muted-foreground mt-2">
                    Subscribe to all events regardless of type. Useful for logging or debugging.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Event Types</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-black/40 rounded"><code className="text-green-400">TRIGGER_CRASH</code></div>
                <div className="p-2 bg-black/40 rounded"><code className="text-green-400">TRIGGER_BUGCHECK</code></div>
                <div className="p-2 bg-black/40 rounded"><code className="text-green-400">TRIGGER_LOCKDOWN</code></div>
                <div className="p-2 bg-black/40 rounded"><code className="text-green-400">ENTER_RECOVERY</code></div>
                <div className="p-2 bg-black/40 rounded"><code className="text-green-400">TRIGGER_REBOOT</code></div>
                <div className="p-2 bg-black/40 rounded"><code className="text-green-400">TRIGGER_SHUTDOWN</code></div>
                <div className="p-2 bg-black/40 rounded"><code className="text-green-400">OPEN_DEV_MODE</code></div>
                <div className="p-2 bg-black/40 rounded"><code className="text-green-400">CLOSE_ADMIN_PANEL</code></div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Convenience Methods</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm font-mono">
                <div className="p-2 bg-black/40 rounded text-green-400">triggerCrash(type, process?)</div>
                <div className="p-2 bg-black/40 rounded text-green-400">triggerBugcheck(code, desc)</div>
                <div className="p-2 bg-black/40 rounded text-green-400">triggerLockdown(protocol)</div>
                <div className="p-2 bg-black/40 rounded text-green-400">enterRecovery()</div>
                <div className="p-2 bg-black/40 rounded text-green-400">triggerReboot()</div>
                <div className="p-2 bg-black/40 rounded text-green-400">triggerShutdown()</div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Access */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-white/10 pb-2 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-400" />
            Global Access
          </h3>
          <div className="p-6 bg-black/40 border border-amber-500/30 rounded-xl space-y-4">
            <p className="text-muted-foreground">
              All APIs are exposed globally on the <code className="text-amber-400">window</code> object for debugging:
            </p>
            <div className="grid md:grid-cols-3 gap-3 font-mono text-sm">
              <div className="p-3 bg-black/60 rounded-lg text-center">
                <code className="text-amber-400">window.actionDispatcher</code>
              </div>
              <div className="p-3 bg-black/60 rounded-lg text-center">
                <code className="text-amber-400">window.commandQueue</code>
              </div>
              <div className="p-3 bg-black/60 rounded-lg text-center">
                <code className="text-amber-400">window.systemBus</code>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Open browser DevTools console and type these to interact with the APIs directly.
            </p>
          </div>
        </section>

        {/* Navigation */}
        <section className="flex flex-wrap gap-4 pt-8 border-t border-white/10">
          <Link
            to="/docs/def-dev/bugchecks"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bugchecks
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

export default DefDevAPI;