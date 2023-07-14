import { useMap } from "@/app/components/(map)/map";
import { useGameInfoStore } from "@/app/lib/storage/game-info";
import { useSettingsStore } from "@/app/lib/storage/settings";
import leaflet from "leaflet";
import { useEffect, useRef } from "react";
import { getGameInfo, listenToGameLaunched, setFeatures } from "../lib/games";
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

    let isActive = false;
    let lastPosition = { x: 0, y: 0, z: 0 };
    let lastTerritory = 0;
    async function updateMatchInfo() {
      try {
        const latestGameInfo = await getGameInfo();
        if (latestGameInfo?.match_info) {
          const position = normalizePoint(
            JSON.parse(latestGameInfo.match_info.location) as {
              x: number;
              y: number;
              z: number;
            }
          );
          let map = {
            area: 0,
            territory: 0,
          };
          try {
            map = JSON.parse(latestGameInfo.match_info.map) as {
              area: number;
              territory: number;
            };
          } catch (err) {
            //
          }
          if (
            lastPosition.x !== position.x ||
            lastPosition.y !== position.y ||
            lastTerritory !== map.territory
          ) {
            const rotation =
              (Math.atan2(
                position.y - (lastPosition.y || position.y),
                position.x - (lastPosition.x || position.x)
              ) *
                180) /
              Math.PI;
            lastPosition = position;
            lastTerritory = map.territory;

            gameInfo.setPlayer({
              position,
              rotation,
              area: map.area,
              territory: map.territory,
            });
          }
        }
      } catch (err) {
        // console.error(err);
      } finally {
        setTimeout(updateMatchInfo, 50);
      }
    }

    listenToGameLaunched(() => {
      if (!isActive) {
        isActive = false;
        updateMatchInfo();
      }

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
