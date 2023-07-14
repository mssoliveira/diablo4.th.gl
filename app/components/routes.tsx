import { nodes } from "@/app/lib/nodes";
import leaflet, { Polyline } from "leaflet";
import { nanoid } from "nanoid";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useOverwolfRouter } from "../(overwolf)/components/overwolf-router";
import { ROUTE, useRoutesStore } from "../lib/storage/routes";
import { useMap } from "./(map)/map";
import RouteTypes from "./route-types";
import Toggle from "./toggle";

const EMPTY_ROUTE: ROUTE = {
  id: "",
  name: "",
  types: [],
  positions: [],
};
export default function Routes() {
  const map = useMap();
  const routes = useRoutesStore();
  const [tempRoute, setTempRoute] = useState<ROUTE>(EMPTY_ROUTE);
  const router = useOverwolfRouter();

  const setRoutePositions = useCallback((workingLayers: leaflet.Polyline[]) => {
    const types: ROUTE["types"] = [];
    const positions: ROUTE["positions"] = [];

    workingLayers.forEach((workingLayer) => {
      const latLngs = workingLayer.getLatLngs() as leaflet.LatLng[];
      if (latLngs.length === 0) {
        return;
      }
      const layerPositions = latLngs.map((latLng) => {
        const snappedNode = nodes.find((node) =>
          latLng.equals([node.x, node.y])
        );
        if (snappedNode) {
          const existingType = types.find(
            ({ type }) => type === snappedNode.type
          );
          if (existingType) {
            existingType.count++;
          } else {
            types.push({
              type: snappedNode.type as string,
              count: 1,
            });
          }
          return {
            position: [latLng.lat, latLng.lng] as [number, number],
            nodeId: snappedNode.id,
            nodeType: snappedNode.type as string,
          };
        }
        return {
          position: [latLng.lat, latLng.lng] as [number, number],
        };
      });
      positions.push(layerPositions);
    });

    setTempRoute((tempRoute) => ({
      ...tempRoute,
      types,
      positions,
    }));
  }, []);

  useEffect(() => {
    if (!routes.isCreating || !map) {
      return;
    }

    const workingLayers: leaflet.Polyline[] = [];
    tempRoute.positions.forEach((layerPositions) => {
      const workingLayer = leaflet.polyline(
        layerPositions.map(({ position }) => position)
      );
      workingLayer.options.pmIgnore = false;
      leaflet.PM.reInitLayer(workingLayer);
      workingLayer.on("pm:edit", () => {
        setRoutePositions([workingLayer]);
      });
      workingLayers.push(workingLayer);
      workingLayer.addTo(map);
    });

    map.on("pm:drawstart", ({ workingLayer, shape }) => {
      if (shape !== "Line") {
        return;
      }
      workingLayers.push(workingLayer as Polyline);
      workingLayer.on("pm:change", () => {
        setRoutePositions(workingLayers);
      });
    });

    map.on("pm:create", (e) => {
      e.layer.options.pmIgnore = false;
      leaflet.PM.reInitLayer(e.layer);
      workingLayers.push(e.layer as Polyline);

      e.layer.on("pm:edit", () => {
        setRoutePositions(workingLayers);
      });
    });

    map.pm.enableDraw("Line");

    return () => {
      map.pm.disableDraw();
      map.pm.disableGlobalEditMode();
      map.off("pm:drawstart");
      map.off("pm:create");
      workingLayers.forEach((layer) => {
        layer.remove();
      });
      setTempRoute(EMPTY_ROUTE);
    };
  }, [routes.isCreating, map]);

  useEffect(() => {
    if (routes.isCreating || !map) {
      return;
    }
    const layers: leaflet.Polyline[] = [];
    routes.activeRoutes.forEach((activeRoute) => {
      const route = routes.routes.find(({ id }) => id === activeRoute);
      if (!route) {
        return;
      }

      route.positions.forEach((layerPositions) => {
        const layer = leaflet.polyline(
          layerPositions.map(({ position }) => position)
        );
        layers.push(layer);
        layer.addTo(map);
      });
    });

    return () => {
      layers.forEach((layer) => {
        layer.remove();
      });
    };
  }, [routes.isCreating, routes.activeRoutes, map]);

  if (routes.isCreating) {
    return (
      <div className="divide-y divide-neutral-700 border-t border-t-neutral-600 bg-neutral-900 text-gray-200 text-sm w-full md:border md:border-gray-600 md:rounded-lg">
        <div className="flex leaflet-pm-toolbar">
          <button
            className="flex gap-1 p-2 uppercase hover:text-white w-1/2 justify-center"
            onClick={() => map.pm.enableDraw("Line")}
          >
            <div className="control-icon leaflet-pm-icon-polyline !w-5 !h-5" />
            <span>Add Line</span>
          </button>
          <button
            className="flex gap-1 p-2 uppercase hover:text-white w-1/2 justify-center"
            onClick={() => map.pm.toggleGlobalEditMode()}
          >
            <div className="control-icon leaflet-pm-icon-edit !w-5 !h-5" />
            <span>Edit Lines</span>
          </button>
        </div>
        <div className="flex flex-col p-2 gap-1">
          <input
            className="bg-neutral-900 text-gray-200 text-sm px-2 py-1 w-full border border-gray-600 md:rounded-lg outline-none"
            type="text"
            placeholder="Give this route an explanatory name"
            required
            autoFocus
            value={tempRoute.name}
            onChange={(event) =>
              setTempRoute({ ...tempRoute, name: event.target.value })
            }
          />
          <RouteTypes route={tempRoute} />
          <p className="text-xs text-neutral-400">
            You can add multiple lines and connect every node on the map.
            Right-click in edit mode removes a vertex.
          </p>
        </div>
        <div className="flex">
          <button
            className="p-2 uppercase hover:text-white w-1/2"
            onClick={() => {
              routes.setIsCreating(false);
            }}
          >
            Cancel
          </button>
          <button
            className={`p-2 uppercase w-1/2 ${
              tempRoute.name.length === 0 ? "text-gray-500" : "hover:text-white"
            }`}
            onClick={() => {
              if (tempRoute.id.length === 0) {
                routes.addRoute({
                  ...tempRoute,
                  id: nanoid(),
                });
              } else {
                routes.editRoute(tempRoute.id, tempRoute);
              }
              routes.setIsCreating(false);
            }}
            disabled={tempRoute.name.length === 0}
          >
            Save
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="divide-y divide-neutral-700 border-t border-t-neutral-600 bg-neutral-900 text-gray-200 text-sm w-full md:border md:border-gray-600 md:rounded-lg">
      <div className="flex">
        <button
          className="p-2 uppercase hover:text-white w-1/2"
          onClick={() => {
            routes.setIsCreating(true);
          }}
        >
          Create
        </button>
        <label className="p-2 uppercase hover:text-white w-1/2 text-center">
          <input
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              const reader = new FileReader();
              reader.addEventListener("load", (loadEvent) => {
                const text = loadEvent.target?.result;
                if (!text || typeof text !== "string") {
                  return;
                }
                try {
                  const route = JSON.parse(text);
                  if (
                    !Array.isArray(route.types) ||
                    !Array.isArray(route.positions) ||
                    typeof route.name !== "string" ||
                    typeof route.id !== "string"
                  ) {
                    throw new Error("Invalid route");
                  }
                  if (routes.routes.some(({ id }) => id === route.id)) {
                    routes.editRoute(route.id, route);
                  } else {
                    routes.addRoute(route);
                  }
                } catch (error) {
                  // Do nothing
                }
                event.target.value = "";
              });
              reader.readAsText(file);
            }}
          />
          Import
        </label>
      </div>
      <p className="text-xs text-neutral-400 p-2">
        Join the{" "}
        <Link
          target="_blank"
          href="https://discord.com/invite/NTZu8Px"
          className="text-neutral-300 hover:text-white"
        >
          Discord server
        </Link>{" "}
        to explore and share routes with other players. You can also import and
        export routes here.
      </p>
      <div className="overflow-auto max-h-full">
        {routes.routes.length === 0 && (
          <div className="p-2">No routes created</div>
        )}
        {routes.routes.map((route) => (
          <article key={route.id} className={`p-2 space-y-1`}>
            <div className="flex justify-between">
              <Toggle
                checked={routes.activeRoutes.includes(route.id)}
                onChange={(checked) =>
                  checked
                    ? routes.addActiveRoute(route.id)
                    : routes.removeActiveRoute(route.id)
                }
                small
              />
              <div className="space-x-3">
                {"update" in router ? (
                  <button
                    className="hover:text-white"
                    onClick={() => {
                      overwolf.io.writeFileContents(
                        `${overwolf.io.paths.documents}\\Diablo 4 Map\\route_${route.id}.json`,
                        JSON.stringify(route),
                        "UTF8" as overwolf.io.enums.eEncoding.UTF8,
                        true,
                        () => console.log
                      );
                      overwolf.utils.openWindowsExplorer(
                        `${overwolf.io.paths.documents}\\Diablo 4 Map`,
                        console.log
                      );
                    }}
                  >
                    Export
                  </button>
                ) : (
                  <a
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(
                      JSON.stringify(route)
                    )}`}
                    download={`route_${route.id}.json`}
                    className="hover:text-white"
                  >
                    Export
                  </a>
                )}
                <button
                  className="hover:text-white"
                  onClick={() => {
                    setTempRoute(route);
                    routes.setIsCreating(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="hover:text-white"
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to delete this route?")
                    ) {
                      routes.removeRoute(route.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="truncate text-base">{route.name}</div>
            <RouteTypes route={route} />
          </article>
        ))}
      </div>
    </div>
  );
}
