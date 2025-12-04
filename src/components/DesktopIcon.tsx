import { App } from "./Desktop";

interface DesktopIconProps {
  app: App;
  onOpen: (app: App) => void;
}

export const DesktopIcon = ({ app, onOpen }: DesktopIconProps) => {
  return (
    <div
      className="w-[100px] flex flex-col items-center gap-2 text-center select-none group animate-fade-in cursor-pointer hover-scale"
      onDoubleClick={() => app.run()}
    >
      <div className="w-16 h-16 rounded-xl glass-panel flex items-center justify-center text-primary group-hover:urbanshade-glow transition-all duration-300">
        <div className="w-10 h-10 flex items-center justify-center [&>svg]:w-10 [&>svg]:h-10">
          {app.icon}
        </div>
      </div>
      <div className="text-xs text-muted-foreground transition-colors group-hover:text-foreground max-w-[90px] truncate">{app.name}</div>
    </div>
  );
};