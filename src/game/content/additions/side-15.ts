import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_15',
  title: 'Fence-Ash for the Ward',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A smith at Ghostgate needs three pinches of fence-ash from the walk outside the gate to set a ward.',
  giver: 'side_15_giver',
  location: 'ghostgate',
  sites: [{ id: 'side_15_site', name: 'Walk outside the gate', hub: 'ghostgate', place: 'wild' }],
  spawns: [
    { location: 'ghostgate', npc: 'side_15_giver', name: 'A ward-smith' },
    { location: 'side_15_site', item: 'side_15_pile', name: 'fence-ash' },
  ],
  stages: [
    {
      journal:
        'At Ghostgate a smith, written in no roll, asks to be heard. He will not set the ward until three pinches of fence-ash are in his hands. The ash waits on the walk outside the gate.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'ghostgate' },
          { op: 'talk', npc: 'side_15_giver' },
        ],
      },
    },
    {
      journal:
        'Take three pinches from the fence-ash on the walk outside Ghostgate. Return them to the smith at the gate. Only then will he set the ward. Bring no less, and leave none behind.',
      complete: {
        op: 'all',
        of: [
          { op: 'item', id: 'side_15_pile', qty: 3, consume: true },
          { op: 'at', location: 'ghostgate' },
          { op: 'talk', npc: 'side_15_giver' },
        ],
      },
      reward: { gold: 100, flags: ['side_15_done'] },
    },
  ],
};
