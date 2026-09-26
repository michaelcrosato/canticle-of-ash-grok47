import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_09',
  title: 'Temper of the Glaze',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A Caldera alchemist needs three eggshell chips from the mine spoil heap to temper a glaze.',
  giver: 'side_09_giver',
  location: 'caldera',
  stages: [
    {
      journal:
        'In Caldera, a kiln alchemist waits on the street and will not send a note. Stand in town and hear the charge: three eggshell chips, taken from the mine spoil heap, to temper a glaze that plain ash would crack.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'caldera' },
          { op: 'talk', npc: 'side_09_giver' },
        ],
      },
    },
    {
      journal:
        'Leave Caldera for the mine spoil heap. Lift three eggshell chips from the waste, no more than the glaze requires, then return to the alchemist in town and set them in their hands.',
      complete: {
        op: 'all',
        of: [
          { op: 'item', id: 'side_09_pile', qty: 3, consume: true },
          { op: 'at', location: 'caldera' },
          { op: 'talk', npc: 'side_09_giver' },
        ],
      },
      reward: { gold: 100, flags: ['side_09_done'] },
    },
  ],
  sites: [{ id: 'side_09_site', name: 'Mine spoil heap', hub: 'caldera', place: 'wild' }],
  spawns: [
    { location: 'caldera', npc: 'side_09_giver', name: 'A kiln alchemist' },
    { location: 'side_09_site', item: 'side_09_pile', name: 'Eggshell chips' },
  ],
};
