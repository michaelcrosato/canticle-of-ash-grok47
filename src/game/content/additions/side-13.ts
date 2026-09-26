import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_13',
  title: 'The Cedar Peg',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A fish-drying rack in Khuul lost its cedar peg in a shack on the point. Bring it back.',
  giver: 'side_13_giver',
  location: 'khuul',
  stages: [
    {
      journal:
        'A rack-keeper stands by the fish-drying racks in Khuul. One rack will not hold until its cedar peg is returned. Speak with the keeper here before you leave the shore.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'khuul' },
          { op: 'talk', npc: 'side_13_giver' },
        ],
      },
    },
    {
      journal:
        'The cedar peg lies in a shack on the point, salt-stiff and still cut for the rack. Take it from that interior. Return to Khuul and give it to the rack-keeper. No other wood will serve.',
      complete: {
        op: 'all',
        of: [
          { op: 'item', id: 'side_13_find' },
          { op: 'at', location: 'khuul' },
          { op: 'talk', npc: 'side_13_giver' },
        ],
      },
      reward: {
        gold: 90,
        flags: ['side_13_done'],
        items: [{ id: 'side_13_keepsake' }],
      },
    },
  ],
  sites: [{ id: 'side_13_site', name: 'Shack on the Point', hub: 'khuul', place: 'interior' }],
  spawns: [
    { location: 'khuul', npc: 'side_13_giver', name: 'A rack-keeper' },
    { location: 'side_13_site', item: 'side_13_find', name: 'cedar peg' },
  ],
};
