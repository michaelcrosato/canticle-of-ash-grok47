export type Attribute =
  | 'strength'
  | 'intelligence'
  | 'willpower'
  | 'agility'
  | 'speed'
  | 'endurance'
  | 'personality'
  | 'luck';

export const ATTRIBUTES: Attribute[] = [
  'strength',
  'intelligence',
  'willpower',
  'agility',
  'speed',
  'endurance',
  'personality',
  'luck',
];

export type Specialty = 'combat' | 'magic' | 'stealth';

export interface SkillDef {
  id: string;
  name: string;
  attribute: Attribute;
  specialization: Specialty;
  school?: boolean;
}

export interface RaceDef {
  id: string;
  name: string;
  attributes: Record<Attribute, number>;
  skills: Record<string, number>;
  magickaMult: number;
  powers: string[];
  resist: Record<string, number>;
  weakness?: Record<string, number>;
  lore: string;
}

export interface SignDef {
  id: string;
  name: string;
  lore: string;
  attributes?: Partial<Record<Attribute, number>>;
  magickaMult?: number;
  powers: string[];
  fortifyAttack?: number;
  spellAbsorb?: number;
  stuntedMagicka?: boolean;
  weakness?: Record<string, number>;
}

export interface ClassDef {
  id: string;
  name: string;
  specialization: Specialty;
  major: string[];
  minor: string[];
  lore: string;
}

export type Origin = 'source' | 'addition';

export type Category =
  | 'main'
  | 'hlaalu'
  | 'redoran'
  | 'telvanni'
  | 'fighters'
  | 'mages'
  | 'thieves'
  | 'cult'
  | 'legion'
  | 'temple'
  | 'morag'
  | 'daedric'
  | 'vampire'
  | 'miscellaneous';

export type Cond =
  | { op: 'talk'; npc: string; at?: string }
  | { op: 'item'; id: string; qty?: number; consume?: boolean }
  | { op: 'at'; location: string }
  | { op: 'dead'; npc: string }
  | { op: 'disposition'; npc: string; min: number }
  | { op: 'equipped'; id: string }
  | { op: 'gold'; amount: number; consume?: boolean }
  | { op: 'flag'; id: string }
  | { op: 'notFlag'; id: string }
  | { op: 'quest'; id: string }
  | { op: 'disease'; id: string; has: boolean }
  | { op: 'faction'; id: string; rank: number }
  | { op: 'vampire' }
  | { op: 'released' }
  | { op: 'all'; of: Cond[] }
  | { op: 'any'; of: Cond[] };

export interface Reward {
  gold?: number;
  items?: { id: string; qty?: number }[];
  flags?: string[];
  clearFlags?: string[];
  disease?: string;
  cure?: string;
  faction?: string;
  rank?: number;
  disposition?: { npc: string; delta: number };
  journal?: string;
  spell?: string;
  vampireClan?: string;
  attribute?: Partial<Record<Attribute, number>>;
}

export interface QuestStage {
  journal: string;
  complete: Cond;
  reward?: Reward;
}

export interface QuestDef {
  id: string;
  title: string;
  category: Category;
  origin: Origin;
  uesp: string;
  summary: string;
  faction?: string;
  giver: string;
  location: string;
  stages: QuestStage[];
  sites: { id: string; name: string; hub: string; place: PlaceKind }[];
  spawns: { location: string; npc?: string; item?: string; hostile?: boolean; name: string; hp?: number }[];
}

export type PlaceKind =
  | 'town'
  | 'camp'
  | 'wild'
  | 'interior'
  | 'cave'
  | 'tomb'
  | 'dwemer'
  | 'shrine'
  | 'manor'
  | 'tower'
  | 'stronghold'
  | 'canton'
  | 'ship'
  | 'citadel'
  | 'gate'
  | 'daedric';

export interface LocationDef {
  id: string;
  name: string;
  region: RegionId;
  kind: PlaceKind;
  x: number;
  y: number;
  walk: string[];
  silt: string[];
  boat: string[];
  guide: string[];
  divine: string;
  almsivi: string;
  markable: boolean;
}

export type RegionId =
  | 'bitter_coast'
  | 'ascadian'
  | 'west_gash'
  | 'ashlands'
  | 'red_mountain'
  | 'grazelands'
  | 'azura_coast'
  | 'molag_amur'
  | 'sheogorad';

export interface ItemDef {
  id: string;
  name: string;
  kind: 'weapon' | 'armor' | 'quest' | 'potion' | 'ingredient' | 'misc' | 'soul' | 'book' | 'clothing';
  weight: number;
  value: number;
  damage?: number;
  skill?: string;
  armor?: number;
  slot?: string;
  effect?: EffectSpec;
  effects?: IngredientEffect[];
}

export interface IngredientEffect {
  id: string;
  name: string;
}

export interface EffectSpec {
  id: string;
  magnitude: number;
  duration?: number;
  name: string;
}

export interface SpellDef {
  id: string;
  name: string;
  school: string;
  cost: number;
  effect: EffectSpec;
  made?: boolean;
}

export interface ActorDef {
  id: string;
  name: string;
  hp: number;
  skill: number;
  damage: number;
  armor: number;
  hostile?: boolean;
  vampireClan?: string;
  leash?: number;
  kind?: string;
}

export interface QuestProgress {
  stage: number;
  complete: boolean;
}

export interface GameState {
  version: 1;
  name: string;
  race: string;
  birthsign: string;
  className: string;
  specialization: Specialty;
  major: string[];
  minor: string[];
  attributes: Record<Attribute, number>;
  skills: Record<string, number>;
  magickaMult: number;
  fortifyAttack: number;
  spellAbsorb: number;
  stuntedMagicka: boolean;
  resist: Record<string, number>;
  weakness: Record<string, number>;
  health: number;
  healthMax: number;
  magicka: number;
  magickaMax: number;
  fatigue: number;
  fatigueMax: number;
  gold: number;
  inventory: { id: string; qty: number }[];
  equipment: { weapon?: string; armor: Record<string, string> };
  location: string;
  yaw: number;
  pitch: number;
  px: number;
  py: number;
  pz: number;
  released: boolean;
  level: number;
  majorProgress: number;
  levelUpPending: boolean;
  quests: Record<string, QuestProgress>;
  factions: Record<string, number>;
  disposition: Record<string, number>;
  dead: Record<string, boolean>;
  actors: Record<string, number>;
  flags: Record<string, boolean>;
  diseases: string[];
  vampire: string | false;
  day: number;
  porphyricSince?: number;
  mark?: string;
  spells: string[];
  customSpells: SpellDef[];
  enchantments: { id: string; name: string; effect: EffectSpec; charges: number }[];
  guidance: boolean;
  quality: 'low' | 'high';
  camera: 'first' | 'pullback';
  mute: boolean;
  volume: number;
  blightEnded: boolean;
  heartLinked: boolean;
  dagothHp: number;
  dagothMax: number;
  ending: boolean;
  hostile: Record<string, boolean>;
  sanctuary: number;
}

export interface CharacterChoices {
  name: string;
  race: string;
  birthsign: string;
  classId?: string;
  custom?: { name: string; specialization: Specialty; major: string[]; minor: string[] };
}

export type GameAction =
  | 'attack'
  | 'interact'
  | 'magic'
  | 'journal'
  | 'inventory'
  | 'map'
  | 'stats'
  | 'rest'
  | 'jump'
  | 'menu';

export const GAME_ACTIONS: GameAction[] = [
  'attack',
  'interact',
  'magic',
  'journal',
  'inventory',
  'map',
  'stats',
  'rest',
  'jump',
  'menu',
];
