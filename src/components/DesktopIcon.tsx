import { useState, useRef } from "react";
import { App } from "./Desktop";

interface DesktopIconProps {
  app: App;
  onOpen: (app: App) => void;
  onDragStart?: (appId: string) => void;
  onDragEnd?: (appId: string, x: number, y: number) => void;
}

export const DesktopIcon = ({ app, onOpen, onDragStart, onDragEnd }: DesktopIconProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    const rect = iconRef.current?.getBoundingClientRect();
    if (rect) {
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      onDragStart?.(app.id);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !iconRef.current) return;
    
    const parent = iconRef.current.parentElement;
    if (!parent) return;
    
    const parentRect = parent.getBoundingClientRect();
    const x = e.clientX - parentRect.left - offset.x;
    const y = e.clientY - parentRect.top - offset.y;
    
    iconRef.current.style.left = `${x}px`;
    iconRef.current.style.top = `${y}px`;
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging || !iconRef.current) return;
    
    const parent = iconRef.current.parentElement;
    if (!parent) return;
    
    const parentRect = parent.getBoundingClientRect();
    const x = e.clientX - parentRect.left - offset.x;
    const y = e.clientY - parentRect.top - offset.y;
    
    onDragEnd?.(app.id, x, y);
    setIsDragging(false);
  };

  // Add/remove global mouse event listeners
  useState(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  return (
    <div
      ref={iconRef}
      className={`w-30 flex flex-col items-center gap-2 text-center select-none group animate-fade-in ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover-scale'}`}
      onDoubleClick={() => app.run()}
      onMouseDown={handleMouseDown}
    >
      <div className={`w-22 h-22 rounded-xl glass-panel flex items-center justify-center text-primary group-hover:urbanshade-glow transition-all duration-300 ${isDragging ? 'scale-110 shadow-lg' : ''}`}>
        {app.icon}
      </div>
      <div className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">{app.name}</div>
    </div>
  );
};
