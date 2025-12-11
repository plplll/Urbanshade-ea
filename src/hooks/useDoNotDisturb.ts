import { useState, useEffect, useCallback } from "react";

export const useDoNotDisturb = () => {
  const [isDndEnabled, setIsDndEnabled] = useState(() => {
    return localStorage.getItem("settings_dnd") === "true";
  });

  useEffect(() => {
    const handleStorage = () => {
      setIsDndEnabled(localStorage.getItem("settings_dnd") === "true");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleDnd = useCallback(() => {
    const newValue = !isDndEnabled;
    setIsDndEnabled(newValue);
    localStorage.setItem("settings_dnd", newValue.toString());
  }, [isDndEnabled]);

  const setDnd = useCallback((value: boolean) => {
    setIsDndEnabled(value);
    localStorage.setItem("settings_dnd", value.toString());
  }, []);

  return {
    isDndEnabled,
    toggleDnd,
    setDnd
  };
};
