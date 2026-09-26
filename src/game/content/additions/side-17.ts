import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_17',
  title: 'Direction Through the Pads',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A path-warden in Vos asks you to earn a mushroom-tender’s regard of fifty before they will name a way through the pads.',
  giver: 'side_17_giver',
  location: 'vos',
  sites: [],
  spawns: [
    { location: 'vos', npc: 'side_17_giver', name: 'Serath Volen' },
    { location: 'vos', npc: 'side_17_neighbor', name: 'Ithren Saloth' },
  ],
  stages: [
    {
      journal:
        'Serath Volen, path-warden of Vos, will not name the way. The mushroom-tender Ithren Saloth gives a direction through the pads only after their regard reaches fifty. Earn that regard, hear the way, and return.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'vos' },
          { op: 'talk', npc: 'side_17_giver' },
        ],
      },
    },
    {
      journal:
        'Ithren Saloth tends the pads at Vos. Speak with them only once their regard is fifty or more, take the solemn direction they give, and return to the path-warden Serath Volen, still in Vos.',
      complete: {
        op: 'all',
        of: [
          { op: 'disposition', npc: 'side_17_neighbor', min: 50 },
          { op: 'talk', npc: 'side_17_neighbor' },
          { op: 'at', location: 'vos' },
          { op: 'talk', npc: 'side_17_giver' },
        ],
      },
      reward: { gold: 70, flags: ['side_17_done'] },
    },
  ],
};
