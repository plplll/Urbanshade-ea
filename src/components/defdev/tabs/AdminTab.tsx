import { Skull, Zap, RefreshCw, Power, Lock, HardDrive, AlertTriangle, Trash2 } from "lucide-react";
import { commandQueue } from "@/lib/commandQueue";
import { toast } from "sonner";

const AdminTab = () => {
  const crashTypes = [
    { name: "KERNEL_PANIC", color: "red" },
    { name: "CRITICAL_PROCESS_DIED", color: "red" },
    { name: "MEMORY_MANAGEMENT", color: "orange" },
    { name: "SYSTEM_SERVICE_EXCEPTION", color: "orange" },
  ];

  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      {/* Crash Triggers */}
      <div className="p-4 bg-red-500/5 border border-red-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-red-400" />
          <h3 className="font-bold text-red-400">Crash Triggers</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {crashTypes.map(crash => (
            <button
              key={crash.name}
              onClick={() => { commandQueue.queueCrash(crash.name); toast.success(`Queued: ${crash.name}`); }}
              className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 rounded-lg text-sm text-red-400 transition-colors"
            >
              {crash.name}
            </button>
          ))}
        </div>
      </div>

      {/* System Controls */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <h3 className="font-bold text-amber-400 mb-4">System Controls</h3>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => { commandQueue.queueReboot(); toast.success('Reboot queued'); }} className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 rounded-lg text-sm text-blue-400 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Reboot
          </button>
          <button onClick={() => { commandQueue.queueShutdown(); toast.success('Shutdown queued'); }} className="p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 rounded-lg text-sm text-purple-400 flex items-center gap-2">
            <Power className="w-4 h-4" /> Shutdown
          </button>
          <button onClick={() => { commandQueue.queueLockdown('ALPHA'); toast.success('Lockdown queued'); }} className="p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/40 rounded-lg text-sm text-orange-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Lockdown
          </button>
          <button onClick={() => { commandQueue.queueRecovery(); toast.success('Recovery queued'); }} className="p-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-sm text-cyan-400 flex items-center gap-2">
            <HardDrive className="w-4 h-4" /> Recovery
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-4 bg-red-500/10 border-2 border-red-500/40 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="font-bold text-red-400">Danger Zone</h3>
        </div>
        <button
          onClick={() => { if(confirm('WIPE ALL DATA?')) { commandQueue.queueWipe(); toast.error('Wipe queued'); }}}
          className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Wipe System Data
        </button>
      </div>
    </div>
  );
};

export default AdminTab;
