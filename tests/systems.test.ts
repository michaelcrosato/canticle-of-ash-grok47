import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/game/content';
import { ATTRIBUTES } from '../src/game/types';
import { fatigueMaxOf, hitChance, levelUp, moveSpeed, spellChance, useSkill } from '../src/game/formulas';
import { castSpell, drinkPotion, enchantItem, mixPotion, useEnchantment } from '../src/game/magic';
import { admire } from '../src/game/formulas';
import { deserialize, serialize } from '../src/game/save';
import { createNewGame, spellStrike } from '../src/game/state';
import { advanceQuest } from '../src/game/quests';
import { canFight, canTravel, castTravelSpell, travelTo } from '../src/game/travel';
import { nearestHostile, pickup, spawnsAt } from '../src/game/world';
import { PerspectiveCamera, Vector3 } from 'three';
import { moveVectorFromCamera } from '../src/render/frame';

const base = () =>
  createNewGame({ name: 'Nerevar', race: 'darkelf', birthsign: 'warrior', classId: 'mage' });

describe('character and combat rules', () => {
  it('lists ten races, thirteen signs, eight attributes', () => {
    expect(CONTENT.races).toHaveLength(10);
    expect(CONTENT.signs).toHaveLength(13);
    expect(ATTRIBUTES).toHaveLength(8);
  });

  it('race, birthsign, and class change starting pools', () => {
    const nord = createNewGame({ name: 'A', race: 'nord', birthsign: 'steed', classId: 'warrior' });
    const altmer = createNewGame({ name: 'B', race: 'highelf', birthsign: 'atronach', classId: 'mage' });
    expect(nord.attributes.strength).toBeGreaterThan(altmer.attributes.strength);
    expect(nord.attributes.speed).toBeGreaterThan(40);
    expect(altmer.magickaMax).toBeGreaterThan(nord.magickaMax);
    expect(altmer.stuntedMagicka).toBe(true);
    expect(nord.skills.longblade).toBeGreaterThan(nord.skills.destruction);
    expect(altmer.skills.destruction).toBeGreaterThan(altmer.skills.axe);
  });

  it('hit chance rises with skill, agility, and fatigue and falls with defense', () => {
    const low = hitChance({ weaponSkill: 20, agility: 30, luck: 40, fatigue: 10, fatigueMax: 200, sanctuary: 0 });
    const skilled = hitChance({ weaponSkill: 80, agility: 30, luck: 40, fatigue: 10, fatigueMax: 200 });
    const agile = hitChance({ weaponSkill: 20, agility: 90, luck: 40, fatigue: 10, fatigueMax: 200 });
    const fresh = hitChance({ weaponSkill: 20, agility: 30, luck: 40, fatigue: 200, fatigueMax: 200 });
    const guarded = hitChance({ weaponSkill: 20, agility: 30, luck: 40, fatigue: 200, fatigueMax: 200, sanctuary: 40, block: 50 });
    expect(skilled).toBeGreaterThan(low);
    expect(agile).toBeGreaterThan(low);
    expect(fresh).toBeGreaterThan(low);
    expect(guarded).toBeLessThan(fresh);
  });

  it('spell success rises with school skill and fatigue', () => {
    const tired = spellChance({ schoolSkill: 25, willpower: 40, luck: 40, fatigue: 5, fatigueMax: 200, cost: 10 });
    const studied = spellChance({ schoolSkill: 80, willpower: 40, luck: 40, fatigue: 5, fatigueMax: 200, cost: 10 });
    const rested = spellChance({ schoolSkill: 25, willpower: 40, luck: 40, fatigue: 200, fatigueMax: 200, cost: 10 });
    expect(studied).toBeGreaterThan(tired);
    expect(rested).toBeGreaterThan(tired);
  });

  it('a new character is not stuck at a crawl', () => {
    const slow = createNewGame({ name: 'A', race: 'highelf', birthsign: 'mage', classId: 'mage' });
    const speed = moveSpeed({ ...slow, encumbrance: 0, capacity: fatigueMaxOf(slow.attributes) });
    expect(speed).toBeGreaterThanOrEqual(2.4);
  });

  it('major skill use opens a level-up that raises chosen attributes', () => {
    const state = base();
    const major = state.major[0]!;
    const attr = 'strength';
    const before = state.attributes[attr];
    const skillBefore = state.skills[major] ?? 0;
    for (let i = 0; i < 10; i++) useSkill(state, major, 1);
    expect(state.skills[major]).toBeGreaterThan(skillBefore);
    expect(state.levelUpPending).toBe(true);
    expect(levelUp(state, ['strength', 'endurance', 'luck'])).toBe(true);
    expect(state.attributes[attr]).toBeGreaterThan(before);
    expect(state.level).toBe(2);
  });

  it('a potion and a made or enchanted spell change a pool', () => {
    const state = base();
    state.health = 10;
    state.inventory.push({ id: 'marshmerrow', qty: 2 }, { id: 'wickwheat', qty: 2 }, { id: 'soul_gem', qty: 1 });
    const mixed = mixPotion(state, CONTENT.items, 'marshmerrow', 'wickwheat');
    expect(mixed.ok).toBe(true);
    expect(mixed.potion).toBeTruthy();
    CONTENT.items.set(mixed.potion!.id, mixed.potion!);
    const drunk = drinkPotion(state, CONTENT.items, mixed.potion!.id);
    expect(drunk.ok).toBe(true);
    expect(state.health).toBeGreaterThan(10);

    state.skills.restoration = 90;
    state.fatigue = state.fatigueMax;
    state.magicka = state.magickaMax;
    state.health = 12;
    const cast = castSpell(state, CONTENT.spells, 'heal_minor', () => 0);
    expect(cast.success).toBe(true);
    expect(state.health).toBeGreaterThan(12);

    state.skills.enchant = 80;
    state.health = 8;
    const ench = enchantItem(state, 'soul_gem', { id: 'restore_health', name: 'Restore Health', magnitude: 15 }, 'Test Amulet');
    expect(ench.ok).toBe(true);
    const used = useEnchantment(state, ench.id!);
    expect(used.ok).toBe(true);
    expect(state.health).toBeGreaterThan(8);
  });

  it('admiration scales with personality and speechcraft', () => {
    const meek = base();
    meek.attributes.personality = 20;
    meek.skills.speechcraft = 10;
    meek.fatigue = meek.fatigueMax;
    const bold = base();
    bold.attributes.personality = 90;
    bold.skills.speechcraft = 90;
    bold.fatigue = bold.fatigueMax;
    const a = admire(meek, 'stranger');
    const b = admire(bold, 'stranger');
    expect(b.delta).toBeGreaterThan(a.delta);
  });

  it('disposition gates the Zainsubani informant', () => {
    const state = base();
    state.released = true;
    state.location = 'ald_ruhn';
    state.quests.mq_vivec_informants = { stage: 1, complete: true };
    state.flags['talk:caius_cosades'] = true;
    const quests = CONTENT.quests;
    expect(advanceQuest(state, quests, 'mq_zainsubani').ok).toBe(true);
    state.flags['talk:hassour_zainsubani'] = true;
    state.disposition.hassour_zainsubani = 20;
    expect(advanceQuest(state, quests, 'mq_zainsubani').ok).toBe(false);
    state.disposition.hassour_zainsubani = 70;
    expect(advanceQuest(state, quests, 'mq_zainsubani').ok).toBe(true);
  });

  it('save and load round-trips quest, rank, and inventory', () => {
    const state = base();
    state.inventory.push({ id: 'iron_dagger', qty: 2 });
    state.factions.hlaalu = 4;
    state.quests.mq_caius = { stage: 1, complete: true };
    const again = deserialize(serialize(state));
    expect(again.quests.mq_caius?.complete).toBe(true);
    expect(again.factions.hlaalu).toBe(4);
    expect(again.inventory.find((i) => i.id === 'iron_dagger')?.qty).toBe(2);
  });

  it('travel and combat work before the package is delivered', () => {
    const state = base();
    state.released = true;
    state.gold = 100;
    state.location = 'seyda_neen';
    state.inventory.push({ id: 'package_for_caius', qty: 1 });
    expect(state.quests.mq_caius?.complete).toBeFalsy();
    expect(canTravel(state)).toBe(true);
    expect(canFight(state)).toBe(true);
    const moved = travelTo(state, CONTENT.locations, 'balmora', 'silt');
    expect(moved.ok).toBe(true);
    expect(state.location).toBe('balmora');
    expect(state.inventory.some((i) => i.id === 'package_for_caius')).toBe(true);
  });
});

describe('gather, spell kills, and learned travel magic', () => {
  it('sload soap stays in the world until five handfuls are picked up', () => {
    const state = base();
    state.released = true;
    state.factions.telvanni = 0;
    state.quests.tel_003 = { stage: 9, complete: true };
    state.location = 'sadrith_mora';
    state.flags['talk:arara_uvulas'] = true;
    expect(advanceQuest(state, CONTENT.quests, 'tel_004').ok).toBe(true);
    expect(spawnsAt(state, CONTENT.quests, 'sadrith_mora').some((s) => s.item === 'sload_soap')).toBe(true);
    for (let i = 1; i <= 4; i++) {
      const got = pickup(state, CONTENT.quests, 'sload_soap');
      expect(got.qty).toBe(i);
      expect(got.done).toBe(false);
      expect(spawnsAt(state, CONTENT.quests, 'sadrith_mora').some((s) => s.item === 'sload_soap')).toBe(true);
      expect(advanceQuest(state, CONTENT.quests, 'tel_004').ok).toBe(false);
    }
    const last = pickup(state, CONTENT.quests, 'sload_soap');
    expect(last.qty).toBe(5);
    expect(last.done).toBe(true);
    expect(spawnsAt(state, CONTENT.quests, 'sadrith_mora').some((s) => s.item === 'sload_soap')).toBe(false);
    expect(advanceQuest(state, CONTENT.quests, 'tel_004').ok).toBe(true);
  });

  it('a damaging spell records the death of the nearer foe', () => {
    const state = base();
    state.released = true;
    const target = nearestHostile(
      [
        { id: 'far_mark', x: 8, z: 0, hostile: true, hp: 40 },
        { id: 'near_mark', x: 1, z: 0, hostile: true, hp: 12 },
      ],
      0,
      0,
      6,
    );
    expect(target).toBe('near_mark');
    const hit = spellStrike(state, { id: target!, hp: 12 }, 20);
    expect(hit.killed).toBe(true);
    expect(state.dead.near_mark).toBe(true);
    expect(state.actors.near_mark).toBe(0);
    expect(state.dead.far_mark).toBeFalsy();
  });

  it('divine intervention does not move an unlearned, drained, or fizzled cast', () => {
    const state = base();
    state.released = true;
    state.location = 'balmora';
    state.spells = state.spells.filter((id) => id !== 'divine_spell');
    expect(castTravelSpell(state, CONTENT.spells, CONTENT.locations, 'divine_spell').reason).toBe('unlearned');
    expect(state.location).toBe('balmora');
    state.spells.push('divine_spell');
    state.magicka = 0;
    expect(castTravelSpell(state, CONTENT.spells, CONTENT.locations, 'divine_spell').reason).toBe('magicka');
    expect(state.location).toBe('balmora');
    state.magicka = state.magickaMax;
    const fizzle = castTravelSpell(state, CONTENT.spells, CONTENT.locations, 'divine_spell', () => 1);
    expect(fizzle.success).toBe(false);
    expect(state.location).toBe('balmora');
    expect(state.magicka).toBeLessThan(state.magickaMax);
    const cast = castTravelSpell(state, CONTENT.spells, CONTENT.locations, 'divine_spell', () => 0);
    expect(cast.success).toBe(true);
    expect(state.location).not.toBe('balmora');
  });
});

describe('camera frame', () => {
  it('yaw 0 looks down -Z and strafe-right is +X', () => {
    const camera = new PerspectiveCamera();
    camera.rotation.order = 'YXZ';
    camera.rotation.y = 0;
    camera.rotation.x = 0;
    const move = new Vector3();
    moveVectorFromCamera(camera, { forward: 1, strafe: 0 }, move);
    expect(move.z).toBeLessThan(-0.9);
    expect(Math.abs(move.x)).toBeLessThan(0.05);
    moveVectorFromCamera(camera, { forward: 0, strafe: 1 }, move);
    expect(move.x).toBeGreaterThan(0.9);
    expect(Math.abs(move.z)).toBeLessThan(0.05);
  });
});
