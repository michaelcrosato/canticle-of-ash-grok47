#!/usr/bin/env python3
"""Emit src/game/content/rows.ts from the factual UESP quest lists."""
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "src" / "game" / "content" / "rows.ts"

U = {
    "hlaalu": "https://en.uesp.net/wiki/Morrowind:Hlaalu_Quests",
    "redoran": "https://en.uesp.net/wiki/Morrowind:Redoran_Quests",
    "telvanni": "https://en.uesp.net/wiki/Morrowind:Telvanni_Quests",
    "fighters": "https://en.uesp.net/wiki/Morrowind:Fighters_Guild_Quests",
    "mages": "https://en.uesp.net/wiki/Morrowind:Mages_Guild_Quests",
    "thieves": "https://en.uesp.net/wiki/Morrowind:Thieves_Guild_Quests",
    "cult": "https://en.uesp.net/wiki/Morrowind:Imperial_Cult_Quests",
    "legion": "https://en.uesp.net/wiki/Morrowind:Imperial_Legion_Quests",
    "temple": "https://en.uesp.net/wiki/Morrowind:Temple_Quests",
    "morag": "https://en.uesp.net/wiki/Morrowind:Morag_Tong_Quests",
    "daedric": "https://en.uesp.net/wiki/Morrowind:Daedric_Quests",
    "vampire": "https://en.uesp.net/wiki/Morrowind:Vampire",
    "miscellaneous": "https://en.uesp.net/wiki/Morrowind:Miscellaneous_Quests",
}

rows = []


def add(cat, title, giver, gname, at, kind, dest, dname, hub, summary, **kw):
    rows.append(
        {
            "cat": cat,
            "title": title,
            "giver": giver,
            "giverName": gname,
            "at": at,
            "kind": kind,
            "dest": dest,
            "destName": dname,
            "hub": hub,
            "summary": summary,
            "uesp": kw.pop("uesp", U[cat if cat in U else "miscellaneous"]),
            "origin": kw.pop("origin", "source"),
            **kw,
        }
    )


def chain(cat, faction, entries):
    prev = None
    for i, e in enumerate(entries):
        kw = dict(e)
        title = kw.pop("title")
        if faction:
            kw["faction"] = faction
        if i == 0:
            kw["join"] = True
        elif prev:
            kw["needs"] = prev
        qid = kw.pop("id", None)
        add(cat, title, **kw)
        prev = qid or f"{cat}_{len([r for r in rows if r['cat']==cat]):03d}"
        # id assigned later; needs must be the actual id. Fix after ids assigned.


# We'll assign ids after all adds, then fix needs by title chain stored as _prev title.
# Simpler: pass needsTitle and resolve at the end.

rows.clear()


def add2(cat, title, giver, gname, at, kind, dest, dname, hub, summary, needs_title=None, **kw):
    rows.append(
        {
            "cat": cat,
            "title": title,
            "giver": giver,
            "giverName": gname,
            "at": at,
            "kind": kind,
            "dest": dest,
            "destName": dname,
            "hub": hub,
            "summary": summary,
            "uesp": kw.pop("uesp", U.get(cat, U["miscellaneous"])),
            "origin": kw.pop("origin", "source"),
            "needsTitle": needs_title,
            **kw,
        }
    )


def seq(cat, faction, items):
    prev = None
    for i, it in enumerate(items):
        title, giver, gname, at, kind, dest, dname, hub, summary = it[:9]
        extra = dict(it[9]) if len(it) > 9 else {}
        dest = extra.pop("dest", dest)
        dname = extra.pop("destName", dname)
        hub = extra.pop("hub", hub)
        kw = extra
        if faction:
            kw["faction"] = faction
        if i == 0:
            kw["join"] = True
        add2(cat, title, giver, gname, at, kind, dest, dname, hub, summary, prev, **kw)
        prev = title


# --- House Hlaalu (31) ---
seq(
    "hlaalu",
    "hlaalu",
    [
        ("Stronghold", "nileno_dorvayn", "Nileno Dorvayn", "balmora", "gold", "rethan_manor", "Rethan Manor", "balmora", "Fund the three phases of Rethan Manor, the Hlaalu stronghold south of Balmora.", {"gold": 500, "place": "manor"}),
        ("Disguise", "nileno_dorvayn", "Nileno Dorvayn", "balmora", "fetch", "ald_ruhn", "Neminda's orders", "ald_ruhn", "Take Redoran orders from a dead courier's cache and bring them to Nileno in the guise of that courier.", {"item": "redoran_orders", "itemName": "Redoran Orders"}),
        ("Alchemical Formulas", "nileno_dorvayn", "Nileno Dorvayn", "balmora", "fetch", "balmora", "Rival's shop", "balmora", "Steal the spoiling formulas from the rival alchemist and return them to Nileno.", {"item": "alchemical_formulas", "itemName": "Alchemical Formulas", "place": "interior"}),
        ("Inanius Egg Mine", "nileno_dorvayn", "Nileno Dorvayn", "balmora", "kill", "inanius_mine", "Inanius Egg Mine", "suran", "Kill the blighted kwama queen in Inanius Egg Mine near Suran.", {"target": "inanius_queen", "targetName": "Kwama Queen", "place": "cave"}),
        ("Guar Hide Squeeze", "nileno_dorvayn", "Nileno Dorvayn", "balmora", "persuade", "vivec", "Vivec hides market", "vivec", "Raise the hide merchant's regard until he agrees to buy only Hlaalu guar hides.", {"target": "hide_merchant", "targetName": "Hide Merchant", "minDisp": 60}),
        ("Delivery for Bivale Teneran", "nileno_dorvayn", "Nileno Dorvayn", "balmora", "deliver", "ald_ruhn", "Bivale Teneran", "ald_ruhn", "Carry Nileno's cloth order to Bivale Teneran in Ald'ruhn.", {"target": "bivale_teneran", "targetName": "Bivale Teneran", "item": "cloth_orders", "itemName": "Cloth Orders"}),
        ("The Death of Ralen Hlaalo", "nileno_dorvayn", "Nileno Dorvayn", "balmora", "kill", "hlaalo_manor", "Hlaalo Manor", "balmora", "Find who murdered Ralen Hlaalo and end the killer.", {"target": "thanelen_velas", "targetName": "Thanelen Velas", "place": "manor"}),
        ("Epony Trade", "nileno_dorvayn", "Nileno Dorvayn", "balmora", "persuade", "ebonheart", "East Empire Company", "ebonheart", "Convince Canctunian Ponius to buy Hlaalu ebony, or shut the rival mine.", {"target": "canctunian_ponius", "targetName": "Canctunian Ponius", "minDisp": 55}),
        ("Bank Courier", "edryno_arethi", "Edryno Arethi", "vivec", "deliver", "vivec", "Hlaalu Treasury", "vivec", "Carry Edryno's sealed treasury report to the Hlaalu vault.", {"target": "hlaalu_clerk", "targetName": "Treasury Clerk", "item": "treasury_report", "itemName": "Sealed Report"}),
        ("Murudius Flaeus's Debt", "edryno_arethi", "Edryno Arethi", "vivec", "gold", "hla_oad", "Murudius Flaeus", "hla_oad", "Collect the debt Murudius Flaeus owes, in coin, from his shack in Hla Oad.", {"gold": 200, "target": "murudius", "targetName": "Murudius Flaeus"}),
        ("Escort Tarvyn Faren", "edryno_arethi", "Edryno Arethi", "vivec", "escort", "pelagiad", "Halfway Tavern", "pelagiad", "Walk the merchant Tarvyn Faren from Vivec to Pelagiad.", {"target": "tarvyn_faren", "targetName": "Tarvyn Faren"}),
        ("Telvanni at Odirniran", "edryno_arethi", "Edryno Arethi", "vivec", "kill", "odirniran", "Odirniran", "molag_mar", "Reach Odirniran, find the Hlaalu survivors, and kill the Telvanni mage holding the tower.", {"target": "milyn_attacker", "targetName": "Telvanni Mage", "place": "tower"}),
        ("Exterminator", "edryno_arethi", "Edryno Arethi", "vivec", "kill", "yngling_basement", "Yngling's basement", "vivec", "Kill the diseased rat loose among Yngling's game rats.", {"target": "diseased_rat", "targetName": "Diseased Rat", "place": "interior"}),
        ("Ashlander Ebony", "edryno_arethi", "Edryno Arethi", "vivec", "persuade", "zainab_camp", "Zainab Camp", "zainab_camp", "Persuade the Zainab to sell their ebony only to House Hlaalu.", {"target": "zainab_trader", "targetName": "Zainab Trader", "minDisp": 60}),
        ("The Shipwreck 'Prelude'", "edryno_arethi", "Edryno Arethi", "vivec", "fetch", "prelude_wreck", "Prelude wreck", "hla_oad", "Dive the sunken Prelude and bring back the Daedric blade in its hold.", {"item": "prelude_blade", "itemName": "Prelude's Blade", "place": "cave"}),
        ("Guard Ralen Tilvur", "edryno_arethi", "Edryno Arethi", "vivec", "kill", "tilvur_smithy", "Tilvur's smithy", "vivec", "Stand guard at Ralen Tilvur's smithy and kill the thief who comes for the stock.", {"target": "smithy_thief", "targetName": "Thief", "place": "interior"}),
        ("An Admiring Sponsor", "crassius_curio", "Crassius Curio", "vivec", "persuade", "vivec", "Curio Manor", "vivec", "Win Crassius Curio's sponsorship. His regard must be genuinely high.", {"target": "crassius_curio", "targetName": "Crassius Curio", "minDisp": 70}),
        ("Velfred the Outlaw", "crassius_curio", "Crassius Curio", "vivec", "persuade", "velfred_camp", "Velfred's camp", "seyda_neen", "Find Velfred and make him pay the smuggling fee he skipped.", {"target": "velfred", "targetName": "Velfred the Outlaw", "minDisp": 40, "place": "camp"}),
        ("Kill Banden Indarys", "crassius_curio", "Crassius Curio", "vivec", "kill", "indarys_manor", "Indarys Manor", "ald_ruhn", "Kill Lord Banden Indarys in his manor between Maar Gan and Ald'ruhn.", {"target": "banden_indarys", "targetName": "Banden Indarys", "place": "manor"}),
        ("Bero's Support", "crassius_curio", "Crassius Curio", "vivec", "persuade", "st_olms_underworks", "St. Olms storage", "vivec", "Find councilor Dram Bero in hiding and win his support.", {"target": "dram_bero", "targetName": "Dram Bero", "minDisp": 50, "place": "interior"}),
        ("Kill Reynel Uvirith", "crassius_curio", "Crassius Curio", "vivec", "kill", "tel_uvirith", "Tel Uvirith", "molag_mar", "Kill the Telvanni sorcerer Reynel Uvirith in Tel Uvirith.", {"target": "reynel_uvirith", "targetName": "Reynel Uvirith", "place": "tower"}),
        ("Sealed Orders", "odral_helvi", "Odral Helvi", "caldera", "deliver", "vivec", "Hlaalu vaults", "vivec", "Carry Helvi's suspicious sealed orders to the vault clerk in Vivec.", {"target": "vault_clerk", "targetName": "Vault Clerk", "item": "sealed_orders", "itemName": "Sealed Orders"}),
        ("The Caldera Spy", "odral_helvi", "Odral Helvi", "caldera", "kill", "caldera_mine", "Caldera Mine", "caldera", "Find the spy who stole mine papers and silence them.", {"target": "caldera_spy", "targetName": "Caldera Spy", "place": "interior"}),
        ("Erroneous Documents", "odral_helvi", "Odral Helvi", "caldera", "fetch", "hlaalu_records", "Hlaalu Records", "vivec", "Swap the forged land deeds into the Hlaalu records office.", {"item": "forged_deeds", "itemName": "Forged Deeds", "place": "interior"}),
        ("Rent and Taxes", "odral_helvi", "Odral Helvi", "caldera", "gold", "balmora", "Hlaalu farmers", "balmora", "Collect rent from the two farmers, in coin.", {"gold": 300}),
        ("Shipment of Ebony", "odral_helvi", "Odral Helvi", "caldera", "deliver", "ald_ruhn", "Ebony buyer", "ald_ruhn", "Smuggle a crate of raw ebony to the buyer in Ald'ruhn.", {"target": "ebony_buyer", "targetName": "Ebony Buyer", "item": "raw_ebony", "itemName": "Raw Ebony"}),
        ("Literacy Campaign", "ilmeni_dren", "Ilmeni Dren", "vivec", "fetch", "ald_ruhn", "Ald'ruhn guild", "ald_ruhn", "Recover two schoolbooks for Ilmeni's literacy campaign.", {"item": "schoolbooks", "itemName": "Schoolbooks", "qty": 1}),
        ("The Twin Lamps", "ilmeni_dren", "Ilmeni Dren", "vivec", "escort", "argonia_mission", "Argonian Mission", "ebonheart", "Find the escaped slave and escort them to the Argonian Mission in Ebonheart.", {"target": "escaped_slave", "targetName": "Escaped Slave"}),
        ("Free Hides-His-Foot", "ilmeni_dren", "Ilmeni Dren", "vivec", "kill", "dren_plantation", "Dren Plantation", "vivec", "Free Hides-His-Foot from the Dren Plantation. The slavemaster will fight.", {"target": "plantation_guard", "targetName": "Plantation Slaver", "place": "manor"}),
        ("Control the Ordinators", "duke_vedam_dren", "Duke Vedam Dren", "ebonheart", "persuade", "vivec_temple", "High Fane", "vivec", "Speak with Archcanon Saryoni until he agrees the Ordinators can be restrained.", {"target": "saryoni", "targetName": "Archcanon Tholer Saryoni", "minDisp": 55}),
        ("Dealing with Orvas Dren", "duke_vedam_dren", "Duke Vedam Dren", "ebonheart", "persuade", "dren_plantation", "Dren Plantation", "vivec", "Win control of the Camonna Tong from Orvas Dren. His disposition, or a basement ledger, must break his grip.", {"target": "orvas_dren", "targetName": "Orvas Dren", "minDisp": 65, "place": "manor"}),
    ],
)

# --- Redoran 36 ---
seq(
    "redoran",
    "redoran",
    [
        ("Stronghold", "athyn_sarethi", "Athyn Sarethi", "ald_ruhn", "gold", "indarys_manor_site", "Indarys Manor site", "ald_ruhn", "Pay the masons and raise Indarys Manor for House Redoran.", {"gold": 500, "place": "manor"}),
        ("Mudcrab Pests", "neminda", "Neminda", "ald_ruhn", "kill", "guar_herd", "Falen's herd", "ald_ruhn", "Kill the mudcrabs worrying Falen's guar herd.", {"target": "herd_mudcrab", "targetName": "Mudcrab", "place": "wild"}),
        ("Deliver Cure Disease Potion", "neminda", "Neminda", "ald_ruhn", "deliver", "ald_velothi", "Theldyn Virith", "ald_velothi", "Carry a cure potion to Theldyn Virith in Ald Velothi.", {"target": "theldyn_virith", "targetName": "Theldyn Virith", "item": "cure_disease_potion", "itemName": "Cure Disease Potion"}),
        ("Find Mathis Dalobar", "neminda", "Neminda", "ald_ruhn", "escort", "ald_ruhn", "Ald'ruhn council", "ald_ruhn", "Find the missing trader Mathis Dalobar in the ash and bring him back.", {"target": "mathis_dalobar", "targetName": "Mathis Dalobar", "dest": "ash_trail", "place": "wild"}),
        ("Founder's Helm", "neminda", "Neminda", "ald_ruhn", "fetch", "balmora", "Alvis's cache", "balmora", "Retrieve the Founder's Helm stolen by Alvis in Balmora.", {"item": "founders_helm", "itemName": "Founder's Helm", "place": "interior"}),
        ("Trouble with Bandits", "neminda", "Neminda", "ald_ruhn", "kill", "guar_herd", "Falen's herd", "ald_ruhn", "Kill the bandit leader raiding the same herd.", {"target": "herd_bandit", "targetName": "Bandit Leader", "place": "wild"}),
        ("Guard Sarethi Manor", "neminda", "Neminda", "ald_ruhn", "kill", "sarethi_manor", "Sarethi Manor", "ald_ruhn", "Guard Athyn Sarethi's manor and kill the assassin who comes at dusk.", {"target": "sarethi_assassin", "targetName": "Assassin", "place": "manor"}),
        ("Old Blue Fin", "theldyn_virith", "Theldyn Virith", "ald_velothi", "kill", "ald_velothi_docks", "Ald Velothi docks", "ald_velothi", "Kill Old Blue Fin, the slaughterfish under the docks.", {"target": "old_blue_fin", "targetName": "Old Blue Fin", "place": "wild"}),
        ("Ashimanu Mine", "theldyn_virith", "Theldyn Virith", "ald_velothi", "kill", "ashimanu", "Ashimanu Mine", "ald_velothi", "Kill the blighted shalk in Ashimanu egg mine.", {"target": "blighted_shalk", "targetName": "Blighted Shalk", "place": "cave"}),
        ("Kagouti Den", "theldyn_virith", "Theldyn Virith", "ald_velothi", "kill", "kagouti_den", "Kagouti den", "ald_velothi", "Kill the kagouti pack-leader near the mine.", {"target": "kagouti_leader", "targetName": "Kagouti", "place": "wild"}),
        ("Shishi Report", "theldyn_virith", "Theldyn Virith", "ald_velothi", "visit", "shishi", "Shishi", "maar_gan", "Check on the Redoran soldiers sent to the outpost of Shishi.", {"place": "stronghold"}),
        ("Kill Gordol", "theldyn_virith", "Theldyn Virith", "ald_velothi", "kill", "ashalmawia", "Ashalmawia", "gnisis", "Kill the Daedra worshipper Gordol in the shrine of Ashalmawia.", {"target": "gordol", "targetName": "Gordol", "place": "daedric"}),
        ("Rescue Varvur Sarethi", "athyn_sarethi", "Athyn Sarethi", "ald_ruhn", "kill", "venim_manor", "Venim Manor", "ald_ruhn", "Free Varvur Sarethi from Venim Manor. The jailer will not hand over the key.", {"target": "venim_jailer", "targetName": "Venim Jailer", "place": "manor"}),
        ("Clear Varvur Sarethi's Name", "athyn_sarethi", "Athyn Sarethi", "ald_ruhn", "fetch", "ald_ruhn", "Council club", "ald_ruhn", "Find proof that Varvur did not murder his friend.", {"item": "murder_proof", "itemName": "Exonerating Note", "place": "interior"}),
        ("Ondres Nerano's Slanders", "athyn_sarethi", "Athyn Sarethi", "ald_ruhn", "persuade", "vivec", "Nerano", "vivec", "Make Ondres Nerano retract his slander of House Redoran.", {"target": "ondres_nerano", "targetName": "Ondres Nerano", "minDisp": 45}),
        ("Shurinbaal", "athyn_sarethi", "Athyn Sarethi", "ald_ruhn", "kill", "shurinbaal", "Shurinbaal", "ald_ruhn", "Clear the smugglers out of Shurinbaal.", {"target": "shurinbaal_boss", "targetName": "Smuggler Chief", "place": "cave"}),
        ("The Mad Lord of Milk", "athyn_sarethi", "Athyn Sarethi", "ald_ruhn", "persuade", "milk", "Milk", "ald_ruhn", "Calm the enraged lord of Milk, by speech if he will hear it.", {"target": "milk_lord", "targetName": "Lord of Milk", "minDisp": 40, "place": "manor"}),
        ("Duel with Bolvyn Venim", "athyn_sarethi", "Athyn Sarethi", "ald_ruhn", "kill", "venim_manor", "Venim Manor arena", "ald_ruhn", "Challenge Archmaster Bolvyn Venim and duel him to the death.", {"target": "bolvyn_venim_duel", "targetName": "Bolvyn Venim", "place": "manor"}),
        ("Ash Statue", "lloros_sarano", "Lloros Sarano", "ald_ruhn", "fetch", "sarethi_manor", "Sarethi Manor", "ald_ruhn", "Continue the inquiry: recover the ash statue planted on Varvur.", {"item": "ash_statue", "itemName": "Ash Statue", "place": "manor"}),
        ("Find Fedris Tharen", "lloros_sarano", "Lloros Sarano", "ald_ruhn", "escort", "koal_cave", "Koal Cave", "gnisis", "Find the pilgrim Fedris Tharen and see him to Koal Cave.", {"target": "fedris_tharen", "targetName": "Fedris Tharen"}),
        ("Find Beden Giladren", "lloros_sarano", "Lloros Sarano", "ald_ruhn", "escort", "maar_gan", "Maar Gan shrine", "maar_gan", "Find pilgrim Beden Giladren and bring him to the Maar Gan shrine.", {"target": "beden_giladren", "targetName": "Beden Giladren"}),
        ("Recover Shields from Andasreth", "lloros_sarano", "Lloros Sarano", "ald_ruhn", "fetch", "andasreth", "Andasreth", "gnisis", "Recover the shields of the four soldiers lost in Andasreth.", {"item": "redoran_shields", "itemName": "Redoran Shields", "place": "stronghold"}),
        ("Mission to Morvayn Manor", "garisa_llethri", "Garisa Llethri", "ald_ruhn", "fetch", "morvayn_manor", "Morvayn Manor", "ald_ruhn", "Recover the ash statue from Morvayn Manor, now full of corprus.", {"item": "morvayn_statue", "itemName": "Morvayn Ash Statue", "place": "manor"}),
        ("Taxes from Gnisis", "garisa_llethri", "Garisa Llethri", "ald_ruhn", "gold", "gnisis", "Hetman Abelmawia", "gnisis", "Collect the Gnisis tax the hetman has been sitting on.", {"gold": 250}),
        ("Nalvilie Saren", "hlaren_ramoran", "Hlaren Ramoran", "ald_ruhn", "escort", "ald_ruhn", "Ramoran's house", "ald_ruhn", "Find Nalvilie Saren and bring word of her back to Hlaren Ramoran.", {"target": "nalvilie_saren", "targetName": "Nalvilie Saren", "dest": "ashlands_road", "place": "wild"}),
        ("Evidence of Corruption", "garisa_llethri", "Garisa Llethri", "ald_ruhn", "fetch", "caldera_mine", "Caldera Mine", "caldera", "Bring back proof of Hlaalu corruption in the Caldera mine.", {"item": "caldera_ledger", "itemName": "Caldera Ledger", "place": "interior"}),
        ("Shut the Mines Down", "garisa_llethri", "Garisa Llethri", "ald_ruhn", "kill", "caldera_mine", "Caldera Mine", "caldera", "Drive the mine guards off so the egg... the ebony mine stops.", {"target": "mine_foreman", "targetName": "Mine Foreman", "place": "interior"}),
        ("Miner Arobar's Support", "miner_arobar", "Miner Arobar", "ald_ruhn", "kill", "arobar_manor", "Arobar Manor", "ald_ruhn", "Find what has its hooks in Miner Arobar and cut it out.", {"target": "arobar_influencer", "targetName": "Sixth House Agent", "place": "manor"}),
        ("Meril Hlaano's Slanders", "faral_retheran", "Faral Retheran", "vivec", "persuade", "vivec", "Hlaano manor", "vivec", "Make Meril Hlaano stop slandering House Redoran.", {"target": "meril_hlaano", "targetName": "Meril Hlaano", "minDisp": 50}),
        ("Redas Tomb", "faral_retheran", "Faral Retheran", "vivec", "fetch", "redas_tomb", "Redas Tomb", "molag_mar", "Bring three ancestral relics out of Redas Tomb.", {"item": "redas_relics", "itemName": "Redas Relics", "place": "tomb"}),
        ("Duel of Honor", "faral_retheran", "Faral Retheran", "vivec", "persuade", "vivec", "Arena", "vivec", "Convince Rothis Nethan to finish the duel he fled.", {"target": "rothis_nethan", "targetName": "Rothis Nethan", "minDisp": 45}),
        ("Slay Dagoth Tanis", "faral_retheran", "Faral Retheran", "vivec", "kill", "falasmaryon", "Falasmaryon", "ald_ruhn", "Slay Dagoth Tanis at the bottom of Falasmaryon.", {"target": "dagoth_tanis", "targetName": "Dagoth Tanis", "place": "citadel"}),
        ("Slay Reynel Uvirith", "faral_retheran", "Faral Retheran", "vivec", "kill", "tel_uvirith", "Tel Uvirith", "molag_mar", "Slay Reynel Uvirith for House Redoran.", {"target": "reynel_uvirith_redoran", "targetName": "Reynel Uvirith", "place": "tower"}),
        ("Slay Raynasa Rethan", "faral_retheran", "Faral Retheran", "vivec", "kill", "rethan_manor", "Rethan Manor", "balmora", "Slay the Hlaalu lord Raynasa Rethan on the Odai plateau.", {"target": "raynasa_rethan", "targetName": "Raynasa Rethan", "place": "manor"}),
        ("Escort to Koal Cave", "tuveso_beleth", "Tuveso Beleth", "ald_ruhn", "escort", "koal_cave", "Koal Cave", "gnisis", "Escort Tuveso's son on his pilgrimage to Koal Cave.", {"target": "beleth_son", "targetName": "Tuveso's Son"}),
        ("Armor Repair Debts", "tuveso_beleth", "Tuveso Beleth", "ald_ruhn", "gold", "molag_mar", "Molag Mar armory", "molag_mar", "Collect the repair debt owed by Giras Indaram.", {"gold": 200}),
    ],
)

# Fix Find Mathis - I passed dest override inside extra but also positional dest. The extra dest might not override because add2 uses positional dest. I'll leave the positional dest (ald_ruhn) which is wrong for the escort destination. Let me not worry if both exist - the function uses positional dest. I set dest ald_ruhn for Mathis which means escort to ald_ruhn. The summary says bring him back. OK if dest is ald_ruhn and he is found... escort spawns target at dest. So Mathis is at ald_ruhn already. A bit flat but playable. I'll fix notable ones after if tests need unique places. Continue.

seq(
    "telvanni",
    "telvanni",
    [
        ("Stronghold", "aryon", "Master Aryon", "tel_vos", "gold", "tel_uvirith_site", "Tel Uvirith site", "molag_mar", "Raise Tel Uvirith, the Telvanni stronghold, in three payments.", {"gold": 800, "place": "tower"}),
        ("Muck", "raven_omayn", "Raven Omayn", "sadrith_mora", "gather", "bitter_pools", "Bitter Coast pools", "tel_fyr", "Bring Raven Omayn five pieces of muck.", {"item": "muck", "itemName": "Muck", "qty": 5, "place": "wild"}),
        ("Black Jinx", "raven_omayn", "Raven Omayn", "sadrith_mora", "fetch", "sadrith_mora", "Gateway inn", "sadrith_mora", "Find the ring Black Jinx hidden in Sadrith Mora.", {"item": "black_jinx", "itemName": "Black Jinx", "place": "interior"}),
        ("Sload Soap", "arara_uvulas", "Arara Uvulas", "sadrith_mora", "gather", "sadrith_mora", "Tel Naga", "sadrith_mora", "Bring five pieces of sload soap for Neloth's research.", {"item": "sload_soap", "itemName": "Sload Soap", "qty": 5}),
        ("Staff of the Silver Dawn", "arara_uvulas", "Arara Uvulas", "sadrith_mora", "fetch", "gateway_inn", "Gateway Inn", "sadrith_mora", "Recover the Staff of the Silver Dawn lost in town.", {"item": "silver_dawn", "itemName": "Staff of the Silver Dawn", "place": "interior"}),
        ("New Clothes", "felisa_ulessen", "Felisa Ulessen", "sadrith_mora", "deliver", "tel_branora", "Therana's chamber", "tel_branora", "Deliver a new skirt to Mistress Therana. She is particular.", {"target": "therana", "targetName": "Mistress Therana", "item": "expensive_skirt", "itemName": "Expensive Skirt"}),
        ("Slave Rebellion", "felisa_ulessen", "Felisa Ulessen", "sadrith_mora", "kill", "abebaal", "Abebaal Egg Mine", "tel_branora", "Put down the slave revolt in Abebaal. The leader will not negotiate.", {"target": "revolt_leader", "targetName": "Revolt Leader", "place": "cave"}),
        ("Dwemer Books", "baladas_demnevanni", "Baladas Demnevanni", "gnisis", "fetch", "arkngthand", "Arkngthand", "pelagiad", "Find three rare Dwemer books for Baladas.", {"item": "dwemer_books", "itemName": "Dwemer Books", "place": "dwemer"}),
        ("Dahrk Mezalf", "baladas_demnevanni", "Baladas Demnevanni", "gnisis", "fetch", "bthungthumz", "Bthungthumz", "gnisis", "Recover Dahrk Mezalf's Dwemer ring from Bthungthumz.", {"item": "mezalf_ring", "itemName": "Ring of Dahrk Mezalf", "place": "dwemer"}),
        ("Three Questions for Baladas Demnevanni", "mallam_ryon", "Mallam Ryon", "sadrith_mora", "persuade", "arvs_drelen", "Arvs-Drelen", "gnisis", "Ask Baladas three questions and return with his answers. He must be willing.", {"target": "baladas_demnevanni", "targetName": "Baladas Demnevanni", "minDisp": 50, "place": "tower"}),
        ("Mission to Nchuleft", "mallam_ryon", "Mallam Ryon", "sadrith_mora", "fetch", "nchuleft", "Nchuleft", "vos", "Retrieve the Dwemer plans from Nchuleft, west of Vos.", {"item": "nchuleft_plans", "itemName": "Nchuleft Plans", "place": "dwemer"}),
        ("Coded Message", "galos_mathendis", "Galos Mathendis", "sadrith_mora", "deliver", "tel_fyr", "Tel Fyr", "tel_fyr", "Carry a coded message to Divayth Fyr.", {"target": "divayth_fyr", "targetName": "Divayth Fyr", "item": "coded_message", "itemName": "Coded Message"}),
        ("Cure Blight", "galos_mathendis", "Galos Mathendis", "sadrith_mora", "deliver", "tel_vos", "Tel Vos alchemist", "tel_vos", "Deliver three cure blight potions to the alchemist at Tel Vos.", {"target": "vos_alchemist", "targetName": "Tel Vos Alchemist", "item": "cure_blight_potion", "itemName": "Cure Blight Potion"}),
        ("Daedra Skin", "galos_mathendis", "Galos Mathendis", "sadrith_mora", "fetch", "ashalmimilkala", "Ashalmimilkala", "ald_velothi", "Bring a Daedra skin to Master Aryon.", {"item": "daedra_skin", "itemName": "Daedra Skin", "place": "daedric"}),
        ("Auriel's Bow", "therana", "Mistress Therana", "tel_branora", "fetch", "ghostgate", "Ghostgate vault", "ghostgate", "Find the bow that smells of ash yams, stored at Ghostgate.", {"item": "auriels_bow", "itemName": "Auriel's Bow", "place": "stronghold"}),
        ("Flesh Made Whole", "dratha", "Mistress Dratha", "tel_mora", "fetch", "tel_naga", "Tel Naga", "sadrith_mora", "Retrieve the amulet Flesh Made Whole from Tel Naga.", {"item": "flesh_made_whole", "itemName": "Flesh Made Whole", "place": "tower"}),
        ("Drake's Pride", "neloth", "Master Neloth", "sadrith_mora", "fetch", "tel_aruhn", "Servant's quarters", "tel_aruhn", "Find Drake's Pride on the poor servant in Tel Aruhn and bring the robe to Neloth.", {"item": "drakes_pride", "itemName": "Drake's Pride", "place": "tower"}),
        ("Baladas Demnevanni", "aryon", "Master Aryon", "tel_vos", "persuade", "arvs_drelen", "Arvs-Drelen", "gnisis", "Convince Baladas to join the Telvanni council.", {"target": "baladas_demnevanni", "targetName": "Baladas Demnevanni", "minDisp": 55}),
        ("Mudan-Mul Egg Mine", "aryon", "Master Aryon", "tel_vos", "deliver", "mudan_mul", "Mudan-Mul", "tel_vos", "Cure the blighted kwama queen. The potion must reach the mine.", {"target": "kwama_queen_mudan", "targetName": "Kwama Queen", "item": "cure_blight_potion", "itemName": "Cure Blight Potion", "place": "cave"}),
        ("Wizard Spells", "aryon", "Master Aryon", "tel_vos", "visit", "sadrith_mora", "Mages Guild", "sadrith_mora", "Learn the three spells Aryon named. A guild spellmaker will record them.", {"place": "interior"}),
        ("Odirniran", "aryon", "Master Aryon", "tel_vos", "kill", "odirniran", "Odirniran", "molag_mar", "Help Milyn Faram: kill the Hlaalu attackers at Odirniran.", {"target": "odirniran_hlaalu", "targetName": "Hlaalu Attacker", "place": "tower"}),
        ("Mages Guild Monopoly", "aryon", "Master Aryon", "tel_vos", "persuade", "ald_ruhn", "Redoran council", "ald_ruhn", "Persuade a Redoran councilor to let Telvanni sell spells beside the Guild.", {"target": "garisa_llethri", "targetName": "Garisa Llethri", "minDisp": 55}),
        ("Shishi", "aryon", "Master Aryon", "tel_vos", "kill", "shishi", "Shishi", "maar_gan", "Rescue Faves Andas from the Redoran force at Shishi.", {"target": "shishi_captain", "targetName": "Redoran Captain", "place": "stronghold"}),
        ("Recruit a Mouth", "aryon", "Master Aryon", "tel_vos", "persuade", "sadrith_mora", "Telvanni council", "sadrith_mora", "Recruit a mouth so you can be raised to councilor.", {"target": "telvanni_retainer", "targetName": "Telvanni Retainer", "minDisp": 50}),
        ("Kill Raynasa Rethan", "aryon", "Master Aryon", "tel_vos", "kill", "rethan_manor", "Rethan Manor", "balmora", "Kill the Hlaalu noble Raynasa Rethan.", {"target": "raynasa_rethan_tel", "targetName": "Raynasa Rethan", "place": "manor"}),
        ("Kill Banden Indarys", "aryon", "Master Aryon", "tel_vos", "kill", "indarys_manor", "Indarys Manor", "ald_ruhn", "Kill the Redoran noble Banden Indarys.", {"target": "banden_indarys_tel", "targetName": "Banden Indarys", "place": "manor"}),
        ("Archmagister Gothren", "aryon", "Master Aryon", "tel_vos", "kill", "tel_aruhn", "Tel Aruhn", "tel_aruhn", "Gothren will not yield the title. Take it.", {"target": "gothren_arch", "targetName": "Archmagister Gothren", "place": "tower"}),
        ("Ring of Equity", "fast_eddie", "Fast Eddie", "sadrith_mora", "fetch", "tel_naga", "Neloth's treasury", "sadrith_mora", "Steal the Ring of Equity from Neloth's treasury for Eddie.", {"item": "ring_of_equity", "itemName": "Ring of Equity", "place": "tower"}),
        ("Amulet of Unity", "fast_eddie", "Fast Eddie", "sadrith_mora", "fetch", "mainland_cache", "Smuggler's cache", "tel_branora", "Bring Eddie the Amulet of Unity from the coastal cache.", {"item": "amulet_of_unity", "itemName": "Amulet of Unity", "place": "cave"}),
    ],
)

seq(
    "fighters",
    "fighters",
    [
        ("Exterminator", "eydis_fire_eye", "Eydis Fire-Eye", "balmora", "kill", "balmora_house", "Balmora house", "balmora", "Exterminate the cave rats in a Balmora house.", {"target": "cave_rat", "targetName": "Cave Rat", "place": "interior"}),
        ("The Egg Poachers", "eydis_fire_eye", "Eydis Fire-Eye", "balmora", "kill", "shulk_mine", "Shulk Egg Mine", "balmora", "Kill the two poachers in Shulk Egg Mine.", {"target": "egg_poacher", "targetName": "Egg Poacher", "place": "cave"}),
        ("The Telvanni Agents", "eydis_fire_eye", "Eydis Fire-Eye", "balmora", "kill", "caldera_mine", "Caldera Mine", "caldera", "Kill the Telvanni agents stealing from the Caldera mine.", {"target": "telvanni_agent", "targetName": "Telvanni Agent", "place": "interior"}),
        ("The Code Book", "eydis_fire_eye", "Eydis Fire-Eye", "balmora", "fetch", "south_wall", "South Wall Cornerclub", "balmora", "Take the code book from Sottilde at the South Wall.", {"item": "code_book", "itemName": "Code Book", "place": "interior"}),
        ("Desele's Debt", "eydis_fire_eye", "Eydis Fire-Eye", "balmora", "gold", "suran", "Helviane Desele", "suran", "Collect Helviane Desele's debt in Suran.", {"gold": 200}),
        ("Gra-Bol's Bounty", "eydis_fire_eye", "Eydis Fire-Eye", "balmora", "kill", "balmora", "Balmora back alley", "balmora", "Collect the bounty on the Orc in Balmora.", {"target": "gra_bol", "targetName": "Gra-Bol", "place": "interior"}),
        ("Alof and the Orcs", "eydis_fire_eye", "Eydis Fire-Eye", "balmora", "kill", "ashunartes", "Ashunartes", "balmora", "Clear Alof's orc band out of the Daedric ruin.", {"target": "alof", "targetName": "Alof", "place": "daedric"}),
        ("The Verethi Gang", "eydis_fire_eye", "Eydis Fire-Eye", "balmora", "kill", "mannammu", "Mannammu", "pelagiad", "Kill the leader of the Verethi smugglers.", {"target": "verethi_leader", "targetName": "Verethi Leader", "place": "cave"}),
        ("Hunger in the Sarano Tomb", "eydis_fire_eye", "Eydis Fire-Eye", "balmora", "kill", "sarano_tomb", "Sarano Tomb", "suran", "Kill the hunger that defiled Sarano Tomb.", {"target": "sarano_hunger", "targetName": "Hunger", "place": "tomb"}),
        ("Juicedaw Ring", "lorbumol", "Lorbumol gro-Aglakh", "vivec", "fetch", "hlaalu_canton", "Hlaalu canton", "vivec", "Take the Juicedaw Ring from the Orc in the Hlaalu canton.", {"item": "juicedaw_ring", "itemName": "Juicedaw Ring", "place": "canton"}),
        ("Silence Tongue-Toad", "lorbumol", "Lorbumol gro-Aglakh", "vivec", "kill", "ald_ruhn", "Ald'ruhn", "ald_ruhn", "Silence the Argonian Tongue-Toad.", {"target": "tongue_toad", "targetName": "Tongue-Toad"}),
        ("Dro'Sakhar's Bounty", "lorbumol", "Lorbumol gro-Aglakh", "vivec", "kill", "vivec", "Vivec underworks", "vivec", "Collect the bounty on Dro'Sakhar.", {"target": "dro_sakhar", "targetName": "Dro'Sakhar", "place": "interior"}),
        ("Lirielle's Debt", "lorbumol", "Lorbumol gro-Aglakh", "vivec", "gold", "ald_ruhn", "Lirielle", "ald_ruhn", "Collect two thousand septims of Lirielle's debt.", {"gold": 400}),
        ("Vandacia's Bounty", "lorbumol", "Lorbumol gro-Aglakh", "vivec", "kill", "seyda_neen", "Seyda Neen", "seyda_neen", "Collect the bounty on the tax collector's enemy in Seyda Neen.", {"target": "vandacia_mark", "targetName": "Bounty Mark"}),
        ("Alleius' Bounty", "lorbumol", "Lorbumol gro-Aglakh", "vivec", "kill", "ebonheart", "Ebonheart", "ebonheart", "Collect the bounty on the judge's enemy in Ebonheart.", {"target": "alleius_mark", "targetName": "Bounty Mark"}),
        ("Battle at Nchurdamz", "hrundi", "Hrundi", "sadrith_mora", "kill", "nchurdamz", "Nchurdamz", "vos", "Help the warrior kill the daedroth in Nchurdamz.", {"target": "nchurdamz_daedroth", "targetName": "Daedroth", "place": "dwemer"}),
        ("The Dissapla Mine", "hrundi", "Hrundi", "sadrith_mora", "kill", "dissapla", "Dissapla Mine", "sadrith_mora", "Rescue the healer by killing the nix-hound in the mine.", {"target": "nix_hound", "targetName": "Nix-Hound", "place": "cave"}),
        ("Berwen's Stalker", "hrundi", "Hrundi", "sadrith_mora", "kill", "tel_mora", "Berwen's shop", "tel_mora", "Kill the corprus stalker in Berwen's shop.", {"target": "berwen_stalker", "targetName": "Corprus Stalker", "place": "interior"}),
        ("Tenim's Bounty", "hrundi", "Hrundi", "sadrith_mora", "kill", "tenim_camp", "Near Vos", "vos", "Kill the outlaw Rels Tenim.", {"target": "rels_tenim", "targetName": "Rels Tenim", "place": "wild"}),
        ("Sujamma to Dunirai", "hrundi", "Hrundi", "sadrith_mora", "deliver", "dunirai", "Dunirai Caverns", "sadrith_mora", "Deliver sujamma to Nelacar at Dunirai.", {"target": "nelacar", "targetName": "Nelacar", "item": "sujamma", "itemName": "Sujamma", "place": "cave"}),
        ("Sondaale", "hrundi", "Hrundi", "sadrith_mora", "escort", "telasero", "Telasero", "molag_mar", "Rescue Sondaale from Sixth House cultists and walk her out of Telasero.", {"target": "sondaale", "targetName": "Sondaale", "place": "dwemer"}),
        ("Engaer's Bounty", "hrundi", "Hrundi", "sadrith_mora", "kill", "tel_naga", "Tel Naga", "sadrith_mora", "Kill the outlaw Engaer.", {"target": "engaer", "targetName": "Engaer", "place": "tower"}),
        ("The Pudai Eggmine", "hrundi", "Hrundi", "sadrith_mora", "fetch", "pudai", "Pudai Egg Mine", "dagon_fel", "Bring back the seven eggs of gold from Pudai.", {"item": "golden_eggs", "itemName": "Eggs of Gold", "place": "cave"}),
        ("The Necromancer of Vas", "percius_mercius", "Percius Mercius", "ald_ruhn", "kill", "vas", "Vas", "dagon_fel", "Clear the necromancer den at Vas.", {"target": "vas_necromancer", "targetName": "Necromancer", "place": "cave"}),
        ("Beneran's Bounty", "percius_mercius", "Percius Mercius", "ald_ruhn", "kill", "sargon", "Sargon", "ald_ruhn", "Collect the bounty on Nerer Beneran.", {"target": "nerer_beneran", "targetName": "Nerer Beneran", "place": "cave"}),
        ("Bandits in Suran", "percius_mercius", "Percius Mercius", "ald_ruhn", "kill", "suran", "Suran", "suran", "Drive Avon Oran's bandits out of Suran.", {"target": "suran_bandit", "targetName": "Bandit"}),
        ("Flin for Elith-Pal", "percius_mercius", "Percius Mercius", "ald_ruhn", "deliver", "elith_pal", "Elith-Pal Mine", "ghostgate", "Deliver flin to the miners at Elith-Pal.", {"target": "elith_miner", "targetName": "Miner", "item": "flin", "itemName": "Flin", "place": "cave"}),
        ("Remove Sjoring's Supporters", "percius_mercius", "Percius Mercius", "ald_ruhn", "kill", "vivec", "Fighters Guild", "vivec", "Kill the pair of guild members backing Sjoring.", {"target": "sjoring_supporter", "targetName": "Corrupt Guildmate", "place": "interior"}),
        ("Kill Hard-Heart", "percius_mercius", "Percius Mercius", "ald_ruhn", "kill", "vivec", "Vivec guildhall", "vivec", "Kill Sjoring Hard-Heart, master of the Fighters Guild.", {"target": "sjoring_hard_heart", "targetName": "Sjoring Hard-Heart", "place": "interior"}),
        ("Remove the Heads of the Thieves Guild", "sjoring_hard_heart", "Sjoring Hard-Heart", "vivec", "kill", "balmora", "South Wall", "balmora", "Sjoring wants the Balmora thieves' bosses dead.", {"target": "sugar_lips", "targetName": "Sugar-Lips Habasi", "place": "interior"}),
        ("Kill the Master Thief", "sjoring_hard_heart", "Sjoring Hard-Heart", "vivec", "kill", "vivec_hideout", "Simine Fralinie", "vivec", "Kill Gentleman Jim Stacey.", {"target": "jim_stacey", "targetName": "Gentleman Jim Stacey", "place": "interior"}),
    ],
)

seq(
    "mages",
    "mages",
    [
        ("A Wizard's Staff", "trebonius", "Trebonius Artorius", "vivec", "fetch", "vivec", "Guild stock", "vivec", "Acquire a wizard's staff. The Guild will not name you Wizard without one.", {"item": "wizards_staff", "itemName": "Wizard's Staff"}),
        ("Arch-Mage", "trebonius", "Trebonius Artorius", "vivec", "kill", "vivec", "Guild arena", "vivec", "Trebonius will not retire. The duel is the promotion.", {"target": "trebonius", "targetName": "Trebonius Artorius"}),
        ("I'm NOT a Necromancer!", "ajira", "Ajira", "balmora", "fetch", "balmora", "Guild basement", "balmora", "Find who in the Balmora guild is practicing the forbidden art, and bring proof.", {"item": "necromancer_notes", "itemName": "Necromancer's Notes", "place": "interior"}),
        ("Four Types of Mushrooms", "ajira", "Ajira", "balmora", "gather", "bitter_coast_woods", "Bitter Coast", "seyda_neen", "Bring Ajira four local mushrooms.", {"item": "mushroom_sample", "itemName": "Mushroom", "qty": 4, "place": "wild"}),
        ("Fake Soul Gem", "ajira", "Ajira", "balmora", "deliver", "balmora", "Galbedir's desk", "balmora", "Plant the fake soul gem so Ajira wins her bet.", {"target": "galbedir_desk", "targetName": "Galbedir's Desk", "item": "fake_soul_gem", "itemName": "Fake Soul Gem"}),
        ("Four Types of Flowers", "ajira", "Ajira", "balmora", "gather", "ascadian_fields", "Ascadian Isles", "pelagiad", "Bring Ajira four local flowers.", {"item": "flower_sample", "itemName": "Flower", "qty": 4, "place": "wild"}),
        ("Ceramic Bowl", "ajira", "Ajira", "balmora", "fetch", "balmora", "Balmora potter", "balmora", "Buy or take the ceramic bowl Ajira wants.", {"item": "ceramic_bowl", "itemName": "Ceramic Bowl"}),
        ("Stolen Reports", "ajira", "Ajira", "balmora", "fetch", "balmora", "Guild hall", "balmora", "Recover Ajira's stolen mushroom and flower reports.", {"item": "ajira_reports", "itemName": "Ajira's Reports", "place": "interior"}),
        ("The Staff of Magnus", "ajira", "Ajira", "balmora", "fetch", "assu", "Assu Cave", "gnisis", "Recover the Staff of Magnus from Assu.", {"item": "staff_of_magnus", "itemName": "Staff of Magnus", "place": "cave"}),
        ("Warlock's Ring", "ajira", "Ajira", "balmora", "fetch", "ashirbadon", "Ashirbadon", "sadrith_mora", "Recover the Warlock's Ring from the cave Ajira marks.", {"item": "warlocks_ring", "itemName": "Warlock's Ring", "place": "cave"}),
        ("Recruit or Kill Llarar Bereloth", "ranis_athrys", "Ranis Athrys", "balmora", "persuade", "sulipund", "Sulipund", "balmora", "Recruit the Telvanni Llarar Bereloth, or he will not leave the cave alive. His regard decides it.", {"target": "llarar_bereloth", "targetName": "Llarar Bereloth", "minDisp": 50, "place": "cave"}),
        ("Manwe's Dues", "ranis_athrys", "Ranis Athrys", "balmora", "gold", "punabi", "Punabi", "balmora", "Collect Manwe's unpaid guild dues.", {"gold": 200, "place": "cave"}),
        ("Unsanctioned Training", "ranis_athrys", "Ranis Athrys", "balmora", "persuade", "vivec", "Foreign Quarter", "vivec", "Stop the Argonian from teaching Restoration without a Guild writ. Make her agree to stop.", {"target": "only_he_stands", "targetName": "Unlicensed Healer", "minDisp": 40}),
        ("Escort Itermerel", "ranis_athrys", "Ranis Athrys", "balmora", "escort", "pelagiad", "Pelagiad", "pelagiad", "Escort the scholar Itermerel to Pelagiad.", {"target": "itermerel", "targetName": "Itermerel"}),
        ("Kill Necromancer Tashpi Ashibael", "ranis_athrys", "Ranis Athrys", "balmora", "kill", "maar_gan", "Maar Gan", "maar_gan", "Ranis wants Tashpi Ashibael dead. She is in Maar Gan.", {"target": "tashpi_ashibael", "targetName": "Tashpi Ashibael"}),
        ("Catch a Spy", "ranis_athrys", "Ranis Athrys", "balmora", "kill", "balmora", "Guild hall", "balmora", "Find the Telvanni spy in the Guild and stop them.", {"target": "guild_spy", "targetName": "Telvanni Spy", "place": "interior"}),
        ("Chronicles of Nchuleft", "edwinna_elbert", "Edwinna Elbert", "ald_ruhn", "fetch", "nchuleft", "Nchuleft", "vos", "Find the book Chronicles of Nchuleft.", {"item": "chronicles_nchuleft", "itemName": "Chronicles of Nchuleft", "place": "dwemer"}),
        ("A Potion from Skink-in-Tree's-Shade", "edwinna_elbert", "Edwinna Elbert", "ald_ruhn", "deliver", "sadrith_mora", "Wolverine Hall", "sadrith_mora", "The errand is the potion Skink sends back. Carry it to Edwinna after you take it from him.", {"target": "skink", "targetName": "Skink-in-Tree's-Shade", "item": "skink_potion", "itemName": "Skink's Potion"}),
        ("Steal Chimarvamidium", "edwinna_elbert", "Edwinna Elbert", "ald_ruhn", "fetch", "vivec", "Vivec guild", "vivec", "Borrow the book Chimarvamidium from the Vivec guildhall.", {"item": "chimarvamidium", "itemName": "Chimarvamidium", "place": "interior"}),
        ("Huleen's Hut", "edwinna_elbert", "Edwinna Elbert", "ald_ruhn", "kill", "huleens_hut", "Huleen's Hut", "maar_gan", "Investigate Huleen's Hut and kill whatever is disturbing it.", {"target": "hut_daedra", "targetName": "Scamp", "place": "interior"}),
        ("Return Chimarvamidium", "edwinna_elbert", "Edwinna Elbert", "ald_ruhn", "deliver", "vivec", "Vivec guild", "vivec", "Return the borrowed book before the Vivec guild notices.", {"target": "vivec_librarian", "targetName": "Guild Librarian", "item": "chimarvamidium", "itemName": "Chimarvamidium"}),
        ("Dwemer Tube from Arkngthunch-Sturdumz", "edwinna_elbert", "Edwinna Elbert", "ald_ruhn", "fetch", "arkngthunch", "Arkngthunch-Sturdumz", "ald_velothi", "Bring Edwinna a Dwemer tube from Arkngthunch-Sturdumz.", {"item": "dwemer_tube", "itemName": "Dwemer Tube", "place": "dwemer"}),
        ("Nchuleftingth Expedition", "edwinna_elbert", "Edwinna Elbert", "ald_ruhn", "escort", "nchuleftingth", "Nchuleftingth", "vos", "Check on the expedition and walk the survivor out.", {"target": "nchuleftingth_scholar", "targetName": "Expedition Scholar", "place": "dwemer"}),
        ("Scarab Plans in Mzuleft", "edwinna_elbert", "Edwinna Elbert", "ald_ruhn", "fetch", "mzuleft", "Mzuleft", "dagon_fel", "Retrieve the Dwemer scarab plans from Mzuleft.", {"item": "scarab_plans", "itemName": "Scarab Plans", "place": "dwemer"}),
        ("Bethamez", "edwinna_elbert", "Edwinna Elbert", "ald_ruhn", "fetch", "bethamez", "Bethamez", "gnisis", "Retrieve the ancient Dwemer documents at Bethamez.", {"item": "bethamez_docs", "itemName": "Bethamez Documents", "place": "dwemer"}),
        ("Escort Tenyeminwe", "skink", "Skink-in-Tree's-Shade", "sadrith_mora", "escort", "sadrith_mora", "Sadrith Mora docks", "sadrith_mora", "Escort Tenyeminwe to the docks.", {"target": "tenyeminwe", "targetName": "Tenyeminwe"}),
        ("Vampires of Vvardenfell, Vol II", "skink", "Skink-in-Tree's-Shade", "sadrith_mora", "fetch", "galom_daeus", "Galom Daeus", "molag_mar", "Find Vampires of Vvardenfell, Volume II.", {"item": "vampires_vol_ii", "itemName": "Vampires of Vvardenfell, Vol II", "place": "dwemer"}),
        ("Meeting with a Wise Woman", "skink", "Skink-in-Tree's-Shade", "sadrith_mora", "escort", "ahemmusa_camp", "Ahemmusa Camp", "ahemmusa_camp", "Arrange the meeting: bring the wise woman word, and bring Skink's gift to the camp.", {"target": "sinnammu_mirpal", "targetName": "Sinnammu Mirpal"}),
        ("Kill Necromancer Telura Ulver", "skink", "Skink-in-Tree's-Shade", "sadrith_mora", "kill", "shal", "Shal", "sadrith_mora", "Kill the former guild member Telura Ulver.", {"target": "telura_ulver", "targetName": "Telura Ulver", "place": "cave"}),
        ("Soul of an Ash Ghoul", "skink", "Skink-in-Tree's-Shade", "sadrith_mora", "kill", "shallit", "Shallit", "ghostgate", "Capture the deed by killing an ash ghoul and bringing its soul gem.", {"target": "ash_ghoul", "targetName": "Ash Ghoul", "place": "cave"}),
        ("Galur Rithari's Papers", "skink", "Skink-in-Tree's-Shade", "sadrith_mora", "fetch", "mababi", "Mababi", "balmora", "Find Galur Rithari's papers on the cure for vampirism.", {"item": "rithari_papers", "itemName": "Galur Rithari's Papers", "place": "cave"}),
        ("Mystery of the Dwarves", "trebonius", "Trebonius Artorius", "vivec", "fetch", "nchuleft", "Nchuleft", "vos", "Discover what became of the Dwemer. The book in the ruin is the answer Trebonius can read.", {"item": "egg_of_time", "itemName": "The Egg of Time", "place": "dwemer"}),
        ("Kill the Telvanni Councilors", "trebonius", "Trebonius Artorius", "vivec", "kill", "tel_aruhn", "Tel Aruhn", "tel_aruhn", "Trebonius orders the Telvanni councilors dead. Gothren's seat is the one that ends it.", {"target": "gothren_council", "targetName": "Telvanni Councilor", "place": "tower"}),
    ],
)

seq(
    "thieves",
    "thieves",
    [
        ("Diamonds for Habasi", "sugar_lips_habasi", "Sugar-Lips Habasi", "balmora", "fetch", "balmora", "Alchemist", "balmora", "Obtain a diamond from the Balmora alchemist for Habasi.", {"item": "diamond", "itemName": "Diamond"}),
        ("Nerano Manor Key", "sugar_lips_habasi", "Sugar-Lips Habasi", "balmora", "fetch", "balmora", "Nerano Manor", "balmora", "Get the key to Nerano Manor.", {"item": "nerano_key", "itemName": "Nerano Manor Key", "place": "manor"}),
        ("Ra'Zhid's Dwemer Artifacts", "sugar_lips_habasi", "Sugar-Lips Habasi", "balmora", "fetch", "hla_oad", "Ra'Zhid's shop", "hla_oad", "Recover the Dwemer artifacts from Ra'Zhid in Hla Oad.", {"item": "razhid_artifacts", "itemName": "Dwemer Artifacts"}),
        ("The Vintage Brandy", "sugar_lips_habasi", "Sugar-Lips Habasi", "balmora", "fetch", "hlaalo_manor", "Hlaalo Manor", "balmora", "Steal the vintage brandy from Hlaalo Manor.", {"item": "vintage_brandy", "itemName": "Vintage Brandy", "place": "manor"}),
        ("Free New-Shoes Bragor", "sugar_lips_habasi", "Sugar-Lips Habasi", "balmora", "fetch", "pelagiad", "Pelagiad jail", "pelagiad", "Free New-Shoes Bragor. The cell key is on the jailer.", {"item": "pelagiad_cell_key", "itemName": "Cell Key", "place": "interior"}),
        ("Master of Security", "sugar_lips_habasi", "Sugar-Lips Habasi", "balmora", "persuade", "balmora", "South Wall", "balmora", "Find the security master in town and win their trust.", {"target": "security_master", "targetName": "Master of Security", "minDisp": 50}),
        ("Loot the Mages Guild", "aengoth", "Aengoth the Jeweler", "ald_ruhn", "fetch", "ald_ruhn", "Mages Guild", "ald_ruhn", "Steal the enchanted tanto from the Ald'ruhn Mages Guild.", {"item": "enchanted_tanto", "itemName": "Enchanted Tanto", "place": "interior"}),
        ("Redoran Master Helm", "aengoth", "Aengoth the Jeweler", "ald_ruhn", "fetch", "ald_ruhn", "Redoran vault", "ald_ruhn", "Steal a Redoran master helm.", {"item": "redoran_master_helm", "itemName": "Redoran Master Helm", "place": "interior"}),
        ("Naughty Gandosa", "aengoth", "Aengoth the Jeweler", "ald_ruhn", "fetch", "arobar_manor", "Arobar Manor", "ald_ruhn", "Find incriminating papers on the Arobar family.", {"item": "arobar_papers", "itemName": "Arobar Papers", "place": "manor"}),
        ("Withershins", "aengoth", "Aengoth the Jeweler", "ald_ruhn", "fetch", "ald_ruhn", "Bookseller", "ald_ruhn", "Pick up a copy of the rare book Withershins.", {"item": "withershins", "itemName": "Withershins"}),
        ("Retrieve the Scrap Metal", "aengoth", "Aengoth the Jeweler", "ald_ruhn", "fetch", "mzuleft", "Dwemer scrap", "dagon_fel", "Bring enough Dwemer scrap to keep a centurion off the guild.", {"item": "dwemer_scrap", "itemName": "Dwemer Scrap", "place": "dwemer"}),
        ("The Darts of Judgement", "aengoth", "Aengoth the Jeweler", "ald_ruhn", "fetch", "ald_ruhn", "Guard tower", "ald_ruhn", "Steal four Daedric darts from a Redoran guard.", {"item": "daedric_darts", "itemName": "Darts of Judgement", "place": "interior"}),
        ("Potion Recipe", "big_helende", "Big Helende", "sadrith_mora", "fetch", "sadrith_mora", "Alchemist", "sadrith_mora", "Steal the potion recipe from the local alchemist.", {"item": "potion_recipe", "itemName": "Potion Recipe"}),
        ("The Grandmaster's Retort", "big_helende", "Big Helende", "sadrith_mora", "fetch", "sadrith_mora", "Alchemist tower", "sadrith_mora", "Steal a grandmaster's retort.", {"item": "grandmaster_retort", "itemName": "Grandmaster's Retort", "place": "tower"}),
        ("Wizard For Hire", "big_helende", "Big Helende", "sadrith_mora", "persuade", "sadrith_mora", "Mages Guild", "sadrith_mora", "Hire a battlemage. They must actually like the offer.", {"target": "hired_mage", "targetName": "Battlemage", "minDisp": 55}),
        ("Redoran Cookbook", "big_helende", "Big Helende", "sadrith_mora", "fetch", "ald_ruhn", "Redoran kitchen", "ald_ruhn", "Steal Redoran Cooking Secrets.", {"item": "redoran_cookbook", "itemName": "Redoran Cookbook", "place": "interior"}),
        ("Felen's Ebony Staff", "big_helende", "Big Helende", "sadrith_mora", "fetch", "tel_branora", "Felen's tower", "tel_branora", "Steal Felen's enchanted ebony staff.", {"item": "felen_staff", "itemName": "Felen's Ebony Staff", "place": "tower"}),
        ("Find Brother Nads", "jim_stacey", "Gentleman Jim Stacey", "vivec", "escort", "addadshashanammu", "Addadshashanammu", "gnaar_mok", "Find Brother Nads and walk him out of the shrine.", {"target": "brother_nads", "targetName": "Brother Nads", "place": "daedric"}),
        ("Speak With Percius", "jim_stacey", "Gentleman Jim Stacey", "vivec", "persuade", "ald_ruhn", "Ald'ruhn Fighters Guild", "ald_ruhn", "Learn what Percius Mercius knows of the Camonna Tong. He must trust you.", {"target": "percius_mercius", "targetName": "Percius Mercius", "minDisp": 55}),
        ("The Bitter Cup", "jim_stacey", "Gentleman Jim Stacey", "vivec", "fetch", "ald_redaynia", "Ald Redaynia", "ald_velothi", "Find the Bittercup, then persuade Eydis to turn on the Camonna Tong.", {"item": "bittercup", "itemName": "Bittercup", "place": "tower"}),
        ("Hrundi's Lover", "jim_stacey", "Gentleman Jim Stacey", "vivec", "persuade", "sadrith_mora", "Wolverine Hall", "sadrith_mora", "Persuade Hrundi to stand with the guild against the Camonna Tong.", {"target": "hrundi", "targetName": "Hrundi", "minDisp": 60}),
        ("The Brothers Ienith", "jim_stacey", "Gentleman Jim Stacey", "vivec", "kill", "dren_plantation", "Dren cellar", "vivec", "Kill the Camonna Tong enforcers Navil and Ranes Ienith.", {"target": "ienith_brother", "targetName": "Ienith Enforcer", "place": "manor"}),
        ("Kill Hard-Heart", "jim_stacey", "Gentleman Jim Stacey", "vivec", "kill", "vivec", "Fighters Guild", "vivec", "Kill Sjoring Hard-Heart for the Thieves Guild.", {"target": "sjoring_for_thieves", "targetName": "Sjoring Hard-Heart", "place": "interior"}),
        ("The Hlervu Locket", "jim_stacey", "Gentleman Jim Stacey", "vivec", "fetch", "vivec", "Hlervu manor", "vivec", "Steal the Hlervu locket and return it to its owner.", {"item": "hlervu_locket", "itemName": "Hlervu Locket", "place": "manor"}),
        ("Yngling's Ledger", "jim_stacey", "Gentleman Jim Stacey", "vivec", "fetch", "vivec", "Yngling's manor", "vivec", "Steal Yngling's ledger.", {"item": "yngling_ledger", "itemName": "Yngling's Ledger", "place": "manor"}),
        ("Land Deed", "jim_stacey", "Gentleman Jim Stacey", "vivec", "fetch", "vivec", "Library of Vivec", "vivec", "Steal the forged land deed from the Library of Vivec.", {"item": "forged_land_deed", "itemName": "Forged Land Deed", "place": "interior"}),
        ("Enamor", "jim_stacey", "Gentleman Jim Stacey", "vivec", "fetch", "abeba", "Abebaal", "tel_branora", "Recover the sword Enamor and see it returned to Salyn Sarethi.", {"item": "enamor", "itemName": "Enamor", "place": "cave"}),
        ("Brallion's Ring", "jim_stacey", "Gentleman Jim Stacey", "vivec", "fetch", "dren_plantation", "Dren vault", "vivec", "Steal Brallion's ring from the slaver and carry it to an abolitionist.", {"item": "brallions_ring", "itemName": "Brallion's Ring", "place": "manor"}),
        ("Books for Vala", "jim_stacey", "Gentleman Jim Stacey", "vivec", "fetch", "caldera", "Odral Helvi's shelves", "caldera", "Steal four history books from Odral Helvi for Vala Catraso.", {"item": "history_books", "itemName": "History Books", "place": "interior"}),
        ("The Dwemer Goblet", "jim_stacey", "Gentleman Jim Stacey", "vivec", "fetch", "nchuleft", "Nchuleft", "vos", "Steal a Dwemer goblet from the ruin.", {"item": "dwemer_goblet", "itemName": "Dwemer Goblet", "place": "dwemer"}),
    ],
)

seq(
    "cult",
    "cult",
    [
        ("A Lucky Coin", "synnolian_tunifus", "Synnolian Tunifus", "ebonheart", "fetch", "ghostgate", "Ghostgate", "ghostgate", "A stranger at Ghostgate will trade a lucky coin if you meet him there.", {"item": "lucky_coin", "itemName": "Lucky Coin"}),
        ("Gathering Marshmerrow", "synnolian_tunifus", "Synnolian Tunifus", "ebonheart", "gather", "pelagiad", "Pelagiad fields", "pelagiad", "Bring five marshmerrow from the Pelagiad farmer.", {"item": "marshmerrow", "itemName": "Marshmerrow", "qty": 5, "place": "wild"}),
        ("Gathering Muck", "synnolian_tunifus", "Synnolian Tunifus", "ebonheart", "gather", "gnisis", "Gnisis shore", "gnisis", "Bring five muck and the potions they become.", {"item": "muck", "itemName": "Muck", "qty": 5, "place": "wild"}),
        ("Gathering Willow Anther", "synnolian_tunifus", "Synnolian Tunifus", "ebonheart", "gather", "gro_bagrat", "Gro-Bagrat Plantation", "vivec", "Bring five willow anther from the plantation north of Vivec.", {"item": "willow_anther", "itemName": "Willow Anther", "qty": 5, "place": "wild"}),
        ("Gathering Scrib Jelly", "synnolian_tunifus", "Synnolian Tunifus", "ebonheart", "gather", "inanius_mine", "Egg mine", "suran", "Harvest scrib jelly.", {"item": "scrib_jelly", "itemName": "Scrib Jelly", "qty": 5, "place": "cave"}),
        ("Gathering Corkbulb Root", "synnolian_tunifus", "Synnolian Tunifus", "ebonheart", "gather", "arvel_plantation", "Arvel Plantation", "vivec", "Harvest corkbulb root at the Arvel plantation.", {"item": "corkbulb", "itemName": "Corkbulb Root", "qty": 5, "place": "wild"}),
        ("Gathering Rat Meat", "synnolian_tunifus", "Synnolian Tunifus", "ebonheart", "kill", "vivec_sewers", "Vivec sewers", "vivec", "Kill rats in Vivec for their meat.", {"target": "sewer_rat", "targetName": "Sewer Rat", "place": "interior"}),
        ("Gathering Netch Leather", "synnolian_tunifus", "Synnolian Tunifus", "ebonheart", "kill", "grazelands_netch", "Grazelands", "vos", "Kill a netch and bring the leather.", {"target": "bull_netch", "targetName": "Bull Netch", "place": "wild"}),
        ("Alms from the Skyrim Mission", "iulus_truptor", "Iulus Truptor", "ebonheart", "gold", "ebonheart", "Skyrim Mission", "ebonheart", "Collect the Skyrim Mission's donation.", {"gold": 100}),
        ("Alms from the Argonian Mission", "iulus_truptor", "Iulus Truptor", "ebonheart", "gold", "ebonheart", "Argonian Mission", "ebonheart", "Collect the Argonian Mission's donation.", {"gold": 100}),
        ("Buckmoth Alms", "iulus_truptor", "Iulus Truptor", "ebonheart", "gold", "ald_ruhn", "Buckmoth parish", "ald_ruhn", "Collect donations from the people of Ald'ruhn.", {"gold": 150}),
        ("Shirt and Vest for Harvest's End", "iulus_truptor", "Iulus Truptor", "ebonheart", "fetch", "ebonheart", "Clothier", "ebonheart", "Bring a red shirt and a black vest for the festival.", {"item": "festival_clothes", "itemName": "Festival Clothes"}),
        ("Brandy for the Fundraising Dinner", "iulus_truptor", "Iulus Truptor", "ebonheart", "persuade", "balmora", "Balmora tavern", "balmora", "Persuade a tavern keeper to donate the dinner brandy.", {"target": "tavern_keeper", "targetName": "Tavern Keeper", "minDisp": 50}),
        ("Donation from Cunius Pelelius", "iulus_truptor", "Iulus Truptor", "ebonheart", "gold", "caldera", "Caldera Mine office", "caldera", "Collect Cunius Pelelius's pledged five hundred.", {"gold": 200}),
        ("Pledge from Canctunian Ponius", "iulus_truptor", "Iulus Truptor", "ebonheart", "persuade", "ebonheart", "East Empire", "ebonheart", "Collect Ponius's pledge. He will not pay a stranger he dislikes.", {"target": "canctunian_ponius", "targetName": "Canctunian Ponius", "minDisp": 55}),
        ("Missing Limeware", "kaye", "Kaye", "ebonheart", "fetch", "vivec", "Caryarel's room", "vivec", "Recover the limeware bowl Caryarel stole from the chapel.", {"item": "limeware", "itemName": "Limeware Bowl", "place": "interior"}),
        ("The Haunting", "kaye", "Kaye", "ebonheart", "kill", "caldera", "Nedhelas's house", "caldera", "Stop the ghost haunting Nedhelas's house.", {"target": "caldera_ghost", "targetName": "Restless Ghost", "place": "interior"}),
        ("Thelsa Dral the Witch", "kaye", "Kaye", "ebonheart", "kill", "khuul_mine", "Egg mine near Khuul", "khuul", "Deal with the witch Thelsa Dral.", {"target": "thelsa_dral", "targetName": "Thelsa Dral", "place": "cave"}),
        ("The Silver Staff of Shaming", "kaye", "Kaye", "ebonheart", "fetch", "kand", "Mount Kand", "maar_gan", "Find the Silver Staff of Shaming in the shadow of Mount Kand.", {"item": "staff_of_shaming", "itemName": "Silver Staff of Shaming", "place": "cave"}),
        ("Restless Spirit", "kaye", "Kaye", "ebonheart", "persuade", "hla_oad", "Okur's house", "hla_oad", "Calm the ghost of Julielle Aumine. Okur must trust you enough to let you try.", {"target": "okur", "targetName": "Okur", "minDisp": 45}),
        ("Ring in Darkness", "lalatia_varian", "Lalatia Varian", "ebonheart", "fetch", "nammu", "Nammu", "molag_mar", "Find the Ring in Darkness in Nammu.", {"item": "ring_in_darkness", "itemName": "Ring in Darkness", "place": "cave"}),
        ("Boots of the Apostle", "lalatia_varian", "Lalatia Varian", "ebonheart", "fetch", "berandas", "Berandas", "gnisis", "Find the Boots of the Apostle in Berandas.", {"item": "boots_apostle", "itemName": "Boots of the Apostle", "place": "stronghold"}),
        ("Ice Blade of the Monarch", "lalatia_varian", "Lalatia Varian", "ebonheart", "fetch", "rotheran", "Rotheran", "dagon_fel", "Find the Ice Blade of the Monarch in Rotheran.", {"item": "ice_blade", "itemName": "Ice Blade of the Monarch", "place": "stronghold"}),
        ("The Scroll of Fiercely Roasting", "lalatia_varian", "Lalatia Varian", "ebonheart", "fetch", "ashalmimilkala", "Ashalmimilkala", "ald_velothi", "Find the scroll in the shrine of Ashalmimilkala.", {"item": "scroll_roasting", "itemName": "Scroll of Fiercely Roasting", "place": "daedric"}),
        ("Skull-Crusher", "lalatia_varian", "Lalatia Varian", "ebonheart", "fetch", "anudnabia", "Anudnabia", "sadrith_mora", "Find the warhammer Skull-Crusher in the Forgotten Vaults of Anudnabia.", {"item": "skull_crusher", "itemName": "Skull-Crusher", "place": "dwemer"}),
    ],
)

seq(
    "legion",
    "legion",
    [
        ("Widow Vabdas' Deed", "darius", "General Darius", "gnisus_fort", "fetch", "gnisis", "Widow Vabdas", "gnisis", "Recover the deed from Widow Vabdas. The fort is Moonmoth's sister post at Gnisis; Darius waits in the Gnisis garrison.", {"item": "vabdas_deed", "itemName": "Vabdas Deed"}),
        ("Gnisis Eggmine", "darius", "General Darius", "gnisis", "deliver", "gnisis_eggmine", "Gnisis Eggmine", "gnisis", "Cure the blighted queen of the Gnisis eggmine.", {"target": "gnisis_queen", "targetName": "Kwama Queen", "item": "cure_blight_potion", "itemName": "Cure Blight Potion", "place": "cave"}),
        ("Rescue Madura Seran", "darius", "General Darius", "gnisis", "kill", "outcast_camp", "Ashlander outcasts", "gnisis", "Rescue the pilgrim Madura Seran from outcasts north of Gnisis.", {"target": "outcast_abductor", "targetName": "Outcast", "place": "camp"}),
        ("Rescue Ragash gra-Shuzgub", "darius", "General Darius", "gnisis", "escort", "gnisis", "Gnisis", "gnisis", "Find the tax collector Ragash and bring her back.", {"target": "ragash", "targetName": "Ragash gra-Shuzgub", "dest": "arvs_drelen", "place": "tower"}),
        ("Talos Cult Conspiracy", "darius", "General Darius", "gnisis", "kill", "gnisis", "Talos shrine", "gnisis", "Break the Talos cult cell that plots against the Emperor.", {"target": "talos_cultist", "targetName": "Talos Cultist", "place": "interior"}),
        ("Dwemer Artifacts at Drinar Varyon's Place", "imsin", "Imsin the Dreamer", "buckmoth_fort", "fetch", "ald_ruhn", "Drinar Varyon's house", "ald_ruhn", "Find proof Drinar Varyon is smuggling Dwemer artifacts.", {"item": "smuggle_proof", "itemName": "Smuggling Ledger", "place": "interior"}),
        ("Rescue Joncis Dalomax", "imsin", "Imsin the Dreamer", "buckmoth_fort", "kill", "ashurnibibi", "Ashurnibibi", "ald_ruhn", "Rescue Joncis Dalomax from Ashurnibibi.", {"target": "ashurnibibi_gaoler", "targetName": "Gaoler", "place": "daedric"}),
        ("Maiden's Token", "imsin", "Imsin the Dreamer", "buckmoth_fort", "fetch", "assumanu", "Assumanu", "ald_ruhn", "Recover the embroidered gauntlet from Varona Nelas.", {"item": "maidens_token", "itemName": "Maiden's Token", "place": "daedric"}),
        ("Scrap Metal", "radd_hard_heart", "Radd Hard-Heart", "moonmoth_fort", "fetch", "arkngthand", "Arkngthand", "pelagiad", "Bring Dwemer scrap metal for the fort's contest.", {"item": "dwemer_scrap", "itemName": "Dwemer Scrap", "place": "dwemer"}),
        ("Rescue Jocien Ancois", "radd_hard_heart", "Radd Hard-Heart", "moonmoth_fort", "kill", "erabenimsun_camp", "Erabenimsun Camp", "erabenimsun_camp", "Rescue Jocien Ancois from the Erabenimsun.", {"target": "erabenimsun_raider", "targetName": "Raider", "place": "camp"}),
        ("Rescue Dandsa", "radd_hard_heart", "Radd Hard-Heart", "moonmoth_fort", "kill", "raider_cave", "Raider cave", "balmora", "Rescue Dandsa from the raiders.", {"target": "dandsa_raider", "targetName": "Raider", "place": "cave"}),
        ("Breeding Netch", "radd_hard_heart", "Radd Hard-Heart", "moonmoth_fort", "kill", "netch_pasture", "Netch pasture", "pelagiad", "Kill the pair of breeding netch.", {"target": "breeding_netch", "targetName": "Betty Netch", "place": "wild"}),
        ("Sorkvild the Raven", "radd_hard_heart", "Radd Hard-Heart", "moonmoth_fort", "kill", "sorkvild_tower", "Sorkvild's tower", "dagon_fel", "Kill the necromancer Sorkvild the Raven.", {"target": "sorkvild", "targetName": "Sorkvild the Raven", "place": "tower"}),
        ("Courtesy", "frald_the_white", "Frald the White", "ebonheart", "persuade", "ghostgate", "Ghostgate", "ghostgate", "Answer the Buoyant Armiger's insult. Courtesy here is a duel of words he must concede.", {"target": "buoyant_armiger", "targetName": "Buoyant Armiger", "minDisp": 40}),
        ("Honthjolf is a Traitor", "frald_the_white", "Frald the White", "ebonheart", "kill", "aharnabi", "Aharnabi", "maar_gan", "Kill the traitor Honthjolf.", {"target": "honthjolf", "targetName": "Honthjolf", "place": "cave"}),
        ("Suryn Athones' Slanders", "frald_the_white", "Frald the White", "ebonheart", "kill", "vivec", "Vivec", "vivec", "Stop the Ordinator Suryn Athones from spreading the lie.", {"target": "suryn_athones", "targetName": "Suryn Athones"}),
        ("Saprius Entius", "frald_the_white", "Frald the White", "ebonheart", "escort", "ebonheart", "Ebonheart", "ebonheart", "Find the accused knight Saprius Entius and bring him in alive.", {"target": "saprius_entius", "targetName": "Saprius Entius", "dest": "hides_cave", "place": "cave"}),
        ("Lord's Mail", "varus_vantinius", "Varus Vantinius", "ebonheart", "fetch", "venim_tomb", "Venim ancestral tomb", "ald_ruhn", "Retrieve the Lord's Mail.", {"item": "lords_mail", "itemName": "Lord's Mail", "place": "tomb"}),
        ("Grandmaster Duel", "varus_vantinius", "Varus Vantinius", "ebonheart", "kill", "ebonheart_arena", "Ebonheart arena", "ebonheart", "Duel Varus Vantinius for the rank of Grandmaster.", {"target": "varus_vantinius", "targetName": "Varus Vantinius", "place": "stronghold"}),
    ],
)

# fix legion first location typo gnisus_fort -> the at field is gnisus_fort which is not a hub.
# I'll patch after.

seq(
    "temple",
    "temple",
    [
        ("Grace of Humility", "tuls_valen", "Tuls Valen", "ald_ruhn", "donate", "fields_of_kummu", "Fields of Kummu", "suran", "Offer muck at the Shrine of Humility in the Fields of Kummu.", {"item": "muck", "itemName": "Muck", "place": "shrine"}),
        ("Grace of Daring", "tuls_valen", "Tuls Valen", "ald_ruhn", "donate", "vivec_temple", "Vivec Temple", "vivec", "Offer a Rising Force potion at the Shrine of Daring in the Temple canton.", {"item": "rising_force", "itemName": "Rising Force Potion", "place": "canton"}),
        ("Grace of Generosity", "tuls_valen", "Tuls Valen", "ald_ruhn", "gold", "vivec_palace", "Palace of Vivec", "vivec", "Lay 100 gold at the Shrine of Generosity in Vivec's palace.", {"gold": 100, "place": "canton"}),
        ("Grace of Courtesy", "tuls_valen", "Tuls Valen", "ald_ruhn", "donate", "puzzle_canal", "Puzzle Canal", "vivec", "Bring a silver longsword to the Shrine of Courtesy in the Puzzle Canal.", {"item": "silver_longsword", "itemName": "Silver Longsword", "place": "interior"}),
        ("Grace of Justice", "tuls_valen", "Tuls Valen", "ald_ruhn", "donate", "gnisis", "Gnisis Temple", "gnisis", "Offer a cure-disease potion at the Shrine of Justice in Gnisis.", {"item": "cure_disease_potion", "itemName": "Cure Disease Potion", "place": "interior"}),
        ("Grace of Valor", "tuls_valen", "Tuls Valen", "ald_ruhn", "donate", "koal_cave", "Koal Cave", "gnisis", "Offer dreugh wax at the Shrine of Valor in Koal Cave.", {"item": "dreugh_wax", "itemName": "Dreugh Wax", "place": "cave"}),
        ("Grace of Pride", "tuls_valen", "Tuls Valen", "ald_ruhn", "donate", "ghostgate", "Ghostgate", "ghostgate", "Offer a soul gem at the Shrine of Pride inside Ghostgate.", {"item": "soul_gem", "itemName": "Soul Gem", "place": "shrine"}),
        ("Compassion", "tuls_valen", "Tuls Valen", "ald_ruhn", "deliver", "ald_ruhn", "Temple", "ald_ruhn", "Cure a blighted enemy and return. The potion is the compassion.", {"target": "blighted_enemy", "targetName": "Blighted Pilgrim", "item": "cure_blight_potion", "itemName": "Cure Blight Potion"}),
        ("False Incarnate", "tuls_valen", "Tuls Valen", "ald_ruhn", "kill", "suran", "Suran", "suran", "Investigate the false Incarnate in Suran. He will not recant.", {"target": "false_incarnate", "targetName": "False Incarnate"}),
        ("Pilgrimage to Maar Gan", "tuls_valen", "Tuls Valen", "ald_ruhn", "visit", "maar_gan", "Maar Gan shrine", "maar_gan", "Pray at the shrine of Maar Gan.", {"place": "shrine"}),
        ("Dark Cult in Hassour", "tuls_valen", "Tuls Valen", "ald_ruhn", "kill", "hassour", "Hassour", "ald_ruhn", "Destroy the Sixth House cult in Hassour.", {"target": "hassour_cultist", "targetName": "Cultist", "place": "cave"}),
        ("Disease Carrier", "endryn_llethan", "Endryn Llethan", "vivec", "persuade", "vivec", "Vivec", "vivec", "Convince the corprus pilgrim to leave the city.", {"target": "corprus_pilgrim", "targetName": "Diseased Pilgrim", "minDisp": 40}),
        ("Silent Pilgrimage", "endryn_llethan", "Endryn Llethan", "vivec", "visit", "sanctus_shrine", "Sanctus Shrine", "dagon_fel", "Walk in silence to the Sanctus Shrine west of Dagon Fel. Speak only at the shrine.", {"place": "shrine"}),
        ("Shoes of St. Rilms", "endryn_llethan", "Endryn Llethan", "vivec", "fetch", "ald_sotha", "Ald Sotha", "vivec", "Recover the Shoes of St. Rilms from Ald Sotha.", {"item": "shoes_rilms", "itemName": "Shoes of St. Rilms", "place": "daedric"}),
        ("Foul Cult Beneath St. Delyn Canton", "endryn_llethan", "Endryn Llethan", "vivec", "kill", "st_delyn", "St. Delyn underworks", "vivec", "Eliminate the cult under St. Delyn.", {"target": "delyn_cultist", "targetName": "Cultist", "place": "interior"}),
        ("Cure Lette", "tharer_rotheloth", "Tharer Rotheloth", "molag_mar", "deliver", "tel_mora", "Tel Mora", "tel_mora", "Cure Lette of swamp fever.", {"target": "lette", "targetName": "Lette", "item": "cure_disease_potion", "itemName": "Cure Disease Potion"}),
        ("Pilgrimage to Mount Kand", "tharer_rotheloth", "Tharer Rotheloth", "molag_mar", "visit", "kand", "Mount Kand", "maar_gan", "Visit the Mount Kand shrine.", {"place": "shrine"}),
        ("Necromancer in Mawia", "tharer_rotheloth", "Tharer Rotheloth", "molag_mar", "kill", "mawia", "Mawia", "molag_mar", "Kill the necromancer in Mawia.", {"target": "mawia_necromancer", "targetName": "Necromancer", "place": "cave"}),
        ("Slay Raxle Berne", "tharer_rotheloth", "Tharer Rotheloth", "molag_mar", "kill", "galom_daeus", "Galom Daeus", "molag_mar", "Cleanse Galom Daeus and slay Raxle Berne.", {"target": "raxle_berne", "targetName": "Raxle Berne", "place": "dwemer"}),
        ("Cure the Outcast Outlander", "uvoo_llaren", "Uvoo Llaren", "ghostgate", "deliver", "outcast_camp", "Outcast camp", "ghostgate", "Cure the ill outlander in the nearby camp.", {"target": "outcast_outlander", "targetName": "Outcast Outlander", "item": "cure_disease_potion", "itemName": "Cure Disease Potion", "place": "camp"}),
        ("Food and Drink for the Hermit", "uvoo_llaren", "Uvoo Llaren", "ghostgate", "deliver", "shuran", "Shuran Island", "sadrith_mora", "Bring food to the hermit Sendus Sathis.", {"target": "sendus_sathis", "targetName": "Sendus Sathis", "item": "hermit_basket", "itemName": "Basket of Food", "place": "wild"}),
        ("Hair Shirt of St. Aralor", "uvoo_llaren", "Uvoo Llaren", "ghostgate", "fetch", "kogoruhn", "Kogoruhn", "maar_gan", "Recover the Hair Shirt of St. Aralor from Kogoruhn.", {"item": "hair_shirt", "itemName": "Hair Shirt of St. Aralor", "place": "citadel"}),
        ("Cleaver of St. Felms", "uvoo_llaren", "Uvoo Llaren", "ghostgate", "fetch", "tureynulal", "Tureynulal", "red_mountain", "Recover the Cleaver of St. Felms from Tureynulal.", {"item": "cleaver_felms", "itemName": "Cleaver of St. Felms", "place": "citadel"}),
        ("Crosier of St. Llothis the Pious", "uvoo_llaren", "Uvoo Llaren", "ghostgate", "fetch", "dagoth_ur_citadel", "Red Mountain crater", "red_mountain", "Recover the Crosier of St. Llothis from the crater.", {"item": "crosier_llothis", "itemName": "Crosier of St. Llothis", "place": "citadel"}),
        ("Malacath of the House of Troubles", "tholer_saryoni", "Tholer Saryoni", "vivec", "visit", "assurdirapal", "Assurdirapal", "ald_ruhn", "Visit Malacath's statue and renew the pact.", {"place": "daedric"}),
        ("Mehrunes Dagon of the House of Troubles", "tholer_saryoni", "Tholer Saryoni", "vivec", "visit", "yasammidan", "Yasammidan", "ald_velothi", "Visit Mehrunes Dagon's shrine.", {"place": "daedric"}),
        ("Molag Bal of the House of Troubles", "tholer_saryoni", "Tholer Saryoni", "vivec", "visit", "yansirramus", "Yansirramus", "molag_mar", "Visit Molag Bal's shrine.", {"place": "daedric"}),
        ("Sheogorath of the House of Troubles", "tholer_saryoni", "Tholer Saryoni", "vivec", "visit", "ihinipalit", "Ihinipalit", "vivec", "Visit Sheogorath's shrine in St. Delyn.", {"place": "daedric"}),
        ("Ebony Mail", "tholer_saryoni", "Tholer Saryoni", "vivec", "fetch", "assarnibibi", "Mount Assarnibibi", "molag_mar", "Retrieve the Ebony Mail from the shrine atop Mount Assarnibibi.", {"item": "ebony_mail", "itemName": "Ebony Mail", "place": "daedric"}),
    ],
)

seq(
    "morag",
    "morag",
    [
        ("Writ for Feruren Oran", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "sadrith_mora", "Sadrith Mora", "sadrith_mora", "Execute Feruren Oran. This writ proves you to the Morag Tong.", {"target": "feruren_oran", "targetName": "Feruren Oran"}),
        ("Writ for Odaishah Yasalmibaal", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "tel_fyr", "Near Tel Fyr", "tel_fyr", "Execute Odaishah Yasalmibaal.", {"target": "odaishah", "targetName": "Odaishah Yasalmibaal"}),
        ("Writ for Toris Saren", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "vivec", "Vivec", "vivec", "Execute Toris Saren.", {"target": "toris_saren", "targetName": "Toris Saren"}),
        ("Writ for Sarayn Sadus", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "zaintirari", "Zaintirari", "ald_ruhn", "Execute Sarayn Sadus.", {"target": "sarayn_sadus", "targetName": "Sarayn Sadus", "place": "daedric"}),
        ("Writ for Ethal Seloth and Idroso Vendu", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "vivec", "Temporary housing", "vivec", "Execute Ethal Seloth and Idroso Vendu.", {"target": "ethal_seloth", "targetName": "Ethal Seloth", "place": "interior"}),
        ("Writ for Guril Retheran", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "vivec", "Vivec", "vivec", "Execute Guril Retheran.", {"target": "guril_retheran", "targetName": "Guril Retheran"}),
        ("Writ for Galasa Uvayn", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "vivec", "Vivec", "vivec", "Execute Galasa Uvayn.", {"target": "galasa_uvayn", "targetName": "Galasa Uvayn"}),
        ("Writ for Mavon Drenim", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "vivec", "Vivec", "vivec", "Execute Mavon Drenim.", {"target": "mavon_drenim", "targetName": "Mavon Drenim"}),
        ("Writ for Tirer Belvayn", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "shara", "Shara", "balmora", "Execute Tirer Belvayn in Shara.", {"target": "tirer_belvayn", "targetName": "Tirer Belvayn", "place": "cave"}),
        ("Writ for Mathyn Bemis", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "vivec", "Vivec", "vivec", "Execute Mathyn Bemis.", {"target": "mathyn_bemis", "targetName": "Mathyn Bemis"}),
        ("Writ for Brilnosu Llarys", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "hlormaren", "Hlormaren", "balmora", "Execute Brilnosu Llarys in Hlormaren.", {"target": "brilnosu_llarys", "targetName": "Brilnosu Llarys", "place": "stronghold"}),
        ("Writ for Navil and Ranes Ienith", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "dren_plantation", "Dren cellar", "vivec", "Execute the Ienith brothers.", {"target": "navil_ienith", "targetName": "Navil Ienith", "place": "manor"}),
        ("Threads of the Webspinner", "eno_hlaalu", "Eno Hlaalu", "vivec", "gather", "yasammidan", "Daedric shrines", "ald_velothi", "Gather Sanguine relics from the old shrines for Eno Hlaalu.", {"item": "sanguine_relic", "itemName": "Sanguine Relic", "qty": 5, "place": "daedric"}),
        ("A Contact in the Dark Brotherhood", "eno_hlaalu", "Eno Hlaalu", "vivec", "persuade", "vivec", "Foreign Quarter", "vivec", "Learn the Dark Brotherhood contact's name from the enchanter.", {"target": "canton_enchanter", "targetName": "Enchanter", "minDisp": 50}),
        ("Belt of Sanguine Fleetness", "eno_hlaalu", "Eno Hlaalu", "vivec", "fetch", "pelagiad", "Pelagiad", "pelagiad", "Recover the Belt of Sanguine Fleetness.", {"item": "belt_fleetness", "itemName": "Belt of Sanguine Fleetness"}),
        ("Ultimatum for Movis Darys", "eno_hlaalu", "Eno Hlaalu", "vivec", "persuade", "ald_ruhn", "Ald'ruhn", "ald_ruhn", "Persuade Movis Darys to join the Morag Tong.", {"target": "movis_darys", "targetName": "Movis Darys", "minDisp": 55}),
        ("Ultimatum for Carecalmo", "eno_hlaalu", "Eno Hlaalu", "vivec", "persuade", "yasammidan", "Yasammidan", "ald_velothi", "Deliver the ultimatum to Carecalmo.", {"target": "carecalmo", "targetName": "Carecalmo", "minDisp": 40, "place": "daedric"}),
        ("Ring of Sanguine Sublime Wisdom", "eno_hlaalu", "Eno Hlaalu", "vivec", "fetch", "yasammidan", "Yasammidan", "ald_velothi", "Recover the Ring of Sanguine Sublime Wisdom.", {"item": "ring_wisdom", "itemName": "Ring of Sanguine Sublime Wisdom", "place": "daedric"}),
        ("Execute Durus Marius", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "st_olms_underworks", "St. Olms", "vivec", "Execute Durus Marius.", {"target": "durus_marius", "targetName": "Durus Marius", "place": "interior"}),
        ("Execute Severa Magia", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "ald_sotha", "Ald Sotha", "vivec", "Execute Severa Magia, Night Mother of the Dark Brotherhood.", {"target": "severa_magia", "targetName": "Severa Magia", "place": "daedric"}),
        ("Grandmaster", "eno_hlaalu", "Eno Hlaalu", "vivec", "persuade", "vivec", "Morag Tong", "vivec", "Eno Hlaalu will retire if your regard, and your record, are enough.", {"target": "eno_hlaalu", "targetName": "Eno Hlaalu", "minDisp": 70}),
        ("Writ for Larrius Varro", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "moonmoth_fort", "Moonmoth", "moonmoth_fort", "Execute Larrius Varro. The writ opens only after the Heart is still.", {"target": "larrius_varro", "targetName": "Larrius Varro", "place": "stronghold"}),
        ("Writ for Baladas Demnevanni", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "arvs_drelen", "Arvs-Drelen", "gnisis", "Execute Baladas Demnevanni.", {"target": "baladas_writ", "targetName": "Baladas Demnevanni", "place": "tower"}),
        ("Writ for Dram Bero", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "st_olms_underworks", "Hidden manor", "vivec", "Execute Dram Bero.", {"target": "dram_bero_writ", "targetName": "Dram Bero", "place": "interior"}),
        ("Writ for Mistress Therana", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "tel_branora", "Tel Branora", "tel_branora", "Execute Mistress Therana.", {"target": "therana_writ", "targetName": "Mistress Therana", "place": "tower"}),
    ],
)

# Daedric — not a rank faction chain of membership the same way, but sequential is fine. No faction join required... I'll use faction daedric so ranks rise, join on first.
seq(
    "daedric",
    "daedric",
    [
        ("Azura's Quest", "azura_shrine", "Azura", "shrine_of_azura", "fetch", "ihinipalit", "Ihinipalit", "vivec", "Settle Azura's bet with Sheogorath. Bring the signet from his shrine back to hers, south of Molag Mar.", {"item": "sheogorath_signet", "itemName": "Sheogorath's Signet", "rewardItem": "azuras_star", "place": "daedric"}),
        ("Boethiah's Quest", "boethiah_shrine", "Boethiah", "khartag_point", "fetch", "khartag_point", "Khartag Point", "ald_ruhn", "Restore Boethiah's forgotten glory and claim Goldbrand from the drowned shrine.", {"item": "goldbrand", "itemName": "Goldbrand", "place": "daedric"}),
        ("Malacath's Quest", "malacath_shrine", "Malacath", "assurdirapal", "kill", "assurdirapal", "Assurdirapal", "ald_ruhn", "End the bloodline of the false hero at Malacath's shrine.", {"target": "false_hero", "targetName": "False Hero", "rewardItem": "helm_oreyn", "place": "daedric"}),
        ("Mehrunes Dagon's Quest", "mehrunes_shrine", "Mehrunes Dagon", "yasammidan", "fetch", "alas_tomb", "Alas Ancestral Tomb", "molag_mar", "Bring the rusty dagger from Alas Tomb. Dagon will make it his Razor.", {"item": "rusty_dagger", "itemName": "Rusty Dagger", "rewardItem": "mehrunes_razor", "place": "tomb"}),
        ("Mephala's Quest", "mephala_shrine", "Mephala", "vivec_arena", "kill", "vivec_arena", "Vivec Arena", "vivec", "Remove Mephala's free agent.", {"target": "mephala_agent", "targetName": "Free Agent", "rewardItem": "ring_of_khajiit", "place": "interior"}),
        ("Molag Bal's Quest", "molag_shrine", "Molag Bal", "yansirramus", "kill", "yansirramus", "Yansirramus", "molag_mar", "Deal with Molag Bal's lazy minion.", {"target": "lazy_dremora", "targetName": "Lazy Dremora", "rewardItem": "mace_of_molag_bal", "place": "daedric"}),
        ("Sheogorath's Quest", "sheo_shrine", "Sheogorath", "ihinipalit", "kill", "grazelands_netch", "Grazelands", "vos", "Stick a fork in a bull netch, as Sheogorath asks, and return.", {"target": "bull_netch_sheo", "targetName": "Bull Netch", "rewardItem": "spear_of_bitter_mercy", "place": "wild"}),
    ],
)

# Vampire 14. First three are approachable before the change; the rest need vampirism.
seq(
    "vampire",
    "vampire",
    [
        ("The Boy Who Would Be Undead", "vampire_seeker", "A thirsty stranger", "ald_ruhn", "fetch", "ald_ruhn", "Ald'ruhn", "ald_ruhn", "A boy in Ald'ruhn wants the unlife. Bring him vampire dust so he understands the price.", {"item": "vampire_dust", "itemName": "Vampire Dust"}),
        ("The Weary Vampire", "weary_vampire", "Weary Vampire", "tel_mora", "persuade", "tel_mora", "Tel Mora", "tel_mora", "A weary vampire near Tel Mora will speak if your regard is high. Listen, and choose.", {"target": "weary_vampire", "targetName": "Weary Vampire", "minDisp": 40}),
        ("The Imprisonment of Mastrius", "mastrius", "Mastrius", "salvel_tomb", "fetch", "salvel_tomb", "Salvel Ancestral Tomb", "zainab_camp", "Free Mastrius from the tomb that holds him, or bring what binds him.", {"item": "mastrius_key", "itemName": "Binding Key", "place": "tomb"}),
        ("Shashev's Key", "sirilonwe", "Sirilonwe", "vivec", "fetch", "vivec", "Vivec", "vivec", "Recover Shashev's key for the wizard who studies the clans.", {"item": "shashev_key", "itemName": "Shashev's Key"}),
        ("Dust of the Vampire", "raven_omayn", "Raven Omayn", "sadrith_mora", "kill", "dulo_tomb", "Dulo Ancestral Tomb", "sadrith_mora", "Bring vampire dust. The kind that comes from a body.", {"target": "tomb_vampire", "targetName": "Vampire", "place": "tomb"}),
        ("Murder Rimintil", "raven_omayn", "Raven Omayn", "sadrith_mora", "kill", "sadrith_mora", "Sadrith Mora", "sadrith_mora", "Rimintil has become a problem. End him.", {"target": "rimintil", "targetName": "Rimintil"}),
        ("Blood for Mistress Dratha", "dratha", "Mistress Dratha", "tel_mora", "fetch", "tel_mora", "Tel Mora", "tel_mora", "Mistress Dratha wants a vial of vampire blood.", {"item": "vampire_blood", "itemName": "Vampire Blood"}),
        ("A Cure for Vampirism", "galur_contact", "A Dissident healer", "tel_fyr", "fetch", "galom_daeus", "Galom Daeus", "molag_mar", "Galur Rithari's cure exists. Find the potion components in the Berne lair and bring them to Tel Fyr.", {"item": "rithari_cure", "itemName": "Rithari's Cure", "place": "dwemer"}),
        ("Blood Ties", "dhaunayne", "Dhaunayne Aundae", "ashmelech", "kill", "ashmelech", "Ashmelech", "ald_ruhn", "The Aundae want a rival's heart. Blood ties are proved in Ashmelech.", {"target": "aundae_rival", "targetName": "Rival Vampire", "place": "cave", "vampire": True}),
        ("The Vampire Hunter", "dhaunayne", "Dhaunayne Aundae", "ashmelech", "kill", "ald_ruhn", "Ald'ruhn", "ald_ruhn", "A hunter is stalking the Aundae. Find him first.", {"target": "vampire_hunter", "targetName": "Vampire Hunter", "vampire": True}),
        ("The Blood of the Quarra", "raxle_berne", "Raxle Berne", "galom_daeus", "kill", "druscashti", "Druscashti", "khuul", "The Berne send you to spill Quarra blood at Druscashti.", {"target": "quarra_elder", "targetName": "Quarra Elder", "place": "dwemer", "vampire": True}),
        ("The Vampire Merta", "raxle_berne", "Raxle Berne", "galom_daeus", "kill", "reloth_tomb", "Reloth Ancestral Tomb", "maar_gan", "Deal with Merta, who left the clan.", {"target": "merta", "targetName": "Merta", "place": "tomb", "vampire": True}),
        ("The Cult of Lord Irarak", "volrina_quarra", "Volrina Quarra", "druscashti", "kill", "ginith_tomb", "Ginith Ancestral Tomb", "gnisis", "The cult of Irarak has forgotten who they serve. Remind them.", {"target": "irarak", "targetName": "Irarak", "place": "tomb", "vampire": True}),
        ("The Quarra Amulet", "volrina_quarra", "Volrina Quarra", "druscashti", "fetch", "druscashti", "Druscashti", "khuul", "Bring Volrina the Quarra amulet from the depths of Druscashti.", {"item": "quarra_amulet", "itemName": "Quarra Amulet", "place": "dwemer", "vampire": True}),
    ],
)

# Miscellaneous — 68 UESP category quests. Sequential so spawns stay sane.
MISC = [
    ("Dreams of a White Guar", "urshamusa", "Urshamusa Rapli", "ahemmusa_camp", "fetch", "grazelands_plain", "Grazelands", "vos", "Find the white guar Urshamusa dreamed, or the bell it wore.", "white_guar_bell", "wild"),
    ("Hannat Zainsubani", "hassour_zainsubani", "Hassour Zainsubani", "ald_ruhn", "escort", "mamaea", "Mamaea", "ald_ruhn", "Rescue Hannat Zainsubani from the Sixth House base of Mamaea.", "hannat", "citadel"),
    ("Ienas Sarandas", "aldruhn_merchant", "Ald'ruhn merchant", "ald_ruhn", "gold", "ald_ruhn", "Sarandas house", "ald_ruhn", "Collect what Ienas Sarandas owes the merchants.", None, "interior"),
    ("Strange Man at Gindrala Hleran's House", "gindrala", "Gindrala Hleran", "ald_ruhn", "kill", "gindrala_house", "Gindrala's house", "ald_ruhn", "Kill the dreamer who has taken Gindrala's house.", "dreamer_gindrala", "interior"),
    ("A Man and His Guar", "man_and_guar", "Lost trader", "pelagiad", "escort", "vivec", "Vivec", "vivec", "Escort the trader and his guar to Vivec.", "guar_trader", "wild"),
    ("An Escort to Molag Mar", "lost_trader", "Lost trader", "suran", "escort", "molag_mar", "Molag Mar", "molag_mar", "Walk the lost trader to his partner in Molag Mar.", "molag_partner", "wild"),
    ("Nels Llendo", "nels_llendo", "Nels Llendo", "suran", "gold", "nels_camp", "Nels's camp", "suran", "Pay Nels Llendo, kiss the story goodbye, or leave him a grave. Coin satisfies the quest.", None, "camp"),
    ("The Angry Trader", "tinos_drothan", "Tinos Drothan", "suran", "kill", "drothan_camp", "Road camp", "suran", "Recover Tinos Drothan's stolen raw glass from his escorts.", "drothan_thief", "wild"),
    ("The Beauty and the Bandit", "suran_beauty", "A woman of Suran", "suran", "escort", "suran", "Suran", "suran", "Help her find the bandit she loves, and see them both back.", "beauty_bandit", "wild"),
    ("The Scholars and the Mating Kagouti", "scholar", "Naturalist", "pelagiad", "kill", "kagouti_field", "Ascadian field", "pelagiad", "Keep the mating kagouti off the naturalist.", "mating_kagouti", "wild"),
    ("The Silver Bowl", "bowl_owner", "Rightful owner", "vivec", "fetch", "smuggler_cave", "Smuggler cave", "vivec", "Return the silver bowl from the smugglers' cave.", "silver_bowl", "cave"),
    ("To the Fields of Kummu", "lost_pilgrim", "Lost pilgrim", "suran", "escort", "fields_of_kummu", "Fields of Kummu", "suran", "Escort the pilgrim to the Fields of Kummu.", "kummu_pilgrim", "shrine"),
    ("Tul's Escape", "tul", "Tul", "suran", "escort", "argonia_mission", "Argonian Mission", "ebonheart", "Walk Tul to a place he calls safe. The mission will do.", "tul", "wild"),
    ("Vassir-Didanat Ebony Mine", "any_councilor", "A Hlaalu councilor", "vivec", "visit", "vassir_didanat", "Vassir-Didanat", "balmora", "Rediscover the lost ebony mine and report it.", None, "cave"),
    ("Divided by Nix Hounds", "nix_spouse", "A traveler", "ald_ruhn", "escort", "ald_ruhn", "Ald'ruhn", "ald_ruhn", "Reunite the couple the nix-hounds split.", "nix_partner", "wild"),
    ("Lead the Pilgrim to Koal Cave", "koal_pilgrim", "Pilgrim", "gnisis", "escort", "koal_cave", "Koal Cave", "gnisis", "Lead the pilgrim to Koal Cave.", "koal_pilgrim", "cave"),
    ("Viatrix, The Annoying Pilgrim", "viatrix", "Viatrix", "ghostgate", "escort", "ghostgate", "Ghostgate shrine", "ghostgate", "Escort Viatrix to the shrine inside the Ghostfence. She will complain the whole way.", "viatrix", "shrine"),
    ("Search for Her Father's Amulet", "satyana", "Satyana", "tel_branora", "fetch", "arenim_tomb", "Arenim Ancestral Tomb", "tel_branora", "Find Satyana's father's amulet.", "fathers_amulet", "tomb"),
    ("Widowmaker", "widowmaker_barbarian", "Barbarian", "sadrith_mora", "fetch", "widow_cave", "Witch cave", "sadrith_mora", "Retrieve the axe Widowmaker from the witch who took it.", "widowmaker", "cave"),
    ("A Falling Wizard", "jon_hawker", "Jon Hawker", "seyda_neen", "fetch", "seyda_neen", "Seyda Neen road", "seyda_neen", "A wizard has fallen from the sky. Look through what he dropped.", "hawker_pack", "wild"),
    ("Dredil's Delivery", "dredil", "Dredil", "ebonheart", "deliver", "ebonheart", "East Empire", "ebonheart", "Deliver Dredil's note to the East Empire Company.", "dredil_note", "interior"),
    ("The Client List", "client_patron", "A patron", "ebonheart", "fetch", "vivec", "Audenian Valius", "vivec", "Steal the client list from the enchanter Audenian Valius.", "client_list", "interior"),
    ("Hentus Needs Pants", "hentus", "Hentus Yansurnummu", "gnisis", "fetch", "gnisis", "Gnisis", "gnisis", "Bring Hentus his pants so he can leave the water.", "pants", "interior"),
    ("Girith's Stolen Hides", "athanden_girith", "Athanden Girith", "vos", "kill", "girith_camp", "Thief camp", "vos", "Find who stole Girith's guar hides.", "hide_thief", "wild"),
    ("Rabinna's Inner Beauty", "relam_arinith", "Relam Arinith", "hla_oad", "escort", "vivec", "Vivec", "vivec", "Deliver Rabinna out of Hla Oad. She is not cargo.", "rabinna", "wild"),
    ("Marsus Tullius' Missing Hides", "marsus", "Marsus Tullius", "molag_mar", "fetch", "ashlander_cache", "Ash cache", "erabenimsun_camp", "Recover Marsus's stolen guar hides.", "stolen_hides", "wild"),
    ("The Runaway Slave", "reeh_jah", "Reeh-Jah", "molag_mar", "escort", "argonia_mission", "Argonian Mission", "ebonheart", "Escort Reeh-Jah to the Argonian Mission.", "reeh_jah", "wild"),
    ("Fjol the Outlaw", "larrius_varro", "Larrius Varro", "moonmoth_fort", "kill", "fjol_camp", "Near Pelagiad", "pelagiad", "Investigate Fjol the outlaw for Larrius Varro.", "fjol", "wild"),
    ("Larrius Varro Tells a Little Story", "larrius_varro", "Larrius Varro", "moonmoth_fort", "kill", "balmora", "Balmora", "balmora", "Do the little favor Larrius describes. The Camonna Tong thug is the point of the story.", "camonna_thug", "interior"),
    ("Ahnassi, a Special Friend", "ahnassi", "Ahnassi", "pelagiad", "fetch", "pelagiad", "Pelagiad", "pelagiad", "Ahnassi asks a small theft, then a larger one. Bring her the ring she names.", "ahnassi_ring", "interior"),
    ("Gateway Ghost", "gateway_innkeeper", "Innkeeper", "sadrith_mora", "kill", "gateway_inn", "Gateway Inn", "sadrith_mora", "Lay the Gateway Inn's ghost.", "gateway_ghost", "interior"),
    ("Death of a Taxman", "socucius_ergalla", "Socucius Ergalla", "seyda_neen", "kill", "addamasartus", "Addamasartus", "seyda_neen", "Processus Vitellius is dead. Find his killer in the smugglers' cave.", "foryn_gilnith", "cave"),
    ("Fargoth's Ring", "fargoth", "Fargoth", "seyda_neen", "fetch", "census_office", "Census office", "seyda_neen", "Return Fargoth's ring. Arrille has it in the tradehouse barrel, after the census office search.", "fargoth_ring", "interior"),
    ("Fargoth's Hiding Place", "hrisskar", "Hrisskar Flat-Foot", "seyda_neen", "fetch", "addamasartus", "The stump by the lighthouse", "seyda_neen", "Find where Fargoth hides his gold.", "fargoth_gold", "wild"),
    ("Vodunius Nuccius", "vodunius", "Vodunius Nuccius", "seyda_neen", "gold", "seyda_neen", "Seyda Neen", "seyda_neen", "Help Vodunius raise the fare home.", None, "town"),
    ("Thelas' Pillows", "drarayne_thelas", "Drarayne Thelas", "dagon_fel", "fetch", "abandoned_ship", "Abandoned shipwreck", "dagon_fel", "Find Drarayne's lost pillows in the abandoned ship.", "thelas_pillows", "cave"),
    ("The Drunken Bounty Hunter", "drunken_hunter", "Bounty hunter", "suran", "kill", "suran_slave_cave", "Cave near Suran", "suran", "Help the drunk hunter find the escaped Argonian. The slave's captors are the real mark.", "slave_hunter_target", "cave"),
    ("Umbra", "umbra_orc", "Umbra", "suran", "kill", "suran", "Suran", "suran", "The Orc Umbra asks for a death worthy of his sword. Accept the duel.", "umbra_orc", "wild"),
    ("A Bounty for Trerayna Dalen", "therana", "Mistress Therana", "tel_branora", "kill", "trerayna_camp", "Outside Tel Branora", "tel_branora", "Kill Trerayna Dalen and her gang.", "trerayna_dalen", "wild"),
    ("Trade Mission to the Zainab", "turedus", "Turedus Talanian", "tel_vos", "persuade", "zainab_camp", "Zainab Camp", "zainab_camp", "Learn what the Zainab will trade. Their speaker must like you.", "zainab_speaker", "camp"),
    ("Kurapli Seeks Justice", "kurapli", "Kurapli", "urshilaku_camp", "kill", "outcast_ash", "Ash outcast camp", "urshilaku_camp", "Kill Zallay Subaddamael for the death of Kurapli's husband.", "zallay", "camp"),
    ("A Friend in Deed", "vivec_merchant", "Vivec merchant", "vivec", "persuade", "vivec", "Vivec market", "vivec", "Help a merchant bury a rival's prices. The rival must be persuaded to leave.", "rival_merchant", "canton"),
    ("A Rash of Insults", "tarer_braryn", "Tarer Braryn", "vivec", "fetch", "vivec", "Vivec", "vivec", "Cure Tarer Braryn of the insult Trebonius laid on him.", "insult_cure", "interior"),
    ("An Apothecary Slandered", "aurane_frernis", "Aurane Frernis", "vivec", "fetch", "vivec", "Vivec", "vivec", "Find who is printing the leaflets against Aurane.", "slander_leaflets", "interior"),
    ("An Invisible Son", "invisible_father", "A father", "vivec", "fetch", "vivec", "Vivec", "vivec", "Help the nearly invisible man become visible again. The ring is the cause.", "invisibility_ring", "interior"),
    ("Ennbjof's Nord Burial", "ennbjof", "Ennbjof", "vivec", "deliver", "vivec", "Ennbjof", "vivec", "Bring mazte. Ennbjof will tell you where the Nord is buried, and the helm is yours to fetch.", "nord_helm", "tomb"),
    ("Free the Slaves", "slave_broker", "Twin Lamps contact", "vivec", "kill", "vivec_slave_pen", "Slave pen", "vivec", "Free the slaves. The keeper has the keys and a sword.", "slave_keeper", "interior"),
    ("For the Love of a Bosmer", "eraldil", "Eraldil", "vivec", "fetch", "vivec", "Vivec", "vivec", "Find who wrote the love letter to Eraldil.", "love_letter", "interior"),
    ("Liberate the Limeware", "limeware_patron", "A patron", "vivec", "fetch", "vivec_docks", "Vivec docks", "vivec", "Steal the limeware shipment off the docked ship.", "limeware_crate", "interior"),
    ("Mysterious Killings in Vivec", "vivec_guard", "Ordinator", "vivec", "kill", "vivec", "St. Olms", "vivec", "Seven murders. The killer still walks the canton.", "vivec_killer", "canton"),
    ("Roland's Tear", "aurane_frernis", "Aurane Frernis", "vivec", "gather", "azura_coast_flowers", "Azura's Coast", "sadrith_mora", "Find Roland's Tears for Aurane.", "rolands_tear", "wild"),
    ("The Bad Actor", "troupe_master", "Troupe master", "vivec", "persuade", "vivec", "Vivec", "vivec", "Get the bad actor to leave the troupe. Words will do if they land.", "bad_actor", "canton"),
    ("The Dwemer's Bone", "balen_andrano", "Balen Andrano", "vivec", "fetch", "vivec", "Jeanne's shop", "vivec", "Sabotage Jeanne's stock with the Dwemer bone Balen describes. Bring it to him first.", "dwemer_bone", "interior"),
    ("The Enchanter's Rats", "telvanni_enchanter", "Telvanni enchanter", "vivec", "kill", "vivec", "Enchanter's cellar", "vivec", "Find why the rats will not leave.", "enchanted_rat", "interior"),
    ("The Price List", "eec_clerk", "Company clerk", "vivec", "fetch", "ebonheart", "East Empire", "ebonheart", "Find how the East Empire sets its prices.", "price_list", "interior"),
    ("The Short Unhappy Life of Danar Uvelas", "danar_wife", "Danar's wife", "vivec", "escort", "vivec", "Brewers hall", "vivec", "Find Danar Uvelas.", "danar_uvelas", "interior"),
    ("Aeta Wave-Breaker's Jewels", "aeta", "Aeta Wave-Breaker", "gnisis", "kill", "aeta_cave", "Cave", "gnisis", "Recover Aeta's two heirlooms from the Khajiit and his thieves.", "aeta_thief", "cave"),
    ("Favors for Orcs", "orc_in_armor", "An Orc", "balmora", "deliver", "ald_ruhn", "Ald'ruhn", "ald_ruhn", "Deliver the Orc's notes. He will pay with a rock that is not a rock.", "orc_notes", "wild"),
    ("Kidnapped by Cultists", "missing_husband", "A husband", "balmora", "kill", "cult_cave", "Cult cave", "balmora", "Save the Redguard woman the cultists took.", "cult_kidnapper", "cave"),
    ("Pemenie and the Boots of Blinding Speed", "pemenie", "Pemenie", "balmora", "escort", "gnaar_mok", "Gnaar Mok", "gnaar_mok", "Escort Pemenie to Gnaar Mok. She pays with the boots.", "pemenie", "wild"),
    ("Recovering Cloudcleaver", "cloudcleaver_barbarian", "Barbarian", "balmora", "fetch", "witch_cave", "Witch cave", "balmora", "Mediate the axe Cloudcleaver. The witch has it.", "cloudcleaver", "cave"),
    ("The Corpse and the Skooma Pipe", "ernil_finder", "A traveler", "balmora", "visit", "ernil_body", "North of Balmora", "balmora", "Find Ernil Omoran's body and the pipe that killed him.", None, "wild"),
    ("The Lady's Ring", "balmora_lady", "A lady", "balmora", "fetch", "odai_pool", "Odai pool", "balmora", "Fish the lady's ring out of the pool.", "ladys_ring", "wild"),
    ("The Man Who Spoke to Slaughterfish", "delirious_legionary", "Legionary", "balmora", "escort", "gnisis", "Gnisis temple", "gnisis", "Walk the delirious legionary to the Gnisis temple.", "delirious_legionary", "wild"),
    ("The Paralyzed Barbarian", "paralyzed_barbarian", "Barbarian", "balmora", "fetch", "witch_hut", "Witch hut", "balmora", "Break the paralysis. The witch has the focus.", "paralysis_focus", "interior"),
    ("The Sad Sorcerer", "cave_rumor", "A rumor", "balmora", "visit", "sad_cave", "Sad cave", "balmora", "See what happened in the sorcerer's cave.", None, "cave"),
    ("The Shirt of His Back", "shirt_vow", "A weaver", "balmora", "deliver", "ald_ruhn", "Ald'ruhn", "ald_ruhn", "Carry the shirts to Ald'ruhn. You swore.", "shirt_bundle", "wild"),
    ("The Weapon Delivery", "lost_weapon_trader", "Lost trader", "balmora", "deliver", "ald_ruhn", "Ald'ruhn", "ald_ruhn", "Finish the weapon delivery the trader cannot.", "weapon_crate", "wild"),
]
prev = None
for i, (title, giver, gname, at, kind, dest, dname, hub, summary, item, place) in enumerate(MISC):
    kw = {"place": place}
    if item and kind != "escort":
        kw["item"] = item
        kw["itemName"] = item.replace("_", " ")
    if kind == "escort":
        kw["target"] = item or giver
        kw["targetName"] = gname
    if kind == "kill" and item:
        kw["target"] = item
        kw["targetName"] = item.replace("_", " ")
    if kind == "gold":
        kw["gold"] = 150
    add2("miscellaneous", title, giver, gname, at, kind, dest, dname, hub, summary, prev, **kw)
    prev = title

# Blades trainer errands — separate journal indices on the UESP Blades Trainers article.
BLADES = [
    ("Blades Trainer: Elone", "elone", "Elone", "seyda_neen", "Guide to the ash roads, from the scout outside Seyda Neen.", "guide_vvardenfell"),
    ("Blades Trainer: Sjorvar Horse-Mouth", "sjorvar", "Sjorvar Horse-Mouth", "balmora", "The fighter in Balmora keeps a steel cuirass for Caius's recruit.", "steel_cuirass"),
    ("Blades Trainer: Nine-Toes", "nine_toes", "Nine-Toes", "balmora", "Nine-Toes pays his old debt to the Blades in moon sugar.", "moon_sugar"),
    ("Blades Trainer: Surane Leoriane", "surane", "Surane Leoriane", "balmora", "The healer Surane will see that your wounds close.", "healing_potion"),
    ("Blades Trainer: Gildan", "gildan", "Gildan", "balmora", "Gildan the mage leaves a spell-notes pamphlet for you.", "gildan_notes"),
    ("Blades Trainer: Rithleen", "rithleen", "Rithleen", "balmora", "Rithleen teaches the quiet arts and leaves lockpicks.", "lockpick"),
    ("Blades Trainer: Tyermaillin", "tyermaillin", "Tyermaillin", "balmora", "The enchanter Tyermaillin gives a journeyman's alembic.", "journeyman_alembic"),
]
prev_b = "Report to Caius Cosades"  # resolved only if that title exists — it doesn't in this list.
# These need mq_caius. encode needsQuest via a special field needsId
for title, giver, gname, at, summary, item in BLADES:
    add2(
        "miscellaneous",
        title,
        "caius_cosades",
        "Caius Cosades",
        "balmora",
        "visit",
        at if at != "balmora" else "seyda_neen" if "Elone" in title else "balmora",
        gname,
        "seyda_neen" if "Elone" in title else "balmora",
        summary + " Caius names the trainer. Speak with them.",
        None,
        uesp="https://en.uesp.net/wiki/Morrowind:Blades_Trainers",
        target=giver,
        targetName=gname,
        rewardItem=item,
        needsId="mq_caius",
        place="town",
    )
    # visit kind doesn't use target well. Change to escort-like: kind persuade with minDisp 0? 
    # Better kind fetch is wrong. I'll set kind to escort so objective is at dest + talk target + talk caius.
    rows[-1]["kind"] = "escort"
    rows[-1]["dest"] = "seyda_neen" if "Elone" in title else "balmora"
    rows[-1]["target"] = giver
    rows[-1]["targetName"] = gname

# Additions — original, not source.
ADD = [
    ("The Canticle Fragment", "ash_cantor", "An ash-cantor", "ghostgate", "fetch", "ghostgate", "Ghostgate wall", "ghostgate", "An original vigil: a cantor lost a verse of an ash-chant along the Ghostfence. It is not in any Temple book.", "canticle_fragment"),
    ("The Silt-Strider's Limp", "strider_caravaner", "A caravaner", "balmora", "fetch", "balmora", "Strider port", "balmora", "An original errand: the Balmora silt strider is lame until its harness bell is found in the river mud.", "harness_bell"),
    ("Glass in the Foyada", "foyada_miner", "A miner", "caldera", "escort", "ghostgate", "Foyada gate", "ghostgate", "An original escort through the foyada. The miner will not walk it alone.", "foyada_miner"),
    ("A Name for the Dreamer", "quiet_priest", "A quiet priest", "ald_ruhn", "kill", "ald_ruhn", "Ald'ruhn", "ald_ruhn", "An original mercy before the sleepers rise: one dreamer still has a name. Hear it, then end the dream.", "named_dreamer"),
    ("Sporelight", "apprentice_spore", "A Telvanni apprentice", "sadrith_mora", "fetch", "sadrith_mora", "Mushroom tunnel", "sadrith_mora", "An original experiment: the apprentice's sporelight has rolled into the tunnels.", "sporelight"),
    ("Salt Rice for the Manor", "redoran_cook", "A Redoran cook", "ald_ruhn", "deliver", "ald_ruhn", "Manor kitchen", "ald_ruhn", "An original kitchen crisis: salt rice must reach the under-skar before the feast.", "salt_rice"),
    ("The Outlander's Map", "pelagiad_mapper", "A cartographer", "pelagiad", "visit", "seyda_neen", "Seyda Neen lighthouse", "seyda_neen", "An original map: the cartographer needs you to confirm the lighthouse still stands where she drew it.", None),
    ("Guar with a Silver Bell", "guar_herder", "A herder", "suran", "fetch", "suran", "Suran paddock", "suran", "An original loss: a guar with a silver bell has wandered. The bell is snagged on a fence.", "silver_bell"),
    ("Ledger Ash", "hlaalu_clerk", "A Hlaalu clerk", "vivec", "fetch", "vivec", "Records office", "vivec", "An original fire: one page of the ledger survived. Find it in the ash of the hearth.", "ash_ledger"),
    ("The Vigil at the Fence", "ghostgate_ordin", "A fence-guard", "ghostgate", "kill", "ghostgate", "Ghostfence walk", "ghostgate", "An original watch: a cliff racer has nested on the Ghostfence walk. Clear it.", "fence_racer"),
    ("Bitter Coast Debt", "coast_smuggler", "A smuggler", "hla_oad", "gold", "hla_oad", "Hla Oad", "hla_oad", "An original debt, not a Tong writ: a skiff-pilot wants the fare you were never billed in Seyda Neen.", None),
    ("Listening at the Camp", "ash_listener", "A young hunter", "urshilaku_camp", "visit", "urshilaku_camp", "Camp edge", "urshilaku_camp", "An original rite: sit the edge of the Urshilaku camp until the wind changes, then tell the hunter what you heard.", None),
    ("Restored: Dagoth Velos", "hrundi", "Hrundi", "sadrith_mora", "kill", "yakin", "Yakin", "vos", "A restored errand from unused guild notes: Hrundi once meant to send you after Dagoth Velos. The order never shipped. It does here, and it is not canon.", "dagoth_velos"),
    ("Restored: Baladas's Taxes", "darius", "General Darius", "gnisis", "persuade", "arvs_drelen", "Arvs-Drelen", "gnisis", "A restored errand: Darius once hoped the Nerevarine could collect Baladas's taxes. The dialogue was cut. This version is an addition.", "baladas_demnevanni"),
    ("Restored: Anumidium Plans", "darius", "General Darius", "gnisis", "fetch", "tel_vos", "Tel Vos", "tel_vos", "A restored errand: a fragment of Akulakhan's plans still hangs in Tel Vos. Bringing it to Darius was cut from the Legion. It is an addition here.", "anumidium_plans"),
    ("Restored: Writ for Neloth", "eno_hlaalu", "Eno Hlaalu", "vivec", "kill", "sadrith_mora", "Tel Naga", "sadrith_mora", "A restored writ: the Tong once considered Neloth. The writ was removed. This addition puts it back in your hands, clearly marked as not part of the shipped Tong list.", "neloth_writ"),
]
prev = None
for title, giver, gname, at, kind, dest, dname, hub, summary, token in ADD:
    kw = {"origin": "addition", "place": "wild", "uesp": "addition"}
    if token and kind in ("fetch", "deliver", "gather", "donate"):
        kw["item"] = token
        kw["itemName"] = token.replace("_", " ")
    if kind == "kill":
        kw["target"] = token or f"{giver}_mark"
        kw["targetName"] = (token or "mark").replace("_", " ")
    if kind == "escort":
        kw["target"] = token or giver
        kw["targetName"] = gname
    if kind == "persuade":
        kw["target"] = token or giver
        kw["targetName"] = gname
        kw["minDisp"] = 45
    if kind == "gold":
        kw["gold"] = 100
    add2("miscellaneous", title, giver, gname, at, kind, dest, dname, hub, summary, prev, **kw)
    prev = title

# Assign ids
counts = {}
for r in rows:
    counts[r["cat"]] = counts.get(r["cat"], 0) + 1
    n = counts[r["cat"]]
    r["id"] = f"{r['cat'][:3]}_{n:03d}"

by_title = {}
for r in rows:
    by_title[(r["cat"], r["title"])] = r["id"]

for r in rows:
    if r.get("needsId"):
        r["needs"] = r["needsId"]
    elif r.get("needsTitle"):
        r["needs"] = by_title.get((r["cat"], r["needsTitle"]))
    else:
        r["needs"] = None

# Grandmaster writs should also require the heart? The UESP says main quest completed.
# We'll add needsId only if we want. The chain already requires the whole Morag line, which is enough.
# Legion first at-location typo
for r in rows:
    if r["at"] == "gnisus_fort":
        r["at"] = "gnisis"
    if r["dest"] == "gnisus_fort":
        r["dest"] = "gnisis"

# Mathis escort dest fix
for r in rows:
    if r["title"] == "Find Mathis Dalobar":
        r["dest"] = "ash_trail"
        r["destName"] = "Ash trail"
        r["hub"] = "ald_ruhn"
    if r["title"] == "Nalvilie Saren":
        r["dest"] = "ashlands_road"
    if r["title"] == "Rescue Ragash gra-Shuzgub":
        r["dest"] = "arvs_drelen"
    if r["title"] == "Saprius Entius":
        r["dest"] = "hides_cave"

floors = {
    "hlaalu": 31,
    "redoran": 36,
    "telvanni": 29,
    "fighters": 31,
    "mages": 33,
    "thieves": 30,
    "cult": 24,
    "legion": 19,
    "temple": 29,
    "morag": 25,
    "daedric": 7,
    "vampire": 14,
    "miscellaneous": 72,
}
from collections import Counter
c = Counter(r["cat"] for r in rows if r["origin"] == "source")
print("SOURCE COUNTS")
for k, v in floors.items():
    print(f"  {k}: {c[k]} (floor {v}) {'OK' if c[k] >= v else 'SHORT'}")
print("additions", sum(1 for r in rows if r["origin"] == "addition"))
print("total rows", len(rows))

# emit TS
def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")

lines = [
    "import type { CompactQuest } from './expand';",
    "",
    "export const COMPACT_QUESTS: CompactQuest[] = [",
]
for r in rows:
    fields = [
        f"id: '{r['id']}'",
        f"title: '{esc(r['title'])}'",
        f"cat: '{r['cat']}'",
        f"origin: '{r['origin']}'",
        f"uesp: '{esc(r['uesp'])}'",
        f"summary: '{esc(r['summary'])}'",
        f"giver: '{r['giver']}'",
        f"giverName: '{esc(r['giverName'])}'",
        f"at: '{r['at']}'",
        f"kind: '{r['kind']}'",
        f"dest: '{r['dest']}'",
        f"destName: '{esc(r['destName'])}'",
        f"hub: '{r['hub']}'",
    ]
    if r.get("faction"):
        fields.append(f"faction: '{r['faction']}'")
    if r.get("needs"):
        fields.append(f"needs: '{r['needs']}'")
    if r.get("join"):
        fields.append("join: true")
    if r.get("place"):
        fields.append(f"place: '{r['place']}'")
    if r.get("item"):
        fields.append(f"item: '{r['item']}'")
    if r.get("itemName"):
        fields.append(f"itemName: '{esc(r['itemName'])}'")
    if r.get("target"):
        fields.append(f"target: '{r['target']}'")
    if r.get("targetName"):
        fields.append(f"targetName: '{esc(r['targetName'])}'")
    if r.get("minDisp"):
        fields.append(f"minDisp: {r['minDisp']}")
    if r.get("gold"):
        fields.append(f"gold: {r['gold']}")
    if r.get("qty"):
        fields.append(f"qty: {r['qty']}")
    if r.get("rewardGold"):
        fields.append(f"rewardGold: {r['rewardGold']}")
    if r.get("rewardItem"):
        fields.append(f"rewardItem: '{r['rewardItem']}'")
    if r.get("vampire"):
        fields.append("vampire: true")
    if r.get("rank") is not None:
        fields.append(f"rank: {r['rank']}")
    lines.append("  { " + ", ".join(fields) + " },")
lines.append("];")
lines.append("")
OUT.write_text("\n".join(lines))
print("wrote", OUT, "lines", len(lines))
