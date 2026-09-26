import type { QuestDef } from '../../types';

/** Net-mender of Hla Oad. Not a person from any shipped quest. */
export const sideQuest: QuestDef = {
  id: 'side_04',
  title: 'The Spliced Line',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A net-mender in Hla Oad will splice a broken line once a twine debt of 60 drakes is paid, and gives back a spliced sample plus more coin.',
  giver: 'side_04_giver',
  location: 'hla_oad',
  stages: [
    {
      journal:
        'Go down to the drying racks at Hla Oad and speak with Malan Virethi, who mends nets on the pilings. Hear the debt before you offer coin. The line stays open until it is named.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'hla_oad' },
          { op: 'talk', npc: 'side_04_giver' },
        ],
      },
    },
    {
      journal:
        'Malan Virethi will splice the line only here in Hla Oad, and only after you pay the twine debt of 60 drakes. Lay the coin in hand. Take back the spliced sample, and the greater sum returned with it.',
      complete: {
        op: 'all',
        of: [
          { op: 'gold', amount: 60, consume: true },
          { op: 'at', location: 'hla_oad' },
          { op: 'talk', npc: 'side_04_giver' },
        ],
      },
      reward: {
        gold: 160,
        flags: ['side_04_done'],
        items: [{ id: 'side_04_keepsake' }],
      },
    },
  ],
  sites: [],
  spawns: [{ location: 'hla_oad', npc: 'side_04_giver', name: 'Malan Virethi' }],
};
