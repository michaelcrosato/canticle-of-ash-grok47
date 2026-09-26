import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_31',
  title: 'The Cellar Index',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A mage at Wolverine Hall lost an index card in the hall cellar and cannot catalog without it. Bring the card back.',
  giver: 'side_31_giver',
  location: 'wolverine_hall',
  sites: [
    {
      id: 'side_31_site',
      name: 'Wolverine Hall Cellar',
      hub: 'wolverine_hall',
      place: 'interior',
    },
  ],
  spawns: [
    { location: 'wolverine_hall', npc: 'side_31_giver', name: 'Tevyn Sarel' },
    { location: 'side_31_site', item: 'side_31_find', name: 'index card' },
  ],
  stages: [
    {
      journal:
        'Tevyn Sarel keeps the catalog at Wolverine Hall. An index card is missing in the hall cellar, and the catalog cannot go on without it. Go down into the cellar, take up the card, and bring it back to the mage.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'wolverine_hall' },
          { op: 'talk', npc: 'side_31_giver' },
        ],
      },
    },
    {
      journal:
        'The index card lies in the cellar under Wolverine Hall. Recover it and return it to Tevyn Sarel in the hall. Until that card is in the mage’s hands, the catalog stays unfinished.',
      complete: {
        op: 'all',
        of: [
          { op: 'item', id: 'side_31_find' },
          { op: 'at', location: 'wolverine_hall' },
          { op: 'talk', npc: 'side_31_giver' },
        ],
      },
      reward: {
        gold: 90,
        flags: ['side_31_done'],
        items: [{ id: 'side_31_keepsake' }],
      },
    },
  ],
};
