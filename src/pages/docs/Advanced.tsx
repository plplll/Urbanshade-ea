import { ArrowLeft, Cpu, RotateCcw, Shield, Wrench, Lock, Skull, Bug, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Advanced = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Advanced Features</h1>
          <Link 
            to="/docs" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Docs
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="text-center space-y-4">
          <Wrench className="w-16 h-16 mx-auto text-primary" />
          <h2 className="text-4xl font-bold">Power User Territory</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Welcome to the advanced section. Here be dragons. And by dragons, 
            we mean system-level features that can really mess things up. In a fun way!
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-primary" />
            <h3 className="text-2xl font-bold">BIOS Access</h3>
          </div>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <kbd className="px-4 py-2 bg-black/60 rounded border border-white/20 font-mono">DEL</kbd>
              <span className="text-muted-foreground">Press during boot sequence</span>
            </div>
            <p className="text-muted-foreground">
              The BIOS (Basic Input/Output System) lets you configure low-level system settings. 
              It looks like those blue screens from the 90s because nostalgia is real.
            </p>
            <div className="space-y-2">
              <h4 className="font-bold">What you can do in BIOS:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• View system information (fake hardware specs!)</li>
                <li>• Configure boot order (does nothing, but feels important)</li>
                <li>• Set a BIOS password (another password to forget)</li>
                <li>• Toggle various hardware options</li>
                <li>• Feel like a system administrator</li>
              </ul>
            </div>
            <div className="p-3 rounded bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-sm text-yellow-500">
                <span className="font-bold">⚡ Pro tip:</span> You need to press DEL at the right moment 
                during boot. Watch for the prompt!
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-primary" />
            <h3 className="text-2xl font-bold">Recovery Mode</h3>
          </div>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <kbd className="px-4 py-2 bg-black/60 rounded border border-white/20 font-mono">F2</kbd>
              <span className="text-muted-foreground">Press during boot sequence</span>
            </div>
            <p className="text-muted-foreground">
              Recovery Mode is your safety net. Forgot your password? System acting weird? 
              This is where you go to fix things (or make them worse, no judgment).
            </p>
            <div className="space-y-2">
              <h4 className="font-bold">Recovery Options:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Reset Password</strong> - For when "password123" didn't work</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>System Repair</strong> - Fix corrupted settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Factory Reset</strong> - Nuclear option. Deletes everything.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Boot Logs</strong> - See what went wrong</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h3 className="text-2xl font-bold">Admin Panel</h3>
          </div>
          <div className="p-6 rounded-lg bg-primary/10 border border-primary/30 space-y-4">
            <p className="text-muted-foreground">
              The Admin Panel gives you godlike control over the system. 
              With great power comes great potential for chaos. And by chaos, we mean glorious, 
              rainbow-colored, glitch-filled chaos.
            </p>
            <div className="space-y-2">
              <h4 className="font-bold text-primary">How to access:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• Type <code className="bg-black/50 px-2 py-0.5 rounded">secret</code> in the Terminal</li>
                <li>• Or use the browser console: <code className="bg-black/50 px-2 py-0.5 rounded">adminPanel()</code></li>
                <li>• Or find the password hidden in the HTML source (good luck!)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-primary">What you can do:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• Apply visual effects (rainbow mode, glitch mode, matrix mode, etc.)</li>
                <li>• Modify system behavior (rotate, shake, blur everything)</li>
                <li>• Disable security features (at your own risk)</li>
                <li>• Create custom crash screens (for... reasons)</li>
                <li>• Trigger random chaos events</li>
                <li>• Break things in creative and reversible ways</li>
              </ul>
            </div>
            <div className="p-3 rounded bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-sm text-yellow-500">
                <span className="font-bold">📖 Want the full guide?</span> Check out the{" "}
                <Link to="/docs/admin-panel" className="underline hover:text-yellow-400">
                  Admin Panel documentation
                </Link>
                {" "}for detailed instructions and creative chaos ideas.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Bug className="w-8 h-8 text-amber-400" />
            <h3 className="text-2xl font-bold">DEF-DEV Console</h3>
          </div>
          <div className="p-6 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-4">
            <p className="text-muted-foreground">
              DEF-DEV (Developer Environment Framework) is the ultimate debugging tool for UrbanShade OS. 
              It provides real-time system monitoring, storage inspection, and remote command execution.
            </p>
            <div className="space-y-2">
              <h4 className="font-bold text-amber-400">How to access:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• Enable Developer Mode in Settings → Developer Options</li>
                <li>• Navigate to <code className="bg-black/50 px-2 py-0.5 rounded">/def-dev</code></li>
                <li>• Or open from crash screen's "Debug Error" button</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-amber-400">Key Features:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• <strong>Console Tab</strong> - Real-time log capture with error simplification</li>
                <li>• <strong>Actions Tab</strong> - Monitor all system events with persistence</li>
                <li>• <strong>Storage Tab</strong> - Inspect and edit localStorage entries</li>
                <li>• <strong>Terminal</strong> - Execute commands on the main OS remotely</li>
                <li>• <strong>Recovery Images</strong> - Create and restore system snapshots</li>
                <li>• <strong>Bugchecks</strong> - View crash history and analyze errors</li>
              </ul>
            </div>
            <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-400">
                <span className="font-bold">📖 Full documentation:</span> Check out the{" "}
                <Link to="/docs/def-dev" className="underline hover:text-amber-300">
                  DEF-DEV documentation
                </Link>
                {" "}for comprehensive guides on all features.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-cyan-400" />
            <h3 className="text-2xl font-bold">SystemBus API</h3>
          </div>
          <div className="p-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 space-y-4">
            <p className="text-muted-foreground">
              The SystemBus is an internal event system that allows components to communicate 
              and trigger system-wide events without direct dependencies.
            </p>
            <div className="space-y-2">
              <h4 className="font-bold text-cyan-400">Available Events:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• <code className="bg-black/50 px-1 rounded">TRIGGER_CRASH</code> - Trigger a crash screen</li>
                <li>• <code className="bg-black/50 px-1 rounded">TRIGGER_REBOOT</code> - Initiate system reboot</li>
                <li>• <code className="bg-black/50 px-1 rounded">TRIGGER_SHUTDOWN</code> - Initiate shutdown</li>
                <li>• <code className="bg-black/50 px-1 rounded">ENTER_RECOVERY</code> - Enter recovery mode</li>
                <li>• <code className="bg-black/50 px-1 rounded">OPEN_DEV_MODE</code> - Open DEF-DEV console</li>
              </ul>
            </div>
            <p className="text-xs text-cyan-400">
              Access via browser console: <code className="bg-black/50 px-2 py-0.5 rounded">window.systemBus</code>
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Lock className="w-8 h-8 text-yellow-500" />
            <h3 className="text-2xl font-bold">System States</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <h4 className="font-bold text-yellow-500 mb-2">⚙️ Maintenance Mode</h4>
              <p className="text-sm text-muted-foreground">
                System maintenance state. Limited access while "updates" are happening. 
                Good for dramatic effect when you need a break.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <h4 className="font-bold text-destructive mb-2">🔐 Lockdown Mode</h4>
              <p className="text-sm text-muted-foreground">
                Emergency lockdown! System access restricted. Usually triggered when 
                something has gone very wrong. Or right, depending on your perspective.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <h4 className="font-bold text-blue-500 mb-2">🔄 Update Mode</h4>
              <p className="text-sm text-muted-foreground">
                System updates in progress. Watch the progress bar. 
                Marvel at the fake file names scrolling by.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <h4 className="font-bold text-red-500 mb-2">💥 Crash Screen</h4>
              <p className="text-sm text-muted-foreground">
                The dreaded blue screen of death... or in our case, a dramatic crash screen. 
                Don't worry, just refresh the page!
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Skull className="w-8 h-8 text-destructive" />
            <h3 className="text-2xl font-bold">Danger Zone</h3>
          </div>
          <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/30 space-y-4">
            <p className="text-muted-foreground">
              These actions can significantly affect your simulated facility. 
              Use with caution... or reckless abandon. Your call.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold">•</span>
                <span className="text-muted-foreground">
                  <strong>Factory Reset</strong> - Wipes all data and starts fresh
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold">•</span>
                <span className="text-muted-foreground">
                  <strong>Disable All Security</strong> - What could go wrong?
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive font-bold">•</span>
                <span className="text-muted-foreground">
                  <strong>Trigger Containment Breach</strong> - For testing purposes only
                </span>
              </li>
            </ul>
            <p className="text-xs text-destructive italic">
              * No actual files will be harmed. This is all localStorage. Relax.
            </p>
          </div>
        </section>

        <div className="flex justify-between pt-8 border-t border-white/10">
          <Link to="/docs/admin-panel" className="text-primary hover:underline">← Admin Panel</Link>
          <Link to="/docs/shortcuts" className="text-primary hover:underline">Keyboard Shortcuts →</Link>
        </div>
      </main>
    </div>
  );
};

export default Advanced;
