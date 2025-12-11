import { useEffect, useRef } from "react";
import { 
  FileText, 
  FolderPlus, 
  Settings, 
  Trash2, 
  Copy, 
  RefreshCw, 
  Monitor, 
  SortAsc, 
  LayoutGrid,
  Palette,
  Cloud,
  ArrowUpAZ,
  Clock,
  FileType,
  Grid3x3,
  List,
  LayoutList,
  ChevronRight
} from "lucide-react";

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  separator?: boolean;
  submenu?: MenuItem[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export const ContextMenu = ({ x, y, items, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onClose]);

  // Adjust position to keep menu on screen
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 400);

  return (
    <div
      ref={menuRef}
      className="fixed z-[999] min-w-[220px] rounded-xl glass-panel border border-border shadow-2xl animate-scale-in py-2"
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
    >
      {items.map((item, index) => (
        <div key={index}>
          {item.separator ? (
            <div className="my-2 mx-3 border-t border-border/30" />
          ) : (
            <button
              onClick={() => {
                item.action();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors group"
            >
              {item.icon && <span className="text-primary w-4 h-4 flex items-center justify-center">{item.icon}</span>}
              <span className="flex-1 text-left">{item.label}</span>
              {item.submenu && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export const getDesktopMenuItems = (
  onNewFolder: () => void,
  onSettings: () => void,
  onRefresh?: () => void,
  onSyncNow?: () => void,
  isOnlineMode?: boolean
): MenuItem[] => {
  const items: MenuItem[] = [
    {
      label: "View",
      icon: <LayoutGrid className="w-4 h-4" />,
      action: () => {}
    },
    {
      label: "Sort by",
      icon: <SortAsc className="w-4 h-4" />,
      action: () => {}
    },
    {
      label: "Refresh",
      icon: <RefreshCw className="w-4 h-4" />,
      action: onRefresh || (() => window.location.reload())
    },
    { separator: true } as MenuItem,
    {
      label: "New Folder",
      icon: <FolderPlus className="w-4 h-4" />,
      action: onNewFolder
    },
    {
      label: "New File",
      icon: <FileText className="w-4 h-4" />,
      action: () => {}
    },
    { separator: true } as MenuItem,
    {
      label: "Display Settings",
      icon: <Monitor className="w-4 h-4" />,
      action: onSettings
    },
    {
      label: "Personalize",
      icon: <Palette className="w-4 h-4" />,
      action: onSettings
    }
  ];

  if (isOnlineMode && onSyncNow) {
    items.push({ separator: true } as MenuItem);
    items.push({
      label: "Sync Now",
      icon: <Cloud className="w-4 h-4" />,
      action: onSyncNow
    });
  }

  return items;
};

export const getFileMenuItems = (
  fileName: string,
  onDelete: () => void,
  onCopy: () => void
): MenuItem[] => [
  {
    label: "Open",
    icon: <FileText className="w-4 h-4" />,
    action: () => {}
  },
  {
    label: "Copy",
    icon: <Copy className="w-4 h-4" />,
    action: onCopy
  },
  { separator: true } as MenuItem,
  {
    label: "Delete",
    icon: <Trash2 className="w-4 h-4" />,
    action: onDelete
  }
];
