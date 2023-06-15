import { useMap } from "@/app/components/(map)/map";
import leaflet from "leaflet";
import { useEffect, useRef } from "react";
import { listenToGameLaunched, setFeatures } from "../lib/games";
import PlayerMarker from "./player-marker";

export default function Player() {
  const map = useMap();
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const icon = leaflet.icon({
      iconUrl: "/icons/player.webp",
      className: "player",
      iconSize: [32, 32],
    });
    const marker = new PlayerMarker([0, 0], {
      icon,
      interactive: false,
    });
    marker.rotation = 0;

    // marker.updatePosition(position);
    marker.addTo(map);
    // map.flyTo(marker.getLatLng(), 2);

    let lastLocation = { x: 0, y: 0, z: 0 };
    function onInfoUpdates2(event: overwolf.games.events.InfoUpdates2Event) {
      if (event.feature === "location") {
        try {
          const info = event.info as {
            match_info: {
              location: string;
            };
          };
          const location = JSON.parse(info.match_info.location) as {
            x: number;
            y: number;
            z: number;
          };
          const rotation =
            (Math.atan2(
              location.y - (lastLocation.y || location.y),
              location.x - (lastLocation.x || location.x)
            ) *
              180) /
              Math.PI -
            135;
          lastLocation = location;

          marker.updatePosition({ location, rotation });
          map.panTo(marker.getLatLng(), {
            duration: 1,
            easeLinearity: 1,
            noMoveStart: true,
          });
        } catch (err) {
          console.error(err);
        }
      }
    }

    function registerEvents() {
      overwolf.games.events.onInfoUpdates2.addListener(onInfoUpdates2);
    }

    function unregisterEvents() {
      overwolf.games.events.onInfoUpdates2.removeListener(onInfoUpdates2);
    }

    listenToGameLaunched(() => {
      unregisterEvents();
      registerEvents();
      setTimeout(setFeatures, 1000);
    });
  }, []);

  return <></>;
}
