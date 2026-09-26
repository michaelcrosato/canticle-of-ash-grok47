import type { GameAction } from './types';

/** Keyboard and gamepad both emit these action names. */
export const KEY_ACTIONS: Record<string, GameAction> = {
  KeyF: 'attack',
  Space: 'attack',
  KeyE: 'interact',
  Enter: 'interact',
  KeyM: 'magic',
  KeyJ: 'journal',
  KeyI: 'inventory',
  KeyP: 'map',
  KeyC: 'stats',
  KeyR: 'rest',
  KeyQ: 'jump',
  Escape: 'menu',
};

/** Standard gamepad: south attack, east interact, west magic, north journal. */
export const GAMEPAD_BUTTON_ACTIONS: Record<number, GameAction> = {
  0: 'attack',
  1: 'interact',
  2: 'magic',
  3: 'journal',
  4: 'inventory',
  5: 'map',
  6: 'stats',
  7: 'rest',
  8: 'menu',
  9: 'jump',
};

export function actionFromKey(code: string): GameAction | null {
  return KEY_ACTIONS[code] ?? null;
}

export function actionFromGamepadButton(index: number): GameAction | null {
  return GAMEPAD_BUTTON_ACTIONS[index] ?? null;
}

export const TOUCH_ACTIONS: GameAction[] = ['attack', 'interact', 'magic', 'journal', 'inventory', 'map', 'rest', 'jump', 'menu'];
