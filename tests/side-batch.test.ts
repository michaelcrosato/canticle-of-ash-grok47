import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/game/content';
import { SIDE_BATCH } from '../src/game/content/side-batch';
import { admire } from '../src/game/formulas';
import { advanceQuest, noteTalk } from '../src/game/quests';
import { createNewGame, spellStrike } from '../src/game/state';
import type { Cond, GameState, QuestDef } from '../src/game/types';
import { pickup } from '../src/game/world';

const PRIOR_ADDITIONS = [
  'mis_076', 'mis_077', 'mis_078', 'mis_079', 'mis_080', 'mis_081', 'mis_082', 'mis_083',
  'mis_084', 'mis_085', 'mis_086', 'mis_087', 'mis_088', 'mis_089', 'mis_090', 'mis_091',
];

function fresh(): GameState {
  const state = createNewGame({ name: 'Outlander', race: 'darkelf', birthsign: 'steed', classId: 'pilgrim' });
  state.released = true;
  return state;
}

function meet(state: GameState, cond: Cond): void {
  switch (cond.op) {
    case 'at':
      state.location = cond.location;
      break;
    case 'talk':
      if (cond.at) state.location = cond.at;
      noteTalk(state, cond.npc);
      break;
    case 'item': {
      const need = cond.qty ?? 1;
      let guard = 0;
      while ((state.inventory.find((row) => row.id === cond.id)?.qty ?? 0) < need) {
        const before = state.inventory.find((row) => row.id === cond.id)?.qty ?? 0;
        const got = pickup(state, CONTENT.quests, cond.id);
        expect(got.qty).toBe(before + 1);
        guard += 1;
        expect(guard).toBeLessThanOrEqual(need);
      }
      break;
    }
    case 'dead':
      spellStrike(state, { id: cond.npc, hp: 46 }, 80);
      break;
    case 'gold':
      if (state.gold < cond.amount) state.gold = cond.amount;
      break;
    case 'disposition':
      while ((state.disposition[cond.npc] ?? 40) < cond.min) admire(state, cond.npc);
      break;
    case 'all':
      for (const child of cond.of) meet(state, child);
      break;
    default:
      throw new Error(`side quest used ${cond.op}`);
  }
}

function idsIn(cond: Cond, bag: { npc: string[]; item: string[]; loc: string[]; quest: string[] }): void {
  switch (cond.op) {
    case 'talk':
    case 'dead':
    case 'disposition':
      bag.npc.push(cond.npc);
      break;
    case 'item':
      bag.item.push(cond.id);
      break;
    case 'at':
      bag.loc.push(cond.location);
      break;
    case 'quest':
      bag.quest.push(cond.id);
      break;
    case 'all':
    case 'any':
      for (const child of cond.of) idsIn(child, bag);
      break;
    default:
      break;
  }
}

describe('side batch', () => {
  it('adds 31 original errands beside the 408 source rows and the 16 earlier additions', () => {
    expect(CONTENT.sourceIndex).toHaveLength(408);
    expect(SIDE_BATCH).toHaveLength(31);
    const sourceIds = new Set(CONTENT.sourceIndex.map((row) => row.id));
    for (const id of PRIOR_ADDITIONS) {
      const quest = CONTENT.quests.find((q) => q.id === id);
      expect(quest?.origin).toBe('addition');
      expect(sourceIds.has(id)).toBe(false);
    }
    for (const quest of SIDE_BATCH) {
      expect(quest.origin).toBe('addition');
      expect(quest.category).toBe('miscellaneous');
      expect(sourceIds.has(quest.id)).toBe(false);
      expect(quest.summary.startsWith('An original errand, not from any guide')).toBe(true);
      expect(CONTENT.quests.filter((q) => q.id === quest.id)).toHaveLength(1);
    }
    expect(CONTENT.additions).toHaveLength(PRIOR_ADDITIONS.length + SIDE_BATCH.length);
  });

  it('keeps each errand on one existing place with ids that do not collide', () => {
    const sourceNpcs = new Set<string>();
    const sourceItems = new Set<string>();
    for (const quest of CONTENT.quests) {
      if (quest.origin !== 'source') continue;
      if (quest.giver) sourceNpcs.add(quest.giver);
      for (const spawn of quest.spawns) {
        if (spawn.npc) sourceNpcs.add(spawn.npc);
        if (spawn.item) sourceItems.add(spawn.item);
      }
    }
    const npcs = new Set<string>();
    const items = new Set<string>();
    const touches = new Set<string>();
    for (const quest of SIDE_BATCH) {
      expect(quest.location.startsWith('side_')).toBe(false);
      expect(CONTENT.locations.has(quest.location)).toBe(true);
      expect(touches.has(quest.location)).toBe(false);
      touches.add(quest.location);
      expect(quest.faction).toBeUndefined();
      const bag = { npc: [] as string[], item: [] as string[], loc: [] as string[], quest: [] as string[] };
      for (const stage of quest.stages) idsIn(stage.complete, bag);
      expect(bag.quest).toEqual([]);
      const existingLocs = new Set(bag.loc.filter((id) => !id.startsWith('side_')));
      expect([...existingLocs]).toEqual([quest.location]);
      for (const site of quest.sites) {
        expect(site.hub).toBe(quest.location);
        expect(site.id.startsWith(quest.id)).toBe(true);
      }
      const localNpcs = new Set([quest.giver, ...quest.spawns.flatMap((s) => (s.npc ? [s.npc] : [])), ...bag.npc]);
      for (const id of localNpcs) {
        expect(id.startsWith(quest.id)).toBe(true);
        expect(sourceNpcs.has(id)).toBe(false);
        expect(npcs.has(id)).toBe(false);
        npcs.add(id);
      }
      const localItems = new Set([
        ...quest.spawns.flatMap((s) => (s.item ? [s.item] : [])),
        ...quest.stages.flatMap((stage) => (stage.reward?.items ?? []).map((item) => item.id)),
        ...bag.item,
      ]);
      for (const id of localItems) {
        expect(id.startsWith(quest.id)).toBe(true);
        expect(sourceItems.has(id)).toBe(false);
        expect(items.has(id)).toBe(false);
        items.add(id);
      }
    }
  });

  it('accepts only at the touch point and resolves only its own objective', () => {
    for (const quest of SIDE_BATCH) {
      const state = fresh();
      const before = state.quests.mq_awakening?.stage;
      expect(advanceQuest(state, CONTENT.quests, quest.id).ok).toBe(false);
      meet(state, quest.stages[0]!.complete);
      expect(advanceQuest(state, CONTENT.quests, quest.id).ok).toBe(true);
      expect(advanceQuest(state, CONTENT.quests, quest.id).ok).toBe(false);
      const goldBefore = state.gold;
      const packBefore = state.inventory.map((row) => `${row.id}:${row.qty}`).join(',');
      meet(state, quest.stages[1]!.complete);
      expect(advanceQuest(state, CONTENT.quests, quest.id).ok).toBe(true);
      expect(state.quests[quest.id]).toEqual({ stage: 2, complete: true });
      const changed =
        state.gold !== goldBefore ||
        state.inventory.map((row) => `${row.id}:${row.qty}`).join(',') !== packBefore ||
        Object.keys(state.flags).some((flag) => flag.startsWith(quest.id));
      expect(changed).toBe(true);
      expect(state.quests.mq_awakening?.stage).toBe(before);
      expect(state.quests.mq_caius?.complete).toBeFalsy();
    }
  });

  it('the prison-ship awakening still opens only after Jiub is spoken to', () => {
    const state = fresh();
    expect(state.location).toBe('prison_ship');
    expect(advanceQuest(state, CONTENT.quests, 'mq_awakening').ok).toBe(false);
    noteTalk(state, 'jiub');
    expect(advanceQuest(state, CONTENT.quests, 'mq_awakening').ok).toBe(true);
    expect(state.quests.mq_awakening).toEqual({ stage: 1, complete: true });
  });
});
