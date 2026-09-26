import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_08',
  title: 'The Plantation Shed',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A diseased shalk has nested in a Suran plantation shed. Clear it and tell the field hand.',
  giver: 'side_08_giver',
  location: 'suran',
  stages: [
    {
      journal:
        'A field hand in Suran speaks low of a diseased shalk nested in the plantation shed. Leave the town, enter that shed, and kill the creature. Then return and tell the field hand the nest is ended.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'suran' },
          { op: 'talk', npc: 'side_08_giver' },
        ],
      },
    },
    {
      journal:
        'The diseased shalk is still nested in the plantation shed. Kill it. Come back to Suran and tell the field hand the shed is clear.',
      complete: {
        op: 'all',
        of: [
          { op: 'dead', npc: 'side_08_foe' },
          { op: 'at', location: 'suran' },
          { op: 'talk', npc: 'side_08_giver' },
        ],
      },
      reward: { gold: 110, flags: ['side_08_done'] },
    },
  ],
  sites: [{ id: 'side_08_site', name: 'Suran plantation shed', hub: 'suran', place: 'interior' }],
  spawns: [
    { location: 'suran', npc: 'side_08_giver', name: 'A field hand' },
    { location: 'side_08_site', npc: 'side_08_foe', name: 'Diseased shalk', hostile: true, hp: 46 },
  ],
};
