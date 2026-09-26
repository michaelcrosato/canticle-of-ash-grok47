import type { Cond, GameState, QuestDef } from './types';
import { conditionMet } from './quests';
import { hasQty } from './magic';

export interface SpawnView {
  location: string;
  npc?: string;
  item?: string;
  hostile?: boolean;
  name: string;
  hp: number;
  leash?: number;
  kind: string;
}

function isGate(cond: Cond): boolean {
  return (
    cond.op === 'quest' ||
    cond.op === 'faction' ||
    cond.op === 'flag' ||
    cond.op === 'notFlag' ||
    cond.op === 'vampire' ||
    cond.op === 'disease' ||
    cond.op === 'released'
  );
}

function gatesOpen(state: GameState, cond: Cond): boolean {
  if (cond.op === 'all') return cond.of.filter(isGate).every((c) => conditionMet(state, c));
  if (cond.op === 'any') return cond.of.some((c) => gatesOpen(state, c));
  if (isGate(cond)) return conditionMet(state, cond);
  return true;
}

export function spawnsAt(state: GameState, quests: QuestDef[], location: string): SpawnView[] {
  const out: SpawnView[] = [];
  const seen = new Set<string>();
  for (const quest of quests) {
    const rec = state.quests[quest.id];
    if (rec?.complete) {
      const giver = quest.spawns.find((s) => s.npc === quest.giver && s.location === location);
      if (giver && !seen.has(giver.npc!)) {
        seen.add(giver.npc!);
        out.push({ ...giver, hp: giver.hp ?? 30, kind: 'npc' });
      }
      continue;
    }
    const started = !!rec;
    const open = started || gatesOpen(state, quest.stages[0]?.complete ?? { op: 'released' });
    if (!open) continue;
    for (const spawn of quest.spawns) {
      if (spawn.location !== location) continue;
      const key = spawn.npc ?? spawn.item ?? spawn.name;
      if (seen.has(key)) continue;
      if (spawn.npc && state.dead[spawn.npc]) continue;
      if (spawn.item && hasQty(state, spawn.item, 1)) continue;
      if (spawn.hostile && !started && spawn.npc !== quest.giver) {
        // Hostile objectives appear once the quest is accepted, or immediately if the only stage is the objective.
        if (quest.stages.length > 1) continue;
      }
      seen.add(key);
      const kind = spawn.hostile ? 'enemy' : spawn.item ? 'item' : 'npc';
      out.push({
        ...spawn,
        hp: spawn.hp ?? (spawn.hostile ? 40 : 30),
        kind,
        leash: spawn.hostile ? 16 : undefined,
      });
    }
  }
  return out;
}

export interface Ambient {
  id: string;
  name: string;
  x: number;
  z: number;
  homeX: number;
  homeZ: number;
  leash: number;
  hp: number;
}

/** Cliff racers stay on a short leash and never crowd a town. */
export function ambientThreats(locationId: string, kind: string): Ambient[] {
  if (kind === 'town' || kind === 'canton' || kind === 'interior' || kind === 'ship') return [];
  const count = kind === 'wild' || kind === 'citadel' || kind === 'gate' ? 2 : 1;
  const out: Ambient[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * 10;
    const z = Math.sin(angle) * 10 - 6;
    out.push({
      id: `racer_${locationId}_${i}`,
      name: 'Cliff Racer',
      x,
      z,
      homeX: x,
      homeZ: z,
      leash: 8,
      hp: 28,
    });
  }
  return out;
}
