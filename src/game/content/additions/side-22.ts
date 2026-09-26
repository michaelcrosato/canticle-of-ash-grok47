import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_22',
  title: 'The Sealed Note',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A porter at Tel Fyr will carry a sealed note you are not allowed to read if you pay 80 drakes.',
  giver: 'side_22_giver',
  location: 'tel_fyr',
  sites: [],
  stages: [
    {
      journal:
        'At Tel Fyr, find the porter who waits with a sealed note. Speak with them. You are not allowed to open it or read what is written inside. Hear the price, and do not pay until you are ready to let the note leave your hands.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'tel_fyr' },
          { op: 'talk', npc: 'side_22_giver' },
        ],
      },
    },
    {
      journal:
        'Pay the porter 80 drakes at Tel Fyr and speak with them again. They will carry the sealed note. Leave the seal unbroken. Do not read it. When the errand is finished, a keepsake remains where the note was.',
      complete: {
        op: 'all',
        of: [
          { op: 'gold', amount: 80, consume: true },
          { op: 'at', location: 'tel_fyr' },
          { op: 'talk', npc: 'side_22_giver' },
        ],
      },
      reward: {
        gold: 180,
        flags: ['side_22_done'],
        items: [{ id: 'side_22_keepsake' }],
      },
    },
  ],
  spawns: [{ location: 'tel_fyr', npc: 'side_22_giver', name: 'A tower porter' }],
};
