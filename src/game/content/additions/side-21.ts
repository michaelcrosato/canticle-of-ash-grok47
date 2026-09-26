import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_21',
  title: 'Corks from the Drowned Cellar',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A cellar-keeper in Sadrith Mora needs three corks of spore-wine from a drowned cellar under the docks.',
  giver: 'side_21_giver',
  location: 'sadrith_mora',
  sites: [
    {
      id: 'side_21_site',
      name: 'Drowned Cellar',
      hub: 'sadrith_mora',
      place: 'interior',
    },
  ],
  spawns: [
    { location: 'sadrith_mora', npc: 'side_21_giver', name: 'A cellar-keeper' },
    { location: 'side_21_site', item: 'side_21_pile', name: 'spore-wine corks' },
  ],
  stages: [
    {
      journal:
        'In Sadrith Mora, a cellar-keeper keeps spore-wine beneath the docks. The tide took the lower stair and left three corks in the drowned cellar. Speak with the keeper in town. The door is under the docks, unmarked, and the water inside is not to be tasted.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'sadrith_mora' },
          { op: 'talk', npc: 'side_21_giver' },
        ],
      },
    },
    {
      journal:
        'Descend into the drowned cellar under the Sadrith Mora docks. From the pile there, take three corks of spore-wine and no more. Carry them back to the cellar-keeper in Sadrith Mora. The bottles stay where the water left them.',
      complete: {
        op: 'all',
        of: [
          { op: 'item', id: 'side_21_pile', qty: 3, consume: true },
          { op: 'at', location: 'sadrith_mora' },
          { op: 'talk', npc: 'side_21_giver' },
        ],
      },
      reward: { gold: 100, flags: ['side_21_done'] },
    },
  ],
};
