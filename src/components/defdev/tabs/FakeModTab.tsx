import { Gavel, Ban, AlertTriangle, VolumeX, UserX, Play, Plus, Clock, X } from "lucide-react";
import { useState } from "react";
import { FakeModerationAction } from "../hooks/useDefDevState";

interface FakeModTabProps {
  fakeModerationActions: FakeModerationAction[];
  saveFakeModerationAction: (action: FakeModerationAction) => void;
  triggerFakeMod: (action: FakeModerationAction) => void;
  activeFakeMod: FakeModerationAction | null;
  dismissFakeMod: () => void;
}

const FakeModTab = ({ fakeModerationActions, saveFakeModerationAction, triggerFakeMod, activeFakeMod, dismissFakeMod }: FakeModTabProps) => {
  const [newAction, setNewAction] = useState<Partial<FakeModerationAction>>({ type: 'ban', reason: '', duration: '7 days' });

  const actionTypes = [
    { type: 'ban' as const, label: 'Ban', icon: Ban, color: 'red' },
    { type: 'warn' as const, label: 'Warning', icon: AlertTriangle, color: 'amber' },
    { type: 'mute' as const, label: 'Mute', icon: VolumeX, color: 'orange' },
    { type: 'kick' as const, label: 'Kick', icon: UserX, color: 'purple' },
  ];

  const createAction = () => {
    if (!newAction.reason) return;
    const action: FakeModerationAction = {
      id: `fake_${Date.now()}`,
      type: newAction.type || 'ban',
      reason: newAction.reason,
      duration: newAction.duration,
      timestamp: new Date().toISOString(),
    };
    saveFakeModerationAction(action);
    setNewAction({ type: 'ban', reason: '', duration: '7 days' });
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Active Fake Mod Popup */}
      {activeFakeMod && (
        <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-xl border-2 ${
            activeFakeMod.type === 'ban' ? 'bg-red-950 border-red-500' :
            activeFakeMod.type === 'warn' ? 'bg-amber-950 border-amber-500' :
            activeFakeMod.type === 'mute' ? 'bg-orange-950 border-orange-500' :
            'bg-purple-950 border-purple-500'
          }`}>
            <div className="text-center mb-4">
              {activeFakeMod.type === 'ban' && <Ban className="w-16 h-16 text-red-400 mx-auto mb-3" />}
              {activeFakeMod.type === 'warn' && <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-3" />}
              {activeFakeMod.type === 'mute' && <VolumeX className="w-16 h-16 text-orange-400 mx-auto mb-3" />}
              {activeFakeMod.type === 'kick' && <UserX className="w-16 h-16 text-purple-400 mx-auto mb-3" />}
              <h2 className="text-2xl font-bold text-white mb-2">
                {activeFakeMod.type === 'ban' ? 'You have been banned' :
                 activeFakeMod.type === 'warn' ? 'Warning Issued' :
                 activeFakeMod.type === 'mute' ? 'You have been muted' : 'You have been kicked'}
              </h2>
              <p className="text-gray-300 mb-4">{activeFakeMod.reason}</p>
              {activeFakeMod.duration && <p className="text-sm text-gray-400">Duration: {activeFakeMod.duration}</p>}
              <p className="text-xs text-gray-500 mt-2">[FAKE - DEF-DEV Testing]</p>
            </div>
            <button onClick={dismissFakeMod} className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create New */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <h3 className="font-bold text-rose-400 mb-3 flex items-center gap-2">
          <Gavel className="w-5 h-5" /> Create Fake Moderation Action
        </h3>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {actionTypes.map(at => (
            <button
              key={at.type}
              onClick={() => setNewAction(p => ({ ...p, type: at.type }))}
              className={`p-2 rounded border text-sm flex items-center justify-center gap-1 ${
                newAction.type === at.type 
                  ? `bg-${at.color}-500/20 border-${at.color}-500/50 text-${at.color}-400` 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <at.icon className="w-4 h-4" /> {at.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Reason..."
          value={newAction.reason}
          onChange={e => setNewAction(p => ({ ...p, reason: e.target.value }))}
          className="w-full p-2 bg-slate-800 border border-slate-700 rounded mb-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Duration (e.g. 7 days)"
            value={newAction.duration}
            onChange={e => setNewAction(p => ({ ...p, duration: e.target.value }))}
            className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded text-sm"
          />
          <button onClick={createAction} className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded text-rose-400 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>
      </div>

      {/* Saved Actions */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {fakeModerationActions.length === 0 ? (
          <div className="text-center text-slate-600 py-12">
            <Gavel className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No fake moderation actions created</p>
          </div>
        ) : (
          fakeModerationActions.map(action => (
            <div key={action.id} className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center gap-3">
              {action.type === 'ban' && <Ban className="w-5 h-5 text-red-400" />}
              {action.type === 'warn' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {action.type === 'mute' && <VolumeX className="w-5 h-5 text-orange-400" />}
              {action.type === 'kick' && <UserX className="w-5 h-5 text-purple-400" />}
              <div className="flex-1">
                <span className="font-medium capitalize">{action.type}</span>
                <span className="text-slate-500 text-sm ml-2">{action.reason}</span>
              </div>
              <button onClick={() => triggerFakeMod(action)} className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded text-green-400">
                <Play className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FakeModTab;
