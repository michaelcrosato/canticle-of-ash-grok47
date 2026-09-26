import type { Attribute, GameState, SpellDef } from './types';
import { ATTRIBUTES } from './types';

export function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

export function fatigueFraction(current: number, max: number): number {
  if (max <= 0) return 0;
  return clamp(current / max, 0, 1);
}

/** Weapon hit chance. Rises with weapon skill, Agility, and fatigue fraction.
 *  Falls as fatigue empties or as defense (sanctuary, block, defender agility) rises.
 */
export function hitChance(args: {
  weaponSkill: number;
  agility: number;
  luck: number;
  fatigue: number;
  fatigueMax: number;
  fortifyAttack?: number;
  defenderAgility?: number;
  defenderLuck?: number;
  defenderFatigue?: number;
  defenderFatigueMax?: number;
  sanctuary?: number;
  block?: number;
}): number {
  const fatA = fatigueFraction(args.fatigue, args.fatigueMax);
  const fatD = fatigueFraction(args.defenderFatigue ?? 1, args.defenderFatigueMax ?? 1);
  const offense =
    (args.weaponSkill + args.agility / 5 + args.luck / 10) * (0.75 + 0.5 * fatA) +
    (args.fortifyAttack ?? 0);
  const defense =
    ((args.defenderAgility ?? 30) / 5 + (args.defenderLuck ?? 40) / 10) * (0.75 + 0.5 * fatD) +
    (args.sanctuary ?? 0) +
    (args.block ?? 0) * 0.15;
  return clamp(offense - defense, 2, 98);
}

/** Spell success. Rises with the school skill and fatigue fraction. Falls as fatigue empties or cost rises. */
export function spellChance(args: {
  schoolSkill: number;
  willpower: number;
  luck: number;
  fatigue: number;
  fatigueMax: number;
  cost: number;
}): number {
  const fat = fatigueFraction(args.fatigue, args.fatigueMax);
  const base = args.schoolSkill * 2 + args.willpower / 5 + args.luck / 10 - args.cost;
  return clamp(base * (0.75 + 0.5 * fat), 2, 100);
}

export function moveSpeed(state: Pick<GameState, 'attributes' | 'fatigue' | 'fatigueMax' | 'inventory' | 'equipment'> & {
  encumbrance?: number;
  capacity?: number;
}): number {
  const speed = state.attributes.speed;
  const fat = fatigueFraction(state.fatigue, state.fatigueMax);
  const cap = state.capacity ?? encumbranceMax(state.attributes.strength);
  const enc = state.encumbrance ?? 0;
  const burden = cap > 0 ? clamp(enc / cap, 0, 1) : 0;
  const base = 2.2 + speed * 0.045;
  return Math.max(2.4, base * (0.85 + 0.15 * fat) * (1 - 0.45 * burden));
}

export function encumbranceMax(strength: number): number {
  return strength * 5;
}

export function healthMaxOf(strength: number, endurance: number): number {
  return Math.max(1, Math.floor((strength + endurance) / 2));
}

export function fatigueMaxOf(a: Record<Attribute, number>): number {
  return a.strength + a.willpower + a.agility + a.endurance;
}

export function magickaMaxOf(intelligence: number, mult: number): number {
  return Math.max(1, Math.floor(intelligence * mult));
}

export function recalcPools(state: GameState, healToFull = false): void {
  const prevH = state.healthMax;
  const prevM = state.magickaMax;
  const prevF = state.fatigueMax;
  state.healthMax = healthMaxOf(state.attributes.strength, state.attributes.endurance);
  state.magickaMax = magickaMaxOf(state.attributes.intelligence, state.magickaMult);
  state.fatigueMax = fatigueMaxOf(state.attributes);
  if (healToFull) {
    state.health = state.healthMax;
    state.magicka = state.stuntedMagicka ? state.magicka : state.magickaMax;
    state.fatigue = state.fatigueMax;
    return;
  }
  state.health = clamp(state.health + (state.healthMax - prevH), 1, state.healthMax);
  if (!state.stuntedMagicka) {
    state.magicka = clamp(state.magicka + (state.magickaMax - prevM), 0, state.magickaMax);
  } else {
    state.magicka = clamp(state.magicka, 0, state.magickaMax);
  }
  state.fatigue = clamp(state.fatigue + (state.fatigueMax - prevF), 0, state.fatigueMax);
}

export function useSkill(state: GameState, skillId: string, amount = 1): number {
  const before = state.skills[skillId] ?? 5;
  const next = clamp(before + amount, 0, 100);
  state.skills[skillId] = next;
  const increased = next - before;
  if (increased > 0 && state.major.includes(skillId)) {
    state.majorProgress += increased;
    if (state.majorProgress >= 10) state.levelUpPending = true;
  }
  return increased;
}

export function levelUp(state: GameState, picks: [Attribute, Attribute, Attribute]): boolean {
  if (!state.levelUpPending) return false;
  for (const p of picks) {
    if (!ATTRIBUTES.includes(p)) return false;
  }
  for (const p of picks) state.attributes[p] += 1;
  const endBonus = Math.floor(state.attributes.endurance / 10);
  state.healthMax += endBonus;
  state.health += endBonus;
  state.level += 1;
  state.majorProgress -= 10;
  if (state.majorProgress < 10) state.levelUpPending = false;
  recalcPools(state);
  return true;
}

export function skillValue(state: GameState, id: string): number {
  return state.skills[id] ?? 5;
}

export function weaponSkillId(state: GameState, skill: string | undefined): number {
  return skillValue(state, skill ?? 'handtohand');
}

export function playerHitChance(state: GameState, weaponSkill: string, defense: { agility?: number; sanctuary?: number; block?: number; armor?: number } = {}): number {
  return hitChance({
    weaponSkill: skillValue(state, weaponSkill),
    agility: state.attributes.agility,
    luck: state.attributes.luck,
    fatigue: state.fatigue,
    fatigueMax: state.fatigueMax,
    fortifyAttack: state.fortifyAttack,
    defenderAgility: defense.agility ?? 40,
    sanctuary: (defense.sanctuary ?? 0) + (defense.armor ?? 0) * 0.05,
    block: defense.block ?? 0,
  });
}

export function playerSpellChance(state: GameState, spell: SpellDef): number {
  return spellChance({
    schoolSkill: skillValue(state, spell.school),
    willpower: state.attributes.willpower,
    luck: state.attributes.luck,
    fatigue: state.fatigue,
    fatigueMax: state.fatigueMax,
    cost: spell.cost,
  });
}

export function armorRating(state: GameState, pieceArmor: { slot: string; armor: number; skill: string }[]): number {
  let rating = 0;
  let any = false;
  for (const piece of pieceArmor) {
    any = true;
    const skill = skillValue(state, piece.skill);
    rating += piece.armor * (0.4 + skill / 200);
  }
  if (!any) rating += skillValue(state, 'unarmored') * 0.15;
  return rating;
}

export function attackDamage(state: GameState, base: number, skillId: string): number {
  const skill = skillValue(state, skillId);
  return Math.max(1, Math.round(base * (0.5 + state.attributes.strength / 100) * (0.5 + skill / 100)));
}

/** Admire. Higher Personality and Speechcraft, and a fuller fatigue bar, raise disposition more. */
export function admire(state: GameState, npcId: string): { delta: number; disposition: number } {
  const speech = skillValue(state, 'speechcraft');
  const per = state.attributes.personality;
  const fat = fatigueFraction(state.fatigue, state.fatigueMax);
  const delta = Math.max(1, Math.round(((speech + per) / 25) * (0.45 + 0.55 * fat)));
  return addDisposition(state, npcId, delta, 'speechcraft');
}

export function intimidate(state: GameState, npcId: string): { delta: number; disposition: number } {
  const speech = skillValue(state, 'speechcraft');
  const str = state.attributes.strength;
  const fat = fatigueFraction(state.fatigue, state.fatigueMax);
  const delta = Math.max(1, Math.round(((speech * 0.6 + str) / 30) * (0.45 + 0.55 * fat)));
  return addDisposition(state, npcId, delta, 'speechcraft');
}

export function taunt(state: GameState, npcId: string): { delta: number; disposition: number; hostile: boolean } {
  const speech = skillValue(state, 'speechcraft');
  const delta = -Math.max(2, Math.round(8 + speech / 20));
  const res = addDisposition(state, npcId, delta, 'speechcraft');
  const hostile = res.disposition < 15;
  if (hostile) state.hostile[npcId] = true;
  return { ...res, hostile };
}

export function bribe(state: GameState, npcId: string, gold: number): { ok: boolean; delta: number; disposition: number; reason: string } {
  if (gold <= 0) return { ok: false, delta: 0, disposition: disp(state, npcId), reason: 'gold' };
  if (state.gold < gold) return { ok: false, delta: 0, disposition: disp(state, npcId), reason: 'poor' };
  state.gold -= gold;
  const speech = skillValue(state, 'speechcraft');
  const delta = Math.max(1, Math.round(gold / 20 + speech / 25));
  const res = addDisposition(state, npcId, delta, 'mercantile');
  return { ok: true, ...res, reason: 'paid' };
}

function disp(state: GameState, npcId: string): number {
  return state.disposition[npcId] ?? 40;
}

function addDisposition(state: GameState, npcId: string, delta: number, skill: string): { delta: number; disposition: number } {
  const next = clamp(disp(state, npcId) + delta, 0, 100);
  state.disposition[npcId] = next;
  useSkill(state, skill);
  state.fatigue = Math.max(0, state.fatigue - 2);
  return { delta, disposition: next };
}

export function roll(chance: number, rng: () => number = Math.random): boolean {
  return rng() * 100 < chance;
}

export function leashStep(pos: { x: number; z: number }, home: { x: number; z: number }, maxR: number): { x: number; z: number } {
  const dx = pos.x - home.x;
  const dz = pos.z - home.z;
  const d = Math.hypot(dx, dz);
  if (d <= maxR || d === 0) return pos;
  const k = maxR / d;
  return { x: home.x + dx * k, z: home.z + dz * k };
}
