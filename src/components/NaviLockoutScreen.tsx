// NAVI AI Lockout Screen - Displayed when user is locked out due to security violations

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Lock, Eye, Radio, Terminal, Cpu } from "lucide-react";

interface NaviLockoutScreenProps {
  reason: string;
  lockoutTime: Date;
  onUnlock?: () => void; // Called when lockout expires
}

export const NaviLockoutScreen = ({ reason, lockoutTime, onUnlock }: NaviLockoutScreenProps) => {
  const [showContent, setShowContent] = useState(false);
  const [scanLines, setScanLines] = useState<number[]>([]);
  const [naviMessages, setNaviMessages] = useState<string[]>([]);

  // Lockout is PERMANENT - no countdown needed

  useEffect(() => {
    // Black screen first, then reveal
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2000);

    // Generate scan lines
    const lines: number[] = [];
    for (let i = 0; i < 12; i++) {
      lines.push(Math.random() * 100);
    }
    setScanLines(lines);

    return () => clearTimeout(timer);
  }, []);

  // NAVI AI messages - lockout is permanent
  useEffect(() => {
    if (!showContent) return;

    const messages = [
      "NAVI: Security violation detected.",
      "NAVI: Analyzing threat pattern...",
      "NAVI: User activity flagged as suspicious.",
      "NAVI: System lockout initiated.",
      "NAVI: All access permanently revoked.",
      "NAVI: Refresh page to restore access.",
      "NAVI: Incident logged for HQ review.",
    ];

    messages.forEach((msg, i) => {
      setTimeout(() => {
        setNaviMessages(prev => [...prev, msg]);
      }, i * 600);
    });
  }, [showContent]);

  // NAVI AI messages
  useEffect(() => {
    if (!showContent) return;

    const messages = [
      "NAVI: Security violation detected.",
      "NAVI: Analyzing threat pattern...",
      "NAVI: User activity flagged as suspicious.",
      "NAVI: System lockout initiated.",
      "NAVI: All access temporarily revoked.",
      "NAVI: Incident logged for review.",
    ];

    messages.forEach((msg, i) => {
      setTimeout(() => {
        setNaviMessages(prev => [...prev, msg]);
      }, i * 600);
    });
  }, [showContent]);

  // Black screen phase
  if (!showContent) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black transition-opacity duration-500" />
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* Animated Background - Deep red/black gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 30%, rgba(139, 0, 0, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, rgba(139, 0, 0, 0.15) 0%, transparent 50%),
            linear-gradient(180deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)
          `
        }}
      />

      {/* Scan Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {scanLines.map((pos, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-red-900"
            style={{
              top: `${pos}%`,
              animation: `naviScanline ${4 + i * 0.3}s linear infinite`,
              opacity: 0.3 + Math.random() * 0.4
            }}
          />
        ))}
      </div>

      {/* CRT Overlay Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.3) 2px,
            rgba(0, 0, 0, 0.3) 4px
          )`
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
        {/* Top Warning Bar */}
        <div className="absolute top-0 left-0 right-0 bg-red-950/90 border-b-2 border-red-800 py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-red-400 text-sm tracking-widest">NAVI SECURITY SYSTEM</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-red-500/70">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>LOCKOUT ACTIVE</span>
          </div>
        </div>

        {/* Central Panel */}
        <div className="max-w-2xl w-full animate-fade-in">
          {/* NAVI Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative w-32 h-32 rounded-full border-4 border-red-800/50 bg-gradient-to-br from-red-950 to-black flex items-center justify-center">
                <Eye className="w-16 h-16 text-red-500 animate-pulse" />
              </div>
              {/* Orbiting lock */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
                <Lock className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-500 tracking-wider mb-2 font-mono">
              SYSTEM LOCKED
            </h1>
            <p className="text-red-400/70 text-sm font-mono">
              NAVI AI Security Protocol Engaged
            </p>
          </div>

          {/* Reason Box */}
          <div className="bg-black/60 border border-red-800/50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <div className="text-red-400 font-bold mb-2 font-mono text-sm">LOCKOUT REASON:</div>
                <p className="text-red-300/80 text-sm leading-relaxed">
                  {reason || "Suspicious behavior detected. Access has been temporarily revoked for security purposes."}
                </p>
              </div>
            </div>
          </div>

          {/* NAVI Terminal Messages */}
          <div className="bg-black/80 border border-red-900/30 rounded-lg p-4 mb-6 font-mono text-xs max-h-40 overflow-y-auto">
            {naviMessages.map((msg, i) => (
              <div key={i} className="flex items-center gap-2 py-1 animate-fade-in">
                <Cpu className="w-3 h-3 text-red-600" />
                <span className={i === naviMessages.length - 1 ? "text-red-400" : "text-red-600/60"}>
                  {msg}
                </span>
              </div>
            ))}
            <span className="text-red-500 animate-pulse">█</span>
          </div>

          {/* Permanent Lockout Notice */}
          <div className="bg-black/40 border border-red-800/30 rounded-lg p-6 text-center">
            <div className="text-red-500/60 text-xs font-mono mb-2">LOCKOUT STATUS</div>
            <div className="text-3xl font-bold text-red-500 font-mono tracking-widest mb-2">
              PERMANENT
            </div>
            <div className="text-red-400/60 text-sm font-mono">
              Refresh page to restore access
            </div>
            <div className="mt-4 h-2 bg-red-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-700 to-red-500 animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-red-600/40 font-mono space-y-1">
            <div>URBANSHADE FACILITY - NAVI SECURITY v3.0</div>
            <div>All access attempts are logged and monitored</div>
            <div>Contact HQ/Dispatch if this lockout is in error</div>
          </div>
        </div>

        {/* Bottom Warning Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-red-950/80 border-t border-red-800/50 py-3 overflow-hidden">
          <div className="animate-marquee-navi whitespace-nowrap text-red-500/60 text-xs font-mono">
            ⛔ NAVI: ACCESS REVOKED — SECURITY LOCKOUT IN EFFECT — 
            SUSPICIOUS ACTIVITY DETECTED — AWAIT LOCKOUT EXPIRATION — 
            ⛔ NAVI: ACCESS REVOKED — SECURITY LOCKOUT IN EFFECT — 
            SUSPICIOUS ACTIVITY DETECTED — AWAIT LOCKOUT EXPIRATION —
          </div>
        </div>
      </div>

      <style>{`
        @keyframes naviScanline {
          0% { transform: translateY(-100vh); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes marquee-navi {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-navi {
          animation: marquee-navi 25s linear infinite;
        }
      `}</style>
    </div>
  );
};
