import { useEffect } from "react";

interface DefDevShortcuts {
  onToggleFloating?: () => void;
  onCaptureSnapshot?: () => void;
  onToggleMockApi?: () => void;
  onSwitchTab?: (tab: string) => void;
}

export const useDefDevKeyboardShortcuts = (callbacks: DefDevShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger with Ctrl/Cmd + Shift
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;

      switch (e.key.toLowerCase()) {
        case 'd': // Toggle floating DEF-DEV
          e.preventDefault();
          callbacks.onToggleFloating?.();
          break;
        case 's': // Capture snapshot
          e.preventDefault();
          callbacks.onCaptureSnapshot?.();
          break;
        case 'm': // Toggle mock API
          e.preventDefault();
          callbacks.onToggleMockApi?.();
          break;
        case '1': callbacks.onSwitchTab?.('console'); break;
        case '2': callbacks.onSwitchTab?.('performance'); break;
        case '3': callbacks.onSwitchTab?.('network'); break;
        case '4': callbacks.onSwitchTab?.('storage'); break;
        case '5': callbacks.onSwitchTab?.('timetravel'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};

export default useDefDevKeyboardShortcuts;
