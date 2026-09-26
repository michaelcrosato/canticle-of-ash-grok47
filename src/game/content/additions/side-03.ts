import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_03',
  title: 'Three Lumps from the Odai',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A Balmora potter needs three lumps of Odai clay from a downstream bank.',
  giver: 'side_03_giver',
  location: 'balmora',
  stages: [
    {
      journal:
        'Virethi Sedas keeps a cold wheel in Balmora. She will shape no vessel until three lumps of clay are taken from the Odai where the river has already passed the town, and brought back to her hands.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'balmora' },
          { op: 'talk', npc: 'side_03_giver' },
        ],
      },
    },
    {
      journal:
        'Follow the Odai downstream of Balmora to the open bank. Lift three lumps of clay from that earth, then return to Virethi Sedas in Balmora and set them in her keeping. She will count them herself.',
      complete: {
        op: 'all',
        of: [
          { op: 'item', id: 'side_03_pile', qty: 3, consume: true },
          { op: 'at', location: 'balmora' },
          { op: 'talk', npc: 'side_03_giver' },
        ],
      },
      reward: { gold: 100, flags: ['side_03_done'] },
    },
  ],
  sites: [{ id: 'side_03_site', name: 'Downstream Odai bank', hub: 'balmora', place: 'wild' }],
  spawns: [
    { location: 'balmora', npc: 'side_03_giver', name: 'Virethi Sedas' },
    { location: 'side_03_site', item: 'side_03_pile', name: 'Odai clay' },
  ],
};
