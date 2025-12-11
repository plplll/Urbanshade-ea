import { useState, useCallback } from "react";

export type SnapZone = "left" | "right" | "top" | "bottom-left" | "bottom-right" | "top-left" | "top-right" | null;

export const useWindowSnap = () => {
  const [snapZone, setSnapZone] = useState<SnapZone>(null);
  const EDGE_THRESHOLD = 20;
  const CORNER_SIZE = 100;

  const detectSnapZone = useCallback((x: number, y: number): SnapZone => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 60; // Account for taskbar

    // Check corners first
    if (x <= EDGE_THRESHOLD && y <= CORNER_SIZE) return "top-left";
    if (x >= screenWidth - EDGE_THRESHOLD && y <= CORNER_SIZE) return "top-right";
    if (x <= EDGE_THRESHOLD && y >= screenHeight - CORNER_SIZE) return "bottom-left";
    if (x >= screenWidth - EDGE_THRESHOLD && y >= screenHeight - CORNER_SIZE) return "bottom-right";

    // Check edges
    if (x <= EDGE_THRESHOLD) return "left";
    if (x >= screenWidth - EDGE_THRESHOLD) return "right";
    if (y <= EDGE_THRESHOLD) return "top";

    return null;
  }, []);

  const getSnapDimensions = useCallback((zone: SnapZone) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - 60; // Account for taskbar

    switch (zone) {
      case "left":
        return { x: 0, y: 0, width: screenWidth / 2, height: screenHeight };
      case "right":
        return { x: screenWidth / 2, y: 0, width: screenWidth / 2, height: screenHeight };
      case "top":
        return { x: 0, y: 0, width: screenWidth, height: screenHeight };
      case "top-left":
        return { x: 0, y: 0, width: screenWidth / 2, height: screenHeight / 2 };
      case "top-right":
        return { x: screenWidth / 2, y: 0, width: screenWidth / 2, height: screenHeight / 2 };
      case "bottom-left":
        return { x: 0, y: screenHeight / 2, width: screenWidth / 2, height: screenHeight / 2 };
      case "bottom-right":
        return { x: screenWidth / 2, y: screenHeight / 2, width: screenWidth / 2, height: screenHeight / 2 };
      default:
        return null;
    }
  }, []);

  const handleDragMove = useCallback((x: number, y: number) => {
    const zone = detectSnapZone(x, y);
    setSnapZone(zone);
    return zone;
  }, [detectSnapZone]);

  const handleDragEnd = useCallback((x: number, y: number) => {
    const zone = detectSnapZone(x, y);
    setSnapZone(null);
    return zone ? getSnapDimensions(zone) : null;
  }, [detectSnapZone, getSnapDimensions]);

  const clearSnapZone = useCallback(() => {
    setSnapZone(null);
  }, []);

  return {
    snapZone,
    handleDragMove,
    handleDragEnd,
    clearSnapZone,
    getSnapDimensions
  };
};
