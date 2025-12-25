import { Cloud, RefreshCw, Database, User, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SupabaseTab = () => {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tables, setTables] = useState<string[]>(['profiles', 'messages', 'site_status', 'user_roles', 'uur_submissions', 'synced_settings', 'moderation_actions']);

  useEffect(() => {
    checkConnection();
    checkAuth();
  }, []);

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('site_status').select('id').limit(1);
      setConnected(!error);
    } catch { setConnected(false); }
  };

  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      {/* Connection Status */}
      <div className={`p-4 rounded-lg border-2 ${connected ? 'bg-green-500/10 border-green-500/40' : connected === false ? 'bg-red-500/10 border-red-500/40' : 'bg-slate-800 border-slate-700'}`}>
        <div className="flex items-center gap-3">
          <Cloud className={`w-6 h-6 ${connected ? 'text-green-400' : 'text-red-400'}`} />
          <div>
            <h3 className="font-bold">Supabase Connection</h3>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              {connected === null ? 'Checking...' : connected ? (
                <><CheckCircle className="w-4 h-4 text-green-400" /> Connected</>
              ) : (
                <><XCircle className="w-4 h-4 text-red-400" /> Disconnected</>
              )}
            </p>
          </div>
          <button onClick={checkConnection} className="ml-auto p-2 hover:bg-white/10 rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Auth Status */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <User className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold">Authentication</h3>
        </div>
        {user ? (
          <div className="text-sm space-y-1">
            <p><span className="text-slate-500">Email:</span> {user.email}</p>
            <p><span className="text-slate-500">ID:</span> <span className="font-mono text-xs">{user.id}</span></p>
            <p><span className="text-slate-500">Role:</span> {user.role}</p>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Not authenticated</p>
        )}
      </div>

      {/* Tables */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Database className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold">Database Tables</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tables.map(table => (
            <div key={table} className="p-2 bg-slate-900 border border-slate-700 rounded text-sm font-mono text-emerald-400">
              {table}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupabaseTab;
