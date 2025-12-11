import { useState, useEffect, useCallback } from "react";

export interface RecentFile {
  id: string;
  name: string;
  type: "app" | "file" | "folder";
  appId?: string;
  path?: string;
  timestamp: number;
}

const MAX_RECENT = 8;

export const useRecentFiles = () => {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(() => {
    const saved = localStorage.getItem("urbanshade_recent_files");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("urbanshade_recent_files", JSON.stringify(recentFiles));
  }, [recentFiles]);

  const addRecent = useCallback((item: Omit<RecentFile, "id" | "timestamp">) => {
    setRecentFiles((prev) => {
      // Remove existing entry with same name/appId
      const filtered = prev.filter(
        (f) => !(f.name === item.name && f.appId === item.appId)
      );
      
      const newItem: RecentFile = {
        ...item,
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      
      return [newItem, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentFiles([]);
  }, []);

  const removeRecent = useCallback((id: string) => {
    setRecentFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return {
    recentFiles,
    addRecent,
    clearRecent,
    removeRecent
  };
};
