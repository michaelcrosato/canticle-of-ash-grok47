import type { QuestDef } from '../../types';

/** Original errand: an Imperial filing clerk's signet, lost in an Ebonheart crate. */
export const sideQuest: QuestDef = {
  id: 'side_07',
  title: 'The Storeroom Signet',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. An Imperial filing clerk in Ebonheart dropped a signet ring into a storeroom crate. Bring it back.',
  giver: 'side_07_giver',
  location: 'ebonheart',
  stages: [
    {
      journal:
        'At the filing desk in Ebonheart, hear the clerk. A signet ring fell into a crate in the storeroom off the hall. Take those directions, then go and search the crates.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'ebonheart' },
          { op: 'talk', npc: 'side_07_giver' },
        ],
      },
    },
    {
      journal:
        'The signet ring is in a crate in the Ebonheart storeroom. Take it from the crate and carry it back to the filing clerk in Ebonheart.',
      complete: {
        op: 'all',
        of: [
          { op: 'item', id: 'side_07_find' },
          { op: 'at', location: 'ebonheart' },
          { op: 'talk', npc: 'side_07_giver' },
        ],
      },
      reward: {
        gold: 90,
        flags: ['side_07_done'],
        items: [{ id: 'side_07_keepsake' }],
      },
    },
  ],
  sites: [{ id: 'side_07_site', name: 'Filing storeroom', hub: 'ebonheart', place: 'interior' }],
  spawns: [
    { location: 'ebonheart', npc: 'side_07_giver', name: 'A filing clerk' },
    { location: 'side_07_site', item: 'side_07_find', name: 'Signet ring' },
  ],
};
