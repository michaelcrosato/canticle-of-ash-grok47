import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_14',
  title: 'The Scrib on the Shrine Stair',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A daedra-touched scrib blocks the shrine stair at Ald Velothi. Clear it for the stair-keeper.',
  giver: 'side_14_giver',
  location: 'ald_velothi',
  stages: [
    {
      journal:
        'Go to Ald Velothi and speak with the stair-keeper. The shrine steps are closed: a daedra-touched scrib has settled on them, and the keeper will not ask the village to pass while it remains.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'ald_velothi' },
          { op: 'talk', npc: 'side_14_giver' },
        ],
      },
    },
    {
      journal:
        'The stair-keeper bids you clear the shrine stair. Kill the daedra-touched scrib that blocks it, then return to Ald Velothi and tell the stair-keeper the way is open again.',
      complete: {
        op: 'all',
        of: [
          { op: 'dead', npc: 'side_14_foe' },
          { op: 'at', location: 'ald_velothi' },
          { op: 'talk', npc: 'side_14_giver' },
        ],
      },
      reward: { gold: 110, flags: ['side_14_done'] },
    },
  ],
  sites: [{ id: 'side_14_site', name: 'Shrine stair', hub: 'ald_velothi', place: 'daedric' }],
  spawns: [
    { location: 'ald_velothi', npc: 'side_14_giver', name: 'A stair-keeper' },
    { location: 'side_14_site', npc: 'side_14_foe', name: 'Daedra-touched scrib', hostile: true, hp: 46 },
  ],
};
