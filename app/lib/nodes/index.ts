import { additionalMonsters } from "./additionalMonsters";
import { alchemists } from "./alchemists";
import { altars } from "./altars";
import { campaignDungeons } from "./campaignDungeons";
import { campaignQuests } from "./campaignQuests";
import { cellars } from "./cellars";
import { chestsAny } from "./chests_any";
import { chestsT1 } from "./chests_t1";
import { chestsT2 } from "./chests_t2";
import { chestsT3 } from "./chests_t3";
import { dungeons } from "./dungeons";
import { events } from "./events";
import { harbingers } from "./harbingers";
import { healers } from "./healers";
import { highValueTargets } from "./high_value_targets";
import { jewelers } from "./jewelers";
import { banditMonsters } from "./monsters_bandit";
import { cannibalMonsters } from "./monsters_cannibal";
import { cultistMonsters } from "./monsters_cultist";
import { demonMonsters } from "./monsters_demon";
import { drownMonsters } from "./monsters_drown";
import { fallenMonsters } from "./monsters_fallen";
import { ghostMonsters } from "./monsters_ghost";
import { goatmanMonsters } from "./monsters_goatman";
import { knightMonsters } from "./monsters_knight";
import { skeletonMonsters } from "./monsters_skeleton";
import { snakeMonsters } from "./monsters_snake";
import { spiderMonsters } from "./monsters_spider";
import { vampireMonsters } from "./monsters_vampire";
import { werewolfMonsters } from "./monsters_werewolf";
import { wildlifeMonsters } from "./monsters_wildlife";
import { zombieMonsters } from "./monsters_zombie";
import { occultists } from "./occultists";
import { sideQuestDungeons } from "./sideQuestDungeons";
import { sideQuests } from "./sideQuests";
import { stableMasters } from "./stableMasters";
import { strongholds } from "./strongholds";
import { waypoints } from "./waypoints";

export const spawnNodes = {
  chestsAny,
  chestsT1,
  chestsT2,
  chestsT3,
  harbingers,
  highValueTargets,
  banditMonsters,
  cannibalMonsters,
  cultistMonsters,
  demonMonsters,
  drownMonsters,
  fallenMonsters,
  ghostMonsters,
  goatmanMonsters,
  knightMonsters,
  skeletonMonsters,
  snakeMonsters,
  spiderMonsters,
  vampireMonsters,
  werewolfMonsters,
  wildlifeMonsters,
  zombieMonsters,
  additionalMonsters,
} as const;

export const staticNodes = {
  alchemists,
  altars,
  cellars,
  dungeons,
  campaignDungeons,
  sideQuestDungeons,
  healers,
  jewelers,
  occultists,
  stableMasters,
  waypoints,
  campaignQuests,
  sideQuests,
  events,
  strongholds,
} as const;

export type NODE_TYPE = keyof typeof staticNodes | keyof typeof spawnNodes;
export type SIMPLE_NODE = (typeof spawnNodes &
  typeof staticNodes)[NODE_TYPE][number];
export type NODE = SIMPLE_NODE & { id: string; type: NODE_TYPE };

export function getID(node: SIMPLE_NODE, type: NODE_TYPE) {
  return `${type}:${"name" in node ? node.name : type}${node.x},${node.y}`;
}

export const nodes: NODE[] = [];
Object.keys(staticNodes).forEach((_type) => {
  const type = _type as keyof typeof staticNodes;
  staticNodes[type].forEach((node) => {
    const id = getID(node, type);
    nodes.push({ ...node, id, type });
  });
});
Object.keys(spawnNodes).forEach((_type) => {
  const type = _type as keyof typeof spawnNodes;
  spawnNodes[type].forEach((node) => {
    const id = getID(node, type);
    nodes.push({ ...node, id, type });
  });
});

nodes.reverse();
