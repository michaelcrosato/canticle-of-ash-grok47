import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_29',
  title: 'The Night Pantry',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. The night cook at Moonmoth Legion Fort will not open the pantry until their regard is 50. A quartermaster asks you to earn it.',
  giver: 'side_29_giver',
  location: 'moonmoth_fort',
  sites: [],
  spawns: [
    { location: 'moonmoth_fort', npc: 'side_29_giver', name: 'A quartermaster' },
    { location: 'moonmoth_fort', npc: 'side_29_neighbor', name: 'The night cook' },
  ],
  stages: [
    {
      journal:
        'Stand in Moonmoth Legion Fort and speak with the quartermaster. The night pantry stays shut. The night cook will not lift the bar until their regard is 50. Take the errand here, and do not seek it in any other hall.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'moonmoth_fort' },
          { op: 'talk', npc: 'side_29_giver' },
        ],
      },
    },
    {
      journal:
        'Remain at Moonmoth Legion Fort. Speak with the night cook and raise their regard to 50. Only then will the pantry open. When that regard is earned, return to the quartermaster in the same fort and tell them the bar is lifted.',
      complete: {
        op: 'all',
        of: [
          { op: 'disposition', npc: 'side_29_neighbor', min: 50 },
          { op: 'talk', npc: 'side_29_neighbor' },
          { op: 'at', location: 'moonmoth_fort' },
          { op: 'talk', npc: 'side_29_giver' },
        ],
      },
      reward: { gold: 70, flags: ['side_29_done'] },
    },
  ],
};
