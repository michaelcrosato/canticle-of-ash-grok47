import type { EffectSpec, GameState, ItemDef, SpellDef } from './types';
import { playerSpellChance, roll, skillValue, useSkill } from './formulas';

export interface MixResult {
  ok: boolean;
  reason: string;
  potion?: ItemDef;
}

export function sharedEffects(a: ItemDef, b: ItemDef): { id: string; name: string }[] {
  const eb = new Map((b.effects ?? []).map((e) => [e.id, e]));
  return (a.effects ?? []).filter((e) => eb.has(e.id));
}

/** Combine two ingredients that share an effect into a potion the character can drink. */
export function mixPotion(state: GameState, items: Map<string, ItemDef>, aId: string, bId: string): MixResult {
  if (!hasQty(state, aId, 1) || !hasQty(state, bId, 1) || (aId === bId && !hasQty(state, aId, 2))) {
    return { ok: false, reason: 'ingredients' };
  }
  const a = items.get(aId);
  const b = items.get(bId);
  if (!a || !b) return { ok: false, reason: 'unknown' };
  const shared = sharedEffects(a, b);
  if (shared.length === 0) return { ok: false, reason: 'noeffect' };
  consume(state, aId, 1);
  consume(state, bId, 1);
  useSkill(state, 'alchemy');
  const effect = shared[0]!;
  const skill = skillValue(state, 'alchemy');
  const mag = Math.max(5, Math.round(8 + skill / 5));
  const potion: ItemDef = {
    id: `potion_${effect.id}_${Math.floor(skill)}_${state.day}`,
    name: `Potion of ${effect.name}`,
    kind: 'potion',
    weight: 0.2,
    value: 15 + skill,
    effect: { id: effect.id, name: effect.name, magnitude: mag, duration: 30 },
  };
  give(state, potion.id, 1);
  return { ok: true, reason: 'mixed', potion };
}

export function drinkPotion(state: GameState, items: Map<string, ItemDef>, id: string): { ok: boolean; reason: string } {
  const item = items.get(id);
  if (!item?.effect) return { ok: false, reason: 'notpotion' };
  if (!hasQty(state, id, 1)) return { ok: false, reason: 'missing' };
  const applied = applyEffect(state, item.effect, 'self');
  if (!applied.ok) return applied;
  consume(state, id, 1);
  return { ok: true, reason: applied.reason };
}

export function applyEffect(state: GameState, effect: EffectSpec, target: 'self' | 'enemy'): { ok: boolean; reason: string; damage?: number; healed?: number } {
  const id = effect.id;
  if (id === 'restore_health' && target === 'self') {
    const before = state.health;
    state.health = Math.min(state.healthMax, state.health + effect.magnitude);
    return { ok: true, reason: 'healed', healed: state.health - before };
  }
  if (id === 'restore_fatigue' && target === 'self') {
    state.fatigue = Math.min(state.fatigueMax, state.fatigue + effect.magnitude);
    return { ok: true, reason: 'rested' };
  }
  if (id === 'restore_magicka' && target === 'self') {
    state.magicka = Math.min(state.magickaMax, state.magicka + effect.magnitude);
    return { ok: true, reason: 'magicka' };
  }
  if (id === 'damage_health' || id === 'fire_damage' || id === 'absorb_health') {
    let mag = effect.magnitude;
    if (id === 'fire_damage') {
      const resist = (state.resist.fire ?? 0) - (state.weakness.fire ?? 0);
      mag = Math.max(1, Math.round(mag * (1 - resist / 100)));
    }
    if (target === 'self') {
      state.health = Math.max(0, state.health - mag);
      return { ok: true, reason: 'hurt', damage: mag };
    }
    return { ok: true, reason: 'damage', damage: mag };
  }
  if (id === 'resist_fire') {
    state.resist.fire = Math.min(100, (state.resist.fire ?? 0) + effect.magnitude);
    return { ok: true, reason: 'resist' };
  }
  if (id === 'sanctuary' || id === 'shield') {
    state.sanctuary += effect.magnitude;
    return { ok: true, reason: 'guarded' };
  }
  if (id === 'fortify_attack') {
    state.fortifyAttack += effect.magnitude;
    return { ok: true, reason: 'fortified' };
  }
  if (id === 'bound_weapon') {
    state.flags.bound_weapon = true;
    if (!state.equipment.weapon) state.equipment.weapon = 'bound_longsword';
    return { ok: true, reason: 'bound' };
  }
  if (id === 'cure_disease') {
    if (state.diseases.includes('corprus')) return { ok: false, reason: 'incurable' };
    state.diseases = state.diseases.filter((d) => d !== 'swamp_fever' && d !== 'porphyric');
    return { ok: true, reason: 'cured' };
  }
  if (id === 'cure_blight') {
    if (state.diseases.includes('corprus')) return { ok: false, reason: 'incurable' };
    state.diseases = state.diseases.filter((d) => d !== 'blight');
    return { ok: true, reason: 'cured' };
  }
  if (id === 'cure_corprus') {
    state.diseases = state.diseases.filter((d) => d !== 'corprus' && d !== 'blight');
    state.attributes.endurance += 5;
    state.attributes.strength += 5;
    state.healthMax += 10;
    state.health = state.healthMax;
    return { ok: true, reason: 'corprus' };
  }
  if (id === 'invisibility' || id === 'night_eye' || id === 'charm' || id === 'open' || id === 'turn_undead') {
    state.flags[`power_${id}`] = true;
    return { ok: true, reason: id };
  }
  if (id === 'water_breathing') {
    state.flags.water_breathing = true;
    return { ok: true, reason: 'water' };
  }
  return { ok: true, reason: id };
}

export function castSpell(
  state: GameState,
  spells: Map<string, SpellDef>,
  spellId: string,
  rng: () => number = Math.random,
): { ok: boolean; success: boolean; chance: number; reason: string; damage?: number; healed?: number } {
  const spell = spells.get(spellId) ?? state.customSpells.find((s) => s.id === spellId);
  if (!spell) return { ok: false, success: false, chance: 0, reason: 'unknown' };
  const known = state.spells.includes(spellId) || state.customSpells.some((s) => s.id === spellId);
  if (!known) return { ok: false, success: false, chance: 0, reason: 'unlearned' };
  if (state.magicka < spell.cost) return { ok: false, success: false, chance: 0, reason: 'magicka' };
  const chance = playerSpellChance(state, spell);
  state.magicka -= spell.cost;
  state.fatigue = Math.max(0, state.fatigue - 4);
  useSkill(state, spell.school);
  const success = roll(chance, rng);
  if (!success) return { ok: true, success: false, chance, reason: 'fizzle' };
  const applied = applyEffect(state, spell.effect, spell.effect.id.includes('damage') || spell.effect.id === 'fire_damage' ? 'enemy' : 'self');
  return { ok: true, success: true, chance, reason: applied.reason, damage: applied.damage, healed: applied.healed };
}

export function makeSpell(state: GameState, effect: EffectSpec, school: string, name: string): SpellDef {
  const cost = Math.max(5, Math.round(effect.magnitude / 2 + 4));
  const goldCost = 50 + cost * 3;
  if (state.gold < goldCost) {
    return { id: '', name: '', school, cost: 0, effect, made: false };
  }
  state.gold -= goldCost;
  useSkill(state, 'spellmaking' in state.skills ? 'mysticism' : 'mysticism');
  const spell: SpellDef = {
    id: `made_${effect.id}_${state.customSpells.length}`,
    name,
    school,
    cost,
    effect,
    made: true,
  };
  state.customSpells.push(spell);
  state.spells.push(spell.id);
  useSkill(state, school);
  return spell;
}

export function enchantItem(
  state: GameState,
  soulGemId: string,
  effect: EffectSpec,
  name: string,
): { ok: boolean; reason: string; id?: string } {
  if (!hasQty(state, soulGemId, 1)) return { ok: false, reason: 'soul' };
  const chance = Math.min(95, 20 + skillValue(state, 'enchant'));
  useSkill(state, 'enchant');
  consume(state, soulGemId, 1);
  if (chance < 25 && skillValue(state, 'enchant') < 20) return { ok: false, reason: 'failed' };
  const id = `ench_${effect.id}_${state.enchantments.length}`;
  state.enchantments.push({ id, name, effect, charges: 10 + Math.floor(skillValue(state, 'enchant') / 5) });
  return { ok: true, reason: 'enchanted', id };
}

export function useEnchantment(state: GameState, id: string): { ok: boolean; reason: string; damage?: number; healed?: number } {
  const ench = state.enchantments.find((e) => e.id === id);
  if (!ench) return { ok: false, reason: 'missing' };
  if (ench.charges <= 0) return { ok: false, reason: 'empty' };
  ench.charges -= 1;
  useSkill(state, 'enchant');
  const applied = applyEffect(state, ench.effect, ench.effect.id.includes('damage') || ench.effect.id === 'fire_damage' ? 'enemy' : 'self');
  return { ok: true, reason: applied.reason, damage: applied.damage, healed: applied.healed };
}

export function hasQty(state: GameState, id: string, qty: number): boolean {
  const row = state.inventory.find((i) => i.id === id);
  return !!row && row.qty >= qty;
}

export function consume(state: GameState, id: string, qty: number): void {
  const row = state.inventory.find((i) => i.id === id);
  if (!row) return;
  row.qty -= qty;
  if (row.qty <= 0) state.inventory = state.inventory.filter((i) => i.qty > 0);
  if (state.equipment.weapon === id) state.equipment.weapon = undefined;
}

export function give(state: GameState, id: string, qty = 1): void {
  const row = state.inventory.find((i) => i.id === id);
  if (row) row.qty += qty;
  else state.inventory.push({ id, qty });
}

export function cureCommon(state: GameState): { ok: boolean; reason: string } {
  return applyEffect(state, { id: 'cure_disease', name: 'Cure Disease', magnitude: 1 }, 'self');
}
