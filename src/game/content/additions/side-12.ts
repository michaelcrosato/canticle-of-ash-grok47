import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_12',
  title: 'The Vent Overlook',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A miner in Gnisis asks you to hear a kwama-widow who waits on a vent overlook and will not come into town.',
  giver: 'side_12_giver',
  location: 'gnisis',
  stages: [
    {
      journal:
        'A miner in Gnisis stops you short of the gate. His kin by marriage keeps a vigil on the vent overlook, where the crust breathes warm ash, and she will not come into town. Leave the houses behind you. Walk the pale ground until the rock opens a lip above the steam. Stand there and hear her. Bring nothing back but the fact that you listened.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'gnisis' },
          { op: 'talk', npc: 'side_12_giver' },
        ],
      },
    },
    {
      journal:
        'The kwama-widow is still on the vent overlook outside Gnisis. Steam rises under her feet, and the town is behind you. She will not cross the gate. Speak with her and let her say what the street was not allowed to hear. Do not lead her back. Hearing her finishes the errand.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'side_12_site' },
          { op: 'talk', npc: 'side_12_witness' },
        ],
      },
      reward: { gold: 80, flags: ['side_12_done'] },
    },
  ],
  sites: [{ id: 'side_12_site', name: 'Vent Overlook', hub: 'gnisis', place: 'wild' }],
  spawns: [
    { location: 'gnisis', npc: 'side_12_giver', name: 'A miner' },
    { location: 'side_12_site', npc: 'side_12_witness', name: 'A kwama-widow' },
  ],
};
