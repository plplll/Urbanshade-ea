import { useCallback } from "react";
import { toast } from "sonner";

export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    bgGradientStart: string;
    bgGradientEnd: string;
    accentColor?: string;
  };
}

export const themePresets: ThemePreset[] = [
  {
    id: "urbanshade-dark",
    name: "Urbanshade Dark",
    colors: {
      bgGradientStart: "#1a1a2e",
      bgGradientEnd: "#16213e"
    }
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    colors: {
      bgGradientStart: "#0f0f23",
      bgGradientEnd: "#1a1a40"
    }
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    colors: {
      bgGradientStart: "#0d1117",
      bgGradientEnd: "#161b22"
    }
  },
  {
    id: "forest-green",
    name: "Forest Green",
    colors: {
      bgGradientStart: "#0d1f0d",
      bgGradientEnd: "#1a2f1a"
    }
  },
  {
    id: "ruby-red",
    name: "Ruby Red",
    colors: {
      bgGradientStart: "#1f0d0d",
      bgGradientEnd: "#2f1a1a"
    }
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    colors: {
      bgGradientStart: "#1a0d1f",
      bgGradientEnd: "#2a1a2f"
    }
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    colors: {
      bgGradientStart: "#1f1a0d",
      bgGradientEnd: "#2f2a1a"
    }
  },
  {
    id: "arctic-blue",
    name: "Arctic Blue",
    colors: {
      bgGradientStart: "#0d1a1f",
      bgGradientEnd: "#1a2a2f"
    }
  }
];

export const useThemePresets = () => {
  const applyPreset = useCallback((preset: ThemePreset) => {
    localStorage.setItem("settings_bg_gradient_start", preset.colors.bgGradientStart);
    localStorage.setItem("settings_bg_gradient_end", preset.colors.bgGradientEnd);
    if (preset.colors.accentColor) {
      localStorage.setItem("settings_accent_color", preset.colors.accentColor);
    }
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"));
    toast.success(`Applied "${preset.name}" theme`);
  }, []);

  const getCurrentPreset = useCallback((): ThemePreset | null => {
    const start = localStorage.getItem("settings_bg_gradient_start");
    const end = localStorage.getItem("settings_bg_gradient_end");
    
    return themePresets.find(
      (p) => p.colors.bgGradientStart === start && p.colors.bgGradientEnd === end
    ) || null;
  }, []);

  return {
    presets: themePresets,
    applyPreset,
    getCurrentPreset
  };
};
