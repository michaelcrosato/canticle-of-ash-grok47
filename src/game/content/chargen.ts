import type { Attribute, ClassDef, RaceDef, SignDef, SkillDef, Specialty } from '../types';
import { ATTRIBUTES } from '../types';

const A = (s: number, i: number, w: number, ag: number, sp: number, e: number, p: number, l: number): Record<Attribute, number> => ({
  strength: s,
  intelligence: i,
  willpower: w,
  agility: ag,
  speed: sp,
  endurance: e,
  personality: p,
  luck: l,
});

export const SKILLS: SkillDef[] = [
  { id: 'armorer', name: 'Armorer', attribute: 'strength', specialization: 'combat' },
  { id: 'athletics', name: 'Athletics', attribute: 'speed', specialization: 'combat' },
  { id: 'axe', name: 'Axe', attribute: 'strength', specialization: 'combat' },
  { id: 'block', name: 'Block', attribute: 'agility', specialization: 'combat' },
  { id: 'blunt', name: 'Blunt Weapon', attribute: 'strength', specialization: 'combat' },
  { id: 'heavyarmor', name: 'Heavy Armor', attribute: 'endurance', specialization: 'combat' },
  { id: 'longblade', name: 'Long Blade', attribute: 'strength', specialization: 'combat' },
  { id: 'mediumarmor', name: 'Medium Armor', attribute: 'endurance', specialization: 'combat' },
  { id: 'spear', name: 'Spear', attribute: 'endurance', specialization: 'combat' },
  { id: 'alchemy', name: 'Alchemy', attribute: 'intelligence', specialization: 'magic' },
  { id: 'alteration', name: 'Alteration', attribute: 'willpower', specialization: 'magic', school: true },
  { id: 'conjuration', name: 'Conjuration', attribute: 'intelligence', specialization: 'magic', school: true },
  { id: 'destruction', name: 'Destruction', attribute: 'willpower', specialization: 'magic', school: true },
  { id: 'enchant', name: 'Enchant', attribute: 'intelligence', specialization: 'magic' },
  { id: 'illusion', name: 'Illusion', attribute: 'personality', specialization: 'magic', school: true },
  { id: 'mysticism', name: 'Mysticism', attribute: 'willpower', specialization: 'magic', school: true },
  { id: 'restoration', name: 'Restoration', attribute: 'willpower', specialization: 'magic', school: true },
  { id: 'unarmored', name: 'Unarmored', attribute: 'speed', specialization: 'magic' },
  { id: 'acrobatics', name: 'Acrobatics', attribute: 'strength', specialization: 'stealth' },
  { id: 'handtohand', name: 'Hand-to-hand', attribute: 'speed', specialization: 'stealth' },
  { id: 'lightarmor', name: 'Light Armor', attribute: 'agility', specialization: 'stealth' },
  { id: 'marksman', name: 'Marksman', attribute: 'agility', specialization: 'stealth' },
  { id: 'mercantile', name: 'Mercantile', attribute: 'personality', specialization: 'stealth' },
  { id: 'security', name: 'Security', attribute: 'intelligence', specialization: 'stealth' },
  { id: 'shortblade', name: 'Short Blade', attribute: 'speed', specialization: 'stealth' },
  { id: 'sneak', name: 'Sneak', attribute: 'agility', specialization: 'stealth' },
  { id: 'speechcraft', name: 'Speechcraft', attribute: 'personality', specialization: 'stealth' },
];

export const SKILL_IDS = SKILLS.map((s) => s.id);

function bonuses(pairs: [string, number][]): Record<string, number> {
  return Object.fromEntries(pairs);
}

export const RACES: RaceDef[] = [
  {
    id: 'argonian',
    name: 'Argonian',
    attributes: A(40, 40, 30, 50, 50, 30, 30, 40),
    skills: bonuses([['alchemy', 5], ['athletics', 10], ['illusion', 5], ['mysticism', 5], ['spear', 10], ['unarmored', 5], ['mediumarmor', 5]]),
    magickaMult: 1,
    powers: ['argonian_breath'],
    resist: { poison: 75, disease: 75 },
    lore: 'A marsh-born people. They breathe water and shrug off poison.',
  },
  {
    id: 'breton',
    name: 'Breton',
    attributes: A(30, 50, 50, 30, 30, 30, 40, 40),
    skills: bonuses([['alchemy', 5], ['alteration', 5], ['conjuration', 10], ['illusion', 5], ['mysticism', 10], ['restoration', 10], ['speechcraft', 5]]),
    magickaMult: 1.5,
    powers: ['breton_shield'],
    resist: { magicka: 50 },
    lore: 'Heirs of the Direnni. Magicka comes easily, and spells break upon them.',
  },
  {
    id: 'darkelf',
    name: 'Dark Elf',
    attributes: A(40, 40, 30, 40, 50, 40, 30, 40),
    skills: bonuses([['athletics', 5], ['destruction', 10], ['lightarmor', 5], ['longblade', 10], ['marksman', 5], ['mysticism', 5], ['shortblade', 10]]),
    magickaMult: 1,
    powers: ['ancestor_guardian'],
    resist: { fire: 75 },
    lore: 'Dunmer of Vvardenfell. Fire is a cousin, not a threat.',
  },
  {
    id: 'highelf',
    name: 'High Elf',
    attributes: A(30, 50, 40, 30, 30, 40, 40, 40),
    skills: bonuses([['alchemy', 5], ['alteration', 10], ['conjuration', 5], ['destruction', 10], ['enchant', 10], ['illusion', 5], ['mysticism', 5]]),
    magickaMult: 1.5,
    powers: [],
    resist: {},
    weakness: { fire: 25, frost: 25, shock: 25, magicka: 50 },
    lore: 'Altmer, tall in magicka and vulnerable to the elements.',
  },
  {
    id: 'imperial',
    name: 'Imperial',
    attributes: A(40, 40, 30, 30, 40, 40, 50, 40),
    skills: bonuses([['blunt', 5], ['handtohand', 5], ['lightarmor', 5], ['longblade', 10], ['mercantile', 10], ['speechcraft', 10], ['block', 5]]),
    magickaMult: 1,
    powers: ['voice_emperor'],
    resist: {},
    lore: 'Cyrodiil\'s voice. Trade and talk open doors that swords do not.',
  },
  {
    id: 'khajiit',
    name: 'Khajiit',
    attributes: A(40, 40, 30, 50, 40, 30, 40, 40),
    skills: bonuses([['acrobatics', 10], ['athletics', 5], ['handtohand', 5], ['lightarmor', 5], ['security', 5], ['shortblade', 10], ['sneak', 10]]),
    magickaMult: 1,
    powers: ['eye_of_night'],
    resist: {},
    lore: 'The cat-folk see in the dark and land where others fall.',
  },
  {
    id: 'nord',
    name: 'Nord',
    attributes: A(50, 30, 40, 30, 40, 50, 30, 40),
    skills: bonuses([['axe', 10], ['blunt', 10], ['heavyarmor', 5], ['longblade', 5], ['mediumarmor', 10], ['spear', 5], ['block', 5]]),
    magickaMult: 1,
    powers: ['nordic_frost'],
    resist: { frost: 75 },
    lore: 'Sons and daughters of Skyrim. Frost is weather, not a wound.',
  },
  {
    id: 'orc',
    name: 'Orc',
    attributes: A(45, 30, 50, 35, 30, 50, 30, 40),
    skills: bonuses([['armorer', 10], ['axe', 5], ['block', 10], ['heavyarmor', 10], ['mediumarmor', 5], ['blunt', 5]]),
    magickaMult: 1,
    powers: ['berserk'],
    resist: { magicka: 25 },
    lore: 'Orsimer of the strongholds. Armor and will are the same craft.',
  },
  {
    id: 'redguard',
    name: 'Redguard',
    attributes: A(50, 30, 30, 40, 40, 50, 30, 40),
    skills: bonuses([['athletics', 5], ['axe', 5], ['blunt', 5], ['heavyarmor', 5], ['longblade', 15], ['mediumarmor', 5], ['shortblade', 5]]),
    magickaMult: 1,
    powers: ['adrenaline'],
    resist: { disease: 75, poison: 75 },
    lore: 'Sword-singers of Hammerfell. Disease finds little purchase.',
  },
  {
    id: 'woodelf',
    name: 'Wood Elf',
    attributes: A(30, 40, 30, 50, 50, 30, 40, 40),
    skills: bonuses([['alchemy', 5], ['lightarmor', 10], ['marksman', 15], ['sneak', 10], ['acrobatics', 5], ['block', 5]]),
    magickaMult: 1,
    powers: ['beast_tongue'],
    resist: { disease: 75 },
    lore: 'Bosmer of the Valenwood. The bow is a language they were born speaking.',
  },
];

export const SIGNS: SignDef[] = [
  { id: 'apprentice', name: 'The Apprentice', lore: 'A deeper well of magicka, and a weakness to spells.', magickaMult: 0.5, powers: [], weakness: { magicka: 50 } },
  { id: 'atronach', name: 'The Atronach', lore: 'A vast reserve that does not refill with rest. Spells may be swallowed.', magickaMult: 2, powers: [], spellAbsorb: 50, stuntedMagicka: true },
  { id: 'lady', name: 'The Lady', lore: 'Endurance and personality, the gift of a kinder star.', attributes: { endurance: 25, personality: 25 }, powers: [] },
  { id: 'lord', name: 'The Lord', lore: 'A healing blood, and a tenderness toward fire.', powers: ['lord_heal'], weakness: { fire: 25 } },
  { id: 'lover', name: 'The Lover', lore: 'Agility on demand, for a little while.', powers: ['lover_agility'] },
  { id: 'mage', name: 'The Mage', lore: 'A modest, reliable gift of magicka.', magickaMult: 0.5, powers: [] },
  { id: 'ritual', name: 'The Ritual', lore: 'A blessing that mends, and a word that turns the restless dead.', powers: ['ritual_heal', 'ritual_turn'] },
  { id: 'serpent', name: 'The Serpent', lore: 'A venomous touch that costs the caster as well.', powers: ['serpent_bite'] },
  { id: 'shadow', name: 'The Shadow', lore: 'The art of stepping out of sight.', powers: ['shadow_hide'] },
  { id: 'steed', name: 'The Steed', lore: 'Swiftness written into the legs.', attributes: { speed: 25 }, powers: [] },
  { id: 'thief', name: 'The Thief', lore: 'Luck, and a knack for not being where the blade arrives.', attributes: { luck: 10 }, powers: ['thief_sanctuary'] },
  { id: 'tower', name: 'The Tower', lore: 'A key that is not a key. Locks remember you.', powers: ['tower_open'] },
  { id: 'warrior', name: 'The Warrior', lore: 'The blow lands more often.', powers: [], fortifyAttack: 10 },
];

function cls(id: string, name: string, specialization: Specialty, major: string[], minor: string[], lore: string): ClassDef {
  return { id, name, specialization, major, minor, lore };
}

export const CLASSES: ClassDef[] = [
  cls('warrior', 'Warrior', 'combat', ['longblade', 'blunt', 'axe', 'heavyarmor', 'block'], ['armorer', 'athletics', 'mediumarmor', 'spear', 'marksman'], 'Steel first. Questions later.'),
  cls('knight', 'Knight', 'combat', ['longblade', 'block', 'heavyarmor', 'speechcraft', 'restoration'], ['armorer', 'athletics', 'mediumarmor', 'mercantile', 'enchant'], 'An oath with a blade behind it.'),
  cls('barbarian', 'Barbarian', 'combat', ['axe', 'blunt', 'mediumarmor', 'athletics', 'block'], ['acrobatics', 'armorer', 'marksman', 'unarmored', 'spear'], 'The ash does not frighten a person who runs at it.'),
  cls('crusader', 'Crusader', 'combat', ['blunt', 'longblade', 'destruction', 'heavyarmor', 'block'], ['restoration', 'armorer', 'handtohand', 'athletics', 'alchemy'], 'Faith worn as plate.'),
  cls('scout', 'Scout', 'combat', ['athletics', 'block', 'mediumarmor', 'longblade', 'sneak'], ['marksman', 'alchemy', 'armorer', 'lightarmor', 'unarmored'], 'The road is the teacher.'),
  cls('archer', 'Archer', 'combat', ['marksman', 'longblade', 'block', 'athletics', 'lightarmor'], ['sneak', 'mediumarmor', 'spear', 'restoration', 'unarmored'], 'Distance is a kindness you grant yourself.'),
  cls('mage', 'Mage', 'magic', ['destruction', 'alteration', 'illusion', 'restoration', 'mysticism'], ['enchant', 'alchemy', 'unarmored', 'conjuration', 'shortblade'], 'Six schools, and the patience to fail them.'),
  cls('battlemage', 'Battlemage', 'magic', ['destruction', 'alteration', 'conjuration', 'axe', 'heavyarmor'], ['mysticism', 'longblade', 'marksman', 'enchant', 'alchemy'], 'War as a syllabus.'),
  cls('sorcerer', 'Sorcerer', 'magic', ['enchant', 'conjuration', 'mysticism', 'destruction', 'alteration'], ['illusion', 'alchemy', 'unarmored', 'shortblade', 'block'], 'The item remembers the spell so you do not have to.'),
  cls('healer', 'Healer', 'magic', ['restoration', 'mysticism', 'alteration', 'handtohand', 'speechcraft'], ['alchemy', 'unarmored', 'illusion', 'blunt', 'enchant'], 'Close the wound. Then ask who made it.'),
  cls('nightblade', 'Nightblade', 'magic', ['illusion', 'mysticism', 'alteration', 'sneak', 'shortblade'], ['lightarmor', 'destruction', 'marksman', 'security', 'speechcraft'], 'A spell is quieter than a hinge.'),
  cls('spellsword', 'Spellsword', 'magic', ['block', 'restoration', 'longblade', 'destruction', 'alteration'], ['blunt', 'enchant', 'alchemy', 'mediumarmor', 'axe'], 'One hand for the blade, one for the word.'),
  cls('witchhunter', 'Witchhunter', 'magic', ['conjuration', 'enchant', 'alchemy', 'marksman', 'sneak'], ['lightarmor', 'mysticism', 'destruction', 'security', 'block'], 'What was summoned can be unsummoned.'),
  cls('thief', 'Thief', 'stealth', ['security', 'sneak', 'acrobatics', 'lightarmor', 'shortblade'], ['marksman', 'speechcraft', 'handtohand', 'mercantile', 'athletics'], 'The lock is a conversation.'),
  cls('agent', 'Agent', 'stealth', ['speechcraft', 'sneak', 'acrobatics', 'lightarmor', 'shortblade'], ['mercantile', 'conjuration', 'block', 'unarmored', 'illusion'], 'A friendly face is a forged key.'),
  cls('assassin', 'Assassin', 'stealth', ['shortblade', 'sneak', 'marksman', 'lightarmor', 'security'], ['acrobatics', 'alchemy', 'block', 'athletics', 'longblade'], 'One cut, then the road.'),
  cls('acrobat', 'Acrobat', 'stealth', ['acrobatics', 'athletics', 'marksman', 'sneak', 'unarmored'], ['speechcraft', 'alteration', 'spear', 'handtohand', 'lightarmor'], 'The ground is optional.'),
  cls('bard', 'Bard', 'stealth', ['speechcraft', 'alchemy', 'enchant', 'illusion', 'lightarmor'], ['mercantile', 'sneak', 'shortblade', 'block', 'acrobatics'], 'A song can be a bribe.'),
  cls('pilgrim', 'Pilgrim', 'stealth', ['speechcraft', 'mercantile', 'restoration', 'marksman', 'alchemy'], ['illusion', 'handtohand', 'shortblade', 'block', 'mediumarmor'], 'The shrine is at the end of the walking.'),
  cls('monk', 'Monk', 'stealth', ['handtohand', 'unarmored', 'athletics', 'acrobatics', 'sneak'], ['block', 'restoration', 'blunt', 'mysticism', 'enchant'], 'The fist is already drawn.'),
  cls('rogue', 'Rogue', 'combat', ['shortblade', 'marksman', 'lightarmor', 'mercantile', 'speechcraft'], ['sneak', 'security', 'block', 'axe', 'athletics'], 'A seller of chances.'),
];

export function classById(id: string): ClassDef | undefined {
  return CLASSES.find((c) => c.id === id);
}

export function raceById(id: string): RaceDef | undefined {
  return RACES.find((r) => r.id === id);
}

export function signById(id: string): SignDef | undefined {
  return SIGNS.find((s) => s.id === id);
}

export function emptyAttributes(): Record<Attribute, number> {
  return A(0, 0, 0, 0, 0, 0, 0, 0);
}

export function skillNames(): { id: string; name: string; specialization: Specialty }[] {
  return SKILLS.map((s) => ({ id: s.id, name: s.name, specialization: s.specialization }));
}

export { ATTRIBUTES };
