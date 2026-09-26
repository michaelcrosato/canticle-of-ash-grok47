import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_05',
  title: 'The Safe Channel',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. In Gnaar Mok a silent fisher will not name the safe channel until their regard reaches 50. The harbor clerk asks you to win that regard.',
  giver: 'side_05_giver',
  location: 'gnaar_mok',
  sites: [],
  spawns: [
    { location: 'gnaar_mok', npc: 'side_05_giver', name: 'Brevyn Aralen', hostile: false },
    { location: 'gnaar_mok', npc: 'side_05_neighbor', name: 'Malae Othren', hostile: false },
  ],
  stages: [
    {
      journal:
        'Go to Gnaar Mok and speak with Brevyn Aralen, clerk of the harbor. A silent fisher on the pier will not name the safe channel until their regard reaches 50, and the clerk has asked that you win it.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'gnaar_mok' },
          { op: 'talk', npc: 'side_05_giver' },
        ],
      },
    },
    {
      journal:
        'Brevyn Aralen will not mark the channel. Malae Othren, the silent fisher, will not name the safe water until their regard reaches 50. Earn that regard, hear the channel from them, then return to the harbor clerk in Gnaar Mok.',
      complete: {
        op: 'all',
        of: [
          { op: 'disposition', npc: 'side_05_neighbor', min: 50 },
          { op: 'talk', npc: 'side_05_neighbor' },
          { op: 'at', location: 'gnaar_mok' },
          { op: 'talk', npc: 'side_05_giver' },
        ],
      },
      reward: { gold: 70, flags: ['side_05_done'] },
    },
  ],
};
