import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_27',
  title: 'The Drying Frame',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A hide-worker at the Zainab camp needs three beads of guar-hide polish from a drying frame out on the grass.',
  giver: 'side_27_giver',
  location: 'zainab_camp',
  stages: [
    {
      journal:
        'A hide-worker waits at the Zainab camp, solemn among the yurts. Stand in the camp and speak with that worker. The way onto the grass is not given until those words are heard.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'zainab_camp' },
          { op: 'talk', npc: 'side_27_giver' },
        ],
      },
    },
    {
      journal:
        'Out on the grass a drying frame holds beads of guar-hide polish. Take three beads from the pile. Return to the Zainab camp and speak again with the hide-worker, and do not come back with fewer than three.',
      complete: {
        op: 'all',
        of: [
          { op: 'item', id: 'side_27_pile', qty: 3, consume: true },
          { op: 'at', location: 'zainab_camp' },
          { op: 'talk', npc: 'side_27_giver' },
        ],
      },
      reward: { gold: 100, flags: ['side_27_done'] },
    },
  ],
  sites: [{ id: 'side_27_site', name: 'Drying Frame', hub: 'zainab_camp', place: 'wild' }],
  spawns: [
    { location: 'zainab_camp', npc: 'side_27_giver', name: 'A hide-worker' },
    { location: 'side_27_site', item: 'side_27_pile', name: 'Beads of guar-hide polish' },
  ],
};
