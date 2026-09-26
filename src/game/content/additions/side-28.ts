import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_28',
  title: 'The Broken Pole',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. At the Erabenimsun camp a tent-mender wants 60 drakes for a broken pole and gives you a stitched charm in return.',
  giver: 'side_28_giver',
  location: 'erabenimsun_camp',
  sites: [],
  spawns: [{ location: 'erabenimsun_camp', npc: 'side_28_giver', name: 'A tent-mender' }],
  stages: [
    {
      journal:
        'Walk the ash to the Erabenimsun camp. A tent-mender waits among the yurts with a snapped pole across their knees. Speak with them there, and do not raise the matter across the wind.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'erabenimsun_camp' },
          { op: 'talk', npc: 'side_28_giver' },
        ],
      },
    },
    {
      journal:
        'The tent-mender needs 60 drakes to set a new pole where the old one broke. Pay them in person at the Erabenimsun camp. They will press a small charm, stitched from hide scrap, into your hand.',
      complete: {
        op: 'all',
        of: [
          { op: 'gold', amount: 60, consume: true },
          { op: 'at', location: 'erabenimsun_camp' },
          { op: 'talk', npc: 'side_28_giver' },
        ],
      },
      reward: {
        gold: 150,
        flags: ['side_28_done'],
        items: [{ id: 'side_28_keepsake' }],
      },
    },
  ],
};
