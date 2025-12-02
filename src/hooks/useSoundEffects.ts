import { useCallback } from "react";

// Sound effect types
type SoundType = "startup" | "shutdown" | "error" | "notification" | "click" | "success" | "warning";

// Create audio context for generating sounds
const createOscillatorSound = (frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 0.3) => {
  const enabled = localStorage.getItem('settings_sound_enabled') !== 'false';
  if (!enabled) return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;

    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.warn("Audio not supported");
  }
};

const playStartupSound = () => {
  // Chord progression for startup
  setTimeout(() => createOscillatorSound(440, 0.3, "sine", 0.2), 0);
  setTimeout(() => createOscillatorSound(554, 0.3, "sine", 0.2), 100);
  setTimeout(() => createOscillatorSound(659, 0.4, "sine", 0.2), 200);
  setTimeout(() => createOscillatorSound(880, 0.5, "sine", 0.3), 300);
};

const playShutdownSound = () => {
  // Descending tone
  setTimeout(() => createOscillatorSound(880, 0.3, "sine", 0.2), 0);
  setTimeout(() => createOscillatorSound(659, 0.3, "sine", 0.2), 100);
  setTimeout(() => createOscillatorSound(440, 0.4, "sine", 0.2), 200);
  setTimeout(() => createOscillatorSound(330, 0.5, "sine", 0.1), 300);
};

const playErrorSound = () => {
  createOscillatorSound(200, 0.2, "square", 0.2);
  setTimeout(() => createOscillatorSound(150, 0.3, "square", 0.2), 200);
};

const playNotificationSound = () => {
  createOscillatorSound(800, 0.1, "sine", 0.2);
  setTimeout(() => createOscillatorSound(1000, 0.15, "sine", 0.2), 100);
};

const playClickSound = () => {
  createOscillatorSound(1200, 0.05, "sine", 0.1);
};

const playSuccessSound = () => {
  createOscillatorSound(523, 0.1, "sine", 0.2);
  setTimeout(() => createOscillatorSound(659, 0.1, "sine", 0.2), 100);
  setTimeout(() => createOscillatorSound(784, 0.2, "sine", 0.2), 200);
};

const playWarningSound = () => {
  createOscillatorSound(400, 0.15, "triangle", 0.2);
  setTimeout(() => createOscillatorSound(400, 0.15, "triangle", 0.2), 200);
};

export const useSoundEffects = () => {
  const playSound = useCallback((type: SoundType) => {
    switch (type) {
      case "startup": playStartupSound(); break;
      case "shutdown": playShutdownSound(); break;
      case "error": playErrorSound(); break;
      case "notification": playNotificationSound(); break;
      case "click": playClickSound(); break;
      case "success": playSuccessSound(); break;
      case "warning": playWarningSound(); break;
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem('settings_sound_enabled', String(enabled));
  }, []);

  const isEnabled = useCallback(() => {
    return localStorage.getItem('settings_sound_enabled') !== 'false';
  }, []);

  return { playSound, setEnabled, isEnabled };
};
