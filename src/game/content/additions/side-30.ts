import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_30',
  title: 'The Ash Berm Report',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A scout at Buckmoth will give a report only from the ash berm, not inside the fort. The gate sergeant asks you to meet them there.',
  giver: 'side_30_giver',
  location: 'buckmoth_fort',
  stages: [
    {
      journal:
        'At Buckmoth Legion Fort, speak with the gate sergeant. A scout will give a report only from the ash berm beyond the gate, never inside the walls. The sergeant asks you to leave the fort and meet the scout on that open ground.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'buckmoth_fort' },
          { op: 'talk', npc: 'side_30_giver' },
        ],
      },
    },
    {
      journal:
        'Stand on the ash berm outside Buckmoth and speak with the scout. They give the report only there, not within the fort. Hear it on the berm, and the errand is done.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'side_30_site' },
          { op: 'talk', npc: 'side_30_witness' },
        ],
      },
      reward: { gold: 80, flags: ['side_30_done'] },
    },
  ],
  sites: [{ id: 'side_30_site', name: 'Ash Berm', hub: 'buckmoth_fort', place: 'wild' }],
  spawns: [
    { location: 'buckmoth_fort', npc: 'side_30_giver', name: 'A gate sergeant' },
    { location: 'side_30_site', npc: 'side_30_witness', name: 'A berm scout' },
  ],
};
