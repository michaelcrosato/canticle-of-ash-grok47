import { describe, expect, it } from 'vitest';
import { actionFromGamepadButton, actionFromKey } from '../src/game/input-map';

describe('input maps', () => {
  it('gamepad buttons emit the same actions as the keyboard', () => {
    expect(actionFromGamepadButton(0)).toBe(actionFromKey('KeyF'));
    expect(actionFromGamepadButton(1)).toBe(actionFromKey('KeyE'));
    expect(actionFromGamepadButton(2)).toBe(actionFromKey('KeyM'));
    expect(actionFromGamepadButton(3)).toBe(actionFromKey('KeyJ'));
    expect(actionFromGamepadButton(0)).toBe('attack');
    expect(actionFromGamepadButton(1)).toBe('interact');
    expect(actionFromGamepadButton(2)).toBe('magic');
    expect(actionFromGamepadButton(3)).toBe('journal');
  });
});
