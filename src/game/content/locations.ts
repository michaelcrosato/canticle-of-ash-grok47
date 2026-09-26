import type { LocationDef, PlaceKind, RegionId } from '../types';

interface Hub {
  id: string;
  name: string;
  region: RegionId;
  kind: PlaceKind;
  x: number;
  y: number;
  walk?: string[];
  silt?: string[];
  boat?: string[];
  guide?: string[];
}

const H: Hub[] = [
  { id: 'prison_ship', name: 'Imperial Prison Ship', region: 'bitter_coast', kind: 'ship', x: 150, y: 900, walk: ['seyda_neen'] },
  { id: 'census_office', name: 'Census and Excise', region: 'bitter_coast', kind: 'interior', x: 142, y: 868, walk: ['seyda_neen'] },
  { id: 'seyda_neen', name: 'Seyda Neen', region: 'bitter_coast', kind: 'town', x: 140, y: 860, walk: ['prison_ship', 'census_office', 'hla_oad', 'pelagiad'], silt: ['balmora', 'vivec', 'suran', 'gnisis'], boat: ['hla_oad', 'ebonheart', 'vivec'] },
  { id: 'hla_oad', name: 'Hla Oad', region: 'bitter_coast', kind: 'town', x: 70, y: 790, walk: ['seyda_neen', 'gnaar_mok'], boat: ['seyda_neen', 'gnaar_mok'] },
  { id: 'gnaar_mok', name: 'Gnaar Mok', region: 'bitter_coast', kind: 'town', x: 60, y: 680, walk: ['hla_oad'], boat: ['hla_oad', 'khuul'] },
  { id: 'pelagiad', name: 'Pelagiad', region: 'ascadian', kind: 'town', x: 210, y: 740, walk: ['seyda_neen', 'balmora', 'moonmoth_fort'] },
  { id: 'moonmoth_fort', name: 'Moonmoth Legion Fort', region: 'ascadian', kind: 'stronghold', x: 190, y: 680, walk: ['pelagiad', 'balmora'] },
  { id: 'balmora', name: 'Balmora', region: 'west_gash', kind: 'town', x: 200, y: 600, walk: ['pelagiad', 'caldera', 'moonmoth_fort', 'vivec'], silt: ['seyda_neen', 'ald_ruhn', 'suran', 'vivec'], guide: ['ald_ruhn', 'vivec', 'caldera', 'sadrith_mora'] },
  { id: 'caldera', name: 'Caldera', region: 'west_gash', kind: 'town', x: 250, y: 500, walk: ['balmora', 'ald_ruhn'], guide: ['balmora', 'ald_ruhn', 'vivec', 'sadrith_mora'] },
  { id: 'vivec', name: 'Vivec', region: 'ascadian', kind: 'canton', x: 300, y: 930, walk: ['balmora', 'ebonheart', 'suran'], silt: ['balmora', 'seyda_neen', 'suran', 'molag_mar'], boat: ['ebonheart', 'molag_mar', 'tel_branora', 'seyda_neen'], guide: ['balmora', 'ald_ruhn', 'caldera', 'sadrith_mora'] },
  { id: 'ebonheart', name: 'Ebonheart', region: 'ascadian', kind: 'town', x: 360, y: 900, walk: ['vivec'], boat: ['vivec', 'seyda_neen'] },
  { id: 'suran', name: 'Suran', region: 'ascadian', kind: 'town', x: 430, y: 800, walk: ['vivec', 'molag_mar'], silt: ['balmora', 'seyda_neen', 'vivec', 'molag_mar'] },
  { id: 'molag_mar', name: 'Molag Mar', region: 'molag_amur', kind: 'town', x: 560, y: 760, walk: ['suran', 'erabenimsun_camp', 'tel_branora'], silt: ['vivec', 'suran'], boat: ['vivec', 'tel_branora'] },
  { id: 'ald_ruhn', name: "Ald'ruhn", region: 'ashlands', kind: 'town', x: 340, y: 300, walk: ['caldera', 'maar_gan', 'ghostgate', 'buckmoth_fort', 'urshilaku_camp'], silt: ['balmora', 'maar_gan', 'gnisis', 'khuul'], guide: ['balmora', 'vivec', 'caldera', 'sadrith_mora'] },
  { id: 'buckmoth_fort', name: 'Buckmoth Legion Fort', region: 'ashlands', kind: 'stronghold', x: 360, y: 340, walk: ['ald_ruhn'] },
  { id: 'maar_gan', name: 'Maar Gan', region: 'ashlands', kind: 'town', x: 300, y: 210, walk: ['ald_ruhn', 'gnisis', 'urshilaku_camp'], silt: ['ald_ruhn', 'gnisis'] },
  { id: 'gnisis', name: 'Gnisis', region: 'west_gash', kind: 'town', x: 170, y: 170, walk: ['maar_gan', 'khuul', 'koal_cave'], silt: ['ald_ruhn', 'maar_gan', 'seyda_neen', 'khuul'] },
  { id: 'koal_cave', name: 'Koal Cave', region: 'west_gash', kind: 'cave', x: 200, y: 230, walk: ['gnisis'] },
  { id: 'khuul', name: 'Khuul', region: 'west_gash', kind: 'town', x: 110, y: 90, walk: ['gnisis', 'ald_velothi'], silt: ['ald_ruhn', 'gnisis', 'maar_gan'], boat: ['gnaar_mok', 'dagon_fel'] },
  { id: 'ald_velothi', name: 'Ald Velothi', region: 'sheogorad', kind: 'town', x: 150, y: 40, walk: ['khuul', 'dagon_fel'] },
  { id: 'dagon_fel', name: 'Dagon Fel', region: 'sheogorad', kind: 'town', x: 560, y: 30, walk: ['ald_velothi', 'vos'], boat: ['khuul', 'sadrith_mora', 'tel_mora'] },
  { id: 'ghostgate', name: 'Ghostgate', region: 'red_mountain', kind: 'gate', x: 480, y: 500, walk: ['ald_ruhn', 'red_mountain'] },
  { id: 'red_mountain', name: 'Red Mountain', region: 'red_mountain', kind: 'wild', x: 500, y: 400, walk: ['ghostgate', 'vemynal', 'odrosal', 'endusal', 'tureynulal', 'dagoth_ur_citadel'] },
  { id: 'vemynal', name: 'Vemynal', region: 'red_mountain', kind: 'citadel', x: 440, y: 350, walk: ['red_mountain'] },
  { id: 'odrosal', name: 'Odrosal', region: 'red_mountain', kind: 'citadel', x: 570, y: 350, walk: ['red_mountain'] },
  { id: 'endusal', name: 'Endusal', region: 'red_mountain', kind: 'citadel', x: 420, y: 450, walk: ['red_mountain'] },
  { id: 'tureynulal', name: 'Tureynulal', region: 'red_mountain', kind: 'citadel', x: 590, y: 450, walk: ['red_mountain'] },
  { id: 'dagoth_ur_citadel', name: "Dagoth Ur's Citadel", region: 'red_mountain', kind: 'citadel', x: 500, y: 330, walk: ['red_mountain', 'heart_chamber'] },
  { id: 'heart_chamber', name: 'Heart of Lorkhan', region: 'red_mountain', kind: 'interior', x: 500, y: 320, walk: ['dagoth_ur_citadel'] },
  { id: 'urshilaku_camp', name: 'Urshilaku Camp', region: 'ashlands', kind: 'camp', x: 420, y: 110, walk: ['ald_ruhn', 'maar_gan', 'cavern_of_the_incarnate'] },
  { id: 'cavern_of_the_incarnate', name: 'Cavern of the Incarnate', region: 'ashlands', kind: 'cave', x: 480, y: 160, walk: ['urshilaku_camp'] },
  { id: 'ahemmusa_camp', name: 'Ahemmusa Camp', region: 'grazelands', kind: 'camp', x: 680, y: 110, walk: ['vos', 'ald_daedroth'] },
  { id: 'ald_daedroth', name: 'Ald Daedroth', region: 'sheogorad', kind: 'daedric', x: 640, y: 70, walk: ['ahemmusa_camp'] },
  { id: 'zainab_camp', name: 'Zainab Camp', region: 'grazelands', kind: 'camp', x: 640, y: 280, walk: ['vos', 'tel_vos'] },
  { id: 'erabenimsun_camp', name: 'Erabenimsun Camp', region: 'molag_amur', kind: 'camp', x: 700, y: 640, walk: ['molag_mar'] },
  { id: 'vos', name: 'Vos', region: 'grazelands', kind: 'town', x: 700, y: 190, walk: ['tel_mora', 'tel_vos', 'zainab_camp', 'ahemmusa_camp', 'dagon_fel'] },
  { id: 'tel_mora', name: 'Tel Mora', region: 'grazelands', kind: 'tower', x: 780, y: 130, walk: ['vos'], boat: ['dagon_fel', 'sadrith_mora'] },
  { id: 'tel_vos', name: 'Tel Vos', region: 'grazelands', kind: 'tower', x: 720, y: 250, walk: ['vos', 'zainab_camp'] },
  { id: 'tel_aruhn', name: 'Tel Aruhn', region: 'azura_coast', kind: 'tower', x: 820, y: 360, walk: ['sadrith_mora'] },
  { id: 'sadrith_mora', name: 'Sadrith Mora', region: 'azura_coast', kind: 'town', x: 880, y: 430, walk: ['tel_aruhn', 'tel_fyr', 'tel_branora', 'wolverine_hall'], boat: ['tel_branora', 'tel_fyr', 'dagon_fel', 'tel_mora'], guide: ['balmora', 'ald_ruhn', 'vivec', 'caldera'] },
  { id: 'wolverine_hall', name: 'Wolverine Hall', region: 'azura_coast', kind: 'stronghold', x: 900, y: 410, walk: ['sadrith_mora'] },
  { id: 'tel_fyr', name: 'Tel Fyr', region: 'azura_coast', kind: 'tower', x: 930, y: 560, walk: ['sadrith_mora', 'corprusarium'], boat: ['sadrith_mora'] },
  { id: 'corprusarium', name: 'Corprusarium', region: 'azura_coast', kind: 'interior', x: 940, y: 580, walk: ['tel_fyr'] },
  { id: 'tel_branora', name: 'Tel Branora', region: 'azura_coast', kind: 'tower', x: 840, y: 820, walk: ['molag_mar', 'sadrith_mora'], boat: ['molag_mar', 'vivec', 'sadrith_mora'] },
];

const DIVINE = ['pelagiad', 'ebonheart', 'moonmoth_fort', 'buckmoth_fort', 'gnisis', 'wolverine_hall'];
const ALMSIVI = ['balmora', 'vivec', 'ald_ruhn', 'molag_mar', 'gnisis', 'ghostgate'];

function nearest(id: string, hubs: Hub[], options: string[]): string {
  const here = hubs.find((h) => h.id === id)!;
  let best = options[0]!;
  let bestD = Infinity;
  for (const oid of options) {
    const o = hubs.find((h) => h.id === oid);
    if (!o) continue;
    const d = (o.x - here.x) ** 2 + (o.y - here.y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = oid;
    }
  }
  return best;
}

export function baseLocations(): LocationDef[] {
  return H.map((h) => ({
    id: h.id,
    name: h.name,
    region: h.region,
    kind: h.kind,
    x: h.x,
    y: h.y,
    walk: [...(h.walk ?? [])],
    silt: [...(h.silt ?? [])],
    boat: [...(h.boat ?? [])],
    guide: [...(h.guide ?? [])],
    divine: nearest(h.id, H, DIVINE),
    almsivi: nearest(h.id, H, ALMSIVI),
    markable: true,
  }));
}

export function attachSite(
  locations: LocationDef[],
  site: { id: string; name: string; hub: string; place: PlaceKind },
): void {
  if (locations.some((l) => l.id === site.id)) return;
  const hub = locations.find((l) => l.id === site.hub) ?? locations.find((l) => l.id === 'balmora')!;
  const divine = hub.divine;
  const almsivi = hub.almsivi;
  locations.push({
    id: site.id,
    name: site.name,
    region: hub.region,
    kind: site.place,
    x: hub.x + ((locations.length * 17) % 40) - 20,
    y: hub.y + ((locations.length * 13) % 40) - 20,
    walk: [hub.id],
    silt: [],
    boat: [],
    guide: [],
    divine,
    almsivi,
    markable: true,
  });
  if (!hub.walk.includes(site.id)) hub.walk.push(site.id);
}

export const REGION_TINT: Record<RegionId, string> = {
  bitter_coast: '#1d3a34',
  ascadian: '#3c5a32',
  west_gash: '#4a5340',
  ashlands: '#6a5844',
  red_mountain: '#5c2e28',
  grazelands: '#6d7a3e',
  azura_coast: '#35586a',
  molag_amur: '#6a4032',
  sheogorad: '#3d4a58',
};
