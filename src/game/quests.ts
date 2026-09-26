import type { Cond, GameState, QuestDef, Reward } from './types';
import { consume, give, hasQty } from './magic';

const TITLES = [
  'mq_hortator_hlaalu',
  'mq_hortator_redoran',
  'mq_hortator_telvanni',
  'mq_nerevarine_urshilaku',
  'mq_nerevarine_ahemmusa',
  'mq_nerevarine_zainab',
  'mq_nerevarine_erabenimsun',
];

/** Vivec offers Wraithguard. Refusal leaves the door open for Yagrum Bagarn. */
export function chooseVivec(state: GameState, accept: boolean): { ok: boolean; reason: string } {
  for (const id of TITLES) {
    if (!state.quests[id]?.complete) return { ok: false, reason: 'precondition' };
  }
  if (state.location !== 'vivec_palace') return { ok: false, reason: 'location' };
  if (!state.flags['talk:vivec']) return { ok: false, reason: 'talk' };
  if (accept) {
    if (!hasQty(state, 'wraithguard', 1)) give(state, 'wraithguard', 1);
    state.flags.vivec_plan = true;
    state.flags.vivec_refused = false;
    return { ok: true, reason: 'plan' };
  }
  state.flags.vivec_refused = true;
  state.flags.vivec_plan = false;
  return { ok: true, reason: 'refused' };
}
import { recalcPools } from './formulas';

export function conditionMet(state: GameState, cond: Cond): boolean {
  switch (cond.op) {
    case 'talk':
      if (cond.at) return !!state.flags[`met:${cond.npc}:${cond.at}`];
      return !!state.flags[`talk:${cond.npc}`];
    case 'item':
      return hasQty(state, cond.id, cond.qty ?? 1);
    case 'at':
      return state.location === cond.location;
    case 'dead':
      return !!state.dead[cond.npc];
    case 'disposition':
      return (state.disposition[cond.npc] ?? 0) >= cond.min;
    case 'equipped':
      return state.equipment.weapon === cond.id || Object.values(state.equipment.armor).includes(cond.id);
    case 'gold':
      return state.gold >= cond.amount;
    case 'flag':
      return !!state.flags[cond.id];
    case 'notFlag':
      return !state.flags[cond.id];
    case 'quest': {
      const q = state.quests[cond.id];
      return !!q?.complete;
    }
    case 'disease':
      return state.diseases.includes(cond.id) === cond.has;
    case 'faction':
      return (state.factions[cond.id] ?? -1) >= cond.rank;
    case 'vampire':
      return !!state.vampire;
    case 'released':
      return state.released;
    case 'all':
      return cond.of.every((c) => conditionMet(state, c));
    case 'any':
      return cond.of.some((c) => conditionMet(state, c));
    default:
      return false;
  }
}

function payCosts(state: GameState, cond: Cond): void {
  switch (cond.op) {
    case 'item':
      if (cond.consume) consume(state, cond.id, cond.qty ?? 1);
      break;
    case 'gold':
      if (cond.consume) state.gold -= cond.amount;
      break;
    case 'all':
    case 'any':
      for (const c of cond.of) {
        if (cond.op === 'any' && !conditionMet(state, c)) continue;
        payCosts(state, c);
      }
      break;
    default:
      break;
  }
}

export function applyReward(state: GameState, reward: Reward | undefined): void {
  if (!reward) return;
  if (reward.gold) state.gold += reward.gold;
  for (const item of reward.items ?? []) give(state, item.id, item.qty ?? 1);
  for (const f of reward.flags ?? []) {
      state.flags[f] = true;
      if (f === 'released') state.released = true;
      if (f === 'heartSevered') {
        state.heartLinked = false;
        state.blightEnded = true;
        state.ending = true;
      }
      if (f === 'blightEnded') state.blightEnded = true;
    }
  for (const f of reward.clearFlags ?? []) state.flags[f] = false;
  if (reward.disease && !state.diseases.includes(reward.disease)) state.diseases.push(reward.disease);
  if (reward.cure) state.diseases = state.diseases.filter((d) => d !== reward.cure);
  if (reward.faction) {
    const cur = state.factions[reward.faction] ?? -1;
    state.factions[reward.faction] = Math.max(cur, reward.rank ?? 0);
  }
  if (reward.disposition) {
    const id = reward.disposition.npc;
    state.disposition[id] = Math.max(0, Math.min(100, (state.disposition[id] ?? 40) + reward.disposition.delta));
  }
  if (reward.spell && !state.spells.includes(reward.spell)) state.spells.push(reward.spell);
  if (reward.vampireClan) state.vampire = reward.vampireClan;
  if (reward.attribute) {
    for (const [k, v] of Object.entries(reward.attribute)) {
      const key = k as keyof typeof state.attributes;
      state.attributes[key] += v ?? 0;
    }
    recalcPools(state);
  }
  if (reward.journal) state.flags[`journal:${reward.journal}`] = true;
}

export function questRecord(state: GameState, id: string): { stage: number; complete: boolean } {
  return state.quests[id] ?? { stage: 0, complete: false };
}

export function advanceQuest(state: GameState, quests: QuestDef[], questId: string): { ok: boolean; reason: string; journal?: string } {
  const quest = quests.find((q) => q.id === questId);
  if (!quest) return { ok: false, reason: 'unknown' };
  const rec = questRecord(state, questId);
  if (rec.complete) return { ok: false, reason: 'done' };
  const stage = quest.stages[rec.stage];
  if (!stage) return { ok: false, reason: 'done' };
  if (!conditionMet(state, stage.complete)) return { ok: false, reason: 'precondition' };
  payCosts(state, stage.complete);
  applyReward(state, stage.reward);
  const next = { stage: rec.stage + 1, complete: rec.stage + 1 >= quest.stages.length };
  state.quests[questId] = next;
  return { ok: true, reason: 'advanced', journal: stage.journal };
}

export function currentJournal(state: GameState, quest: QuestDef): string | null {
  const rec = questRecord(state, quest.id);
  if (rec.complete) return null;
  if (rec.stage === 0 && !state.quests[quest.id]) return null;
  const stage = quest.stages[rec.stage];
  return stage?.journal ?? null;
}

export function activeJournals(state: GameState, quests: QuestDef[]): { id: string; title: string; category: string; text: string }[] {
  const out = [];
  for (const q of quests) {
    const rec = state.quests[q.id];
    if (!rec || rec.complete) continue;
    const stage = q.stages[rec.stage];
    if (!stage) continue;
    out.push({ id: q.id, title: q.title, category: q.category, text: stage.journal });
  }
  return out;
}

/** Dagoth Ur is tied to the Heart. Damage never severs that link. */
export function damageDagothUr(state: GameState, amount: number): { destroyed: boolean; revived: boolean; hp: number } {
  state.dagothHp -= amount;
  if (state.dagothHp > 0) return { destroyed: false, revived: false, hp: state.dagothHp };
  if (state.heartLinked) {
    state.dagothHp = state.dagothMax;
    state.flags.dagothRevived = true;
    return { destroyed: false, revived: true, hp: state.dagothHp };
  }
  state.dagothHp = 0;
  state.flags.dagothUrDestroyed = true;
  return { destroyed: true, revived: false, hp: 0 };
}

/**
 * The Heart yields only to Sunder, then Keening, and only while Wraithguard is worn.
 * That order severs Dagoth Ur and ends the Blight.
 */
export function strikeHeart(state: GameState, tool: 'sunder' | 'keening'): { ok: boolean; reason: string } {
  if (state.location !== 'heart_chamber') return { ok: false, reason: 'location' };
  const worn =
    state.equipment.weapon === 'wraithguard' ||
    Object.values(state.equipment.armor).includes('wraithguard') ||
    !!state.flags.wraithguard_equipped;
  if (!worn && !isWraithguardEquipped(state)) return { ok: false, reason: 'wraithguard' };
  if (!hasQty(state, tool, 1)) return { ok: false, reason: 'tool' };
  if (tool === 'sunder') {
    if (state.flags.heartSundered) return { ok: false, reason: 'already' };
    state.flags.heartSundered = true;
    return { ok: true, reason: 'sundered' };
  }
  if (!state.flags.heartSundered) return { ok: false, reason: 'order' };
  if (state.flags.heartSevered) return { ok: false, reason: 'already' };
  state.flags.heartSevered = true;
  state.flags.heartLinked = false;
  state.heartLinked = false;
  state.flags.dagothUrDestroyed = true;
  state.dagothHp = 0;
  state.blightEnded = true;
  state.flags.blightEnded = true;
  state.diseases = state.diseases.filter((d) => d !== 'blight');
  state.ending = true;
  return { ok: true, reason: 'severed' };
}

export function isWraithguardEquipped(state: GameState): boolean {
  return (
    state.equipment.weapon === 'wraithguard' ||
    Object.values(state.equipment.armor).includes('wraithguard') ||
    !!state.flags.wraithguard_equipped
  );
}

export function equipItem(state: GameState, items: Map<string, { id: string; kind: string; slot?: string }>, id: string): { ok: boolean; reason: string } {
  if (!hasQty(state, id, 1)) return { ok: false, reason: 'missing' };
  const item = items.get(id);
  if (!item) return { ok: false, reason: 'unknown' };
  if (id === 'wraithguard') {
    state.equipment.armor.gauntlet = id;
    state.flags.wraithguard_equipped = true;
    return { ok: true, reason: 'armor' };
  }
  if (item.kind === 'weapon' || id === 'sunder' || id === 'keening') {
    state.equipment.weapon = id;
    return { ok: true, reason: 'weapon' };
  }
  if (item.kind === 'armor' || item.kind === 'clothing') {
    const slot = item.slot ?? 'body';
    state.equipment.armor[slot] = id;
    if (id === 'wraithguard') state.flags.wraithguard_equipped = true;
    return { ok: true, reason: 'armor' };
  }
  return { ok: false, reason: 'notgear' };
}

export function questIsPlayable(quest: QuestDef): boolean {
  return quest.stages.some((s) => condHasWorld(s.complete));
}

function condHasWorld(cond: Cond): boolean {
  switch (cond.op) {
    case 'item':
    case 'at':
    case 'dead':
    case 'disposition':
    case 'equipped':
    case 'gold':
    case 'disease':
      return true;
    case 'all':
    case 'any':
      return cond.of.some(condHasWorld);
    default:
      return false;
  }
}

export function noteTalk(state: GameState, npcId: string): void {
  state.flags[`talk:${npcId}`] = true;
  state.flags[`met:${npcId}:${state.location}`] = true;
}

export function killActor(state: GameState, npcId: string): void {
  state.dead[npcId] = true;
  state.actors[npcId] = 0;
}
