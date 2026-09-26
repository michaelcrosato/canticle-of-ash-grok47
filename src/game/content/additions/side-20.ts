import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_20',
  title: 'The Slipped Hound',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A hound slipped the pens under Tel Aruhn and lairs in a side cave. The pen-keeper asks you to end it.',
  giver: 'side_20_giver',
  location: 'tel_aruhn',
  stages: [
    {
      journal:
        'Under Tel Aruhn the pen-keeper keeps the lower pens. A hound has slipped them and gone to ground in a side cave. Speak with the keeper in Tel Aruhn if you will take the solemn work of ending it.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'tel_aruhn' },
          { op: 'talk', npc: 'side_20_giver' },
        ],
      },
    },
    {
      journal:
        'The hound lairs in the side cave beneath the pens. End it there. When it is dead, return to the pen-keeper in Tel Aruhn and say the thing is done.',
      complete: {
        op: 'all',
        of: [
          { op: 'dead', npc: 'side_20_foe' },
          { op: 'at', location: 'tel_aruhn' },
          { op: 'talk', npc: 'side_20_giver' },
        ],
      },
      reward: { gold: 110, flags: ['side_20_done'] },
    },
  ],
  sites: [{ id: 'side_20_site', name: 'Side cave under the pens', hub: 'tel_aruhn', place: 'cave' }],
  spawns: [
    { location: 'tel_aruhn', npc: 'side_20_giver', name: 'Pen-keeper' },
    { location: 'side_20_site', npc: 'side_20_foe', name: 'Slipped hound', hostile: true, hp: 46 },
  ],
};
