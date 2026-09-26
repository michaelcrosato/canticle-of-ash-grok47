import './style.css';
import { Canticle } from './render/play';
import { CONTENT } from './game/content';
import { hitChance, spellChance } from './game/formulas';
import { actionFromGamepadButton, actionFromKey } from './game/input-map';
import { advanceQuest, strikeHeart } from './game/quests';
import { canTravel } from './game/travel';

const root = document.querySelector('#app');
if (!root) throw new Error('missing #app');
const game = new Canticle(root as HTMLElement);
game.start();

// Keep the shipped rules reachable from the entry the tests import.
void CONTENT;
void hitChance;
void spellChance;
void advanceQuest;
void strikeHeart;
void canTravel;
void actionFromKey;
void actionFromGamepadButton;
