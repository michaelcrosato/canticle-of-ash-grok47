import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_26',
  title: 'The Hollow Takes Calves',
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    'An original errand, not from any guide. A wounded cliff racer lairs in a hollow near the Ahemmusa camp and has been taking guar calves. A herder asks you to end it.',
  giver: 'side_26_giver',
  location: 'ahemmusa_camp',
  stages: [
    {
      journal:
        'A herder at the Ahemmusa camp speaks without raising her voice. A wounded cliff racer has taken a hollow near the yurts and has been taking guar calves. She asks you to end it. Walk out from the camp, find the hollow, and do not leave the beast to feed again.',
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'ahemmusa_camp' },
          { op: 'talk', npc: 'side_26_giver' },
        ],
      },
    },
    {
      journal:
        'The hollow lies near the Ahemmusa camp, where the wounded cliff racer lairs and the guar calves have been taken. Kill it. When it is dead, return to the herder at the camp and tell her the herd can rest.',
      complete: {
        op: 'all',
        of: [
          { op: 'dead', npc: 'side_26_foe' },
          { op: 'at', location: 'ahemmusa_camp' },
          { op: 'talk', npc: 'side_26_giver' },
        ],
      },
      reward: { gold: 110, flags: ['side_26_done'] },
    },
  ],
  sites: [{ id: 'side_26_site', name: 'Calf Hollow', hub: 'ahemmusa_camp', place: 'wild' }],
  spawns: [
    { location: 'ahemmusa_camp', npc: 'side_26_giver', name: 'A herder' },
    {
      location: 'side_26_site',
      npc: 'side_26_foe',
      name: 'Wounded Cliff Racer',
      hostile: true,
      hp: 46,
    },
  ],
};
