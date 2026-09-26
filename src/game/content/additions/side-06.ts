import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_06',
  title: 'The Unlit Landing',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A cantor in Vivec will not come down from a forgotten waistworks landing. A temple usher asks you to go hear them there.',
  giver: 'side_06_giver',
  location: 'vivec',
  stages: [
    {
      journal:
        'Usher Selos Vathren speaks quietly in Vivec. A cantor will not come down from a forgotten waistworks landing. The usher asks you to climb the unlit stair above the canal walk and hear them there. Do not call them down. Leave the landing as still as you found it.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'vivec' },
          { op: 'talk', npc: 'side_06_giver' },
        ],
      },
    },
    {
      journal:
        'On the forgotten waistworks landing, Cantor Mirane Othrel remains and will not descend. Hear the verse they keep. They ask no escort back, and the stair is the only way you came.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'side_06_site' },
          { op: 'talk', npc: 'side_06_witness' },
        ],
      },
      reward: { gold: 80, flags: ['side_06_done'] },
    },
  ],
  sites: [
    {
      id: 'side_06_site',
      name: 'Forgotten Waistworks Landing',
      hub: 'vivec',
      place: 'interior',
    },
  ],
  spawns: [
    { location: 'vivec', npc: 'side_06_giver', name: 'Usher Selos Vathren' },
    { location: 'side_06_site', npc: 'side_06_witness', name: 'Cantor Mirane Othrel' },
  ],
};
