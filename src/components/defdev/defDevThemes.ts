export type DefDevTheme = 'default' | 'hacker' | 'light' | 'cyberpunk' | 'midnight';

export const defDevThemes: Record<DefDevTheme, {
  name: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  accent: string;
  accentBg: string;
}> = {
  default: {
    name: 'Default Dark',
    bg: 'bg-[#0d1117]',
    surface: 'bg-slate-800/50',
    border: 'border-slate-700',
    text: 'text-slate-300',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-500/20'
  },
  hacker: {
    name: 'Hacker Green',
    bg: 'bg-black',
    surface: 'bg-green-950/30',
    border: 'border-green-900',
    text: 'text-green-400',
    accent: 'text-green-300',
    accentBg: 'bg-green-500/20'
  },
  light: {
    name: 'Light Mode',
    bg: 'bg-gray-100',
    surface: 'bg-white',
    border: 'border-gray-300',
    text: 'text-gray-800',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-100'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    bg: 'bg-[#0a0014]',
    surface: 'bg-purple-950/30',
    border: 'border-pink-800',
    text: 'text-pink-300',
    accent: 'text-yellow-400',
    accentBg: 'bg-pink-500/20'
  },
  midnight: {
    name: 'Midnight Blue',
    bg: 'bg-[#0a0a1a]',
    surface: 'bg-blue-950/30',
    border: 'border-blue-800',
    text: 'text-blue-200',
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/20'
  }
};

export const getStoredTheme = (): DefDevTheme => {
  return (localStorage.getItem('defdev_theme') as DefDevTheme) || 'default';
};

export const setStoredTheme = (theme: DefDevTheme) => {
  localStorage.setItem('defdev_theme', theme);
};
