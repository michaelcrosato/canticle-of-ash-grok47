import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_25',
  title: 'The Wind-Break Flute',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A child\'s bone flute was left at a wind-break outside the Urshilaku camp. An aunt at the camp asks you to bring it back.',
  giver: 'side_25_giver',
  location: 'urshilaku_camp',
  stages: [
    {
      journal:
        'Aunt Yenammu waits at the Urshilaku camp, where the yurt-ropes hum in the ash-wind. A child of her hearth set a bone flute on the wind-break outside the camp and did not return for it. She asks you, solemnly, to walk out to that low wall of hide and stone, lift the flute from the ash, and bring it back to her hands. She will not send the child into that weather.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'urshilaku_camp' },
          { op: 'talk', npc: 'side_25_giver' },
        ],
      },
    },
    {
      journal:
        'The bone flute lies at the wind-break outside the Urshilaku camp. Take it up and bring it back to Aunt Yenammu in the camp. She will know it by the notch a small hand wore into the bone.',
      complete: {
        op: 'all',
        of: [
          { op: 'item', id: 'side_25_find' },
          { op: 'at', location: 'urshilaku_camp' },
          { op: 'talk', npc: 'side_25_giver' },
        ],
      },
      reward: {
        gold: 90,
        flags: ['side_25_done'],
        items: [{ id: 'side_25_keepsake' }],
      },
    },
  ],
  sites: [{ id: 'side_25_site', name: 'Urshilaku wind-break', hub: 'urshilaku_camp', place: 'wild' }],
  spawns: [
    { location: 'urshilaku_camp', npc: 'side_25_giver', name: 'Aunt Yenammu' },
    { location: 'side_25_site', item: 'side_25_find', name: "child's bone flute" },
  ],
};
