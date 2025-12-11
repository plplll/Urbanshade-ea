interface WindowSnapIndicatorProps {
  zone: "left" | "right" | "top" | "bottom-left" | "bottom-right" | "top-left" | "top-right" | null;
}

export const WindowSnapIndicator = ({ zone }: WindowSnapIndicatorProps) => {
  if (!zone) return null;

  const getZoneStyles = () => {
    switch (zone) {
      case "left":
        return "left-2 top-2 bottom-[68px] w-[49%]";
      case "right":
        return "right-2 top-2 bottom-[68px] w-[49%]";
      case "top":
        return "left-2 right-2 top-2 bottom-[68px]";
      case "top-left":
        return "left-2 top-2 w-[49%] h-[calc(50%-36px)]";
      case "top-right":
        return "right-2 top-2 w-[49%] h-[calc(50%-36px)]";
      case "bottom-left":
        return "left-2 bottom-[68px] w-[49%] h-[calc(50%-36px)]";
      case "bottom-right":
        return "right-2 bottom-[68px] w-[49%] h-[calc(50%-36px)]";
      default:
        return "";
    }
  };

  return (
    <div
      className={`fixed ${getZoneStyles()} rounded-xl border-2 border-primary/50 bg-primary/10 backdrop-blur-sm z-[9998] pointer-events-none animate-scale-in`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-xl" />
    </div>
  );
};
