import type { CharacterChoices, GameState, ItemDef, QuestDef, SpellDef } from './types';
import { ATTRIBUTES } from './types';
import { CLASSES, RACES, SIGNS, SKILLS, classById, raceById, signById } from './content/chargen';
import { attackDamage, armorRating, playerHitChance, recalcPools, roll, skillValue, useSkill } from './formulas';
import { applyEffect, give, hasQty } from './magic';
import { damageDagothUr, killActor, noteTalk } from './quests';

export function createNewGame(choices: CharacterChoices): GameState {
  const race = raceById(choices.race) ?? RACES[2]!;
  const sign = signById(choices.birthsign) ?? SIGNS[9]!;
  const preset = choices.classId ? classById(choices.classId) : undefined;
  const custom = choices.custom;
  const specialization = custom?.specialization ?? preset?.specialization ?? 'combat';
  const major = custom?.major ?? preset?.major ?? CLASSES[0]!.major;
  const minor = custom?.minor ?? preset?.minor ?? CLASSES[0]!.minor;
  const className = custom?.name ?? preset?.name ?? 'Wanderer';
  const attributes = { ...race.attributes };
  for (const key of ATTRIBUTES) attributes[key] += sign.attributes?.[key] ?? 0;
  const skills: Record<string, number> = {};
  for (const skill of SKILLS) {
    let v = 5;
    if (minor.includes(skill.id)) v += 10;
    if (major.includes(skill.id)) v += 25;
    if (skill.specialization === specialization) v += 5;
    v += race.skills[skill.id] ?? 0;
    skills[skill.id] = Math.min(100, v);
  }
  const magickaMult = race.magickaMult + (sign.magickaMult ?? 0);
  const spells = new Set<string>([...race.powers, ...sign.powers]);
  const schoolOf = (id: string) => SKILLS.find((s) => s.id === id)?.school;
  const bestSchool = [...major].map((id) => ({ id, v: skills[id] ?? 0 })).sort((a, b) => b.v - a.v).find((s) => schoolOf(s.id));
  if (bestSchool?.id === 'destruction' || specialization === 'combat') spells.add('fire_bite');
  if (bestSchool?.id === 'restoration' || major.includes('restoration')) spells.add('heal_minor');
  if (major.includes('alteration')) spells.add('shield_spell');
  if (major.includes('illusion')) spells.add('sanctuary_spell');
  if (major.includes('conjuration')) spells.add('bound_blade');
  if (major.includes('mysticism')) spells.add('detect_spell');
  spells.add('heal_minor');
  spells.add('mark_spell');
  spells.add('recall_spell');
  spells.add('divine_spell');
  spells.add('almsivi_spell');
  const state: GameState = {
    version: 1,
    name: choices.name.trim() || 'Outlander',
    race: race.id,
    birthsign: sign.id,
    className,
    specialization,
    major: [...major],
    minor: [...minor],
    attributes,
    skills,
    magickaMult,
    fortifyAttack: sign.fortifyAttack ?? 0,
    spellAbsorb: sign.spellAbsorb ?? 0,
    stuntedMagicka: !!sign.stuntedMagicka,
    resist: { ...race.resist },
    weakness: { ...(race.weakness ?? {}), ...(sign.weakness ?? {}) },
    health: 1,
    healthMax: 1,
    magicka: 1,
    magickaMax: 1,
    fatigue: 1,
    fatigueMax: 1,
    gold: 0,
    inventory: [],
    equipment: { armor: {} },
    location: 'prison_ship',
    yaw: 0,
    pitch: 0,
    px: 0,
    py: 0,
    pz: 2,
    released: false,
    level: 1,
    majorProgress: 0,
    levelUpPending: false,
    quests: { mq_awakening: { stage: 0, complete: false } },
    factions: {},
    disposition: { hassour_zainsubani: 30, yngling_half_troll: 35, orvas_dren: 25, falura_llervu: 32, neloth: 20 },
    dead: {},
    actors: {},
    flags: {},
    diseases: [],
    vampire: false,
    day: 1,
    spells: [...spells],
    customSpells: [],
    enchantments: [],
    guidance: true,
    quality: 'low',
    camera: 'first',
    mute: false,
    volume: 0.7,
    blightEnded: false,
    heartLinked: true,
    dagothHp: 400,
    dagothMax: 400,
    ending: false,
    hostile: {},
    sanctuary: 0,
  };
  recalcPools(state, true);
  return state;
}

export function carryWeight(state: GameState, items: Map<string, ItemDef>): number {
  let w = 0;
  for (const row of state.inventory) w += (items.get(row.id)?.weight ?? 0) * row.qty;
  return w;
}

export function equippedPieces(state: GameState, items: Map<string, ItemDef>): { slot: string; armor: number; skill: string }[] {
  const out = [];
  for (const id of Object.values(state.equipment.armor)) {
    const item = items.get(id);
    if (item?.armor && item.slot) out.push({ slot: item.slot, armor: item.armor, skill: item.skill ?? 'unarmored' });
  }
  return out;
}

export function playerDefense(state: GameState, items: Map<string, ItemDef>): number {
  return armorRating(state, equippedPieces(state, items)) + state.sanctuary;
}

export interface StrikeResult {
  hit: boolean;
  chance: number;
  damage: number;
  killed: boolean;
  revived: boolean;
  reason: string;
}

export function resolveStrike(
  state: GameState,
  items: Map<string, ItemDef>,
  target: { id: string; hp: number; skill: number; armor: number; agility?: number },
  rng: () => number = Math.random,
): StrikeResult {
  if (!state.released) return { hit: false, chance: 0, damage: 0, killed: false, revived: false, reason: 'detained' };
  const weapon = state.equipment.weapon ? items.get(state.equipment.weapon) : undefined;
  const skillId = weapon?.skill ?? (state.flags.bound_weapon ? 'longblade' : 'handtohand');
  const base = weapon?.damage ?? (state.flags.bound_weapon ? 14 : 5);
  const chance = playerHitChance(state, skillId, { armor: target.armor, agility: target.agility ?? 40, block: target.skill * 0.05 });
  useSkill(state, skillId);
  state.fatigue = Math.max(0, state.fatigue - 5);
  const hit = roll(chance, rng);
  if (!hit) return { hit: false, chance, damage: 0, killed: false, revived: false, reason: 'miss' };
  let damage = attackDamage(state, base, skillId);
  damage = Math.max(1, damage - Math.floor(target.armor / 8));
  if (target.id === 'dagoth_ur') {
    const res = damageDagothUr(state, damage);
    return { hit: true, chance, damage, killed: res.destroyed, revived: res.revived, reason: res.revived ? 'revived' : res.destroyed ? 'destroyed' : 'hit' };
  }
  const hp = Math.max(0, (state.actors[target.id] ?? target.hp) - damage);
  state.actors[target.id] = hp;
  if (hp <= 0) {
    killActor(state, target.id);
    if (target.id === 'dagoth_gares' && !state.diseases.includes('corprus')) state.diseases.push('corprus');
    if (target.id.startsWith('vampire_') || target.id === 'raxle_berne') {
      const clan = target.id.includes('quarra') ? 'quarra' : target.id.includes('berne') || target.id === 'raxle_berne' ? 'berne' : 'aundae';
      infectPorphyric(state, clan);
    }
    return { hit: true, chance, damage, killed: true, revived: false, reason: 'kill' };
  }
  return { hit: true, chance, damage, killed: false, revived: false, reason: 'hit' };
}

export function talkTo(state: GameState, npcId: string, quests: QuestDef[]): void {
  noteTalk(state, npcId);
  if (npcId === 'huleeya' && state.location === 'huleeya_hideout' && state.flags['talk:huleeya']) {
    state.flags.huleeya_safe = true;
  }
  if (npcId === 'huleeya' && state.location === 'jobasha') state.flags.huleeya_met = true;
  if (npcId === 'falura_llervu' && (state.disposition.falura_llervu ?? 0) >= 55 && hasQty(state, 'ceremonial_robe', 1)) {
    state.flags.falura_agreed = true;
  }
  void quests;
}

export function rest(state: GameState): { days: number; vampire: boolean; cured: boolean } {
  state.day += 1;
  state.fatigue = state.fatigueMax;
  if (!state.stuntedMagicka) state.magicka = state.magickaMax;
  if (!state.vampire) state.health = Math.min(state.healthMax, state.health + Math.ceil(state.healthMax * 0.3));
  let vampire = false;
  if (state.diseases.includes('porphyric') && !state.vampire) {
    if (state.porphyricSince === undefined) state.porphyricSince = state.day;
    if (state.day - state.porphyricSince >= 3) {
      const clan = state.flags.sire_quarra ? 'quarra' : state.flags.sire_berne ? 'berne' : 'aundae';
      state.vampire = clan;
      state.diseases = state.diseases.filter((d) => d !== 'porphyric');
      state.attributes.strength += 20;
      state.attributes.willpower += 20;
      state.attributes.speed += 20;
      recalcPools(state);
      vampire = true;
    }
  }
  return { days: state.day, vampire, cured: false };
}

export function infectPorphyric(state: GameState, clan: string): void {
  if (state.vampire || state.diseases.includes('corprus')) return;
  if (!state.diseases.includes('porphyric')) state.diseases.push('porphyric');
  if (state.porphyricSince === undefined) state.porphyricSince = state.day;
  state.flags[`sire_${clan}`] = true;
}

export function cureAttempt(state: GameState, kind: 'disease' | 'blight' | 'corprus'): { ok: boolean; reason: string } {
  if (kind === 'corprus') {
    return applyEffect(state, { id: 'cure_corprus', name: 'Corprus Cure', magnitude: 1 }, 'self');
  }
  if (kind === 'blight') return applyEffect(state, { id: 'cure_blight', name: 'Cure Blight', magnitude: 1 }, 'self');
  return applyEffect(state, { id: 'cure_disease', name: 'Cure Disease', magnitude: 1 }, 'self');
}

export function skillOfWeapon(state: GameState, items: Map<string, ItemDef>): string {
  const id = state.equipment.weapon;
  if (!id) return 'handtohand';
  return items.get(id)?.skill ?? 'handtohand';
}

export { skillValue, give };
