import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/game/content';
import { give } from '../src/game/magic';
import { advanceQuest, branchClosed, chooseVivec, damageDagothUr, strikeHeart } from '../src/game/quests';
import { cureAttempt, createNewGame } from '../src/game/state';
import type { GameState } from '../src/game/types';
import { crowdSpots, doorSpots, spawnsAt } from '../src/game/world';

const quests = CONTENT.quests;

function fresh(): GameState {
  return createNewGame({ name: 'Prisoner', race: 'darkelf', birthsign: 'lover', classId: 'spellsword' });
}

function done(state: GameState, id: string): void {
  const q = quests.find((quest) => quest.id === id)!;
  state.quests[id] = { stage: q.stages.length, complete: true };
}

describe('main quest preconditions', () => {
  it('fails each linear beat until its precondition is true', () => {
    const state = fresh();
    expect(advanceQuest(state, quests, 'mq_awakening').ok).toBe(false);
    state.flags['talk:jiub'] = true;
    state.location = 'prison_ship';
    expect(advanceQuest(state, quests, 'mq_awakening').ok).toBe(true);

    expect(advanceQuest(state, quests, 'mq_release').ok).toBe(false);
    state.location = 'census_office';
    state.flags['talk:sellus_gravius'] = true;
    expect(advanceQuest(state, quests, 'mq_release').ok).toBe(true);
    expect(state.released).toBe(true);
    expect(state.inventory.some((i) => i.id === 'package_for_caius')).toBe(true);
    expect(state.quests.mq_caius).toEqual({ stage: 0, complete: false });

    expect(advanceQuest(state, quests, 'mq_caius').ok).toBe(false);
    state.location = 'balmora';
    state.flags['talk:caius_cosades'] = true;
    expect(advanceQuest(state, quests, 'mq_caius').ok).toBe(true);
    expect(state.inventory.some((i) => i.id === 'package_for_caius')).toBe(false);

    expect(advanceQuest(state, quests, 'mq_antabolis').ok).toBe(true);
    expect(advanceQuest(state, quests, 'mq_antabolis').ok).toBe(false);
    give(state, 'dwemer_puzzle_box');
    expect(advanceQuest(state, quests, 'mq_antabolis').ok).toBe(true);
    state.flags['talk:hasphat_antabolis'] = true;
    expect(advanceQuest(state, quests, 'mq_antabolis').ok).toBe(true);
    expect(advanceQuest(state, quests, 'mq_antabolis').ok).toBe(true);

    expect(advanceQuest(state, quests, 'mq_gramuzgob').ok).toBe(true);
    give(state, 'skull_llevule');
    expect(advanceQuest(state, quests, 'mq_gramuzgob').ok).toBe(true);
    state.flags['talk:sharn_gra_muzgob'] = true;
    expect(advanceQuest(state, quests, 'mq_gramuzgob').ok).toBe(true);
    expect(advanceQuest(state, quests, 'mq_gramuzgob').ok).toBe(true);

    expect(advanceQuest(state, quests, 'mq_vivec_informants').ok).toBe(true);
    expect(advanceQuest(state, quests, 'mq_vivec_informants').ok).toBe(false);
    state.dead.camonna_agent = true;
    state.flags['talk:addhiranirr'] = true;
    state.flags.huleeya_safe = true;
    state.flags['talk:mehra_milo'] = true;
    expect(advanceQuest(state, quests, 'mq_vivec_informants').ok).toBe(true);

    done(state, 'mq_zainsubani');
    expect(advanceQuest(state, quests, 'mq_sul_matuul').ok).toBe(false);
    state.location = 'urshilaku_camp';
    state.flags['talk:sul_matuul'] = true;
    expect(advanceQuest(state, quests, 'mq_sul_matuul').ok).toBe(true);

    expect(advanceQuest(state, quests, 'mq_sixth_house').ok).toBe(true);
    expect(advanceQuest(state, quests, 'mq_sixth_house').ok).toBe(false);
    state.dead.dagoth_gares = true;
    expect(advanceQuest(state, quests, 'mq_sixth_house').ok).toBe(true);
    expect(state.diseases.includes('corprus')).toBe(true);
    expect(cureAttempt(state, 'disease').ok).toBe(false);
    expect(state.diseases.includes('corprus')).toBe(true);
    expect(advanceQuest(state, quests, 'mq_sixth_house').ok).toBe(true);

    expect(advanceQuest(state, quests, 'mq_corprus').ok).toBe(true);
    state.location = 'tel_fyr';
    state.flags['talk:divayth_fyr'] = true;
    give(state, 'corprus_sample');
    expect(advanceQuest(state, quests, 'mq_corprus').ok).toBe(true);
    expect(advanceQuest(state, quests, 'mq_corprus').ok).toBe(true);
    expect(state.diseases.includes('corprus')).toBe(false);

    expect(advanceQuest(state, quests, 'mq_mehra').ok).toBe(false);
    state.location = 'ministry_of_truth';
    state.flags['talk:mehra_milo'] = true;
    expect(advanceQuest(state, quests, 'mq_mehra').ok).toBe(true);
    state.dead.ordinator = true;
    expect(advanceQuest(state, quests, 'mq_mehra').ok).toBe(true);
    state.location = 'holamayan';
    give(state, 'lost_prophecies');
    expect(advanceQuest(state, quests, 'mq_mehra').ok).toBe(true);

    expect(advanceQuest(state, quests, 'mq_path').ok).toBe(false);
    state.location = 'urshilaku_camp';
    state.flags['talk:nibani_maesa'] = true;
    expect(advanceQuest(state, quests, 'mq_path').ok).toBe(true);
    expect(advanceQuest(state, quests, 'mq_path').ok).toBe(false);
    state.location = 'cavern_of_the_incarnate';
    state.flags['talk:azura'] = true;
    expect(advanceQuest(state, quests, 'mq_path').ok).toBe(true);
    expect(state.inventory.some((i) => i.id === 'moon_and_star')).toBe(true);
  });

  it('houses and tribes are independent after the Third Trial, then Vivec or Yagrum yields Wraithguard', () => {
    const state = fresh();
    state.location = 'vivec';
    state.flags['talk:crassius_curio'] = true;
    expect(advanceQuest(state, quests, 'mq_hortator_hlaalu').ok).toBe(false);
    done(state, 'mq_path');
    expect(advanceQuest(state, quests, 'mq_hortator_hlaalu').ok).toBe(true);
    expect(advanceQuest(state, quests, 'mq_hortator_redoran').ok).toBe(false);
    state.location = 'ald_ruhn';
    state.flags['talk:athyn_sarethi'] = true;
    expect(advanceQuest(state, quests, 'mq_hortator_redoran').ok).toBe(true);
    state.location = 'tel_vos';
    state.flags['talk:aryon'] = true;
    expect(advanceQuest(state, quests, 'mq_hortator_telvanni').ok).toBe(true);

    state.location = 'urshilaku_camp';
    state.flags['talk:nibani_maesa'] = true;
    state.flags['talk:sul_matuul'] = true;
    state.equipment.armor.ring = 'moon_and_star';
    expect(advanceQuest(state, quests, 'mq_nerevarine_urshilaku').ok).toBe(true);
    state.dead.daedroth_lord = true;
    state.location = 'ahemmusa_camp';
    state.flags['talk:sinnammu_mirpal'] = true;
    expect(advanceQuest(state, quests, 'mq_nerevarine_ahemmusa').ok).toBe(true);
    state.flags.falura_agreed = true;
    give(state, 'ceremonial_robe');
    state.location = 'zainab_camp';
    state.flags['talk:kaushad'] = true;
    expect(advanceQuest(state, quests, 'mq_nerevarine_zainab').ok).toBe(true);
    state.dead.ulath_pal = true;
    state.location = 'erabenimsun_camp';
    state.flags['talk:han_ammu'] = true;
    expect(advanceQuest(state, quests, 'mq_nerevarine_erabenimsun').ok).toBe(true);

    for (const id of ['mq_hortator_hlaalu', 'mq_hortator_redoran', 'mq_hortator_telvanni']) {
      expect(advanceQuest(state, quests, id).ok).toBe(false);
    }
    state.disposition.yngling_half_troll = 80;
    state.flags['met:dram_bero:st_olms_underworks'] = true;
    state.disposition.orvas_dren = 80;
    state.flags['met:velanda_omani:omani_manor'] = true;
    state.flags['met:nevena_ules:ules_manor'] = true;
    state.location = 'vivec';
    expect(advanceQuest(state, quests, 'mq_hortator_hlaalu').ok).toBe(true);

    give(state, 'caldera_ledger');
    state.flags['talk:garisa_llethri'] = true;
    state.dead.bolvyn_venim = true;
    state.location = 'ald_ruhn';
    expect(advanceQuest(state, quests, 'mq_hortator_redoran').ok).toBe(true);

    state.flags['met:baladas_demnevanni:arvs_drelen'] = true;
    state.gold = 5000;
    state.flags['met:neloth:sadrith_mora'] = true;
    state.dead.gothren = true;
    state.location = 'tel_vos';
    expect(advanceQuest(state, quests, 'mq_hortator_telvanni').ok).toBe(true);

    state.location = 'vivec_palace';
    state.flags['talk:vivec'] = true;
    const early = fresh();
    early.location = 'vivec_palace';
    early.flags['talk:vivec'] = true;
    expect(chooseVivec(early, true).ok).toBe(false);
    done(state, 'mq_hortator_hlaalu');
    done(state, 'mq_hortator_redoran');
    done(state, 'mq_hortator_telvanni');
    done(state, 'mq_nerevarine_urshilaku');
    done(state, 'mq_nerevarine_ahemmusa');
    done(state, 'mq_nerevarine_zainab');
    done(state, 'mq_nerevarine_erabenimsun');
    expect(chooseVivec(state, false).ok).toBe(true);
    expect(state.inventory.some((i) => i.id === 'wraithguard')).toBe(false);
    expect(advanceQuest(state, quests, 'mq_hortator_nerevarine').ok).toBe(true);
    expect(advanceQuest(state, quests, 'mq_yagrum').ok).toBe(false);
    give(state, 'kagrenacs_notes');
    state.location = 'corprusarium';
    state.flags['talk:yagrum_bagarn'] = true;
    expect(advanceQuest(state, quests, 'mq_yagrum').ok).toBe(true);
    expect(state.inventory.some((i) => i.id === 'wraithguard')).toBe(true);

    const blessed = fresh();
    blessed.location = 'vivec_palace';
    blessed.flags['talk:vivec'] = true;
    for (const id of [
      'mq_hortator_hlaalu',
      'mq_hortator_redoran',
      'mq_hortator_telvanni',
      'mq_nerevarine_urshilaku',
      'mq_nerevarine_ahemmusa',
      'mq_nerevarine_zainab',
      'mq_nerevarine_erabenimsun',
    ]) done(blessed, id);
    expect(chooseVivec(blessed, true).ok).toBe(true);
    expect(blessed.inventory.some((i) => i.id === 'wraithguard')).toBe(true);
    expect(advanceQuest(blessed, quests, 'mq_yagrum').ok).toBe(false);
  });

  it('the Heart answers only Sunder then Keening, and only under Wraithguard', () => {
    const state = fresh();
    state.location = 'heart_chamber';
    give(state, 'sunder');
    give(state, 'keening');
    give(state, 'wraithguard');
    expect(strikeHeart(state, 'sunder').ok).toBe(false);
    state.equipment.armor.gauntlet = 'wraithguard';
    state.flags.wraithguard_equipped = true;
    expect(strikeHeart(state, 'keening').reason).toBe('order');
    expect(strikeHeart(state, 'sunder').ok).toBe(true);
    expect(strikeHeart(state, 'keening').ok).toBe(true);
    expect(state.blightEnded).toBe(true);
    expect(state.heartLinked).toBe(false);
    expect(state.ending).toBe(true);
    expect(state.flags.dagothUrDestroyed).toBe(true);
  });

  it('Dagoth Ur is not destroyed by damage while the Heart is linked', () => {
    const state = fresh();
    state.heartLinked = true;
    state.dagothHp = 30;
    const first = damageDagothUr(state, 100);
    expect(first.destroyed).toBe(false);
    expect(first.revived).toBe(true);
    expect(state.dagothHp).toBe(state.dagothMax);
    expect(state.flags.dagothUrDestroyed).toBeFalsy();
    state.heartLinked = false;
    const second = damageDagothUr(state, 10000);
    expect(second.destroyed).toBe(true);
  });

  it('sleepers and citadels follow the titles and the tools', () => {
    const state = fresh();
    expect(advanceQuest(state, quests, 'mq_sleepers').ok).toBe(false);
    done(state, 'mq_hortator_nerevarine');
    expect(advanceQuest(state, quests, 'mq_sleepers').ok).toBe(false);
    state.dead.dreamer_balmora = true;
    state.dead.dreamer_aldruhn = true;
    state.dead.dreamer_vivec = true;
    state.dead.dreamer_tel = true;
    expect(advanceQuest(state, quests, 'mq_sleepers').ok).toBe(true);
    expect(advanceQuest(state, quests, 'mq_citadels').ok).toBe(false);
    give(state, 'wraithguard');
    give(state, 'sunder');
    give(state, 'keening');
    state.dead.dagoth_vemyn = true;
    state.dead.dagoth_odros = true;
    state.dead.dagoth_endus = true;
    state.dead.dagoth_tureynul = true;
    expect(advanceQuest(state, quests, 'mq_citadels').ok).toBe(true);
    state.location = 'heart_chamber';
    state.equipment.armor.gauntlet = 'wraithguard';
    state.flags.wraithguard_equipped = true;
    expect(advanceQuest(state, quests, 'mq_heart').ok).toBe(false);
    state.flags.heartSevered = true;
    state.flags.heartSundered = true;
    expect(advanceQuest(state, quests, 'mq_heart').ok).toBe(true);
  });

  it('the Heart, Falura, and Vivec are in the world before their objective flags', () => {
    const state = fresh();
    done(state, 'mq_citadels');
    const heart = spawnsAt(state, quests, 'heart_chamber').map((s) => s.npc ?? s.item);
    expect(heart).toContain('heart_of_lorkhan');
    expect(heart).toContain('dagoth_ur');
    expect(state.flags.heartSevered).toBeFalsy();

    done(state, 'mq_path');
    const aruhn = spawnsAt(state, quests, 'tel_aruhn').map((s) => s.npc ?? s.item);
    expect(aruhn).toContain('falura_llervu');
    expect(aruhn).toContain('ceremonial_robe');

    for (const id of [
      'mq_hortator_hlaalu',
      'mq_hortator_redoran',
      'mq_hortator_telvanni',
      'mq_nerevarine_urshilaku',
      'mq_nerevarine_ahemmusa',
      'mq_nerevarine_zainab',
      'mq_nerevarine_erabenimsun',
    ]) done(state, id);
    const palace = spawnsAt(state, quests, 'vivec_palace').map((s) => s.npc ?? s.item);
    expect(palace).toContain('vivec');

    done(state, 'mq_sul_matuul');
    const camp = spawnsAt(state, quests, 'urshilaku_camp').map((s) => s.npc);
    expect(camp).toContain('nibani_maesa');
    expect(camp).toContain('sul_matuul');
  });

  it('accepting Vivec closes the Yagrum branch', () => {
    const state = fresh();
    const yagrum = quests.find((q) => q.id === 'mq_yagrum')!;
    expect(branchClosed(state, yagrum.stages[0]?.complete)).toBe(false);
    state.flags.vivec_plan = true;
    expect(branchClosed(state, yagrum.stages[0]?.complete)).toBe(true);
  });

  it('a crowded canton still has a separate road for every walk link', () => {
    const spots = doorSpots(30);
    expect(spots).toHaveLength(30);
    const crowd = crowdSpots(90);
    expect(crowd).toHaveLength(90);
    for (const s of crowd) expect(Math.hypot(s.x, s.z - 1.2)).toBeLessThan(6.2);
    expect(spots[0]!.z).toBeLessThan(-8);
    expect(Math.abs(spots[0]!.x)).toBeLessThan(0.02);
    for (let i = 0; i < spots.length; i++) {
      for (let j = i + 1; j < spots.length; j++) {
        const d = Math.hypot(spots[i]!.x - spots[j]!.x, spots[i]!.z - spots[j]!.z);
        expect(d).toBeGreaterThan(2.4);
      }
    }
  });
});
