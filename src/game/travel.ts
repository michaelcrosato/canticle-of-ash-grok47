import type { GameState, LocationDef } from './types';

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

export function canTravel(state: GameState): boolean {
  return state.released;
}

export function canFight(state: GameState): boolean {
  return state.released;
}
