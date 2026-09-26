import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_11',
  title: 'The Safe Ash Road',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A shrine attendant at Maar Gan asks you to earn a pilgrim’s regard, for that pilgrim will not share the safe ash road until it stands at 50.',
  giver: 'side_11_giver',
  location: 'maar_gan',
  sites: [],
  spawns: [
    { location: 'maar_gan', npc: 'side_11_giver', name: 'Shrine attendant Ilveth' },
    { location: 'maar_gan', npc: 'side_11_neighbor', name: 'Pilgrim Nenmu' },
  ],
  stages: [
    {
      journal:
        'Shrine attendant Ilveth keeps the lamps at Maar Gan and will not send you out unguided. A pilgrim beside the shrine will not share the safe ash road until their regard for you is 50. Speak with the pilgrim. Do not press. Let the words be plain, and return only when that regard is earned.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'maar_gan' },
          { op: 'talk', npc: 'side_11_giver' },
        ],
      },
    },
    {
      journal:
        'Pilgrim Nenmu shares the safe ash road only when their regard is 50. Hear it, then repeat it to the shrine attendant at Maar Gan: keep the packed track between the shrine and the outer stones, leave the ridge of the foyada on your left, and do not cut the ash plain when the wind turns. Walk until the red hill falls behind you. Do not leave the track for a shorter way.',
      complete: {
        op: 'all',
        of: [
          { op: 'disposition', npc: 'side_11_neighbor', min: 50 },
          { op: 'talk', npc: 'side_11_neighbor' },
          { op: 'at', location: 'maar_gan' },
          { op: 'talk', npc: 'side_11_giver' },
        ],
      },
      reward: { gold: 70, flags: ['side_11_done'] },
    },
  ],
};
