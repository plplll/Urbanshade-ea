import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Shield, Users, AlertTriangle, Ban, Clock, Search, RefreshCw, XCircle, 
  CheckCircle, Skull, FileText, PartyPopper, Activity, Save, Eye, Lock,
  Radio, Zap, Terminal, AlertOctagon, UserX, UserCheck, History,
  Settings, Database, Wifi, Globe, Server, ChevronDown, ChevronRight,
  TriangleAlert, ShieldAlert, ShieldCheck, Filter, Download, Trash2,
  MessageSquare, Bell, Volume2, VolumeX, Cpu, HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  role: string;
  clearance?: number;
  personnelRank?: "EXR-P" | "LR-P" | "MR-P" | "Staff" | "Security" | "Admin";
  isBanned: boolean;
  banInfo?: {
    action_type: string;
    reason: string;
    expires_at: string | null;
    is_fake: boolean;
  };
  warningsCount: number;
  warnings: Array<{ reason: string; created_at: string }>;
  created_at: string;
  lastActive?: string;
}

interface StatusEntry {
  id: string;
  status: string;
  message: string | null;
}

interface ActivityLog {
  id: string;
  type: "login" | "logout" | "action" | "warning" | "ban" | "system";
  user?: string;
  message: string;
  timestamp: Date;
}

const routeLabels: Record<string, string> = {
  'main': 'Main Site',
  'docs': 'Documentation',
  'def-dev': 'DefDev Mode',
  'entire-site': 'Entire Site (Global)'
};

const personnelRankColors: Record<string, string> = {
  "EXR-P": "text-orange-500 bg-orange-500/20 border-orange-500/30",
  "LR-P": "text-yellow-500 bg-yellow-500/20 border-yellow-500/30",
  "MR-P": "text-amber-400 bg-amber-400/20 border-amber-400/30",
  "Staff": "text-cyan-400 bg-cyan-400/20 border-cyan-400/30",
  "Security": "text-blue-500 bg-blue-500/20 border-blue-500/30",
  "Admin": "text-red-500 bg-red-500/20 border-red-500/30",
};

// Hadal Blacksite themed status card
const StatusCard = ({ status, onUpdate }: { status: StatusEntry; onUpdate: (id: string, status: string, message: string | null) => void }) => {
  const [editing, setEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(status.status);
  const [newMessage, setNewMessage] = useState(status.message || '');

  const handleSave = () => {
    onUpdate(status.id, newStatus, newMessage || null);
    setEditing(false);
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'online': return 'border-cyan-500/50 bg-gradient-to-br from-cyan-950/50 to-slate-950';
      case 'maintenance': return 'border-amber-500/50 bg-gradient-to-br from-amber-950/50 to-slate-950';
      case 'offline': return 'border-red-500/50 bg-gradient-to-br from-red-950/50 to-slate-950';
      default: return 'border-slate-700 bg-slate-900/50';
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'online': return <Wifi className="w-5 h-5 text-cyan-400" />;
      case 'maintenance': return <Settings className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />;
      case 'offline': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Globe className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className={`p-5 rounded-lg border-2 transition-all ${getStatusStyle(status.status)}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(status.status)}
          <div>
            <h4 className="font-bold text-lg font-mono">{routeLabels[status.id] || status.id}</h4>
            <span className="text-xs text-slate-500 font-mono">ZONE: {status.id.toUpperCase()}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded font-mono text-xs font-bold uppercase tracking-wider ${
          status.status === 'online' ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50' :
          status.status === 'maintenance' ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50' :
          'bg-red-500/30 text-red-400 border border-red-500/50'
        }`}>
          {status.status}
        </span>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-mono mb-1 block text-slate-400">STATUS</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="bg-slate-900/80 border-slate-700 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-mono mb-1 block text-slate-400">BROADCAST MESSAGE</label>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message to broadcast to users..."
              className="bg-slate-900/80 border-slate-700 font-mono"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="gap-1 bg-cyan-600 hover:bg-cyan-500">
              <Save className="w-3 h-3" /> Confirm
            </Button>
            <Button onClick={() => setEditing(false)} size="sm" variant="outline" className="border-slate-600">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {status.message && (
            <p className="text-sm mb-3 text-slate-400 font-mono border-l-2 border-slate-600 pl-3">{status.message}</p>
          )}
          <Button onClick={() => setEditing(true)} size="sm" variant="outline" className="border-slate-600 hover:bg-slate-800">
            <Settings className="w-3 h-3 mr-1" /> Configure
          </Button>
        </div>
      )}
    </div>
  );
};

// User details panel
const UserDetailsPanel = ({ user, onClose, onWarn, onBan, onUnban }: { 
  user: UserData; 
  onClose: () => void;
  onWarn: () => void;
  onBan: () => void;
  onUnban: () => void;
}) => {
  const rank = user.personnelRank || (user.role === 'admin' ? 'Admin' : 'Staff');
  
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-950 border-l-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/10 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-cyan-400">PERSONNEL FILE</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${personnelRankColors[rank]}`}>
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-lg">{user.display_name || user.username}</h3>
            <p className="text-sm text-slate-500 font-mono">@{user.username}</p>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono mt-1 border ${personnelRankColors[rank]}`}>
              {rank}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            {user.isBanned && (
              <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-mono flex items-center gap-1 border border-red-500/30">
                <Ban className="w-3 h-3" /> BANNED
                {user.banInfo?.is_fake && <PartyPopper className="w-3 h-3" />}
              </span>
            )}
            {user.warningsCount > 0 && (
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-mono flex items-center gap-1 border border-amber-500/30">
                <AlertTriangle className="w-3 h-3" /> {user.warningsCount} WARNINGS
              </span>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded bg-slate-900/50 border border-slate-800">
              <div className="text-xs text-slate-500 font-mono mb-1">CLEARANCE</div>
              <div className="font-bold text-cyan-400">LEVEL {user.clearance || 1}</div>
            </div>
            <div className="p-3 rounded bg-slate-900/50 border border-slate-800">
              <div className="text-xs text-slate-500 font-mono mb-1">USER ID</div>
              <div className="font-mono text-sm truncate">{user.user_id.slice(0, 8)}...</div>
            </div>
            <div className="p-3 rounded bg-slate-900/50 border border-slate-800 col-span-2">
              <div className="text-xs text-slate-500 font-mono mb-1">REGISTERED</div>
              <div className="font-mono text-sm">{new Date(user.created_at).toLocaleString()}</div>
            </div>
          </div>

          {/* Warnings history */}
          {user.warnings.length > 0 && (
            <div>
              <h4 className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" /> WARNING HISTORY
              </h4>
              <div className="space-y-2">
                {user.warnings.slice(0, 5).map((w, i) => (
                  <div key={i} className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-sm">
                    <p className="text-amber-300">{w.reason}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(w.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ban info */}
          {user.banInfo && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30">
              <h4 className="text-xs font-mono text-red-400 mb-2 flex items-center gap-2">
                <Ban className="w-3 h-3" /> BAN DETAILS
              </h4>
              <p className="text-sm text-red-300 mb-2">{user.banInfo.reason}</p>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Type: {user.banInfo.action_type}{user.banInfo.is_fake && ' (FAKE)'}</p>
                {user.banInfo.expires_at && <p>Expires: {new Date(user.banInfo.expires_at).toLocaleString()}</p>}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      {user.role !== 'admin' && (
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={onWarn}
              className="bg-amber-600 hover:bg-amber-500 gap-1"
            >
              <AlertTriangle className="w-4 h-4" /> Warn
            </Button>
            {user.isBanned ? (
              <Button 
                onClick={onUnban}
                className="bg-green-600 hover:bg-green-500 gap-1"
              >
                <CheckCircle className="w-4 h-4" /> Unban
              </Button>
            ) : (
              <Button 
                onClick={onBan}
                className="bg-red-600 hover:bg-red-500 gap-1"
              >
                <Ban className="w-4 h-4" /> Ban
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Live activity feed
const ActivityFeed = ({ activities }: { activities: ActivityLog[] }) => {
  const getActivityIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "login": return <UserCheck className="w-3 h-3 text-green-400" />;
      case "logout": return <UserX className="w-3 h-3 text-slate-400" />;
      case "warning": return <AlertTriangle className="w-3 h-3 text-amber-400" />;
      case "ban": return <Ban className="w-3 h-3 text-red-400" />;
      case "system": return <Terminal className="w-3 h-3 text-cyan-400" />;
      default: return <Activity className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-1 font-mono text-xs">
      {activities.map(act => (
        <div key={act.id} className="flex items-center gap-2 p-2 rounded bg-slate-900/50 border border-slate-800/50">
          {getActivityIcon(act.type)}
          <span className="flex-1 truncate">{act.message}</span>
          <span className="text-slate-600">{act.timestamp.toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  );
};

const ModerationPanel = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [logs, setLogs] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Status management
  const [statuses, setStatuses] = useState<StatusEntry[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Activity feed (simulated)
  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: "1", type: "system", message: "NAVI: Moderation panel accessed", timestamp: new Date() },
    { id: "2", type: "system", message: "NAVI: Security scan completed - no threats", timestamp: new Date(Date.now() - 60000) },
  ]);
  
  // Lockdown controls
  const [lockdownActive, setLockdownActive] = useState(false);
  const [lockdownZone, setLockdownZone] = useState<string>("all");
  
  // Action dialogs
  const [showWarnDialog, setShowWarnDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showLockdownDialog, setShowLockdownDialog] = useState(false);
  const [warnReason, setWarnReason] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<"1h" | "24h" | "7d" | "30d" | "perm">("24h");
  const [isFakeBan, setIsFakeBan] = useState(false);

  // Check admin status and fetch data
  useEffect(() => {
    const checkAdminAndFetch = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Please log in first");
          navigate("/");
          return;
        }

        const response = await supabase.functions.invoke('admin-actions', {
          method: 'GET'
        });

        if (response.error) {
          if (response.error.message?.includes('403') || response.error.message?.includes('Access denied')) {
            toast.error("Access denied - Admin only");
            navigate("/");
            return;
          }
          throw response.error;
        }

        setIsAdmin(true);
        setUsers(response.data.users || []);
        
        // Add activity
        setActivities(prev => [{
          id: Date.now().toString(),
          type: "system",
          message: `Admin authenticated - ${response.data.users?.length || 0} users loaded`,
          timestamp: new Date()
        }, ...prev]);
        
      } catch (error: any) {
        console.error("Admin check error:", error);
        toast.error("Access denied");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await supabase.functions.invoke('admin-actions', { method: 'GET' });
      if (response.data?.users) {
        setUsers(response.data.users);
        setActivities(prev => [{
          id: Date.now().toString(),
          type: "system",
          message: "User data refreshed",
          timestamp: new Date()
        }, ...prev]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await supabase.functions.invoke('admin-actions/logs', { method: 'GET' });
      if (response.data?.logs) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error("Fetch logs error:", error);
    }
  };

  const fetchStatuses = async () => {
    setStatusLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_status')
        .select('id, status, message')
        .order('id');
      
      if (error) throw error;
      setStatuses(data || []);
    } catch (error) {
      console.error("Fetch status error:", error);
      toast.error("Failed to fetch site status");
    } finally {
      setStatusLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, message: string | null) => {
    try {
      const { error } = await supabase
        .from('site_status')
        .update({ status, message, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Zone ${id} status updated`);
      setActivities(prev => [{
        id: Date.now().toString(),
        type: "system",
        message: `Zone ${id} set to ${status.toUpperCase()}`,
        timestamp: new Date()
      }, ...prev]);
      fetchStatuses();
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Failed to update status");
    }
  };

  const handleWarn = async () => {
    if (!selectedUser || !warnReason) return;
    
    try {
      const response = await supabase.functions.invoke('admin-actions/warn', {
        method: 'POST',
        body: { targetUserId: selectedUser.user_id, reason: warnReason }
      });

      if (response.error) throw response.error;
      
      toast.success(`Warning issued to ${selectedUser.username}`);
      setActivities(prev => [{
        id: Date.now().toString(),
        type: "warning",
        user: selectedUser.username,
        message: `Warning issued to @${selectedUser.username}: ${warnReason}`,
        timestamp: new Date()
      }, ...prev]);
      setShowWarnDialog(false);
      setWarnReason("");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to issue warning");
    }
  };

  const handleBan = async () => {
    if (!selectedUser || !banReason) return;
    
    try {
      const response = await supabase.functions.invoke('admin-actions/ban', {
        method: 'POST',
        body: { 
          targetUserId: selectedUser.user_id, 
          reason: banReason,
          duration: banDuration !== 'perm' ? banDuration : null,
          isPermanent: banDuration === 'perm',
          isFake: isFakeBan
        }
      });

      if (response.error) throw response.error;
      
      toast.success(`${isFakeBan ? 'Fake ban' : 'Ban'} issued to ${selectedUser.username}`);
      setActivities(prev => [{
        id: Date.now().toString(),
        type: "ban",
        user: selectedUser.username,
        message: `${isFakeBan ? 'FAKE BAN' : 'BAN'}: @${selectedUser.username} - ${banReason}`,
        timestamp: new Date()
      }, ...prev]);
      setShowBanDialog(false);
      setBanReason("");
      setIsFakeBan(false);
      setShowUserDetails(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to ban user");
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      const response = await supabase.functions.invoke('admin-actions/unban', {
        method: 'POST',
        body: { targetUserId: userId }
      });

      if (response.error) throw response.error;
      
      const user = users.find(u => u.user_id === userId);
      toast.success("User unbanned");
      setActivities(prev => [{
        id: Date.now().toString(),
        type: "system",
        message: `Unban: @${user?.username || 'Unknown'}`,
        timestamp: new Date()
      }, ...prev]);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to unban user");
    }
  };

  const handleLockdown = () => {
    setLockdownActive(true);
    setShowLockdownDialog(false);
    toast.success(`Lockdown initiated for zone: ${lockdownZone}`);
    setActivities(prev => [{
      id: Date.now().toString(),
      type: "system",
      message: `🚨 LOCKDOWN INITIATED - Zone: ${lockdownZone.toUpperCase()}`,
      timestamp: new Date()
    }, ...prev]);
  };

  const handleLiftLockdown = () => {
    setLockdownActive(false);
    toast.success("Lockdown lifted");
    setActivities(prev => [{
      id: Date.now().toString(),
      type: "system",
      message: "Lockdown lifted - normal operations resumed",
      timestamp: new Date()
    }, ...prev]);
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "banned" && u.isBanned) ||
      (filterStatus === "active" && !u.isBanned) ||
      (filterStatus === "warned" && u.warningsCount > 0);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Cpu className="w-16 h-16 text-cyan-500 mx-auto mb-4 animate-pulse" />
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
          </div>
          <p className="text-cyan-400 font-mono text-sm">NAVI: Verifying credentials...</p>
          <p className="text-slate-600 font-mono text-xs mt-2">Accessing Hadal Blacksite Control</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-500 mb-2 font-mono">ACCESS DENIED</h1>
          <p className="text-slate-400 font-mono text-sm">Clearance level insufficient</p>
          <p className="text-slate-600 font-mono text-xs mt-2">This incident has been logged</p>
          <Button onClick={() => navigate("/")} className="mt-6 bg-slate-800 hover:bg-slate-700">
            Return to Surface
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0a0f1a] to-slate-950 text-foreground">
      {/* Hadal Blacksite Header */}
      <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500/20 to-slate-900 border-2 border-cyan-500/40 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-cyan-400" />
                </div>
                {lockdownActive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-cyan-400 font-mono tracking-wider">HADAL BLACKSITE</h1>
                <p className="text-xs text-slate-500 font-mono">MODERATION CONTROL CENTER</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Lockdown Status */}
              {lockdownActive ? (
                <Button 
                  onClick={handleLiftLockdown}
                  className="bg-red-600 hover:bg-red-500 gap-2 animate-pulse"
                >
                  <Lock className="w-4 h-4" /> LOCKDOWN ACTIVE
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowLockdownDialog(true)}
                  variant="outline" 
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2"
                >
                  <AlertOctagon className="w-4 h-4" /> Initiate Lockdown
                </Button>
              )}
              
              <Button variant="outline" onClick={fetchUsers} className="gap-2 border-slate-700">
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
              <Button variant="ghost" onClick={() => navigate("/")} className="text-slate-400">
                <XCircle className="w-4 h-4 mr-1" /> Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6 flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-900/50 border border-slate-800 p-1 mb-6">
              <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Users className="w-4 h-4" /> Personnel ({users.length})
              </TabsTrigger>
              <TabsTrigger value="logs" onClick={() => fetchLogs()} className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <FileText className="w-4 h-4" /> Logs
              </TabsTrigger>
              <TabsTrigger value="status" onClick={() => fetchStatuses()} className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Server className="w-4 h-4" /> Zone Control
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <ShieldCheck className="w-4 h-4" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="m-0">
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search personnel..."
                    className="pl-10 bg-slate-900/50 border-slate-700 font-mono"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="warned">With Warnings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-2xl font-bold text-cyan-400 font-mono">{users.length}</div>
                      <div className="text-xs text-slate-500 font-mono">TOTAL</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Ban className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-2xl font-bold text-red-400 font-mono">{users.filter(u => u.isBanned).length}</div>
                      <div className="text-xs text-slate-500 font-mono">BANNED</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-2xl font-bold text-amber-400 font-mono">{users.reduce((acc, u) => acc + u.warningsCount, 0)}</div>
                      <div className="text-xs text-slate-500 font-mono">WARNINGS</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400 font-mono">{users.filter(u => !u.isBanned && u.warningsCount === 0).length}</div>
                      <div className="text-xs text-slate-500 font-mono">CLEAN</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-purple-400 font-mono">{users.filter(u => u.role === 'admin').length}</div>
                      <div className="text-xs text-slate-500 font-mono">ADMINS</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User List */}
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => { setSelectedUser(user); setShowUserDetails(true); }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                      user.isBanned 
                        ? 'bg-gradient-to-r from-red-950/30 to-slate-950 border-red-500/30 hover:border-red-500/50' 
                        : user.warningsCount > 0
                        ? 'bg-gradient-to-r from-amber-950/20 to-slate-950 border-amber-500/20 hover:border-amber-500/40'
                        : 'bg-slate-900/50 border-slate-800 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${
                          user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                          user.role === 'moderator' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{user.display_name || user.username}</span>
                            <span className="text-xs text-slate-500 font-mono">@{user.username}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-mono border ${
                              user.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              user.role === 'moderator' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                              'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {user.role?.toUpperCase() || 'USER'}
                            </span>
                            {user.isBanned && (
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-mono flex items-center gap-1 border border-red-500/30">
                                <Ban className="w-3 h-3" /> BANNED
                              </span>
                            )}
                            {user.warningsCount > 0 && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-mono flex items-center gap-1 border border-amber-500/30">
                                <AlertTriangle className="w-3 h-3" /> {user.warningsCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="m-0">
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="font-mono">No moderation logs recorded</p>
                  </div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                            log.action_type === 'warn' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            log.action_type.includes('ban') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {log.action_type.toUpperCase()}
                            {log.is_fake && ' (PRANK)'}
                          </span>
                          <span className="text-sm font-mono">{log.reason}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="status" className="m-0">
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 mb-6">
                <h3 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2 font-mono">
                  <Server className="w-5 h-5" />
                  ZONE CONTROL MATRIX
                </h3>
                <p className="text-sm text-slate-400 font-mono">
                  Manage operational status of facility zones. Setting zones to maintenance or offline will broadcast alerts to all connected personnel.
                </p>
              </div>

              {statusLoading ? (
                <div className="text-center py-16">
                  <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
                  <p className="text-slate-400 font-mono">Loading zone data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {statuses.map(status => (
                    <StatusCard 
                      key={status.id}
                      status={status}
                      onUpdate={updateStatus}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="security" className="m-0">
              <div className="grid grid-cols-2 gap-6">
                {/* NAVI Security Status */}
                <div className="p-6 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-500/30">
                  <h3 className="font-bold text-cyan-400 mb-4 flex items-center gap-2 font-mono">
                    <Eye className="w-5 h-5" /> NAVI SECURITY SYSTEM
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded bg-slate-800/50">
                      <span className="text-sm font-mono">Threat Detection</span>
                      <span className="text-green-400 font-mono text-sm">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-800/50">
                      <span className="text-sm font-mono">Access Monitoring</span>
                      <span className="text-green-400 font-mono text-sm">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-800/50">
                      <span className="text-sm font-mono">Lockout System</span>
                      <span className="text-green-400 font-mono text-sm">ARMED</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded bg-slate-800/50">
                      <span className="text-sm font-mono">Facility Lockdown</span>
                      <span className={`font-mono text-sm ${lockdownActive ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                        {lockdownActive ? 'ENGAGED' : 'STANDBY'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-6 rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-800">
                  <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2 font-mono">
                    <Zap className="w-5 h-5" /> QUICK ACTIONS
                  </h3>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => setShowLockdownDialog(true)}
                      className="w-full justify-start gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30"
                      disabled={lockdownActive}
                    >
                      <Lock className="w-4 h-4" /> Initiate Facility Lockdown
                    </Button>
                    <Button 
                      onClick={fetchUsers}
                      className="w-full justify-start gap-2 bg-slate-800 hover:bg-slate-700"
                    >
                      <RefreshCw className="w-4 h-4" /> Refresh All Data
                    </Button>
                    <Button 
                      onClick={() => toast.info("Broadcasting to all personnel...")}
                      className="w-full justify-start gap-2 bg-slate-800 hover:bg-slate-700"
                    >
                      <Radio className="w-4 h-4" /> Broadcast Alert
                    </Button>
                    <Button 
                      onClick={() => {
                        const data = JSON.stringify(users, null, 2);
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'personnel-export.json';
                        a.click();
                      }}
                      className="w-full justify-start gap-2 bg-slate-800 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4" /> Export Personnel Data
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Activity Feed Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="sticky top-6 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
            <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2 font-mono text-sm">
              <Activity className="w-4 h-4 text-cyan-400" /> LIVE ACTIVITY
            </h3>
            <ScrollArea className="h-[600px]">
              <ActivityFeed activities={activities} />
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* User Details Panel */}
      {showUserDetails && selectedUser && (
        <UserDetailsPanel
          user={selectedUser}
          onClose={() => { setShowUserDetails(false); setSelectedUser(null); }}
          onWarn={() => setShowWarnDialog(true)}
          onBan={() => setShowBanDialog(true)}
          onUnban={() => handleUnban(selectedUser.user_id)}
        />
      )}

      {/* Warn Dialog */}
      <Dialog open={showWarnDialog} onOpenChange={setShowWarnDialog}>
        <DialogContent className="bg-slate-950 border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400 font-mono">
              <AlertTriangle className="w-5 h-5" />
              ISSUE WARNING
            </DialogTitle>
            <DialogDescription className="font-mono text-slate-400">
              Warning will be logged and added to {selectedUser?.username}'s record.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={warnReason}
            onChange={(e) => setWarnReason(e.target.value)}
            placeholder="Enter warning reason..."
            rows={3}
            className="bg-slate-900 border-slate-700 font-mono"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarnDialog(false)} className="border-slate-700">Cancel</Button>
            <Button onClick={handleWarn} className="bg-amber-600 hover:bg-amber-500">Issue Warning</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="bg-slate-950 border-red-500/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400 font-mono">
              <Ban className="w-5 h-5" />
              BAN USER
            </DialogTitle>
            <DialogDescription className="font-mono text-slate-400">
              Banning {selectedUser?.username} will revoke all access.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-mono mb-2 block text-slate-400">DURATION</label>
              <div className="flex flex-wrap gap-2">
                {(['1h', '24h', '7d', '30d', 'perm'] as const).map(d => (
                  <Button
                    key={d}
                    variant={banDuration === d ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBanDuration(d)}
                    className={banDuration === d ? "bg-red-600" : "border-slate-700"}
                  >
                    {d === 'perm' ? 'PERMANENT' : d.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            
            <Textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter ban reason..."
              rows={3}
              className="bg-slate-900 border-slate-700 font-mono"
            />

            <label className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 cursor-pointer">
              <input
                type="checkbox"
                checked={isFakeBan}
                onChange={(e) => setIsFakeBan(e.target.checked)}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium text-purple-400 flex items-center gap-2 font-mono">
                  <PartyPopper className="w-4 h-4" /> FAKE BAN (Prank)
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Shows ban message but reveals "GET PRANKED!" on click
                </p>
              </div>
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)} className="border-slate-700">Cancel</Button>
            <Button onClick={handleBan} className="bg-red-600 hover:bg-red-500">
              {isFakeBan ? 'Fake Ban' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lockdown Dialog */}
      <Dialog open={showLockdownDialog} onOpenChange={setShowLockdownDialog}>
        <DialogContent className="bg-slate-950 border-red-500/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400 font-mono">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
              INITIATE LOCKDOWN
            </DialogTitle>
            <DialogDescription className="font-mono text-slate-400">
              This will restrict all non-essential operations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-mono mb-2 block text-slate-400">TARGET ZONE</label>
              <Select value={lockdownZone} onValueChange={setLockdownZone}>
                <SelectTrigger className="bg-slate-900 border-slate-700 font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">All Zones (Facility-Wide)</SelectItem>
                  <SelectItem value="main">Main Site Only</SelectItem>
                  <SelectItem value="docs">Documentation</SelectItem>
                  <SelectItem value="def-dev">DefDev Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-300 font-mono">
                ⚠️ WARNING: Lockdown will broadcast emergency alerts to all connected personnel and restrict access to affected zones.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLockdownDialog(false)} className="border-slate-700">Cancel</Button>
            <Button onClick={handleLockdown} className="bg-red-600 hover:bg-red-500 gap-2">
              <Lock className="w-4 h-4" /> CONFIRM LOCKDOWN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModerationPanel;
