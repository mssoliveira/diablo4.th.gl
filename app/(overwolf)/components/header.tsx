"use client";
import { useSettingsStore } from "@/app/lib/storage";
import { useLayoutEffect, useState } from "react";
import { togglePreferedWindow, useCurrentWindow } from "../lib/windows";
import HeaderToggle from "./header-toggle";
import SVGIcons from "./svg-icons";

export default function Header() {
  const currentWindow = useCurrentWindow();
  const [version, setVersion] = useState("");
  const settingsStore = useSettingsStore();

  const isMaximized = currentWindow?.stateEx === "maximized";

  useLayoutEffect(() => {
    overwolf.extensions.current.getManifest((manifest) => {
      setVersion(manifest.meta.version);
    });
  }, []);

  if (settingsStore.lockedWindow) {
    return (
      <>
        <SVGIcons />
        <button
          className="lock h-[30px] w-[30px] p-1 flex items-center hover:bg-neutral-700 fixed z-10 left-1/2 -translate-x-1/2 text-red-500 rounded-t-lg bg-opacity-5 bg-neutral-800"
          onClick={settingsStore.toggleLockedWindow}
        >
          <svg>
            <use xlinkHref="#icon-lock-open" />
          </svg>
        </button>
        <header className="h-[30px]">
          <div className="h-[30px]" />
        </header>
      </>
    );
  }
  return (
    <>
      <SVGIcons />
      <header
        className={`hidden md:flex items-center h-[30px] relative bg-neutral-800 ${
          settingsStore.overlayMode && settingsStore.overlayTransparentMode
            ? "bg-opacity-5"
            : ""
        }`}
        onMouseDown={() =>
          isMaximized ? null : overwolf.windows.dragMove(currentWindow!.id)
        }
        onDoubleClick={() =>
          isMaximized
            ? overwolf.windows.restore(currentWindow!.id)
            : overwolf.windows.maximize(currentWindow!.id)
        }
      >
        <h1 className="font-mono ml-2">Diablo 4 Map v{version}</h1>

        <div className="flex ml-auto">
          <div className="flex space-x-2">
            <HeaderToggle
              label="2nd Screen"
              checked={!settingsStore.overlayMode}
              onChange={(checked) => {
                settingsStore.setOverlayMode(!checked);
                togglePreferedWindow();
              }}
            />
            <HeaderToggle
              label="Transparent"
              checked={settingsStore.overlayTransparentMode}
              onChange={settingsStore.setOverlayTransparentMode}
            />
            <label className="flex items-center">
              <span className="text-xs font-mono">Opacity</span>
              <input
                className="ml-2 w-16"
                onMouseDown={(event) => event.stopPropagation()}
                type="range"
                step={0.05}
                min={0.45}
                max={1}
                value={settingsStore.windowOpacity}
                onChange={(event) =>
                  settingsStore.setWindowOpacity(+event.target.value)
                }
              />
            </label>
            <button
              className="flex items-center  px-1 hover:bg-neutral-700"
              title="Lock window control"
              onClick={settingsStore.toggleLockedWindow}
            >
              <span className="text-xs font-mono">Lock Window</span>
              <svg className="h-[28px] w-[28px] p-1">
                <use xlinkHref="#icon-lock" />
              </svg>
            </button>
          </div>
          <a
            href="https://discord.com/invite/NTZu8Px"
            target="_blank"
            className="h-[30px] w-[30px] flex items-center hover:bg-[#7289da]"
          >
            <svg>
              <use xlinkHref="#window-control_discord" />
            </svg>
          </a>
          <button
            className="h-[30px] w-[30px] flex items-center hover:bg-neutral-700"
            onClick={() => overwolf.windows.minimize(currentWindow!.id)}
          >
            <svg>
              <use xlinkHref="#window-control_minimize" />
            </svg>
          </button>
          {isMaximized ? (
            <button
              className="h-[30px] w-[30px] flex items-center hover:bg-neutral-700"
              onClick={() => overwolf.windows.restore(currentWindow!.id)}
            >
              <svg>
                <use xlinkHref="#window-control_restore" />
              </svg>
            </button>
          ) : (
            <button
              className="h-[30px] w-[30px] flex items-center hover:bg-neutral-700"
              onClick={() => overwolf.windows.maximize(currentWindow!.id)}
            >
              <svg>
                <use xlinkHref="#window-control_maximize" />
              </svg>
            </button>
          )}
          <button
            className="h-[30px] w-[30px] flex items-center hover:bg-red-600"
            id="close"
            onClick={() => overwolf.windows.close(currentWindow!.id)}
          >
            <svg>
              <use xlinkHref="#window-control_close" />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
}
