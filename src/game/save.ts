import type { GameState } from './types';

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function deserialize(raw: string): GameState {
  const state = JSON.parse(raw) as GameState;
  if (state.version !== 1) throw new Error('unknown save version');
  if (!state.quests || !state.inventory || !state.factions || !state.attributes) {
    throw new Error('save missing progression');
  }
  return state;
}

export const SAVE_KEY = 'canticle-of-ash-save-1';

export function writeLocalSave(state: GameState, storage: Storage = localStorage): void {
  storage.setItem(SAVE_KEY, serialize(state));
}

export function readLocalSave(storage: Storage = localStorage): GameState | null {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return deserialize(raw);
  } catch {
    return null;
  }
}
