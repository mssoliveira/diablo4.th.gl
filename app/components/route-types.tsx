import { ICONS } from "../lib/icons";
import { NODE_TYPE } from "../lib/nodes";
import { ROUTE } from "../lib/storage/routes";

export default function RouteTypes({ route }: { route: ROUTE }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {route.types.map((type) => {
        const icon = ICONS[type.type as NODE_TYPE];
        return (
          <div
            key={type.type}
            className="rounded bg-neutral-800 flex px-1 py-0.5 gap-1"
          >
            <svg
              viewBox="0 0 100 100"
              fill={icon?.color}
              className="h-5 w-5 shrink-0"
            >
              {icon && <path d={icon.path} />}
            </svg>
            <span>{type.count}</span>
          </div>
        );
      })}
    </div>
  );
}
