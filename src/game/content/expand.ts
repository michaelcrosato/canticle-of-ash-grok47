import type { Category, Cond, PlaceKind, QuestDef, Reward } from '../types';

export interface CompactQuest {
  id: string;
  title: string;
  cat: Category;
  origin?: 'source' | 'addition';
  uesp: string;
  summary: string;
  giver: string;
  giverName: string;
  at: string;
  faction?: string;
  needs?: string;
  needsAll?: string[];
  kind: 'fetch' | 'kill' | 'persuade' | 'deliver' | 'visit' | 'donate' | 'gold' | 'escort' | 'gather';
  dest: string;
  destName: string;
  hub: string;
  place?: PlaceKind;
  item?: string;
  itemName?: string;
  target?: string;
  targetName?: string;
  minDisp?: number;
  gold?: number;
  qty?: number;
  rewardGold?: number;
  rewardItem?: string;
  rank?: number;
  vampire?: boolean;
  join?: boolean;
}

function pre(row: CompactQuest): Cond[] {
  const conds: Cond[] = [];
  if (row.needs) conds.push({ op: 'quest', id: row.needs });
  for (const id of row.needsAll ?? []) conds.push({ op: 'quest', id });
  if (row.vampire) conds.push({ op: 'vampire' });
  if (row.faction && !row.join) conds.push({ op: 'faction', id: row.faction, rank: 0 });
  return conds;
}

export function expandQuest(row: CompactQuest): QuestDef {
  const place = row.place ?? 'cave';
  const sites = row.dest === row.at ? [] : [{ id: row.dest, name: row.destName, hub: row.hub, place }];
  const spawns: QuestDef['spawns'] = [{ location: row.at, npc: row.giver, name: row.giverName }];
  const reward: Reward = {};
  reward.gold = (row.rewardGold ?? 0) + 100;
  if (row.rewardItem) reward.items = [{ id: row.rewardItem }];
  if (row.faction) reward.faction = row.faction;
  if (row.rank !== undefined) reward.rank = row.rank;
  if (row.join) reward.rank = 0;
  const gates = pre(row);
  const accept: Cond = { op: 'all', of: [...gates, { op: 'at', location: row.at }, { op: 'talk', npc: row.giver }] };
  let objective: Cond;
  const item = row.item ?? `${row.id}_token`;
  const itemName = row.itemName ?? row.title;
  const target = row.target ?? `${row.id}_target`;
  const targetName = row.targetName ?? 'the mark';
  if (row.kind === 'fetch' || row.kind === 'donate') {
    spawns.push({ location: row.dest, item, name: itemName });
    objective = {
      op: 'all',
      of: [
        { op: 'item', id: item, consume: true },
        { op: 'at', location: row.kind === 'donate' ? row.dest : row.at },
        { op: 'talk', npc: row.kind === 'donate' ? row.giver : row.giver },
      ],
    };
    if (row.kind === 'donate') {
      objective = {
        op: 'all',
        of: [{ op: 'item', id: item, consume: true }, { op: 'at', location: row.dest }, { op: 'talk', npc: row.giver }],
      };
    }
  } else if (row.kind === 'kill') {
    spawns.push({ location: row.dest, npc: target, name: targetName, hostile: true, hp: 55 });
    objective = { op: 'all', of: [{ op: 'dead', npc: target }, { op: 'at', location: row.at }, { op: 'talk', npc: row.giver }] };
  } else if (row.kind === 'persuade') {
    spawns.push({ location: row.dest, npc: target, name: targetName });
    objective = {
      op: 'all',
      of: [
        { op: 'disposition', npc: target, min: row.minDisp ?? 55 },
        { op: 'talk', npc: target },
        { op: 'at', location: row.at },
        { op: 'talk', npc: row.giver },
      ],
    };
  } else if (row.kind === 'deliver') {
    objective = {
      op: 'all',
      of: [
        { op: 'item', id: item, consume: true },
        { op: 'at', location: row.dest },
        { op: 'talk', npc: target },
      ],
    };
    spawns.push({ location: row.dest, npc: target, name: targetName });
  } else if (row.kind === 'visit') {
    objective = { op: 'all', of: [{ op: 'at', location: row.dest }, { op: 'talk', npc: row.giver }] };
  } else if (row.kind === 'gold') {
    const amount = row.join ? Math.min(row.gold ?? 60, 60) : (row.gold ?? 200);
    objective = {
      op: 'all',
      of: [{ op: 'gold', amount, consume: true }, { op: 'at', location: row.at }, { op: 'talk', npc: row.giver }],
    };
  } else if (row.kind === 'escort') {
    spawns.push({ location: row.dest, npc: target, name: targetName });
    objective = { op: 'all', of: [{ op: 'at', location: row.dest }, { op: 'talk', npc: target }, { op: 'talk', npc: row.giver }] };
  } else {
    spawns.push({ location: row.dest, item, name: itemName });
    objective = {
      op: 'all',
      of: [{ op: 'item', id: item, qty: row.qty ?? 3, consume: true }, { op: 'at', location: row.at }, { op: 'talk', npc: row.giver }],
    };
  }
  const stages = [
    {
      journal: row.summary,
      complete: accept,
      reward: row.kind === 'deliver' ? { items: [{ id: item }] } : undefined,
    },
    {
      journal: row.summary,
      complete: objective,
      reward,
    },
  ];
  return {
    id: row.id,
    title: row.title,
    category: row.cat,
    origin: row.origin ?? 'source',
    uesp: row.uesp,
    summary: row.summary,
    faction: row.faction,
    giver: row.giver,
    location: row.at,
    stages,
    sites,
    spawns,
  };
}

export function assignRanks(quests: QuestDef[], faction: string): void {
  const mine = quests.filter((q) => q.faction === faction && q.origin === 'source');
  mine.forEach((q, i) => {
    const rank = Math.min(9, Math.floor((i * 9) / Math.max(1, mine.length - 1)));
    const last = q.stages[q.stages.length - 1];
    if (!last) return;
    last.reward = { ...(last.reward ?? {}), faction, rank: q.id.endsWith('_join') ? 0 : rank };
    if (i === 0) {
      last.reward.rank = Math.max(0, rank);
      q.stages[0]!.complete = stripFactionGate(q.stages[0]!.complete);
    }
  });
}

function stripFactionGate(cond: Cond): Cond {
  if (cond.op === 'all') return { op: 'all', of: cond.of.filter((c) => c.op !== 'faction') };
  if (cond.op === 'faction') return { op: 'released' };
  return cond;
}
