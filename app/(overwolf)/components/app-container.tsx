import { useSettingsStore } from "@/app/lib/storage";
import { ReactNode, useEffect } from "react";
import { setInputPassThrough } from "../lib/windows";

export default function AppContainer({ children }: { children: ReactNode }) {
  const settingsStore = useSettingsStore();

  useEffect(() => {
    setInputPassThrough(settingsStore.lockedWindow);
  }, [settingsStore.lockedWindow]);

  return (
    <div
      className={`h-screen flex flex-col text-white app antialiased select-none overflow-hidden ${
        settingsStore.lockedWindow ? "locked" : ""
      }}`}
      style={{
        willChange: "opacity",
        opacity: settingsStore.windowOpacity.toFixed(2),
      }}
    >
      {children}
    </div>
  );
}
