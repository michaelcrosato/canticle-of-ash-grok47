import type { Cond, GameState, QuestDef } from './types';
import { conditionMet } from './quests';
import { give, hasQty } from './magic';

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
  // Objective flags (Heart severed, Falura agreed, Vivec's answer) are resolved
  // where the actors stand. They must not hide those actors.
  return (
    cond.op === 'quest' ||
    cond.op === 'faction' ||
    cond.op === 'notFlag' ||
    cond.op === 'vampire' ||
    cond.op === 'disease' ||
    cond.op === 'released'
  );
}

/** People and relics stand in a tight spiral inside the plaza, clear of the road ring. */
export function crowdSpots(count: number): { x: number; z: number }[] {
  const out: { x: number; z: number }[] = [];
  if (count <= 0) return out;
  const gap = count > 50 ? 0.78 : 1;
  let i = 0;
  let ring = 0;
  while (i < count) {
    if (ring === 0) {
      out.push({ x: 0, z: 1.2 });
      i++;
      ring++;
      continue;
    }
    const radius = ring * gap;
    const seats = Math.max(6, Math.floor((2 * Math.PI * radius) / gap));
    for (let s = 0; s < seats && i < count; s++) {
      const a = (s / seats) * Math.PI * 2;
      out.push({ x: Math.sin(a) * radius, z: 1.2 + Math.cos(a) * radius * 0.72 });
      i++;
    }
    ring++;
  }
  return out;
}

/** Roads around a cell. Index 0 is straight ahead (−Z). Gates stay farther apart than a step. */
export function doorSpots(count: number): { x: number; z: number }[] {
  if (count <= 0) return [];
  const radius = Math.max(8.5, (count * 3.15) / (2 * Math.PI));
  const out: { x: number; z: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    out.push({ x: Math.sin(angle) * radius, z: -Math.cos(angle) * radius });
  }
  return out;
}

function qtyAsked(cond: Cond | undefined, itemId: string): number {
  if (!cond) return 0;
  if (cond.op === 'item' && cond.id === itemId) return cond.qty ?? 1;
  if (cond.op === 'all' || cond.op === 'any') {
    return cond.of.reduce((n, c) => Math.max(n, qtyAsked(c, itemId)), 0);
  }
  return 0;
}

/** How many of this item the open stage still expects. A unique find asks for one. */
export function gatherNeed(state: GameState, quests: QuestDef[], itemId: string): number {
  let need = 1;
  for (const quest of quests) {
    const rec = state.quests[quest.id];
    if (!rec || rec.complete) continue;
    const asked = qtyAsked(quest.stages[rec.stage]?.complete, itemId);
    if (asked > need) need = asked;
  }
  return need;
}

/** One handful from a node. The pile remains until that quantity is in the pack. */
export function pickup(state: GameState, quests: QuestDef[], itemId: string): { qty: number; need: number; done: boolean } {
  give(state, itemId, 1);
  const qty = state.inventory.find((row) => row.id === itemId)?.qty ?? 0;
  const need = gatherNeed(state, quests, itemId);
  return { qty, need, done: qty >= need };
}

export function nearestHostile(
  actors: { id: string; x: number; z: number; hostile: boolean; hp: number }[],
  x: number,
  z: number,
  max = 2.5,
): string | null {
  let best: string | null = null;
  let bestD = max;
  for (const actor of actors) {
    if (!actor.hostile || actor.hp <= 0) continue;
    const d = Math.hypot(actor.x - x, actor.z - z);
    if (d < bestD) {
      bestD = d;
      best = actor.id;
    }
  }
  return best;
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
      // People stay where they live. Quest items and corpses do not return.
      for (const spawn of quest.spawns) {
        if (spawn.location !== location || spawn.hostile || spawn.item || !spawn.npc) continue;
        if (seen.has(spawn.npc) || state.dead[spawn.npc]) continue;
        seen.add(spawn.npc);
        out.push({ ...spawn, hp: spawn.hp ?? 30, kind: 'npc' });
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
      if (spawn.item && hasQty(state, spawn.item, gatherNeed(state, quests, spawn.item))) continue;
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
