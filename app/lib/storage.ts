import { Mutate, StoreApi, create } from "zustand";
import { persist } from "zustand/middleware";
import { NODE_TYPE, getID, nodes, spawnNodes, staticNodes } from "./nodes";

export const ALL_FILTERS = [
  ...Object.keys(staticNodes),
  ...Object.keys(spawnNodes),
];

type StoreWithPersist<State = any> = Mutate<
  StoreApi<State>,
  [["zustand/persist", State]]
>;

export const withStorageDOMEvents = (store: StoreWithPersist) => {
  if (typeof window === "undefined") {
    return;
  }
  const storageEventCallback = (e: StorageEvent) => {
    try {
      if (e.key && e.key === store.persist.getOptions().name && e.newValue) {
        store.persist.rehydrate();
      }
    } catch (error) {
      console.error(error);
    }
  };

  window.addEventListener("storage", storageEventCallback);

  return () => {
    window.removeEventListener("storage", storageEventCallback);
  };
};

function filterDiscoveredNodes(discoveredNodes: string[]) {
  try {
    if (!Array.isArray(discoveredNodes)) {
      return [];
    } else if (
      discoveredNodes.some((node: unknown) => typeof node !== "string")
    ) {
      return [];
    }
    return [
      ...new Set(
        discoveredNodes
          .map((nodeId) => {
            if (nodes.some((node) => node.id === nodeId)) {
              return nodeId;
            }
            const [type, rest] = nodeId.split(":");
            if (!rest) {
              return null;
            }
            if (!(type in staticNodes)) {
              return null;
            }
            const name = rest.split("-")[0];
            if (!name) {
              return null;
            }

            let node = (
              staticNodes[
                type as keyof typeof staticNodes
              ] as (typeof staticNodes)[keyof typeof staticNodes]
            ).find((node) => node.name === name);
            if (!node) {
              if (type === "dungeons") {
                node = staticNodes.campaignDungeons.find(
                  (node) => node.name === name
                );
                if (node) {
                  return getID(node, "campaignDungeons");
                }
                node = staticNodes.sideQuestDungeons.find(
                  (node) => node.name === name
                );
                if (node) {
                  return getID(node, "sideQuestDungeons");
                } else {
                  return null;
                }
              } else {
                return null;
              }
            }
            return getID(node, type as NODE_TYPE);
          })
          .filter(Boolean) as string[]
      ),
    ];
  } catch (error) {
    return [];
  }
}
export const useDiscoveredNodesStore = create(
  persist<{
    discoveredNodes: string[];
    toggleDiscoveredNode: (node: string) => void;
    setDiscoveredNodes: (discoveredNodes: string[]) => void;
  }>(
    (set) => ({
      discoveredNodes: [],
      toggleDiscoveredNode: (node) =>
        set((state) => {
          if (state.discoveredNodes.includes(node)) {
            return {
              discoveredNodes: state.discoveredNodes.filter((n) => n !== node),
            };
          } else {
            return { discoveredNodes: [...state.discoveredNodes, node] };
          }
        }),
      setDiscoveredNodes: (discoveredNodes) =>
        set({ discoveredNodes: filterDiscoveredNodes(discoveredNodes) }),
    }),
    {
      name: "discovered-nodes-storage",
      version: 1,
      migrate: (persistedState: any) => {
        return persistedState;
      },
      merge: (persistentState: any, currentState) => {
        if (persistentState?.discoveredNodes) {
          persistentState.discoveredNodes = filterDiscoveredNodes(
            persistentState.discoveredNodes
          );
        }
        return { ...currentState, ...persistentState };
      },
    }
  )
);

withStorageDOMEvents(useDiscoveredNodesStore);

export const useAccountStore = create(
  persist<{
    isPatron: boolean;
    setIsPatron: (isPatron: boolean) => void;
  }>(
    (set) => ({
      isPatron: false,
      setIsPatron: (isPatron) => set({ isPatron }),
    }),
    {
      name: "account-storage",
    }
  )
);

withStorageDOMEvents(useAccountStore);

// App and Website
export const useGlobalSettingsStore = create(
  persist<{
    // App and Website
    showTerritoryNames: boolean;
    toggleShowTerritoryNames: () => void;
    iconSize: number;
    setIconSize: (iconSize: number) => void;
    filters: string[];
    setFilters: (filters: string[]) => void;
    showFilters: boolean;
    toggleShowFilters: () => void;
    showTimers: boolean;
    toggleShowTimers: () => void;
    showSidebar: boolean;
    toggleShowSidebar: () => void;
  }>(
    (set) => {
      let filters = ALL_FILTERS;
      if (typeof window !== "undefined" && typeof overwolf === "undefined") {
        const filtersString = new URLSearchParams(window.location.search).get(
          "filters"
        );
        if (filtersString) {
          filters = filtersString.split(",");
        }
      }

      return {
        showTerritoryNames: true,
        toggleShowTerritoryNames: () =>
          set((state) => ({
            showTerritoryNames: !state.showTerritoryNames,
          })),
        iconSize: 1,
        setIconSize: (iconSize) => set({ iconSize }),
        filters,
        setFilters: (filters) => set({ filters }),
        showFilters: false,
        toggleShowFilters: () =>
          set((state) => ({ showFilters: !state.showFilters })),
        showTimers: true,
        toggleShowTimers: () =>
          set((state) => ({ showTimers: !state.showTimers })),
        showSidebar:
          typeof document !== "undefined"
            ? document.body.clientWidth >= 768
            : false,
        toggleShowSidebar: () =>
          set((state) => ({
            showSidebar: !state.showSidebar,
          })),
      };
    },
    {
      name: "global-settings-storage",
      merge: (persistentState: any, currentState) => {
        if (
          typeof overwolf === "undefined" &&
          currentState.filters.length !== ALL_FILTERS.length
        ) {
          persistentState.filters = currentState.filters;
        }
        return { ...currentState, ...persistentState };
      },
    }
  )
);

// App only
export const useSettingsStore = create(
  persist<{
    overlayMode: boolean | null;
    setOverlayMode: (overlayMode: boolean) => void;
    overlayTransparentMode: boolean;
    setOverlayTransparentMode: (overlayTransparentMode: boolean) => void;
    windowOpacity: number;
    setWindowOpacity: (windowOpacity: number) => void;
    lockedWindow: boolean;
    toggleLockedWindow: () => void;
    locale: string;
    setLocale: (locale: string) => void;
    followPlayerPosition: boolean;
    toggleFollowPlayerPosition: () => void;
    showTraceLine: boolean;
    toggleShowTraceLine: () => void;
    adTransform: string;
    setAdTransform: (adTransform: string) => void;
  }>(
    (set) => {
      return {
        overlayMode: null,
        setOverlayMode: (overlayMode) =>
          set({
            overlayMode,
          }),
        overlayTransparentMode: false,
        setOverlayTransparentMode: (overlayTransparentMode) =>
          set({ overlayTransparentMode }),
        windowOpacity: 1,
        setWindowOpacity: (windowOpacity) => set({ windowOpacity }),
        lockedWindow: false,
        toggleLockedWindow: () =>
          set((state) => ({ lockedWindow: !state.lockedWindow })),
        locale: "en",
        setLocale: (locale) => set({ locale }),
        followPlayerPosition: true,
        toggleFollowPlayerPosition: () =>
          set((state) => ({
            followPlayerPosition: !state.followPlayerPosition,
          })),
        showTraceLine: true,
        toggleShowTraceLine: () =>
          set((state) => ({ showTraceLine: !state.showTraceLine })),
        adTransform: "",
        setAdTransform: (adTransform) => set({ adTransform }),
      };
    },
    {
      name: "settings-storage",
    }
  )
);

withStorageDOMEvents(useSettingsStore);

export const useGameInfoStore = create<{
  player: {
    position: {
      x: number;
      y: number;
      z: number;
    };
    rotation: number;
    area: number;
    territory: number;
  } | null;
  setPlayer: (player: {
    position: {
      x: number;
      y: number;
      z: number;
    };
    rotation: number;
    area: number;
    territory: number;
  }) => void;
}>((set) => ({
  player: null,
  setPlayer: (player) => set({ player }),
}));
