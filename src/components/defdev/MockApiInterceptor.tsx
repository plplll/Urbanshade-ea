import { useState, useEffect } from "react";
import { Wifi, Plus, Trash2, Play, Pause, Clock, AlertTriangle, Check, X, Zap, Settings } from "lucide-react";
import { toast } from "sonner";

export interface MockRule {
  id: string;
  urlPattern: string;
  method: string;
  enabled: boolean;
  action: 'mock' | 'delay' | 'fail' | 'passthrough';
  mockResponse?: string;
  mockStatus?: number;
  delayMs?: number;
  failStatus?: number;
}

// Global mock rules storage
let mockRules: MockRule[] = [];
let mockEnabled = false;
const originalFetch = window.fetch;

const applyMockRules = () => {
  if (!mockEnabled) {
    window.fetch = originalFetch;
    return;
  }

  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    const method = init?.method || 'GET';

    for (const rule of mockRules) {
      if (!rule.enabled) continue;
      
      const regex = new RegExp(rule.urlPattern, 'i');
      if (!regex.test(url)) continue;
      if (rule.method !== 'ALL' && rule.method !== method) continue;

      // Match found!
      switch (rule.action) {
        case 'mock':
          return new Response(rule.mockResponse || '{}', {
            status: rule.mockStatus || 200,
            headers: { 'Content-Type': 'application/json' }
          });

        case 'delay':
          await new Promise(resolve => setTimeout(resolve, rule.delayMs || 1000));
          return originalFetch.call(this, input, init);

        case 'fail':
          return new Response(JSON.stringify({ error: 'Mocked failure' }), {
            status: rule.failStatus || 500,
            headers: { 'Content-Type': 'application/json' }
          });

        case 'passthrough':
        default:
          break;
      }
    }

    return originalFetch.call(this, input, init);
  };
};

export const MockApiInterceptor = () => {
  const [rules, setRules] = useState<MockRule[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [editingRule, setEditingRule] = useState<MockRule | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Load saved rules
  useEffect(() => {
    const saved = localStorage.getItem('defdev_mock_rules');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRules(parsed);
      mockRules = parsed;
    }
    const enabledState = localStorage.getItem('defdev_mock_enabled') === 'true';
    setIsEnabled(enabledState);
    mockEnabled = enabledState;
    applyMockRules();
  }, []);

  // Sync rules to global
  useEffect(() => {
    mockRules = rules;
    localStorage.setItem('defdev_mock_rules', JSON.stringify(rules));
    applyMockRules();
  }, [rules]);

  // Toggle enabled
  const toggleEnabled = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    mockEnabled = newState;
    localStorage.setItem('defdev_mock_enabled', String(newState));
    applyMockRules();
    toast.success(newState ? 'Mock API enabled' : 'Mock API disabled');
  };

  const createNewRule = (): MockRule => ({
    id: `rule-${Date.now()}`,
    urlPattern: '.*',
    method: 'ALL',
    enabled: true,
    action: 'mock',
    mockResponse: '{"message": "Mocked response"}',
    mockStatus: 200,
    delayMs: 1000,
    failStatus: 500
  });

  const saveRule = (rule: MockRule) => {
    if (editingRule) {
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
    } else {
      setRules(prev => [...prev, rule]);
    }
    setShowEditor(false);
    setEditingRule(null);
    toast.success('Rule saved');
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast.success('Rule deleted');
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const getActionIcon = (action: MockRule['action']) => {
    switch (action) {
      case 'mock': return <Zap className="w-3 h-3 text-cyan-400" />;
      case 'delay': return <Clock className="w-3 h-3 text-amber-400" />;
      case 'fail': return <X className="w-3 h-3 text-red-400" />;
      default: return <Check className="w-3 h-3 text-green-400" />;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Wifi className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Mock API Interceptor</h2>
            <p className="text-xs text-slate-500">{rules.length} rules configured</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditingRule(null); setShowEditor(true); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs">Add Rule</span>
          </button>
          <button
            onClick={toggleEnabled}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              isEnabled 
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isEnabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="text-xs">{isEnabled ? 'Active' : 'Inactive'}</span>
          </button>
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-2">
        {rules.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-xl">
            <Wifi className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No mock rules configured</p>
            <p className="text-xs mt-1">Add rules to mock, delay, or fail API requests</p>
          </div>
        ) : (
          rules.map(rule => (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all ${
                rule.enabled 
                  ? 'bg-slate-800/50 border-slate-700/50'
                  : 'bg-slate-900/50 border-slate-800/50 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`p-1.5 rounded transition-colors ${
                    rule.enabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'
                  }`}
                >
                  {rule.enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </button>
                
                {getActionIcon(rule.action)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{rule.method}</span>
                    <span className="text-sm font-mono text-slate-300 truncate">{rule.urlPattern}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {rule.action === 'mock' && `Returns ${rule.mockStatus} with custom response`}
                    {rule.action === 'delay' && `Delays ${rule.delayMs}ms before request`}
                    {rule.action === 'fail' && `Fails with ${rule.failStatus} status`}
                    {rule.action === 'passthrough' && 'Passes through to real endpoint'}
                  </div>
                </div>

                <button
                  onClick={() => { setEditingRule(rule); setShowEditor(true); }}
                  className="p-2 hover:bg-slate-700 rounded transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-2 hover:bg-red-500/20 rounded transition-colors text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rule Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-bold">{editingRule ? 'Edit Rule' : 'New Rule'}</h3>
            
            <RuleEditor
              rule={editingRule || createNewRule()}
              onSave={saveRule}
              onCancel={() => { setShowEditor(false); setEditingRule(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const RuleEditor = ({ 
  rule, 
  onSave, 
  onCancel 
}: { 
  rule: MockRule; 
  onSave: (rule: MockRule) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(rule);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-slate-400 block mb-1">URL Pattern (Regex)</label>
        <input
          type="text"
          value={formData.urlPattern}
          onChange={(e) => setFormData(prev => ({ ...prev, urlPattern: e.target.value }))}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
          placeholder=".*api/users.*"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Method</label>
          <select
            value={formData.method}
            onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
          >
            <option value="ALL">ALL</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Action</label>
          <select
            value={formData.action}
            onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value as MockRule['action'] }))}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
          >
            <option value="mock">Mock Response</option>
            <option value="delay">Add Delay</option>
            <option value="fail">Force Fail</option>
            <option value="passthrough">Passthrough</option>
          </select>
        </div>
      </div>

      {formData.action === 'mock' && (
        <>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Status Code</label>
            <input
              type="number"
              value={formData.mockStatus}
              onChange={(e) => setFormData(prev => ({ ...prev, mockStatus: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Response Body (JSON)</label>
            <textarea
              value={formData.mockResponse}
              onChange={(e) => setFormData(prev => ({ ...prev, mockResponse: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-mono h-24"
            />
          </div>
        </>
      )}

      {formData.action === 'delay' && (
        <div>
          <label className="text-xs text-slate-400 block mb-1">Delay (ms)</label>
          <input
            type="number"
            value={formData.delayMs}
            onChange={(e) => setFormData(prev => ({ ...prev, delayMs: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
          />
        </div>
      )}

      {formData.action === 'fail' && (
        <div>
          <label className="text-xs text-slate-400 block mb-1">Fail Status Code</label>
          <input
            type="number"
            value={formData.failStatus}
            onChange={(e) => setFormData(prev => ({ ...prev, failStatus: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
          />
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(formData)}
          className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
        >
          Save Rule
        </button>
      </div>
    </div>
  );
};

export default MockApiInterceptor;
