import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_18',
  title: 'The Servant Who Will Not Descend',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A servant at Tel Mora will speak only from a high balcony and will not come down. The door-keeper asks you to go up.',
  giver: 'side_18_giver',
  location: 'tel_mora',
  stages: [
    {
      journal:
        'Stand at Tel Mora and speak with Ilveth the door-keeper. He keeps the lower door and will not climb. A servant above will speak only from the high balcony and will not come down. Hear the door-keeper, then take the stair he names.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'tel_mora' },
          { op: 'talk', npc: 'side_18_giver' },
        ],
      },
    },
    {
      journal:
        'The door-keeper has given the way and will not go with you. Climb to the high balcony. Nereth the servant will speak only from there and will not come down. Do not call them to the stair. Stand where they stand, and hear them.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'side_18_site' },
          { op: 'talk', npc: 'side_18_witness' },
        ],
      },
      reward: { gold: 80, flags: ['side_18_done'] },
    },
  ],
  sites: [
    {
      id: 'side_18_site',
      name: 'High Balcony',
      hub: 'tel_mora',
      place: 'tower',
    },
  ],
  spawns: [
    { location: 'tel_mora', npc: 'side_18_giver', name: 'Ilveth the Door-keeper' },
    { location: 'side_18_site', npc: 'side_18_witness', name: 'Nereth the Balcony Servant' },
  ],
};
