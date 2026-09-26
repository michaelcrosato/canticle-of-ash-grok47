import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_19',
  title: 'The Cracked Gem Below',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A steward of Tel Vos asks you to bring up a cracked soul gem from a lower root, the stone an apprentice was forbidden to touch.',
  giver: 'side_19_giver',
  location: 'tel_vos',
  stages: [
    {
      journal:
        'At Tel Vos, the tower steward speaks without haste. An apprentice was forbidden to touch a cracked soul gem left in a lower root. The steward will not send that apprentice down, and asks you to bring the gem up.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'tel_vos' },
          { op: 'talk', npc: 'side_19_giver' },
        ],
      },
    },
    {
      journal:
        'Descend into the lower root of Tel Vos, where the tower’s flesh grows thin and the air holds old magic. The cracked soul gem lies where it was left. Take it. Do not leave it for the apprentice who was forbidden to touch it. Carry it back to the steward at Tel Vos.',
      complete: {
        op: 'all',
        of: [
          { op: 'item', id: 'side_19_find' },
          { op: 'at', location: 'tel_vos' },
          { op: 'talk', npc: 'side_19_giver' },
        ],
      },
      reward: {
        gold: 90,
        flags: ['side_19_done'],
        items: [{ id: 'side_19_keepsake' }],
      },
    },
  ],
  sites: [{ id: 'side_19_site', name: 'Lower root', hub: 'tel_vos', place: 'tower' }],
  spawns: [
    { location: 'tel_vos', npc: 'side_19_giver', name: 'A tower steward' },
    { location: 'side_19_site', item: 'side_19_find', name: 'Cracked soul gem' },
  ],
};
