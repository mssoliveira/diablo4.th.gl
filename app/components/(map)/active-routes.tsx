"use client";
import { useRoutesStore } from "@/app/lib/storage/routes";
import leaflet from "leaflet";
import { useEffect } from "react";
import { useMap } from "./map";

export default function ActiveRoutes() {
  const map = useMap();

  const routes = useRoutesStore();

  useEffect(() => {
    if (routes.isCreating) {
      return;
    }
    const layers: leaflet.Layer[] = [];
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
      route.texts?.forEach((textPosition) => {
        const layer = leaflet.marker(textPosition.position, {
          textMarker: true,
          text: textPosition.text,
          interactive: false,
          pmIgnore: false,
        });
        layers.push(layer);
        layer.addTo(map);
      });
    });

    return () => {
      layers.forEach((layer) => {
        layer.remove();
      });
    };
  }, [routes.isCreating, routes.activeRoutes]);

  return <></>;
}
