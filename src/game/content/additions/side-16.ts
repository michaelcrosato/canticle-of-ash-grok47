import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_16',
  title: 'The Skiff Rib',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A boatwright at Dagon Fel will fit a repaired skiff rib if you pay fifty drakes.',
  giver: 'side_16_giver',
  location: 'dagon_fel',
  sites: [],
  spawns: [{ location: 'dagon_fel', npc: 'side_16_giver', name: 'A boatwright' }],
  stages: [
    {
      journal:
        'On the stone quay at Dagon Fel, find the boatwright who keeps a repaired skiff rib under oilcloth. Speak with them and hear the terms. They will not set the rib until the coin is named and counted.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'dagon_fel' },
          { op: 'talk', npc: 'side_16_giver' },
        ],
      },
    },
    {
      journal:
        'Return to the boatwright at Dagon Fel with fifty drakes in hand. Pay them, and they will fit the repaired skiff rib. When the work is done, take the keepsake they press into your palm and leave the quay.',
      complete: {
        op: 'all',
        of: [
          { op: 'gold', amount: 50, consume: true },
          { op: 'at', location: 'dagon_fel' },
          { op: 'talk', npc: 'side_16_giver' },
        ],
      },
      reward: {
        gold: 140,
        flags: ['side_16_done'],
        items: [{ id: 'side_16_keepsake' }],
      },
    },
  ],
};
