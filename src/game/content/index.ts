import type { ItemDef, LocationDef, QuestDef } from '../types';
import { CLASSES, RACES, SIGNS, SKILLS } from './chargen';
import { expandQuest, assignRanks } from './expand';
import { ITEMS, SPELLS, spellMap } from './items';
import { attachSite, baseLocations } from './locations';
import { mainQuests } from './mainquests';
import { COMPACT_QUESTS } from './rows';

const FACTIONS = ['hlaalu', 'redoran', 'telvanni', 'fighters', 'mages', 'thieves', 'cult', 'legion', 'temple', 'morag', 'daedric', 'vampire'];

const expanded = COMPACT_QUESTS.map(expandQuest);
for (const f of FACTIONS) assignRanks(expanded, f);
const quests: QuestDef[] = [...mainQuests(), ...expanded];

const locationList: LocationDef[] = baseLocations();
const known = new Set(locationList.map((l) => l.id));

function ensureLoc(id: string, hub: string, name: string, place: LocationDef['kind']): void {
  if (known.has(id)) return;
  const hint = known.has(hub) ? hub : 'balmora';
  attachSite(locationList, { id, name, hub: hint, place });
  known.add(id);
}

for (const q of quests) {
  const hint = q.sites[0]?.hub ?? 'balmora';
  ensureLoc(q.location, hint, q.location, 'interior');
  for (const s of q.sites) ensureLoc(s.id, s.hub, s.name, s.place);
  for (const s of q.spawns) ensureLoc(s.location, hint, s.name, 'interior');
}

const items: ItemDef[] = ITEMS.map((i) => ({ ...i }));
const itemIds = new Set(items.map((i) => i.id));

function ensureItem(id: string, name: string, kind: ItemDef['kind'] = 'quest'): void {
  if (!id || itemIds.has(id)) return;
  itemIds.add(id);
  items.push({ id, name, kind, weight: 0.4, value: 25 });
}

for (const q of quests) {
  for (const s of q.spawns) if (s.item) ensureItem(s.item, s.name, 'quest');
  for (const stage of q.stages) {
    for (const it of stage.reward?.items ?? []) ensureItem(it.id, it.id.replaceAll('_', ' '));
  }
}

export const ALL_QUESTS = quests;
export const SOURCE_QUESTS = quests.filter((q) => q.origin === 'source');
export const ADDITION_QUESTS = quests.filter((q) => q.origin === 'addition');

export const SOURCE_INDEX = SOURCE_QUESTS.map((q) => ({
  id: q.id,
  title: q.title,
  category: q.category,
  origin: q.origin,
  uesp: q.uesp,
  summary: q.summary,
  location: q.location,
  giver: q.giver,
}));

export const CONTENT = {
  quests,
  sourceIndex: SOURCE_INDEX,
  additions: ADDITION_QUESTS.map((q) => q.id),
  locations: new Map(locationList.map((l) => [l.id, l])),
  locationList,
  items: new Map(items.map((i) => [i.id, i])),
  itemList: items,
  spells: spellMap(),
  spellList: SPELLS,
  races: RACES,
  signs: SIGNS,
  classes: CLASSES,
  skills: SKILLS,
  factions: FACTIONS,
};

export const ARTIFACTS = [
  'package_for_caius',
  'dwemer_puzzle_box',
  'skull_llevule',
  'moon_and_star',
  'wraithguard',
  'sunder',
  'keening',
  'heart_of_lorkhan',
] as const;
