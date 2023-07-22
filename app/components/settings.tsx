import { useGlobalSettingsStore } from "../lib/storage/global-settings";
import Toggle from "./toggle";

export default function Settings() {
  const globalSettingsStore = useGlobalSettingsStore();

  return (
    <>
      <div className="flex">
        <span className="w-1/2">Show Event Timers</span>
        <Toggle
          checked={!!globalSettingsStore.showTimers}
          onChange={globalSettingsStore.toggleShowTimers}
        />
      </div>
      <div className="flex">
        <span className="w-1/2">Stack Event Timers</span>
        <Toggle
          checked={!!globalSettingsStore.stackTimers}
          onChange={globalSettingsStore.toggleStackTimers}
        />
      </div>
      <div className="flex">
        <span className="w-1/2">Show Territory Names</span>
        <Toggle
          checked={!!globalSettingsStore.showTerritoryNames}
          onChange={globalSettingsStore.toggleShowTerritoryNames}
        />
      </div>
      <div className="flex">
        <span className="w-1/2">Alternative Discovered Waypoints Icon</span>
        <Toggle
          checked={!!globalSettingsStore.isAlternativeDiscoveredStyle}
          onChange={globalSettingsStore.toggleIsAlternativeDiscoveredStyle}
        />
      </div>
      <div className="flex">
        <span className="w-1/2">Icon Size</span>
        <input
          className="w-5/12"
          type="range"
          value={globalSettingsStore.iconSize}
          min={0.4}
          max={2}
          step={0.1}
          onChange={(event) =>
            globalSettingsStore.setIconSize(+event.target.value)
          }
        />
      </div>
    </>
  );
}
