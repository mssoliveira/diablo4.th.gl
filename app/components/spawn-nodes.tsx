import { SPAWN_ICONS } from "../lib/icons";
import spawnNodes from "../lib/spawn-nodes";
import { useDict } from "./(i18n)/i18n-provider";
import useFilters from "./use-filters";

export default function SpawnNodes() {
  const dict = useDict();
  const [filters, toggleFilter] = useFilters();

  return (
    <div>
      {Object.entries(SPAWN_ICONS).map(([key, icon]) => (
        <button
          key={key}
          className={`flex items-center hover:bg-neutral-700 p-2 w-full ${
            !filters.includes(key) ? "text-gray-500" : ""
          }`}
          onClick={() => {
            toggleFilter(key);
          }}
        >
          <svg viewBox="0 0 100 100" fill={icon.color} className="h-5">
            <path d={icon.path} />
          </svg>
          <span className="flex-1 text-left mx-3">
            {dict.nodes[key as keyof typeof SPAWN_ICONS]}
          </span>
          <span>{spawnNodes[key as keyof typeof SPAWN_ICONS].length}</span>
        </button>
      ))}
    </div>
  );
}
