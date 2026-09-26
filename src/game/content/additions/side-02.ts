import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_02',
  title: 'Worry on the Fort Road',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A bloated nix-hound worries the fort road outside Pelagiad. End it in a pasture cave and tell the herder.',
  giver: 'side_02_giver',
  location: 'pelagiad',
  stages: [
    {
      journal:
        'A bloated nix-hound worries the fort road outside Pelagiad. Find the herder Ervas Sedren in town and hear where the beast has gone before you leave.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'pelagiad' },
          { op: 'talk', npc: 'side_02_giver' },
        ],
      },
    },
    {
      journal:
        'The nix-hound dens in a pasture cave off the fort road. End it there. When it is dead, return to Pelagiad and tell Ervas Sedren the road is quiet.',
      complete: {
        op: 'all',
        of: [
          { op: 'dead', npc: 'side_02_foe' },
          { op: 'at', location: 'pelagiad' },
          { op: 'talk', npc: 'side_02_giver' },
        ],
      },
      reward: { gold: 110, flags: ['side_02_done'] },
    },
  ],
  sites: [{ id: 'side_02_site', name: 'Salt Pasture Cave', hub: 'pelagiad', place: 'cave' }],
  spawns: [
    { location: 'pelagiad', npc: 'side_02_giver', name: 'Ervas Sedren' },
    { location: 'side_02_site', npc: 'side_02_foe', name: 'Bloated Nix-Hound', hostile: true, hp: 46 },
  ],
};
