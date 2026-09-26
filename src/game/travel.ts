import type { GameState, LocationDef, SpellDef } from './types';
import { castSpell } from './magic';

export type TravelMode = 'walk' | 'silt' | 'boat' | 'guide' | 'divine' | 'almsivi' | 'recall' | 'mark';

export function neighbors(loc: LocationDef): { id: string; mode: TravelMode }[] {
  const out: { id: string; mode: TravelMode }[] = [];
  for (const id of loc.walk) out.push({ id, mode: 'walk' });
  for (const id of loc.silt) out.push({ id, mode: 'silt' });
  for (const id of loc.boat) out.push({ id, mode: 'boat' });
  for (const id of loc.guide) out.push({ id, mode: 'guide' });
  if (loc.divine) out.push({ id: loc.divine, mode: 'divine' });
  if (loc.almsivi) out.push({ id: loc.almsivi, mode: 'almsivi' });
  return out;
}

export function canReach(locations: Map<string, LocationDef>, from: string, to: string): boolean {
  if (from === to) return true;
  const seen = new Set<string>();
  const q = [from];
  while (q.length) {
    const id = q.pop()!;
    if (id === to) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    const loc = locations.get(id);
    if (!loc) continue;
    for (const n of neighbors(loc)) {
      if (!seen.has(n.id)) q.push(n.id);
    }
  }
  return false;
}

export function travelTo(
  state: GameState,
  locations: Map<string, LocationDef>,
  dest: string,
  mode: TravelMode,
): { ok: boolean; reason: string } {
  if (!state.released) {
    const opening = new Set(['prison_ship', 'seyda_neen', 'census_office']);
    if (mode !== 'walk' || !opening.has(state.location) || !opening.has(dest)) {
      return { ok: false, reason: 'detained' };
    }
  }
  const here = locations.get(state.location);
  const there = locations.get(dest);
  if (!here || !there) return { ok: false, reason: 'unknown' };
  if (mode === 'mark') {
    state.mark = state.location;
    state.flags.marked = true;
    return { ok: true, reason: 'marked' };
  }
  if (mode === 'recall') {
    if (!state.mark) return { ok: false, reason: 'nomark' };
    state.location = state.mark;
    state.px = 0;
    state.pz = 8;
    return { ok: true, reason: 'recalled' };
  }
  if (mode === 'divine') {
    if (here.divine !== dest) return { ok: false, reason: 'precondition' };
  } else if (mode === 'almsivi') {
    if (here.almsivi !== dest) return { ok: false, reason: 'precondition' };
  } else if (mode === 'walk') {
    if (!here.walk.includes(dest)) return { ok: false, reason: 'precondition' };
  } else if (mode === 'silt') {
    if (!here.silt.includes(dest)) return { ok: false, reason: 'precondition' };
    if (state.gold < 15) return { ok: false, reason: 'gold' };
    state.gold -= 15;
  } else if (mode === 'boat') {
    if (!here.boat.includes(dest)) return { ok: false, reason: 'precondition' };
    if (state.gold < 12) return { ok: false, reason: 'gold' };
    state.gold -= 12;
  } else if (mode === 'guide') {
    if (!here.guide.includes(dest)) return { ok: false, reason: 'precondition' };
    if ((state.factions.mages ?? -1) < 0 && state.gold < 30) return { ok: false, reason: 'gold' };
    if ((state.factions.mages ?? -1) < 0) state.gold -= 30;
  }
  state.location = dest;
  state.px = 0;
  state.py = 0;
  state.pz = 6;
  return { ok: true, reason: mode };
}

/**
 * Mark, Recall, and the interventions move the player only after the same
 * school-and-fatigue roll as any other spell, and only if the spell is known.
 */
export function castTravelSpell(
  state: GameState,
  spells: Map<string, SpellDef>,
  locations: Map<string, LocationDef>,
  spellId: string,
  rng: () => number = Math.random,
): { ok: boolean; success: boolean; reason: string } {
  const cast = castSpell(state, spells, spellId, rng);
  if (!cast.success) return { ok: cast.ok, success: false, reason: cast.reason };
  const spell = spells.get(spellId) ?? state.customSpells.find((s) => s.id === spellId);
  const effect = spell?.effect.id;
  if (effect === 'mark') {
    const moved = travelTo(state, locations, state.location, 'mark');
    return { ok: moved.ok, success: true, reason: moved.reason };
  }
  if (effect === 'recall') {
    if (!state.mark) return { ok: false, success: true, reason: 'nomark' };
    const moved = travelTo(state, locations, state.mark, 'recall');
    return { ok: moved.ok, success: true, reason: moved.reason };
  }
  if (effect === 'divine' || effect === 'almsivi') {
    const here = locations.get(state.location);
    const dest = effect === 'divine' ? here?.divine : here?.almsivi;
    if (!dest) return { ok: false, success: true, reason: 'precondition' };
    const moved = travelTo(state, locations, dest, effect);
    return { ok: moved.ok, success: true, reason: moved.reason };
  }
  return { ok: true, success: true, reason: cast.reason };
}

export function canTravel(state: GameState): boolean {
  return state.released;
}

export function canFight(state: GameState): boolean {
  return state.released;
}
