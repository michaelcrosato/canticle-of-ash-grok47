import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_23',
  title: 'Salt in the Tower Kitchen',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A steward of Tel Branora asks you to win the tower cook’s regard. The kitchen will not admit it is short of salt until that regard is fifty.',
  giver: 'side_23_giver',
  location: 'tel_branora',
  stages: [
    {
      journal:
        'In Tel Branora, speak with the tower steward. The cook who keeps the kitchen will not admit the stores are short of salt until their regard for you is fifty. Win that regard, hear the shortage named, then return and tell the steward.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'tel_branora' },
          { op: 'talk', npc: 'side_23_giver' },
        ],
      },
    },
    {
      journal:
        'The cook’s regard is high enough that the shortage may be spoken. Stand in Tel Branora and tell the steward the kitchen is short of salt.',
      complete: {
        op: 'all',
        of: [
          { op: 'disposition', npc: 'side_23_neighbor', min: 50 },
          { op: 'talk', npc: 'side_23_neighbor' },
          { op: 'at', location: 'tel_branora' },
          { op: 'talk', npc: 'side_23_giver' },
        ],
      },
      reward: { gold: 70, flags: ['side_23_done'] },
    },
  ],
  sites: [],
  spawns: [
    { location: 'tel_branora', npc: 'side_23_giver', name: 'A tower steward' },
    { location: 'tel_branora', npc: 'side_23_neighbor', name: 'A tower cook' },
  ],
};
