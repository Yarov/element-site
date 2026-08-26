"use client";

import { useEffect } from "react";

export function useUnsavedChangesWarning(active: boolean) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}