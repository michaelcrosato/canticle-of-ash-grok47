import type { Cond, QuestDef, QuestStage, Reward } from '../types';

function site(id: string, name: string, hub: string, place: QuestDef['sites'][number]['place']) {
  return { id, name, hub, place };
}

function stage(journal: string, complete: Cond, reward?: Reward): QuestStage {
  return { journal, complete, reward };
}

function quest(partial: Omit<QuestDef, 'origin' | 'category'> & { category?: QuestDef['category'] }): QuestDef {
  return { origin: 'source', category: partial.category ?? 'main', ...partial };
}

const pathDone: Cond = { op: 'quest', id: 'mq_path' };

export function mainQuests(): QuestDef[] {
  return [
    quest({
      id: 'mq_awakening',
      title: 'Azura’s Watch',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Main_Quest',
      summary: 'Jiub wakes a prisoner on the Imperial ship at Seyda Neen, under Azura’s eye.',
      giver: 'jiub',
      location: 'prison_ship',
      sites: [site('prison_ship', 'Imperial Prison Ship', 'seyda_neen', 'ship')],
      spawns: [{ location: 'prison_ship', npc: 'jiub', name: 'Jiub' }],
      stages: [
        stage(
          'A Dark Elf named Jiub is shaking you awake in the hold of a prison ship. The dock outside is Seyda Neen. Stand, look around, and speak to him. The door leads up.',
          { op: 'all', of: [{ op: 'talk', npc: 'jiub' }, { op: 'at', location: 'prison_ship' }] },
          { journal: 'awakened' },
        ),
      ],
    }),
    quest({
      id: 'mq_release',
      title: 'Release from Custody',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Main_Quest',
      summary: 'Sellus Gravius records your identity and releases you with a package and directions for Caius Cosades.',
      giver: 'sellus_gravius',
      location: 'census_office',
      sites: [site('census_office', 'Census and Excise', 'seyda_neen', 'interior')],
      spawns: [{ location: 'census_office', npc: 'sellus_gravius', name: 'Sellus Gravius' }],
      stages: [
        stage(
          'Leave the ship and enter the Census and Excise office. Sellus Gravius will only release you once your name, people, and stars are on his ledger. He will hand you a sealed package and directions to Caius Cosades in Balmora.',
          {
            op: 'all',
            of: [
              { op: 'quest', id: 'mq_awakening' },
              { op: 'at', location: 'census_office' },
              { op: 'talk', npc: 'sellus_gravius' },
            ],
          },
          {
            items: [
              { id: 'package_for_caius' },
              { id: 'directions_to_caius' },
              { id: 'iron_dagger' },
              { id: 'common_shirt' },
            ],
            gold: 87,
            flags: ['released'],
          },
        ),
      ],
    }),
    quest({
      id: 'mq_caius',
      title: 'Report to Caius Cosades',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Report_to_Caius_Cosades',
      summary: 'Deliver the Emperor’s package to Caius Cosades in Balmora.',
      giver: 'caius_cosades',
      location: 'balmora',
      sites: [],
      spawns: [{ location: 'balmora', npc: 'caius_cosades', name: 'Caius Cosades' }],
      stages: [
        stage(
          'Caius Cosades keeps a small house in the northeast of Balmora. Put the package in his hands. Until you do, the rest of the island is yours: walk, ride, or fight as you please.',
          {
            op: 'all',
            of: [
              { op: 'quest', id: 'mq_release' },
              { op: 'at', location: 'balmora' },
              { op: 'talk', npc: 'caius_cosades' },
              { op: 'item', id: 'package_for_caius', consume: true },
            ],
          },
          { gold: 200, flags: ['blades'] },
        ),
      ],
    }),
    quest({
      id: 'mq_antabolis',
      title: 'Antabolis Informant',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Antabolis_Informant',
      summary: 'Recover the Dwemer puzzle box from Arkngthand and trade it to Hasphat Antabolis for notes Caius wants.',
      giver: 'caius_cosades',
      location: 'balmora',
      sites: [site('arkngthand', 'Arkngthand', 'pelagiad', 'dwemer')],
      spawns: [
        { location: 'arkngthand', item: 'dwemer_puzzle_box', name: 'Dwemer Puzzle Box' },
        { location: 'arkngthand', npc: 'dwemer_centurion', name: 'Dwemer Centurion', hostile: true, hp: 80 },
        { location: 'balmora', npc: 'hasphat_antabolis', name: 'Hasphat Antabolis' },
      ],
      stages: [
        stage('Caius sends you to Hasphat Antabolis in Balmora. Hasphat will not talk Nerevarine lore until he holds the Dwemer puzzle box from Arkngthand, on the hills between Seyda Neen and Pelagiad.', {
          op: 'all',
          of: [{ op: 'quest', id: 'mq_caius' }, { op: 'talk', npc: 'caius_cosades' }, { op: 'at', location: 'balmora' }],
        }),
        stage('The puzzle box is in Arkngthand. Take it.', {
          op: 'item',
          id: 'dwemer_puzzle_box',
        }),
        stage('Bring the box to Hasphat Antabolis in Balmora. He will trade notes for it.', {
          op: 'all',
          of: [
            { op: 'at', location: 'balmora' },
            { op: 'talk', npc: 'hasphat_antabolis' },
            { op: 'item', id: 'dwemer_puzzle_box', consume: true },
          ],
        }, { items: [{ id: 'antabolis_notes' }] }),
        stage('Return Hasphat’s notes to Caius in Balmora.', {
          op: 'all',
          of: [
            { op: 'at', location: 'balmora' },
            { op: 'talk', npc: 'caius_cosades' },
            { op: 'item', id: 'antabolis_notes', consume: true },
          ],
        }, { gold: 200 }),
      ],
    }),
    quest({
      id: 'mq_gramuzgob',
      title: 'Gra-Muzgob Informant',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Gra-Muzgob_Informant',
      summary: 'Bring the skull of Llevule Andrano from Andrano Ancestral Tomb to Sharn gra-Muzgob.',
      giver: 'caius_cosades',
      location: 'balmora',
      sites: [site('andrano_tomb', 'Andrano Ancestral Tomb', 'pelagiad', 'tomb')],
      spawns: [
        { location: 'andrano_tomb', npc: 'tomb_guardian', name: 'Ancestral Guardian', hostile: true, hp: 50 },
        { location: 'andrano_tomb', item: 'skull_llevule', name: 'Skull of Llevule Andrano' },
        { location: 'balmora', npc: 'sharn_gra_muzgob', name: 'Sharn gra-Muzgob' },
      ],
      stages: [
        stage('Caius sends you to Sharn gra-Muzgob at the Balmora Mages Guild. She wants the skull of Llevule Andrano from Andrano Ancestral Tomb, south of Pelagiad.', {
          op: 'all',
          of: [{ op: 'quest', id: 'mq_antabolis' }, { op: 'at', location: 'balmora' }, { op: 'talk', npc: 'caius_cosades' }],
        }),
        stage('Recover the skull from Andrano Ancestral Tomb.', { op: 'item', id: 'skull_llevule' }),
        stage('Deliver the skull to Sharn gra-Muzgob in Balmora.', {
          op: 'all',
          of: [
            { op: 'at', location: 'balmora' },
            { op: 'talk', npc: 'sharn_gra_muzgob' },
            { op: 'item', id: 'skull_llevule', consume: true },
          ],
        }, { items: [{ id: 'muzgob_notes' }] }),
        stage('Bring Sharn’s notes back to Caius.', {
          op: 'all',
          of: [{ op: 'at', location: 'balmora' }, { op: 'talk', npc: 'caius_cosades' }, { op: 'item', id: 'muzgob_notes', consume: true }],
        }, { gold: 200 }),
      ],
    }),
    quest({
      id: 'mq_vivec_informants',
      title: 'Vivec Informants',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Vivec_Informants',
      summary: 'Speak with Addhiranirr, Huleeya, and Mehra Milo in Vivec. The three may be approached in any order.',
      giver: 'caius_cosades',
      location: 'balmora',
      sites: [
        site('jobasha', "Jobasha's Rare Books", 'vivec', 'interior'),
        site('huleeya_hideout', 'St. Olms Waistworks', 'vivec', 'interior'),
        site('vivec_temple', 'Vivec Temple', 'vivec', 'canton'),
      ],
      spawns: [
        { location: 'vivec', npc: 'addhiranirr', name: 'Addhiranirr' },
        { location: 'vivec', npc: 'camonna_agent', name: 'Camonna Tong Agent', hostile: true, hp: 45 },
        { location: 'jobasha', npc: 'huleeya', name: 'Huleeya' },
        { location: 'huleeya_hideout', npc: 'huleeya', name: 'Huleeya' },
        { location: 'vivec_temple', npc: 'mehra_milo', name: 'Mehra Milo' },
      ],
      stages: [
        stage('Caius names three people in Vivec: Addhiranirr in the Foreign Quarter, Huleeya at Jobasha’s books, and Mehra Milo in the Temple. Any order will do. Addhiranirr will not talk while a Camonna Tong agent is hunting her. Huleeya needs to be walked to the St. Olms waistworks. Mehra will speak in the library.', {
          op: 'all',
          of: [{ op: 'quest', id: 'mq_gramuzgob' }, { op: 'talk', npc: 'caius_cosades' }],
        }),
        stage('Finish with all three informants, then return to Caius with what they told you.', {
          op: 'all',
          of: [
            { op: 'dead', npc: 'camonna_agent' },
            { op: 'talk', npc: 'addhiranirr' },
            { op: 'flag', id: 'huleeya_safe' },
            { op: 'talk', npc: 'mehra_milo' },
            { op: 'at', location: 'balmora' },
            { op: 'talk', npc: 'caius_cosades' },
          ],
        }, { gold: 400 }),
      ],
    }),
    quest({
      id: 'mq_zainsubani',
      title: 'Zainsubani Informant',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Zainsubani_Informant',
      summary: 'Learn about the Ashlanders and the Sixth House from Hassour Zainsubani in Ald’ruhn. He will not open up until his regard for you is high enough.',
      giver: 'caius_cosades',
      location: 'balmora',
      sites: [],
      spawns: [{ location: 'ald_ruhn', npc: 'hassour_zainsubani', name: 'Hassour Zainsubani' }],
      stages: [
        stage('Caius sends you to Hassour Zainsubani, a writer lodging in Ald’ruhn. He starts cool. Admire him, bribe him, or otherwise raise his disposition before he will share his notes.', {
          op: 'all',
          of: [{ op: 'quest', id: 'mq_vivec_informants' }, { op: 'talk', npc: 'caius_cosades' }],
        }),
        stage('Hassour’s disposition must be at least 60. Speak with him in Ald’ruhn once it is.', {
          op: 'all',
          of: [
            { op: 'at', location: 'ald_ruhn' },
            { op: 'disposition', npc: 'hassour_zainsubani', min: 60 },
            { op: 'talk', npc: 'hassour_zainsubani' },
          ],
        }, { items: [{ id: 'zainsubani_notes' }] }),
        stage('Bring the notes to Caius. He will read them, tell you to seek Sul-Matuul on the northern coast, and then the Empire recalls him.', {
          op: 'all',
          of: [
            { op: 'at', location: 'balmora' },
            { op: 'talk', npc: 'caius_cosades' },
            { op: 'item', id: 'zainsubani_notes', consume: true },
          ],
        }, { gold: 300, flags: ['caius_recalled'] }),
      ],
    }),
    quest({
      id: 'mq_sul_matuul',
      title: 'Meet Sul-Matuul',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Meet_Sul-Matuul',
      summary: 'Travel to the Urshilaku camp and speak with Sul-Matuul about the Nerevarine prophecies.',
      giver: 'sul_matuul',
      location: 'urshilaku_camp',
      sites: [],
      spawns: [
        { location: 'urshilaku_camp', npc: 'sul_matuul', name: 'Sul-Matuul' },
        { location: 'urshilaku_camp', npc: 'nibani_maesa', name: 'Nibani Maesa' },
      ],
      stages: [
        stage('The Urshilaku camp stands on the northern ash coast. Sul-Matuul is ashkhan. Nibani Maesa is the wise woman. Speak to Sul-Matuul.', {
          op: 'all',
          of: [
            { op: 'quest', id: 'mq_zainsubani' },
            { op: 'at', location: 'urshilaku_camp' },
            { op: 'talk', npc: 'sul_matuul' },
          ],
        }),
      ],
    }),
    quest({
      id: 'mq_sixth_house',
      title: 'Sixth House Base',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Sixth_House_Base',
      summary: 'Clear the Sixth House base at Ilunibi, near Gnaar Mok. Dagoth Gares leaves you with corprus, which ordinary cures will not touch.',
      giver: 'sul_matuul',
      location: 'urshilaku_camp',
      sites: [site('ilunibi', 'Ilunibi', 'gnaar_mok', 'cave')],
      spawns: [
        { location: 'ilunibi', npc: 'dagoth_gares', name: 'Dagoth Gares', hostile: true, hp: 120 },
        { location: 'ilunibi', npc: 'ash_slave', name: 'Ash Slave', hostile: true, hp: 40 },
      ],
      stages: [
        stage('Sul-Matuul tells you of a Sixth House base at Ilunibi, in the caves by Gnaar Mok. End it.', {
          op: 'all',
          of: [{ op: 'quest', id: 'mq_sul_matuul' }, { op: 'talk', npc: 'sul_matuul' }],
        }),
        stage('Dagoth Gares waits in the depths of Ilunibi. He cannot be left alive. His curse is corprus, and it will not answer to a common cure.', {
          op: 'dead',
          npc: 'dagoth_gares',
        }, { disease: 'corprus', flags: ['corprus'] }),
        stage('Return to Sul-Matuul. Tell him Gares is dead and the corprus is on you.', {
          op: 'all',
          of: [
            { op: 'at', location: 'urshilaku_camp' },
            { op: 'talk', npc: 'sul_matuul' },
            { op: 'disease', id: 'corprus', has: true },
          ],
        }),
      ],
    }),
    quest({
      id: 'mq_corprus',
      title: 'Corprus Cure',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Corprus_Cure',
      summary: 'Divayth Fyr at Tel Fyr can cure corprus. He asks a sample from the Corprusarium first.',
      giver: 'divayth_fyr',
      location: 'tel_fyr',
      sites: [site('corprusarium', 'Corprusarium', 'tel_fyr', 'interior')],
      spawns: [
        { location: 'tel_fyr', npc: 'divayth_fyr', name: 'Divayth Fyr' },
        { location: 'corprusarium', npc: 'corprus_stalker', name: 'Corprus Stalker', hostile: true, hp: 70 },
        { location: 'corprusarium', item: 'corprus_sample', name: 'Corprus Weepings' },
        { location: 'corprusarium', npc: 'yagrum_bagarn', name: 'Yagrum Bagarn' },
      ],
      stages: [
        stage('Nibani and Sul-Matuul agree: only Divayth Fyr, in Tel Fyr on the eastern islands, has studied corprus long enough to unmake it. A shrine potion will fail.', {
          op: 'all',
          of: [{ op: 'quest', id: 'mq_sixth_house' }, { op: 'disease', id: 'corprus', has: true }],
        }),
        stage('Fyr wants a vial of weepings from a stalker in the Corprusarium beneath his tower.', {
          op: 'all',
          of: [{ op: 'at', location: 'tel_fyr' }, { op: 'talk', npc: 'divayth_fyr' }, { op: 'item', id: 'corprus_sample' }],
        }),
        stage('Give Fyr the sample. Drink what he brews. The corprus ends here.', {
          op: 'all',
          of: [
            { op: 'at', location: 'tel_fyr' },
            { op: 'talk', npc: 'divayth_fyr' },
            { op: 'item', id: 'corprus_sample', consume: true },
            { op: 'disease', id: 'corprus', has: true },
          ],
        }, { cure: 'corprus', clearFlags: ['corprus'], attribute: { endurance: 5, strength: 5 }, flags: ['corprus_cured'] }),
      ],
    }),
    quest({
      id: 'mq_mehra',
      title: 'Mehra Milo and the Lost Prophecies',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Mehra_Milo_and_the_Lost_Prophecies',
      summary: 'Free Mehra Milo from the Ministry of Truth and recover the Lost Prophecies at Holamayan.',
      giver: 'mehra_milo',
      location: 'vivec_temple',
      sites: [
        site('ministry_of_truth', 'Ministry of Truth', 'vivec', 'interior'),
        site('holamayan', 'Holamayan', 'tel_branora', 'shrine'),
      ],
      spawns: [
        { location: 'ministry_of_truth', npc: 'mehra_milo', name: 'Mehra Milo' },
        { location: 'ministry_of_truth', npc: 'ordinator', name: 'Ordinator', hostile: true, hp: 60 },
        { location: 'holamayan', item: 'lost_prophecies', name: 'The Lost Prophecies' },
        { location: 'holamayan', npc: 'mehra_milo', name: 'Mehra Milo' },
      ],
      stages: [
        stage('With the corprus gone, the Dissident Priests can be reached. Mehra Milo has been taken into the Ministry of Truth above Vivec. Find her there.', {
          op: 'all',
          of: [{ op: 'quest', id: 'mq_corprus' }, { op: 'at', location: 'ministry_of_truth' }, { op: 'talk', npc: 'mehra_milo' }],
        }),
        stage('The Ordinators will not let her walk out. Deal with the guard on her door.', { op: 'dead', npc: 'ordinator' }),
        stage('Meet Mehra at the monastery of Holamayan, on the eastern islands, and take the Lost Prophecies.', {
          op: 'all',
          of: [{ op: 'at', location: 'holamayan' }, { op: 'item', id: 'lost_prophecies' }, { op: 'talk', npc: 'mehra_milo' }],
        }),
      ],
    }),
    quest({
      id: 'mq_path',
      title: 'The Path of the Incarnate',
      uesp: 'https://en.uesp.net/wiki/Morrowind:The_Path_of_the_Incarnate',
      summary: 'Pass the Third Trial in the Cavern of the Incarnate and receive Moon-and-Star.',
      giver: 'nibani_maesa',
      location: 'urshilaku_camp',
      sites: [site('cavern_of_the_incarnate', 'Cavern of the Incarnate', 'urshilaku_camp', 'cave')],
      spawns: [{ location: 'cavern_of_the_incarnate', npc: 'azura', name: 'Azura' }],
      stages: [
        stage('Bring the Lost Prophecies to Nibani Maesa at the Urshilaku camp. She will read whether you are the one the verses allow.', {
          op: 'all',
          of: [
            { op: 'quest', id: 'mq_mehra' },
            { op: 'at', location: 'urshilaku_camp' },
            { op: 'talk', npc: 'nibani_maesa' },
            { op: 'item', id: 'lost_prophecies' },
          ],
        }),
        stage('The Third Trial is in the Cavern of the Incarnate, north of the camp. Stand there with the prophecies and answer Azura.', {
          op: 'all',
          of: [
            { op: 'at', location: 'cavern_of_the_incarnate' },
            { op: 'talk', npc: 'azura' },
            { op: 'item', id: 'lost_prophecies' },
          ],
        }, { items: [{ id: 'moon_and_star' }], flags: ['incarnate', 'third_trial'] }),
      ],
    }),
    hortator('mq_hortator_hlaalu', 'Hlaalu Hortator', 'https://en.uesp.net/wiki/Morrowind:Hlaalu_Hortator', 'Persuade House Hlaalu to name you Hortator.', 'crassius_curio', 'vivec', [
      site('dren_plantation', 'Dren Plantation', 'vivec', 'manor'),
      site('omani_manor', 'Omani Manor', 'suran', 'manor'),
      site('ules_manor', 'Ules Manor', 'suran', 'manor'),
      site('st_olms_underworks', 'St. Olms Underworks', 'vivec', 'interior'),
    ], [
      { location: 'vivec', npc: 'crassius_curio', name: 'Crassius Curio' },
      { location: 'vivec', npc: 'yngling_half_troll', name: 'Yngling Half-Troll' },
      { location: 'st_olms_underworks', npc: 'dram_bero', name: 'Dram Bero' },
      { location: 'dren_plantation', npc: 'orvas_dren', name: 'Orvas Dren' },
      { location: 'omani_manor', npc: 'velanda_omani', name: 'Velanda Omani' },
      { location: 'ules_manor', npc: 'nevena_ules', name: 'Nevena Ules' },
    ], stage('Speak with Crassius Curio in his Vivec manor. The Hlaalu councilors may be approached in any order.', {
      op: 'all',
      of: [pathDone, { op: 'at', location: 'vivec' }, { op: 'talk', npc: 'crassius_curio' }],
    }), {
      op: 'all',
      of: [
        { op: 'disposition', npc: 'yngling_half_troll', min: 55 },
        { op: 'talk', npc: 'dram_bero', at: 'st_olms_underworks' },
        { op: 'disposition', npc: 'orvas_dren', min: 50 },
        { op: 'talk', npc: 'velanda_omani', at: 'omani_manor' },
        { op: 'talk', npc: 'nevena_ules', at: 'ules_manor' },
      ],
    }, 'hlaalu_hortator'),
    hortator('mq_hortator_redoran', 'Redoran Hortator', 'https://en.uesp.net/wiki/Morrowind:Redoran_Hortator', 'Win the Redoran council, ending in a duel with Bolvyn Venim.', 'athyn_sarethi', 'ald_ruhn', [
      site('venim_manor', 'Venim Manor', 'ald_ruhn', 'manor'),
      site('caldera_mine', 'Caldera Mine', 'caldera', 'interior'),
    ], [
      { location: 'ald_ruhn', npc: 'athyn_sarethi', name: 'Athyn Sarethi' },
      { location: 'ald_ruhn', npc: 'garisa_llethri', name: 'Garisa Llethri' },
      { location: 'caldera_mine', item: 'caldera_ledger', name: 'Caldera Ledger' },
      { location: 'venim_manor', npc: 'bolvyn_venim', name: 'Bolvyn Venim', hostile: true, hp: 140 },
    ], stage('Athyn Sarethi in Ald’ruhn will sponsor you. The houses may be settled in any order.', {
      op: 'all',
      of: [pathDone, { op: 'at', location: 'ald_ruhn' }, { op: 'talk', npc: 'athyn_sarethi' }],
    }), {
      op: 'all',
      of: [
        { op: 'item', id: 'caldera_ledger' },
        { op: 'talk', npc: 'garisa_llethri' },
        { op: 'dead', npc: 'bolvyn_venim' },
      ],
    }, 'redoran_hortator'),
    hortator('mq_hortator_telvanni', 'Telvanni Hortator', 'https://en.uesp.net/wiki/Morrowind:Telvanni_Hortator', 'Gather the Telvanni council and unseat Archmagister Gothren.', 'aryon', 'tel_vos', [
      site('arvs_drelen', 'Arvs-Drelen', 'gnisis', 'tower'),
    ], [
      { location: 'tel_vos', npc: 'aryon', name: 'Master Aryon' },
      { location: 'arvs_drelen', npc: 'baladas_demnevanni', name: 'Baladas Demnevanni' },
      { location: 'sadrith_mora', npc: 'neloth', name: 'Master Neloth' },
      { location: 'tel_aruhn', npc: 'gothren', name: 'Archmagister Gothren', hostile: true, hp: 160 },
    ], stage('Master Aryon at Tel Vos will explain the council. Telvanni Hortator does not wait on the other houses.', {
      op: 'all',
      of: [pathDone, { op: 'at', location: 'tel_vos' }, { op: 'talk', npc: 'aryon' }],
    }), {
      op: 'all',
      of: [
        { op: 'talk', npc: 'baladas_demnevanni', at: 'arvs_drelen' },
        { op: 'gold', amount: 1000, consume: true },
        { op: 'talk', npc: 'neloth', at: 'sadrith_mora' },
        { op: 'dead', npc: 'gothren' },
      ],
    }, 'telvanni_hortator'),
    nerevarine('mq_nerevarine_urshilaku', 'Urshilaku Nerevarine', 'https://en.uesp.net/wiki/Morrowind:Urshilaku_Nerevarine', 'Be named Nerevarine by Sul-Matuul while Moon-and-Star is worn.', 'sul_matuul', 'urshilaku_camp', [], [
      { location: 'urshilaku_camp', npc: 'sul_matuul', name: 'Sul-Matuul' },
    ], {
      op: 'all',
      of: [pathDone, { op: 'equipped', id: 'moon_and_star' }, { op: 'at', location: 'urshilaku_camp' }, { op: 'talk', npc: 'sul_matuul' }, { op: 'talk', npc: 'nibani_maesa' }],
    }, 'urshilaku_nerevarine'),
    nerevarine('mq_nerevarine_ahemmusa', 'Ahemmusa Nerevarine', 'https://en.uesp.net/wiki/Morrowind:Ahemmusa_Nerevarine', 'Clear Ald Daedroth so the Ahemmusa can name you Nerevarine.', 'sinnammu_mirpal', 'ahemmusa_camp', [
      site('ald_daedroth', 'Ald Daedroth', 'ahemmusa_camp', 'daedric'),
    ], [
      { location: 'ahemmusa_camp', npc: 'sinnammu_mirpal', name: 'Sinnammu Mirpal' },
      { location: 'ald_daedroth', npc: 'daedroth_lord', name: 'Daedroth', hostile: true, hp: 90 },
    ], {
      op: 'all',
      of: [pathDone, { op: 'dead', npc: 'daedroth_lord' }, { op: 'at', location: 'ahemmusa_camp' }, { op: 'talk', npc: 'sinnammu_mirpal' }],
    }, 'ahemmusa_nerevarine'),
    nerevarine('mq_nerevarine_zainab', 'Zainab Nerevarine', 'https://en.uesp.net/wiki/Morrowind:Zainab_Nerevarine', 'Satisfy the Zainab ashkhan’s demand for a high-born bride.', 'kaushad', 'zainab_camp', [], [
      { location: 'zainab_camp', npc: 'kaushad', name: 'Ashkhan Kaushad' },
      { location: 'tel_aruhn', npc: 'falura_llervu', name: 'Falura Llervu' },
      { location: 'tel_aruhn', item: 'ceremonial_robe', name: 'Ceremonial Robe' },
    ], {
      op: 'all',
      of: [
        pathDone,
        { op: 'flag', id: 'falura_agreed' },
        { op: 'item', id: 'ceremonial_robe', consume: true },
        { op: 'at', location: 'zainab_camp' },
        { op: 'talk', npc: 'kaushad' },
      ],
    }, 'zainab_nerevarine'),
    nerevarine('mq_nerevarine_erabenimsun', 'Erabenimsun Nerevarine', 'https://en.uesp.net/wiki/Morrowind:Erabenimsun_Nerevarine', 'Break Ulath-Pal’s grip so Han-Ammu can name you Nerevarine.', 'han_ammu', 'erabenimsun_camp', [], [
      { location: 'erabenimsun_camp', npc: 'ulath_pal', name: 'Ashkhan Ulath-Pal', hostile: true, hp: 110 },
      { location: 'erabenimsun_camp', npc: 'han_ammu', name: 'Han-Ammu' },
      { location: 'erabenimsun_camp', npc: 'gulakhan_a', name: 'Gulakhan Ashu-Ahhe' },
      { location: 'erabenimsun_camp', npc: 'gulakhan_b', name: 'Gulakhan Ranabi' },
    ], {
      op: 'all',
      of: [
        pathDone,
        {
          op: 'any',
          of: [
            { op: 'dead', npc: 'ulath_pal' },
            { op: 'all', of: [{ op: 'disposition', npc: 'gulakhan_a', min: 60 }, { op: 'disposition', npc: 'gulakhan_b', min: 60 }] },
          ],
        },
        { op: 'at', location: 'erabenimsun_camp' },
        { op: 'talk', npc: 'han_ammu' },
      ],
    }, 'erabenimsun_nerevarine'),
    quest({
      id: 'mq_hortator_nerevarine',
      title: 'Hortator and Nerevarine',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Hortator_and_Nerevarine',
      summary: 'With all three Houses and four tribes behind you, meet Vivec. Accept his plan and Wraithguard, or refuse him.',
      giver: 'vivec',
      location: 'vivec_palace',
      sites: [site('vivec_palace', 'Palace of Vivec', 'vivec', 'canton')],
      spawns: [
        { location: 'vivec_palace', npc: 'vivec', name: 'Vivec' },
        { location: 'vivec_palace', item: 'kagrenacs_notes', name: "Kagrenac's Notes" },
      ],
      stages: [
        stage('All three Hortator titles and all four Nerevarine recognitions are required before Vivec will open the plan. Go to his palace in Vivec.', {
          op: 'all',
          of: [
            { op: 'quest', id: 'mq_hortator_hlaalu' },
            { op: 'quest', id: 'mq_hortator_redoran' },
            { op: 'quest', id: 'mq_hortator_telvanni' },
            { op: 'quest', id: 'mq_nerevarine_urshilaku' },
            { op: 'quest', id: 'mq_nerevarine_ahemmusa' },
            { op: 'quest', id: 'mq_nerevarine_zainab' },
            { op: 'quest', id: 'mq_nerevarine_erabenimsun' },
            { op: 'at', location: 'vivec_palace' },
            { op: 'talk', npc: 'vivec' },
            { op: 'any', of: [{ op: 'flag', id: 'vivec_plan' }, { op: 'flag', id: 'vivec_refused' }] },
          ],
        }),
      ],
    }),
    quest({
      id: 'mq_yagrum',
      title: 'Yagrum Bagarn and Wraithguard',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Yagrum_Bagarn_and_Wraithguard',
      summary: 'If Vivec is refused, Yagrum Bagarn can still construct Wraithguard from Kagrenac’s notes.',
      giver: 'yagrum_bagarn',
      location: 'corprusarium',
      sites: [],
      spawns: [{ location: 'corprusarium', npc: 'yagrum_bagarn', name: 'Yagrum Bagarn' }],
      stages: [
        stage('You refused Vivec’s gift. Take Kagrenac’s notes from the palace to Yagrum Bagarn in the Corprusarium. The last living Dwemer can still build Wraithguard.', {
          op: 'all',
          of: [
            { op: 'flag', id: 'vivec_refused' },
            { op: 'notFlag', id: 'vivec_plan' },
            { op: 'item', id: 'kagrenacs_notes', consume: true },
            { op: 'at', location: 'corprusarium' },
            { op: 'talk', npc: 'yagrum_bagarn' },
          ],
        }, { items: [{ id: 'wraithguard' }], flags: ['wraithguard_yagrum'] }),
      ],
    }),
    quest({
      id: 'mq_sleepers',
      title: 'Sleepers Awake',
      uesp: 'https://en.uesp.net/wiki/Morrowind:Sleepers_Awake',
      summary: 'End Dagoth Ur’s hold on the sleepers in the towns before the citadels.',
      giver: 'caius_cosades',
      location: 'balmora',
      sites: [],
      spawns: [
        { location: 'balmora', npc: 'dreamer_balmora', name: 'Sleeper', hostile: true, hp: 35 },
        { location: 'ald_ruhn', npc: 'dreamer_aldruhn', name: 'Sleeper', hostile: true, hp: 35 },
        { location: 'vivec', npc: 'dreamer_vivec', name: 'Sleeper', hostile: true, hp: 35 },
        { location: 'tel_aruhn', npc: 'dreamer_tel', name: 'Sleeper', hostile: true, hp: 35 },
      ],
      stages: [
        stage('Dreamers are waking in Balmora, Ald’ruhn, Vivec, and Tel Aruhn. They attack their neighbors. Put each sleeper down. The Heart still feeds the rest.', {
          op: 'all',
          of: [
            { op: 'quest', id: 'mq_hortator_nerevarine' },
            { op: 'dead', npc: 'dreamer_balmora' },
            { op: 'dead', npc: 'dreamer_aldruhn' },
            { op: 'dead', npc: 'dreamer_vivec' },
            { op: 'dead', npc: 'dreamer_tel' },
          ],
        }, { flags: ['sleepers_quiet'] }),
      ],
    }),
    quest({
      id: 'mq_citadels',
      title: 'The Citadels of the Sixth House',
      uesp: 'https://en.uesp.net/wiki/Morrowind:The_Citadels_of_the_Sixth_House',
      summary: 'Defeat the ash vampires. Take Sunder from Dagoth Vemyn at Vemynal and Keening from Dagoth Odros at Odrosal.',
      giver: 'vivec',
      location: 'vivec_palace',
      sites: [],
      spawns: [
        { location: 'vemynal', npc: 'dagoth_vemyn', name: 'Dagoth Vemyn', hostile: true, hp: 180 },
        { location: 'vemynal', item: 'sunder', name: 'Sunder' },
        { location: 'odrosal', npc: 'dagoth_odros', name: 'Dagoth Odros', hostile: true, hp: 180 },
        { location: 'odrosal', item: 'keening', name: 'Keening' },
        { location: 'endusal', npc: 'dagoth_endus', name: 'Dagoth Endus', hostile: true, hp: 160 },
        { location: 'tureynulal', npc: 'dagoth_tureynul', name: 'Dagoth Tureynul', hostile: true, hp: 160 },
      ],
      stages: [
        stage('The ash-vampire citadels stand inside the Ghostfence: Vemynal, Odrosal, Endusal, and Tureynulal. Sunder is on Dagoth Vemyn. Keening is on Dagoth Odros. You may clear them in any order. Do not wear Sunder or Keening until Wraithguard is on your arm.', {
          op: 'all',
          of: [
            { op: 'quest', id: 'mq_sleepers' },
            { op: 'item', id: 'wraithguard' },
            { op: 'dead', npc: 'dagoth_vemyn' },
            { op: 'item', id: 'sunder' },
            { op: 'dead', npc: 'dagoth_odros' },
            { op: 'item', id: 'keening' },
            { op: 'dead', npc: 'dagoth_endus' },
            { op: 'dead', npc: 'dagoth_tureynul' },
          ],
        }, { flags: ['tools_of_kagrenac'] }),
      ],
    }),
    quest({
      id: 'mq_heart',
      title: 'The Heart of Lorkhan',
      uesp: 'https://en.uesp.net/wiki/Morrowind:The_Citadels_of_the_Sixth_House',
      summary: 'In the Heart chamber, with Wraithguard worn, strike the Heart with Sunder and then with Keening. Dagoth Ur is not ended by wounds while the Heart sustains him.',
      giver: 'azura',
      location: 'heart_chamber',
      sites: [site('heart_chamber', 'Heart of Lorkhan', 'dagoth_ur_citadel', 'interior')],
      spawns: [
        { location: 'heart_chamber', npc: 'dagoth_ur', name: 'Dagoth Ur', hostile: true, hp: 400 },
        { location: 'heart_chamber', npc: 'heart_of_lorkhan', name: 'Heart of Lorkhan' },
      ],
      stages: [
        stage('Enter the facility of Dagoth Ur beneath Red Mountain and descend to the Heart. Wraithguard must be worn. Strike the Heart with Sunder. Then strike it with Keening. Wounds alone will not keep Dagoth Ur down while the Heart is whole.', {
          op: 'all',
          of: [
            { op: 'quest', id: 'mq_citadels' },
            { op: 'at', location: 'heart_chamber' },
            { op: 'equipped', id: 'wraithguard' },
            { op: 'flag', id: 'heartSevered' },
          ],
        }, { flags: ['blightEnded', 'azura_ending'] }),
      ],
    }),
  ];
}

function hortator(
  id: string,
  title: string,
  uesp: string,
  summary: string,
  giver: string,
  at: string,
  sites: QuestDef['sites'],
  spawns: QuestDef['spawns'],
  accept: QuestStage,
  objective: Cond,
  flag: string,
): QuestDef {
  return quest({
    id,
    title,
    uesp,
    summary,
    giver,
    location: at,
    sites,
    spawns,
    stages: [
      accept,
      stage(`Do what this House requires, then return to ${giver.replaceAll('_', ' ')} and be named.`, {
        op: 'all',
        of: [objective, { op: 'at', location: at }, { op: 'talk', npc: giver }],
      }, { flags: [flag], items: id.endsWith('hlaalu') ? [{ id: 'hortator_belt' }] : [] }),
    ],
  });
}

function nerevarine(
  id: string,
  title: string,
  uesp: string,
  summary: string,
  giver: string,
  at: string,
  sites: QuestDef['sites'],
  spawns: QuestDef['spawns'],
  complete: Cond,
  flag: string,
): QuestDef {
  return quest({
    id,
    title,
    uesp,
    summary,
    giver,
    location: at,
    sites,
    spawns,
    stages: [
      stage(summary + ' The tribes may be approached in any order once Moon-and-Star is yours.', complete, { flags: [flag] }),
    ],
  });
}

export const MAIN_IDS = [
  'mq_awakening',
  'mq_release',
  'mq_caius',
  'mq_antabolis',
  'mq_gramuzgob',
  'mq_vivec_informants',
  'mq_zainsubani',
  'mq_sul_matuul',
  'mq_sixth_house',
  'mq_corprus',
  'mq_mehra',
  'mq_path',
  'mq_hortator_hlaalu',
  'mq_hortator_redoran',
  'mq_hortator_telvanni',
  'mq_nerevarine_urshilaku',
  'mq_nerevarine_ahemmusa',
  'mq_nerevarine_zainab',
  'mq_nerevarine_erabenimsun',
  'mq_hortator_nerevarine',
  'mq_yagrum',
  'mq_sleepers',
  'mq_citadels',
  'mq_heart',
] as const;
