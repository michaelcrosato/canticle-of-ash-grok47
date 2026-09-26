# Canticle of Ash — completion

A first-person 3D game of the Vvardenfell prophecy, played from the Imperial prison ship at Seyda Neen through the Heart of Lorkhan. It is a spiritual successor: the places, people, and quest purposes follow the base game; the words, models, and music are original.

Playable file: `canticle-of-ash-grok47.html` (open it from disk; no server). Built 2026-09-26 by Grok 4.7.

## Where the content lives

The checked-in source index and the game load the same objects:

- Quest rows: `src/game/content/mainquests.ts` and `src/game/content/rows.ts`
- Built content the tests import: `src/game/content/index.ts` (`SOURCE_INDEX`, `CONTENT`)
- Rules: `src/game/quests.ts`, `src/game/formulas.ts`, `src/game/magic.ts`, `src/game/travel.ts`, `src/game/state.ts`

Factual titles and objectives were taken from the UESP quest indexes (not copied walkthrough prose). Category pages:

- Main: https://en.uesp.net/wiki/Morrowind:Main_Quest
- Hlaalu, Redoran, Telvanni, Fighters Guild, Mages Guild, Thieves Guild, Imperial Cult, Imperial Legion, Temple, Morag Tong, Daedric, Vampire, Miscellaneous: the matching `Morrowind:*_Quests` pages
- Blades trainers: https://en.uesp.net/wiki/Morrowind:Blades_Trainers

## Source rows

| Bucket | Playable rows |
| --- | ---: |
| Main quest, ship through the Heart | 24 |
| House Hlaalu | 31 |
| House Redoran | 36 |
| House Telvanni | 29 |
| Fighters Guild | 31 |
| Mages Guild | 33 |
| Thieves Guild | 30 |
| Imperial Cult | 25 |
| Imperial Legion | 19 |
| Tribunal Temple (seven graces counted separately) | 29 |
| Morag Tong | 25 |
| Daedric shrine quests | 7 |
| Vampire quests | 14 |
| Miscellaneous, including seven Blades trainer errands | 75 |

408 source quests. The UESP miscellaneous category itself is 68 base-game quests (Bloodmoon’s Patchwork Airship is not included). The seven Blades trainer visits are separate journal indices on the Blades Trainers article; they sit in the miscellaneous bucket because that article is not one of the faction floors. Every source row advances only when its item, place, death, gold, or disposition precondition is true.

Named artifacts are in the world: the package for Caius, the Dwemer puzzle box, the skull of Llevule Andrano, Moon-and-Star, Wraithguard (from Vivec, or from Yagrum Bagarn if Vivec is refused), Sunder, Keening, and the Heart of Lorkhan. Dagoth Ur stands back up while the Heart is linked. The ending is Sunder, then Keening, and only with Wraithguard worn.

## Additions (not source)

Sixteen quests are tagged `addition` in the content object. They are not UESP canon:

- Original errands: The Canticle Fragment, The Silt-Strider’s Limp, Glass in the Foyada, A Name for the Dreamer, Sporelight, Salt Rice for the Manor, The Outlander’s Map, Guar with a Silver Bell, Ledger Ash, The Vigil at the Fence, Bitter Coast Debt, Listening at the Camp.
- Restored from unused journal entries on https://en.uesp.net/wiki/Morrowind:Unfinished_Quests and labeled as restorations: Dagoth Velos, Baladas’s Taxes, Anumidium Plans, Writ for Neloth.

Tribunal and Bloodmoon are not in this game.

## What was modernized

Movement is readable from the first minute. Misses and hits sound and read differently, and the roll still uses weapon skill, Agility, and fatigue. The journal groups quests and keeps their directions when the compass guidance is turned off. Cliff racers stay on a short leash and do not fill the roads. Touch, keyboard, mouse, and gamepad share one action list. Mute, volume, and a fullscreen lock are in Options. Saves are local.
