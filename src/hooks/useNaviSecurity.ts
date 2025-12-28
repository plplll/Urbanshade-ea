// NAVI AI Security System - Monitors unauthorized access attempts
// Implements warning system and lockout for persistent violations

import { useState, useEffect, useCallback } from "react";
import { useNotifications } from "./useNotifications";

export interface SecurityViolation {
  id: string;
  type: "access_denied" | "restricted_area" | "brute_force" | "suspicious_behavior";
  target: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
}

export interface NaviSecurityState {
  violations: SecurityViolation[];
  warningLevel: number; // 0-3: 0=safe, 1=warning, 2=severe, 3=lockout
  isLockedOut: boolean;
  lockoutReason: string;
  lockoutTime: Date | null;
}

const VIOLATION_THRESHOLDS = {
  WARNING: 3,      // 3 violations = first warning
  SEVERE: 5,       // 5 violations = severe warning
  LOCKOUT: 7,      // 7 violations = lockout
};

// Lockout is PERMANENT until page refresh - no auto-expire!
const LOCKOUT_PERMANENT = true;

// Legacy duration (not used when LOCKOUT_PERMANENT is true)
const LOCKOUT_DURATION = 999999999; // Effectively permanent

export const useNaviSecurity = () => {
  const { addNotification } = useNotifications();
  
  const [state, setState] = useState<NaviSecurityState>(() => {
    const saved = localStorage.getItem('navi_security_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if lockout has expired
        if (parsed.lockoutTime) {
          const lockoutEnd = new Date(parsed.lockoutTime).getTime() + LOCKOUT_DURATION;
          if (Date.now() > lockoutEnd) {
            // Lockout expired, reset
            return {
              violations: [],
              warningLevel: 0,
              isLockedOut: false,
              lockoutReason: "",
              lockoutTime: null,
            };
          }
        }
        return {
          ...parsed,
          violations: parsed.violations.map((v: any) => ({
            ...v,
            timestamp: new Date(v.timestamp)
          })),
          lockoutTime: parsed.lockoutTime ? new Date(parsed.lockoutTime) : null,
        };
      } catch {
        return getInitialState();
      }
    }
    return getInitialState();
  });

  function getInitialState(): NaviSecurityState {
    return {
      violations: [],
      warningLevel: 0,
      isLockedOut: false,
      lockoutReason: "",
      lockoutTime: null,
    };
  }

  // Persist state (but don't persist lockout - it resets on refresh)
  useEffect(() => {
    // Only save non-lockout state to allow refresh to clear lockout
    if (!state.isLockedOut) {
      localStorage.setItem('navi_security_state', JSON.stringify(state));
    }
  }, [state]);

  // Lockout is PERMANENT until page refresh - no auto-expire timer needed!

  // Report a security violation
  const reportViolation = useCallback((
    type: SecurityViolation["type"],
    target: string,
    severity: SecurityViolation["severity"] = "medium"
  ) => {
    if (state.isLockedOut) return; // Already locked out

    const violation: SecurityViolation = {
      id: Date.now().toString(),
      type,
      target,
      timestamp: new Date(),
      severity,
    };

    setState(prev => {
      const newViolations = [...prev.violations, violation].slice(-20); // Keep last 20
      const count = newViolations.length;
      let newWarningLevel = prev.warningLevel;
      let isLockedOut = false;
      let lockoutReason = "";
      let lockoutTime: Date | null = null;

      // Calculate warning level based on violations
      if (count >= VIOLATION_THRESHOLDS.LOCKOUT) {
        newWarningLevel = 3;
        isLockedOut = true;
        lockoutReason = getLocakoutMessage(type, target);
        lockoutTime = new Date();
        
        // Play alert sound (if available)
        try {
          const audio = new Audio('/sounds/alert.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch {}
        
      } else if (count >= VIOLATION_THRESHOLDS.SEVERE) {
        newWarningLevel = 2;
        
        // Show severe warning notification
        if (prev.warningLevel < 2) {
          addNotification({
            title: "⚠️ NAVI Security Alert",
            message: `FINAL WARNING: Continued unauthorized access attempts to "${target}" will result in system lockout. Cease immediately.`,
            type: "error",
            app: "NAVI AI",
            priority: "urgent",
            behavior: "alert",
            persistent: true,
          });
        }
      } else if (count >= VIOLATION_THRESHOLDS.WARNING) {
        newWarningLevel = 1;
        
        // Show first warning notification
        if (prev.warningLevel < 1) {
          addNotification({
            title: "NAVI Security Warning",
            message: `Suspicious activity detected. Multiple unauthorized access attempts to "${target}". Further persistence may result in system lockout.`,
            type: "warning",
            app: "NAVI AI",
            priority: "high",
            behavior: "toast",
          });
        }
      }

      return {
        violations: newViolations,
        warningLevel: newWarningLevel,
        isLockedOut,
        lockoutReason,
        lockoutTime,
      };
    });
  }, [state.isLockedOut, addNotification]);

  // Manual lockout (for admin/testing)
  const triggerLockout = useCallback((reason: string) => {
    setState(prev => ({
      ...prev,
      isLockedOut: true,
      lockoutReason: reason,
      lockoutTime: new Date(),
      warningLevel: 3,
    }));
  }, []);

  // Clear lockout (admin override)
  const clearLockout = useCallback(() => {
    setState(getInitialState());
  }, []);

  // Clear violations (reset warning level)
  const clearViolations = useCallback(() => {
    setState(prev => ({
      ...prev,
      violations: [],
      warningLevel: 0,
    }));
  }, []);

  return {
    ...state,
    reportViolation,
    triggerLockout,
    clearLockout,
    clearViolations,
    violationCount: state.violations.length,
    remainingAttempts: Math.max(0, VIOLATION_THRESHOLDS.LOCKOUT - state.violations.length),
  };
};

function getLocakoutMessage(type: SecurityViolation["type"], target: string): string {
  switch (type) {
    case "access_denied":
      return `Repeated unauthorized access attempts to restricted resource: "${target}"`;
    case "restricted_area":
      return `Persistent attempts to access classified zone: "${target}"`;
    case "brute_force":
      return `Brute force attack detected on: "${target}"`;
    case "suspicious_behavior":
      return `Anomalous behavior pattern detected during access to: "${target}"`;
    default:
      return `Security protocol violation - unauthorized activity detected`;
  }
}
