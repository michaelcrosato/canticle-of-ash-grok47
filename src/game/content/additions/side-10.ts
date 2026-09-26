import type { QuestDef } from '../../types';

export const sideQuest: QuestDef = {
  id: 'side_10',
  title: "The Scarab-Keeper's Fee",
  category: 'miscellaneous',
  origin: 'addition',
  uesp: 'addition',
  summary:
    "An original errand, not from any guide. Under the Ald'ruhn skar, a scarab-keeper lost the fee to re-hide a shell.",
  giver: 'side_10_giver',
  location: 'ald_ruhn',
  stages: [
    {
      journal:
        "Under the Ald'ruhn skar, a scarab-keeper waits in the dust and will not call the loss into the street. Stand in Ald'ruhn and speak with them. Hear, in solemn quiet, that a shell still lies uncovered because the fee to hide it again is gone.",
      complete: {
        op: 'all',
        of: [
          { op: 'at', location: 'ald_ruhn' },
          { op: 'talk', npc: 'side_10_giver' },
        ],
      },
    },
    {
      journal:
        "Pay the scarab-keeper seventy drakes beneath the Ald'ruhn skar. The coin is the whole of the rite: with it the shell is covered again, and without it the hiding fails. Bring the gold to Ald'ruhn and speak the payment plainly. Do not bargain, and do not ask the keeper to name the grave.",
      complete: {
        op: 'all',
        of: [
          { op: 'gold', amount: 70, consume: true },
          { op: 'at', location: 'ald_ruhn' },
          { op: 'talk', npc: 'side_10_giver' },
        ],
      },
      reward: {
        gold: 170,
        flags: ['side_10_done'],
        items: [{ id: 'side_10_keepsake' }],
      },
    },
  ],
  sites: [],
  spawns: [{ location: 'ald_ruhn', npc: 'side_10_giver', name: 'A scarab-keeper' }],
};
