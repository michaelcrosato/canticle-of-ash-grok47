import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_24',
  title: 'The Pilgrim on the Lip',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A pilgrim waits on the foyada lip above Molag Mar and will not enter the town. A gate-warden asks you to speak with them there.',
  giver: 'side_24_giver',
  location: 'molag_mar',
  stages: [
    {
      journal:
        'The gate-warden at Molag Mar keeps the gate and will not climb. A pilgrim stands on the foyada lip above the town and will not come down into it. Leave by the ash path above the gate, keep the molten cut on your left, and speak with them where the wind breaks on the lip. Do not lead them into the town.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'molag_mar' },
          { op: 'talk', npc: 'side_24_giver' },
        ],
      },
    },
    {
      journal:
        'The pilgrim on the foyada lip heard you and will not enter Molag Mar. Their word is given. The gate-warden’s errand is finished.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'side_24_site' },
          { op: 'talk', npc: 'side_24_witness' },
        ],
      },
      reward: { gold: 80, flags: ['side_24_done'] },
    },
  ],
  sites: [{ id: 'side_24_site', name: 'Foyada Lip', hub: 'molag_mar', place: 'wild' }],
  spawns: [
    { location: 'molag_mar', npc: 'side_24_giver', name: 'A gate-warden' },
    { location: 'side_24_site', npc: 'side_24_witness', name: 'A pilgrim' },
  ],
};
