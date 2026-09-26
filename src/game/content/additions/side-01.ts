import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_01',
  title: 'The Brass Tide-Weight',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A tide-clerk in Seyda Neen dropped a brass tide-weight into a flooded cellar and waits for it to be brought back.',
  giver: 'side_01_giver',
  location: 'seyda_neen',
  stages: [
    {
      journal:
        'Dralyn Vess, a tide-clerk, stands in Seyda Neen. He let the brass tide-weight slip from the measuring line into the flooded cellar beneath the customs walk. Speak with him on the shore before you go down.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'seyda_neen' },
          { op: 'talk', npc: 'side_01_giver' },
        ],
      },
    },
    {
      journal:
        'The brass tide-weight lies in the flooded cellar under Seyda Neen. Take it from the water and return it to Dralyn Vess where he waits in the town.',
      complete: {
        op: 'all',
        of: [
          { op: 'item', id: 'side_01_find' },
          { op: 'at', location: 'seyda_neen' },
          { op: 'talk', npc: 'side_01_giver' },
        ],
      },
      reward: {
        gold: 90,
        flags: ['side_01_done'],
        items: [{ id: 'side_01_keepsake' }],
      },
    },
  ],
  sites: [
    {
      id: 'side_01_site',
      name: 'Flooded Tide Cellar',
      hub: 'seyda_neen',
      place: 'interior',
    },
  ],
  spawns: [
    { location: 'seyda_neen', npc: 'side_01_giver', name: 'Dralyn Vess' },
    { location: 'side_01_site', item: 'side_01_find', name: 'Brass tide-weight' },
  ],
};
