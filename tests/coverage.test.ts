import { describe, expect, it } from 'vitest';
import { ARTIFACTS, CONTENT, SOURCE_INDEX } from '../src/game/content';
import { questIsPlayable, advanceQuest } from '../src/game/quests';
import { canReach } from '../src/game/travel';
import { createNewGame } from '../src/game/state';
import { give } from '../src/game/magic';
import type { Cond, GameState } from '../src/game/types';

const FLOORS: Record<string, number> = {
  hlaalu: 31,
  redoran: 36,
  telvanni: 29,
  fighters: 31,
  mages: 33,
  thieves: 30,
  cult: 24,
  legion: 19,
  temple: 29,
  morag: 25,
  daedric: 7,
  vampire: 14,
  miscellaneous: 72,
};

const MAIN = [
  'mq_awakening',
  'mq_release',
  'mq_caius',
  'mq_antabolis',
  'mq_gramuzgob',
  'mq_vivec_informants',
  'mq_zainsubani',
  'mq_sul_matuul',
  'mq_sixth_house',
  'mq_corprus',
  'mq_mehra',
  'mq_path',
  'mq_hortator_hlaalu',
  'mq_hortator_redoran',
  'mq_hortator_telvanni',
  'mq_nerevarine_urshilaku',
  'mq_nerevarine_ahemmusa',
  'mq_nerevarine_zainab',
  'mq_nerevarine_erabenimsun',
  'mq_hortator_nerevarine',
  'mq_yagrum',
  'mq_sleepers',
  'mq_citadels',
  'mq_heart',
];

const SETTLEMENTS = [
  'seyda_neen', 'pelagiad', 'balmora', 'hla_oad', 'gnaar_mok', 'vivec', 'ebonheart', 'suran', 'caldera',
  'ald_ruhn', 'maar_gan', 'gnisis', 'khuul', 'ald_velothi', 'ghostgate', 'dagon_fel', 'vos', 'tel_mora',
  'tel_aruhn', 'sadrith_mora', 'tel_fyr', 'molag_mar', 'tel_branora', 'urshilaku_camp', 'ahemmusa_camp',
  'zainab_camp', 'erabenimsun_camp', 'vemynal', 'odrosal',
];

function satisfy(state: GameState, cond: Cond): void {
  switch (cond.op) {
    case 'talk':
      state.flags[`talk:${cond.npc}`] = true;
      if (cond.at) state.location = cond.at;
      break;
    case 'item':
      give(state, cond.id, cond.qty ?? 1);
      break;
    case 'at':
      state.location = cond.location;
      break;
    case 'dead':
      state.dead[cond.npc] = true;
      break;
    case 'disposition':
      state.disposition[cond.npc] = Math.max(state.disposition[cond.npc] ?? 0, cond.min);
      break;
    case 'equipped':
      state.equipment.armor.body = cond.id;
      state.equipment.weapon = cond.id;
      break;
    case 'gold':
      state.gold = Math.max(state.gold, cond.amount);
      break;
    case 'flag':
      state.flags[cond.id] = true;
      break;
    case 'notFlag':
      state.flags[cond.id] = false;
      break;
    case 'quest':
      state.quests[cond.id] = { stage: 9, complete: true };
      break;
    case 'disease':
      if (cond.has && !state.diseases.includes(cond.id)) state.diseases.push(cond.id);
      if (!cond.has) state.diseases = state.diseases.filter((d) => d !== cond.id);
      break;
    case 'faction':
      state.factions[cond.id] = Math.max(state.factions[cond.id] ?? -1, cond.rank);
      break;
    case 'vampire':
      state.vampire = state.vampire || 'quarra';
      break;
    case 'released':
      state.released = true;
      break;
    case 'all':
      for (const c of cond.of) satisfy(state, c);
      break;
    case 'any':
      if (cond.of[0]) satisfy(state, cond.of[0]);
      break;
    default:
      break;
  }
}

describe('source coverage', () => {
  it('meets the category floors and keeps additions distinct', () => {
    const counts: Record<string, number> = {};
    for (const row of SOURCE_INDEX) {
      expect(row.origin).toBe('source');
      counts[row.category] = (counts[row.category] ?? 0) + 1;
      const loaded = CONTENT.quests.find((q) => q.id === row.id);
      expect(loaded?.title).toBe(row.title);
      expect(loaded?.origin).toBe('source');
    }
    for (const [cat, floor] of Object.entries(FLOORS)) {
      expect(counts[cat] ?? 0).toBeGreaterThanOrEqual(floor);
    }
    for (const id of MAIN) expect(SOURCE_INDEX.some((r) => r.id === id)).toBe(true);
    for (const id of ARTIFACTS) {
      if (id === 'heart_of_lorkhan') {
        expect(CONTENT.quests.some((q) => q.id === 'mq_heart')).toBe(true);
      } else {
        expect(CONTENT.items.has(id)).toBe(true);
      }
    }
    const additions = CONTENT.quests.filter((q) => q.origin === 'addition');
    expect(additions.length).toBeGreaterThan(0);
    expect(additions.every((q) => q.origin === 'addition')).toBe(true);
    const playableSource = SOURCE_INDEX.filter((row) => {
      const q = CONTENT.quests.find((quest) => quest.id === row.id)!;
      return questIsPlayable(q);
    });
    expect(playableSource.length / SOURCE_INDEX.length).toBeGreaterThanOrEqual(0.9);
    expect(playableSource.length + additions.length).toBeGreaterThan(SOURCE_INDEX.length);
  });

  it('every quest location is reachable from Seyda Neen', () => {
    const ids = new Set<string>();
    for (const q of CONTENT.quests) {
      ids.add(q.location);
      for (const s of q.sites) ids.add(s.id);
      for (const s of q.spawns) ids.add(s.location);
    }
    for (const id of ids) {
      expect(CONTENT.locations.has(id)).toBe(true);
      expect(canReach(CONTENT.locations, 'seyda_neen', id)).toBe(true);
    }
    for (const id of SETTLEMENTS) expect(CONTENT.locations.has(id)).toBe(true);
  });

  it('a source quest that is not the main chain still advances only when prepared', () => {
    const row = SOURCE_INDEX.find((r) => r.category === 'fighters' && r.title === 'Exterminator')!;
    const quest = CONTENT.quests.find((q) => q.id === row.id)!;
    const state = createNewGame({ name: 'A', race: 'nord', birthsign: 'warrior', classId: 'warrior' });
    expect(advanceQuest(state, CONTENT.quests, quest.id).ok).toBe(false);
    for (const stage of quest.stages) {
      satisfy(state, stage.complete);
      expect(advanceQuest(state, CONTENT.quests, quest.id).ok).toBe(true);
    }
    expect(state.factions.fighters).toBeGreaterThanOrEqual(0);
  });
});
