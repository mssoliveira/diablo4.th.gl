import { useMap } from "@/app/components/(map)/map";
import { useGameInfoStore, useSettingsStore } from "@/app/lib/storage";
import leaflet from "leaflet";
import { useEffect, useRef } from "react";
import { listenToGameLaunched, setFeatures } from "../lib/games";
import PlayerMarker, { normalizePoint } from "./player-marker";

export default function Player() {
  const map = useMap();
  const mounted = useRef(false);
  const gameInfo = useGameInfoStore();
  const followPlayerPosition = useSettingsStore(
    (state) => state.followPlayerPosition
  );
  const marker = useRef<PlayerMarker | null>(null);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const icon = leaflet.icon({
      iconUrl: "/icons/player.webp",
      className: "player",
      iconSize: [36, 36],
    });
    marker.current = new PlayerMarker([0, 0], {
      icon,
      interactive: false,
    });
    marker.current.rotation = 0;
    marker.current.addTo(map);

    let lastPosition = { x: 0, y: 0, z: 0 };
    function onInfoUpdates2(event: overwolf.games.events.InfoUpdates2Event) {
      if (event.feature === "location") {
        try {
          const info = event.info as {
            match_info: {
              location: string;
            };
          };
          const position = normalizePoint(
            JSON.parse(info.match_info.location) as {
              x: number;
              y: number;
              z: number;
            }
          );
          if (position.z < 1) {
            return;
          }
          const rotation =
            (Math.atan2(
              position.y - (lastPosition.y || position.y),
              position.x - (lastPosition.x || position.x)
            ) *
              180) /
            Math.PI;
          lastPosition = position;

          gameInfo.setPlayer({ position, rotation });
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

  useEffect(() => {
    if (!gameInfo.player || !marker.current) {
      return;
    }
    marker.current.updatePosition(gameInfo.player);

    if (followPlayerPosition) {
      map.panTo(marker.current.getLatLng(), {
        duration: 1,
        easeLinearity: 1,
        noMoveStart: true,
      });
    }
  }, [gameInfo.player, followPlayerPosition]);

  return <></>;
}
