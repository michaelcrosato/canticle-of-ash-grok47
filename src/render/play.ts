import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  FogExp2,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { CONTENT } from '../game/content';
import { REGION_TINT } from '../game/content/locations';
import { admire, bribe, intimidate, levelUp, moveSpeed, taunt, useSkill } from '../game/formulas';
import { actionFromGamepadButton, actionFromKey, TOUCH_ACTIONS } from '../game/input-map';
import { castSpell, drinkPotion, enchantItem, give, hasQty, makeSpell, mixPotion, useEnchantment } from '../game/magic';
import { advanceQuest, branchClosed, chooseVivec, conditionMet, currentJournal, equipItem, isWraithguardEquipped, noteTalk, questRecord, strikeHeart } from '../game/quests';
import { readLocalSave, writeLocalSave } from '../game/save';
import { createNewGame, playerDefense, resolveStrike, rest, spellStrike, talkTo } from '../game/state';
import { canFight, canTravel, castTravelSpell, travelTo } from '../game/travel';
import type { CharacterChoices, GameAction, GameState, QuestDef, Specialty } from '../game/types';
import { ATTRIBUTES } from '../game/types';
import { ambientThreats, crowdSpots, doorSpots, nearestHostile, pickup, spawnsAt, type Ambient, type SpawnView } from '../game/world';
import { AshAudio } from './audio';
import { clampPitch, moveVectorFromCamera } from './frame';

interface Actor {
  id: string;
  name: string;
  x: number;
  z: number;
  homeX: number;
  homeZ: number;
  leash: number;
  hp: number;
  max: number;
  hostile: boolean;
  kind: string;
  mesh: Group;
  spawn?: SpawnView;
  item?: string;
  swing: number;
}

const wish = new Vector3();

export class Canticle {
  readonly root: HTMLElement;
  readonly audio = new AshAudio();
  state: GameState | null = null;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(68, 1, 0.08, 220);
  private world = new Group();
  private actors: Actor[] = [];
  private blocks: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
  private keys = new Set<string>();
  private forward = 0;
  private strafe = 0;
  private lookX = 0;
  private lookY = 0;
  private padPrev: boolean[] = [];
  private ui: HTMLElement;
  private floatTimer = 0;
  private gateAt = 0;
  private last = performance.now();
  private mode: 'title' | 'create' | 'play' | 'ending' = 'title';
  private choices: CharacterChoices = { name: 'Outlander', race: 'darkelf', birthsign: 'steed', classId: 'pilgrim' };
  private customMajor: string[] = [];
  private customMinor: string[] = [];
  private spec: Specialty = 'stealth';
  private useCustom = false;
  private selectedSpell = 'fire_bite';
  private raf = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    this.renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x1a120f, 1);
    this.camera.rotation.order = 'YXZ';
    this.scene.add(this.world);
    this.scene.fog = new FogExp2(0x2a211c, 0.028);
    this.scene.add(new HemisphereLight(0xffe0b0, 0x3a2a22, 0.85));
    const sun = new DirectionalLight(0xffc48a, 1.15);
    sun.position.set(30, 40, 10);
    this.scene.add(sun);
    this.scene.add(new AmbientLight(0x6a5344, 0.35));
    root.appendChild(this.renderer.domElement);
    this.ui = document.createElement('div');
    this.ui.id = 'ui';
    root.appendChild(this.ui);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
    let dragId: number | null = null;
    let dragX = 0;
    let dragY = 0;
    this.renderer.domElement.tabIndex = 0;
    this.renderer.domElement.addEventListener('pointerdown', (e) => {
      this.audio.ensure();
      if (this.mode !== 'play') return;
      dragId = e.pointerId;
      dragX = e.clientX;
      dragY = e.clientY;
      this.renderer.domElement.setPointerCapture(e.pointerId);
    });
    this.renderer.domElement.addEventListener('pointermove', (e) => {
      if (e.pointerId !== dragId || !this.state || this.mode !== 'play') return;
      this.state.yaw -= (e.clientX - dragX) * 0.005;
      this.state.pitch = clampPitch(this.state.pitch - (e.clientY - dragY) * 0.004);
      dragX = e.clientX;
      dragY = e.clientY;
    });
    this.renderer.domElement.addEventListener('pointerup', () => {
      dragId = null;
    });
    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== this.renderer.domElement || !this.state) return;
      this.state.yaw -= e.movementX * 0.0022;
      this.state.pitch = clampPitch(this.state.pitch - e.movementY * 0.002);
    });
    this.buildTitleVista();
    this.showTitle();
  }

  start(): void {
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.pollPad(dt);
      try {
        if (this.mode === 'play' && this.state) this.simulate(dt);
      } catch (err) {
        console.error(err);
      }
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private resize(): void {
    const w = this.root.clientWidth || window.innerWidth;
    const h = this.root.clientHeight || window.innerHeight;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  private buildTitleVista(): void {
    this.world.clear();
    const ground = new Mesh(
      new PlaneGeometry(180, 180),
      new MeshStandardMaterial({ color: 0x6a4032, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    this.world.add(ground);
    const mount = new Mesh(new ConeGeometry(16, 28, 7), new MeshStandardMaterial({ color: 0x8a3a2a, roughness: 0.9 }));
    mount.position.set(0, 14, -20);
    this.world.add(mount);
    const ruin = new Mesh(new BoxGeometry(6, 4, 4), new MeshStandardMaterial({ color: 0x8d7048 }));
    ruin.position.set(-8, 2, -4);
    this.world.add(ruin);
    const tower = new Mesh(new CylinderGeometry(1.2, 2, 8, 6), new MeshStandardMaterial({ color: 0x6d7a3e }));
    tower.position.set(10, 4, -8);
    this.world.add(tower);
    this.camera.position.set(0, 6, 22);
    this.camera.lookAt(0, 8, -10);
  }

  private showTitle(): void {
    this.mode = 'title';
    this.ui.innerHTML = '';
    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.innerHTML = `
      <div class="sub">A prophecy of Vvardenfell</div>
      <h1>Canticle of Ash</h1>
      <div class="credit">2026-09-26 · Grok 4.7</div>
      <div class="row"></div>`;
    const row = screen.querySelector('.row')!;
    const mk = (label: string, fn: () => void, primary = false) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (primary) b.className = 'primary';
      b.onclick = () => {
        this.audio.ensure();
        this.audio.ui();
        fn();
      };
      row.appendChild(b);
    };
    mk('New Game', () => this.showCreate(), true);
    mk('Continue', () => {
      const saved = readLocalSave();
      if (saved) this.begin(saved);
    });
    mk('Options', () => this.showOptions(true));
    this.ui.appendChild(screen);
  }

  private showCreate(): void {
    this.mode = 'create';
    const races = CONTENT.races;
    const signs = CONTENT.signs;
    const classes = CONTENT.classes;
    const skills = CONTENT.skills;
    const paint = () => {
      this.ui.innerHTML = '';
      const panel = document.createElement('div');
      panel.className = 'panel';
      panel.innerHTML = `<h2>Who wakes on the ship</h2>`;
      const name = document.createElement('input');
      name.value = this.choices.name;
      name.maxLength = 24;
      name.style.width = '100%';
      name.style.minHeight = '44px';
      name.style.marginBottom = '8px';
      name.oninput = () => (this.choices.name = name.value);
      panel.appendChild(name);
      panel.appendChild(this.heading('People'));
      const rg = document.createElement('div');
      rg.className = 'grid';
      for (const r of races) {
        const b = document.createElement('button');
        b.className = 'card' + (this.choices.race === r.id ? ' on' : '');
        b.innerHTML = `<strong>${r.name}</strong><small>${r.lore}</small>`;
        b.onclick = () => {
          this.choices.race = r.id;
          paint();
        };
        rg.appendChild(b);
      }
      panel.appendChild(rg);
      panel.appendChild(this.heading('Star'));
      const sg = document.createElement('div');
      sg.className = 'grid';
      for (const s of signs) {
        const b = document.createElement('button');
        b.className = 'card' + (this.choices.birthsign === s.id ? ' on' : '');
        b.innerHTML = `<strong>${s.name}</strong><small>${s.lore}</small>`;
        b.onclick = () => {
          this.choices.birthsign = s.id;
          paint();
        };
        sg.appendChild(b);
      }
      panel.appendChild(sg);
      panel.appendChild(this.heading('Calling'));
      const toggle = document.createElement('button');
      toggle.textContent = this.useCustom ? 'Using a custom calling' : 'Using a preset calling';
      toggle.onclick = () => {
        this.useCustom = !this.useCustom;
        paint();
      };
      panel.appendChild(toggle);
      if (!this.useCustom) {
        const cg = document.createElement('div');
        cg.className = 'grid';
        for (const c of classes) {
          const b = document.createElement('button');
          b.className = 'card' + (this.choices.classId === c.id ? ' on' : '');
          b.innerHTML = `<strong>${c.name}</strong><small>${c.specialization} · ${c.lore}</small>`;
          b.onclick = () => {
            this.choices.classId = c.id;
            paint();
          };
          cg.appendChild(b);
        }
        panel.appendChild(cg);
      } else {
        const specs: Specialty[] = ['combat', 'magic', 'stealth'];
        const row = document.createElement('div');
        row.className = 'row';
        for (const s of specs) {
          const b = document.createElement('button');
          b.textContent = s;
          if (this.spec === s) b.className = 'primary';
          b.onclick = () => {
            this.spec = s;
            paint();
          };
          row.appendChild(b);
        }
        panel.appendChild(row);
        panel.appendChild(this.heading(`Major (${this.customMajor.length}/5) and minor (${this.customMinor.length}/5)`));
        const sg2 = document.createElement('div');
        sg2.className = 'grid';
        for (const sk of skills) {
          const b = document.createElement('button');
          const role = this.customMajor.includes(sk.id) ? 'major' : this.customMinor.includes(sk.id) ? 'minor' : '';
          b.className = 'card' + (role ? ' on' : '');
          b.innerHTML = `<strong>${sk.name}</strong><small>${role || sk.specialization}</small>`;
          b.onclick = () => {
            if (this.customMajor.includes(sk.id)) {
              this.customMajor = this.customMajor.filter((id) => id !== sk.id);
              if (this.customMinor.length < 5) this.customMinor.push(sk.id);
            } else if (this.customMinor.includes(sk.id)) {
              this.customMinor = this.customMinor.filter((id) => id !== sk.id);
            } else if (this.customMajor.length < 5) this.customMajor.push(sk.id);
            paint();
          };
          sg2.appendChild(b);
        }
        panel.appendChild(sg2);
      }
      const go = document.createElement('button');
      go.className = 'primary';
      go.textContent = 'Wake';
      go.onclick = () => this.wake();
      panel.appendChild(go);
      const back = document.createElement('button');
      back.textContent = 'Back';
      back.onclick = () => this.showTitle();
      panel.appendChild(back);
      this.ui.appendChild(panel);
    };
    paint();
  }

  private heading(text: string): HTMLElement {
    const h = document.createElement('h2');
    h.textContent = text;
    return h;
  }

  private wake(): void {
    if (this.useCustom) {
      if (this.customMajor.length !== 5 || this.customMinor.length !== 5) return;
      this.choices.custom = {
        name: 'Outlander',
        specialization: this.spec,
        major: [...this.customMajor],
        minor: [...this.customMinor],
      };
      this.choices.classId = undefined;
    } else {
      this.choices.custom = undefined;
      this.choices.classId ??= 'pilgrim';
    }
    this.audio.ensure();
    this.begin(createNewGame(this.choices));
  }

  private begin(state: GameState): void {
    this.state = state;
    this.mode = 'play';
    if (state.quality === 'high') this.renderer.shadowMap.enabled = true;
    this.ui.innerHTML = '';
    this.mountHud();
    this.mountTouch();
    this.enterLocation(true);
    this.toast('Jiub is waiting. Drag to look. Use speaks.', false);
  }

  private mountHud(): void {
    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.innerHTML = `
      <div class="bars">
        <div class="bar hp" title="Health"><span></span></div>
        <div class="bar mp" title="Magicka"><span></span></div>
        <div class="bar ft" title="Fatigue"><span></span></div>
      </div>
      <div class="questline"></div>
      <div class="compass"></div>`;
    this.ui.appendChild(hud);
    const fl = document.createElement('div');
    fl.className = 'float hidden';
    fl.id = 'float';
    this.ui.appendChild(fl);
  }

  private mountTouch(): void {
    const touch = document.createElement('div');
    touch.id = 'touch';
    touch.innerHTML = `<div class="stick"><div class="knob"></div></div><div class="look"></div><div class="tbuttons"></div>`;
    const buttons = touch.querySelector('.tbuttons')!;
    for (const action of TOUCH_ACTIONS) {
      const b = document.createElement('button');
      b.dataset.action = action;
      b.textContent = action === 'attack' ? 'Strike' : action === 'interact' ? 'Use' : action[0]!.toUpperCase() + action.slice(1);
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.audio.ensure();
        this.doAction(action);
      });
      buttons.appendChild(b);
    }
    this.bindStick(touch.querySelector('.stick') as HTMLElement, (x, y) => {
      this.strafe = x;
      this.forward = -y;
    });
    this.bindLook(touch.querySelector('.look') as HTMLElement);
    this.ui.appendChild(touch);
  }

  private bindStick(el: HTMLElement, set: (x: number, y: number) => void): void {
    const knob = el.querySelector('.knob') as HTMLElement;
    let id: number | null = null;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const cx = Math.max(-1, Math.min(1, x));
      const cy = Math.max(-1, Math.min(1, y));
      knob.style.left = `${50 + cx * 30}%`;
      knob.style.top = `${50 + cy * 30}%`;
      set(cx, cy);
    };
    el.addEventListener('pointerdown', (e) => {
      id = e.pointerId;
      el.setPointerCapture(id);
      move(e);
    });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerId === id) move(e);
    });
    const end = () => {
      id = null;
      knob.style.left = '50%';
      knob.style.top = '50%';
      set(0, 0);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  private bindLook(el: HTMLElement): void {
    let id: number | null = null;
    let lx = 0;
    let ly = 0;
    el.addEventListener('pointerdown', (e) => {
      id = e.pointerId;
      lx = e.clientX;
      ly = e.clientY;
      el.setPointerCapture(id);
    });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id || !this.state) return;
      this.state.yaw -= (e.clientX - lx) * 0.005;
      this.state.pitch = clampPitch(this.state.pitch - (e.clientY - ly) * 0.004);
      lx = e.clientX;
      ly = e.clientY;
    });
    el.addEventListener('pointerup', () => (id = null));
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    if (e.repeat) return;
    if (down) this.keys.add(e.code);
    else this.keys.delete(e.code);
    if (!down || this.mode !== 'play') return;
    const action = actionFromKey(e.code);
    if (action) {
      e.preventDefault();
      this.doAction(action);
    }
  }

  private pollPad(dt: number): void {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads?.[0];
    if (!pad || this.mode !== 'play' || !this.state) return;
    pad.buttons.forEach((b, i) => {
      const was = this.padPrev[i];
      if (b.pressed && !was) {
        const action = actionFromGamepadButton(i);
        if (action) this.doAction(action);
      }
      this.padPrev[i] = b.pressed;
    });
    const ax = pad.axes[0] ?? 0;
    const ay = pad.axes[1] ?? 0;
    if (Math.hypot(ax, ay) > 0.2) {
      this.strafe = ax;
      this.forward = -ay;
    }
    const lx = pad.axes[2] ?? 0;
    const ly = pad.axes[3] ?? 0;
    if (Math.abs(lx) > 0.15) this.state.yaw -= lx * dt * 1.6;
    if (Math.abs(ly) > 0.15) this.state.pitch = clampPitch(this.state.pitch - ly * dt * 1.2);
  }

  private doAction(action: GameAction): void {
    if (!this.state || this.mode !== 'play') return;
    this.audio.ensure();
    if (action === 'attack') this.playerAttack();
    else if (action === 'interact') this.interact();
    else if (action === 'magic') this.openMagic();
    else if (action === 'journal') this.openJournal();
    else if (action === 'inventory') this.openInventory();
    else if (action === 'map') this.openMap();
    else if (action === 'stats') this.openStats();
    else if (action === 'rest') {
      const r = rest(this.state);
      this.toast(r.vampire ? 'The dream takes you. You rise a vampire.' : 'You rest.', false);
      this.audio.reward();
    } else if (action === 'jump') {
      this.state.fatigue = Math.max(0, this.state.fatigue - 4);
      useSkill(this.state, 'acrobatics');
    } else if (action === 'menu') this.showOptions(false);
  }

  private simulate(dt: number): void {
    const state = this.state!;
    let f = this.forward;
    let s = this.strafe;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) f += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) f -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) s += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) s -= 1;
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = state.yaw;
    this.camera.rotation.x = state.pitch;
    this.camera.position.set(state.px, 1.62, state.pz);
    this.camera.updateMatrixWorld();
    moveVectorFromCamera(this.camera, { forward: f, strafe: s }, wish);
    if (wish.lengthSq() > 0.0001 && (state.released || state.location === 'prison_ship' || state.location === 'seyda_neen' || state.location === 'census_office')) {
      const speed = moveSpeed({ ...state, encumbrance: 0, capacity: 200 });
      wish.normalize().multiplyScalar(speed * dt);
      this.tryMove(state.px + wish.x, state.pz + wish.z);
      state.fatigue = Math.max(0, state.fatigue - dt * 0.6);
      if (Math.random() < dt * 0.35) useSkill(state, 'athletics', 0);
    }
    for (const actor of this.actors) {
      if (!actor.hostile || actor.hp <= 0) continue;
      const dx = state.px - actor.x;
      const dz = state.pz - actor.z;
      const d = Math.hypot(dx, dz) || 1;
      if (d < 14) {
        actor.x += (dx / d) * dt * 2.2;
        actor.z += (dz / d) * dt * 2.2;
      }
      const lx = actor.x - actor.homeX;
      const lz = actor.z - actor.homeZ;
      const ld = Math.hypot(lx, lz);
      if (ld > actor.leash) {
        actor.x = actor.homeX + (lx / ld) * actor.leash;
        actor.z = actor.homeZ + (lz / ld) * actor.leash;
      }
      actor.mesh.position.set(actor.x, 0, actor.z);
      if (d < 1.7 && state.released) {
        actor.swing -= dt;
        if (actor.swing <= 0) {
          actor.swing = 1.25;
          const def = playerDefense(state, CONTENT.items);
          const raw = 6 + Math.floor(Math.random() * 6);
          const dmg = Math.max(1, raw - Math.floor(def / 6));
          state.health = Math.max(0, state.health - dmg);
          this.toast(`-${dmg}`, true);
          this.audio.hit();
          if (state.health <= 0) {
            state.health = state.healthMax;
            state.location = 'seyda_neen';
            state.px = 0;
            state.pz = 4;
            this.toast('The ancestors drag you back to Seyda Neen.', false);
            this.enterLocation(true);
            return;
          }
        }
      }
    }
    if (state.camera === 'pullback') {
      const back = new Vector3();
      this.camera.getWorldDirection(back);
      this.camera.position.addScaledVector(back, -3.4);
      this.camera.position.y += 1.1;
    }
    const edge = 28;
    const gate = this.actors.find(
      (a) => a.kind === 'exit' && Math.hypot(a.x - state.px, a.z - state.pz) < 1.1,
    );
    if (gate && performance.now() > this.gateAt) {
      this.gateAt = performance.now() + 700;
      const dest = gate.id.slice(5);
      const allowed = state.released || ['seyda_neen', 'census_office', 'prison_ship'].includes(dest);
      if (allowed) {
        const res = travelTo(state, CONTENT.locations, dest, 'walk');
        if (res.ok) {
          this.enterLocation(true);
          return;
        }
      }
    }
    if (Math.abs(state.px) > edge || Math.abs(state.pz) > edge) {
      const loc = CONTENT.locations.get(state.location);
      const exits = loc?.walk ?? [];
      if (exits.length && state.released) {
        const dest = exits[0]!;
        const res = travelTo(state, CONTENT.locations, dest, 'walk');
        if (res.ok) this.enterLocation(true);
      } else {
        state.px = Math.max(-edge, Math.min(edge, state.px));
        state.pz = Math.max(-edge, Math.min(edge, state.pz));
      }
    }
    this.refreshHud();
    if (this.floatTimer > 0) {
      this.floatTimer -= dt;
      if (this.floatTimer <= 0) document.getElementById('float')?.classList.add('hidden');
    }
    if (state.ending && this.mode === 'play') this.showEnding();
  }

  private tryMove(x: number, z: number): void {
    const state = this.state!;
    const r = 0.45;
    const hit = (px: number, pz: number) =>
      this.blocks.some((b) => px > b.minX - r && px < b.maxX + r && pz > b.minZ - r && pz < b.maxZ + r);
    if (!hit(x, state.pz)) state.px = x;
    if (!hit(state.px, z)) state.pz = z;
  }

  private enterLocation(reset: boolean): void {
    const state = this.state!;
    state.flags[`seen:${state.location}`] = true;
    if (reset) {
      state.px = 0;
      state.pz = 4;
      state.py = 0;
    }
    this.world.clear();
    this.actors = [];
    this.blocks = [];
    const loc = CONTENT.locations.get(state.location);
    const region = loc?.region ?? 'ashlands';
    const tint = new Color(REGION_TINT[region] ?? '#4a4038');
    (this.scene.fog as FogExp2).color.copy(tint).multiplyScalar(1.4);
    this.renderer.setClearColor(tint.clone().multiplyScalar(0.55), 1);
    const interior = loc?.kind === 'ship' || loc?.kind === 'interior' || loc?.kind === 'tomb' || loc?.kind === 'cave';
    const floorColor = interior ? new Color('#6b4e32') : tint;
    const ground = new Mesh(new PlaneGeometry(80, 80), new MeshStandardMaterial({ color: floorColor, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    this.world.add(ground);
    if (interior) {
      (this.scene.fog as FogExp2).density = 0.012;
      for (const [x, z, sx, sz] of [[0, -2, 14, 0.4], [-7, 2, 0.4, 16], [7, 2, 0.4, 16]] as const) {
        const wall = new Mesh(new BoxGeometry(sx, 3.2, sz), new MeshStandardMaterial({ color: 0x4a3424, roughness: 0.95 }));
        wall.position.set(x, 1.6, z);
        this.world.add(wall);
      }
    } else {
      (this.scene.fog as FogExp2).density = 0.02;
    }
    if (region === 'red_mountain' || region === 'ashlands') {
      const m = new Mesh(new ConeGeometry(10, 18, 6), new MeshStandardMaterial({ color: 0x7a3428 }));
      m.position.set(-16, 9, -24);
      this.world.add(m);
    }
    if (loc?.kind === 'tower') {
      const stem = new Mesh(new CylinderGeometry(1.4, 2.2, 8, 7), new MeshStandardMaterial({ color: 0x6e8a48 }));
      stem.position.set(0, 4, -8);
      const cap = new Mesh(new SphereGeometry(2.4, 8, 6), new MeshStandardMaterial({ color: 0x8aaa58 }));
      cap.position.set(0, 8.2, -8);
      this.world.add(stem, cap);
    }
    if (loc?.kind === 'canton') {
      for (let i = 0; i < 3; i++) {
        const box = new Mesh(new BoxGeometry(8 - i, 2.2, 8 - i), new MeshStandardMaterial({ color: 0xc2b49a }));
        box.position.set(0, 1.1 + i * 2.2, -10);
        this.world.add(box);
      }
    }
    if ((loc?.silt.length ?? 0) > 0) {
      const shell = new Mesh(new SphereGeometry(1.6, 7, 6), new MeshStandardMaterial({ color: 0x8d5a32 }));
      shell.position.set(6, 6, 2);
      this.world.add(shell);
      this.addActor({
        id: 'silt_strider',
        name: 'Silt Strider',
        x: 6,
        z: 2,
        homeX: 6,
        homeZ: 2,
        leash: 0.2,
        hp: 30,
        max: 30,
        hostile: false,
        kind: 'service',
        mesh: shell as unknown as Group,
      });
    }
    const spawns = spawnsAt(state, CONTENT.quests, state.location);
    const crowd = crowdSpots(spawns.length);
    spawns.forEach((sp, i) => {
      const spot = crowd[i] ?? { x: 0, z: 1.2 };
      this.placeFigure(sp, spot.x, spot.z);
    });
    for (const amb of ambientThreats(state.location, loc?.kind ?? 'town')) this.placeAmbient(amb);
    const walks = loc?.walk ?? [];
    const spots = doorSpots(walks.length);
    walks.forEach((id, idx) => {
      const spot = spots[idx];
      if (!spot) return;
      const x = spot.x;
      const z = spot.z;
      const gate = new Mesh(new BoxGeometry(1.6, 2.8, 0.35), new MeshStandardMaterial({ color: 0xd7c07a }));
      gate.position.set(x, 1.4, z);
      gate.rotation.y = Math.atan2(x, z);
      this.world.add(gate);
      const name = CONTENT.locations.get(id)?.name ?? id;
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#24180f';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = '#f3e6c8';
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name.slice(0, 22), 128, 32);
        const plate = new Mesh(
          new PlaneGeometry(2.1, 0.52),
          new MeshStandardMaterial({ map: new CanvasTexture(canvas), roughness: 1 }),
        );
        plate.position.set(x, 3.05, z);
        plate.rotation.y = Math.atan2(x, z);
        this.world.add(plate);
      }
      this.addActor({
        id: `exit:${id}`,
        name,
        x,
        z,
        homeX: x,
        homeZ: z,
        leash: 0.1,
        hp: 1,
        max: 1,
        hostile: false,
        kind: 'exit',
        mesh: new Group(),
      });
    });
    if ((loc?.boat.length ?? 0) > 0) this.service('boatman', 'Boat', -6, 3);
    if ((loc?.guide.length ?? 0) > 0) this.service('guild_guide', 'Guild Guide', 3, 6);
    this.service('merchant', 'Merchant', -3, 6);
    this.world.add(new Group());
  }

  private service(id: string, name: string, x: number, z: number): void {
    const g = this.figure(0x8899aa, false);
    g.position.set(x, 0, z);
    this.world.add(g);
    this.addActor({ id, name, x, z, homeX: x, homeZ: z, leash: 0.2, hp: 20, max: 20, hostile: false, kind: 'service', mesh: g });
  }

  private placeFigure(sp: SpawnView, x: number, z: number): void {
    if (sp.item && !sp.npc) {
      const mesh = new Mesh(new BoxGeometry(0.45, 0.45, 0.45), new MeshStandardMaterial({ color: 0xffd56a, emissive: 0x553300 }));
      mesh.position.set(x, 0.4, z);
      this.world.add(mesh);
      this.addActor({
        id: sp.item,
        name: sp.name,
        x,
        z,
        homeX: x,
        homeZ: z,
        leash: 0.1,
        hp: 1,
        max: 1,
        hostile: false,
        kind: 'item',
        item: sp.item,
        mesh: new Group(),
      });
      return;
    }
    const color = sp.hostile ? 0x8c2f24 : sp.name === 'Azura' ? 0x7a5cff : 0xd8c7a2;
    const g = this.figure(color, !!sp.hostile);
    g.position.set(x, 0, z);
    this.world.add(g);
    const remembered = sp.npc ? this.state?.actors[sp.npc] : undefined;
    const hp = remembered === undefined ? sp.hp : remembered;
    this.addActor({
      id: sp.npc ?? sp.name,
      name: sp.name,
      x,
      z,
      homeX: x,
      homeZ: z,
      leash: sp.leash ?? 12,
      hp,
      max: sp.hp,
      hostile: !!sp.hostile && hp > 0,
      kind: sp.kind,
      spawn: sp,
      mesh: g,
    });
  }

  private placeAmbient(amb: Ambient): void {
    const g = this.figure(0x665544, true);
    g.position.set(amb.x, 1.2, amb.z);
    this.world.add(g);
    this.addActor({
      id: amb.id,
      name: amb.name,
      x: amb.x,
      z: amb.z,
      homeX: amb.homeX,
      homeZ: amb.homeZ,
      leash: amb.leash,
      hp: amb.hp,
      max: amb.hp,
      hostile: true,
      kind: 'racer',
      mesh: g,
    });
  }

  private figure(color: number, hostile: boolean): Group {
    const g = new Group();
    const body = new Mesh(new CylinderGeometry(0.28, 0.34, 1.1, 6), new MeshStandardMaterial({ color }));
    body.position.y = 0.7;
    const head = new Mesh(new SphereGeometry(0.22, 8, 6), new MeshStandardMaterial({ color: hostile ? 0xddb090 : 0xefd2b4 }));
    head.position.y = 1.45;
    g.add(body, head);
    return g;
  }

  private addActor(actor: Omit<Actor, 'swing'>): void {
    this.actors.push({ ...actor, swing: 1.1 });
  }

  private nearest(max = 2.8, pred?: (a: Actor) => boolean): Actor | null {
    const state = this.state!;
    let best: Actor | null = null;
    let bestD = max;
    for (const a of this.actors) {
      if (pred && !pred(a)) continue;
      const d = Math.hypot(a.x - state.px, a.z - state.pz);
      if (d < bestD) {
        bestD = d;
        best = a;
      }
    }
    return best;
  }

  private playerAttack(): void {
    const state = this.state!;
    if (!canFight(state)) {
      this.toast('You are still in custody.', false);
      return;
    }
    const foe = this.actors.find((a) => a.hostile && a.hp > 0 && Math.hypot(a.x - state.px, a.z - state.pz) < 2.5);
    if (!foe) {
      this.toast('Miss', false);
      this.audio.miss();
      return;
    }
    const skill = foe.kind === 'racer' ? 20 : 35;
    const result = resolveStrike(state, CONTENT.items, { id: foe.id, hp: foe.hp, skill, armor: foe.kind === 'racer' ? 4 : 8 });
    if (!result.hit) {
      this.toast('Miss', false);
      this.audio.miss();
      return;
    }
    foe.hp = state.actors[foe.id] ?? Math.max(0, foe.hp - result.damage);
    if (foe.id === 'dagoth_ur') foe.hp = state.dagothHp;
    this.toast(result.revived ? 'The Heart restores him' : result.killed ? 'Fallen' : `${result.damage}`, true);
    this.audio.hit();
    if (foe.hp <= 0) {
      foe.mesh.visible = false;
      foe.hostile = false;
    }
  }

  private interact(): void {
    const state = this.state!;
    const near = this.nearest(3.6, (a) => !a.hostile) ?? this.nearest(3.6);
    if (!near) {
      this.toast('Nothing here.', false);
      return;
    }
    if (near.kind === 'exit') {
      const dest = near.id.slice(5);
      if (!state.released && !['seyda_neen', 'census_office', 'prison_ship'].includes(dest)) {
        this.toast('Sellus Gravius has not released you.', false);
        return;
      }
      const res = travelTo(state, CONTENT.locations, dest, 'walk');
      if (!res.ok) this.toast(res.reason, false);
      else this.enterLocation(true);
      return;
    }
    if (near.kind === 'item' && near.item) {
      const got = pickup(state, CONTENT.quests, near.item);
      this.toast(got.done ? `Taken: ${near.name}` : `Taken: ${near.name} (${got.qty}/${got.need})`, false);
      this.audio.reward();
      if (got.done) {
        near.mesh.visible = false;
        this.actors = this.actors.filter((a) => a !== near);
      }
      return;
    }
    if (near.kind === 'service') {
      this.openService(near.id, near.name);
      return;
    }
    this.openTalk(near);
  }

  private openTalk(actor: Actor): void {
    const state = this.state!;
    talkTo(state, actor.id, CONTENT.quests);
    noteTalk(state, actor.id);
    const box = document.createElement('div');
    box.id = 'dialogue';
    const p = document.createElement('p');
    p.textContent = `${actor.name} waits.`;
    box.appendChild(p);
    const journal = this.relevantLine(actor.id);
    if (journal) {
      const j = document.createElement('p');
      j.textContent = journal;
      box.appendChild(j);
    }
    const add = (label: string, fn: () => void) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.onclick = () => {
        fn();
        box.remove();
        this.refreshHud();
      };
      box.appendChild(b);
    };
    for (const quest of CONTENT.quests) {
      const rec = questRecord(state, quest.id);
      if (rec.complete) continue;
      const stage = quest.stages[rec.stage];
      if (!stage) continue;
      const involves = JSON.stringify(stage.complete).includes(actor.id) || quest.giver === actor.id;
      if (!involves) continue;
      if (conditionMet(state, stage.complete)) {
        add(rec.stage === 0 ? `Accept: ${quest.title}` : `Resolve: ${quest.title}`, () => {
          const res = advanceQuest(state, CONTENT.quests, quest.id);
          if (res.ok) {
            this.audio.reward();
            this.toast(quest.title, false);
            if (state.flags.released) state.released = true;
            this.enterLocation(false);
          } else this.toast(res.reason, false);
        });
      }
    }
    if (actor.id === 'vivec') {
      add('Accept Vivec’s plan', () => {
        const res = chooseVivec(state, true);
        this.toast(res.ok ? 'Wraithguard is yours.' : res.reason, false);
        if (res.ok) advanceQuest(state, CONTENT.quests, 'mq_hortator_nerevarine');
      });
      add('Refuse Vivec', () => {
        const res = chooseVivec(state, false);
        this.toast(res.ok ? 'You refuse the god.' : res.reason, false);
        if (res.ok) advanceQuest(state, CONTENT.quests, 'mq_hortator_nerevarine');
      });
    }
    if (actor.id === 'heart_of_lorkhan' || actor.name === 'Heart of Lorkhan') {
      add('Strike with Sunder', () => this.heart('sunder'));
      add('Strike with Keening', () => this.heart('keening'));
    }
    add('Admire', () => {
      const r = admire(state, actor.id);
      this.toast(`Regard ${r.disposition} (${r.delta >= 0 ? '+' : ''}${r.delta})`, false);
    });
    add('Intimidate', () => {
      const r = intimidate(state, actor.id);
      this.toast(`Regard ${r.disposition}`, false);
    });
    add('Taunt', () => {
      const r = taunt(state, actor.id);
      this.toast(r.hostile ? 'They draw steel.' : `Regard ${r.disposition}`, false);
      if (r.hostile) actor.hostile = true;
    });
    add('Bribe 50', () => {
      const r = bribe(state, actor.id, 50);
      this.toast(r.ok ? `Regard ${r.disposition}` : r.reason, false);
    });
    add('Close', () => {});
    this.ui.querySelector('#dialogue')?.remove();
    this.ui.appendChild(box);
  }

  private heart(tool: 'sunder' | 'keening'): void {
    const state = this.state!;
    const res = strikeHeart(state, tool);
    this.toast(res.ok ? (tool === 'sunder' ? 'The Heart is sundered.' : 'The Blight breaks.') : res.reason, true);
    if (res.ok) this.audio.reward();
    else this.audio.miss();
    if (res.reason === 'severed') {
      advanceQuest(state, CONTENT.quests, 'mq_heart');
      this.showEnding();
    }
  }

  private relevantLine(npc: string): string {
    const state = this.state!;
    for (const q of CONTENT.quests) {
      if (q.giver !== npc && !q.spawns.some((s) => s.npc === npc)) continue;
      const line = currentJournal(state, q);
      if (line) return line;
      const rec = state.quests[q.id];
      if (!rec) return q.summary;
    }
    return '';
  }

  private openService(id: string, name: string): void {
    const state = this.state!;
    const loc = CONTENT.locations.get(state.location)!;
    const box = document.createElement('div');
    box.id = 'dialogue';
    const p = document.createElement('p');
    p.textContent = name;
    box.appendChild(p);
    const mode = id === 'silt_strider' ? 'silt' : id === 'boatman' ? 'boat' : id === 'guild_guide' ? 'guide' : 'shop';
    if (mode === 'shop') {
      for (const itemId of ['healing_potion', 'cure_disease_potion', 'muck', 'marshmerrow', 'wickwheat', 'iron_longsword', 'chitin_cuirass', 'soul_gem']) {
        const item = CONTENT.items.get(itemId);
        if (!item) continue;
        const b = document.createElement('button');
        b.textContent = `Buy ${item.name} (${item.value})`;
        b.onclick = () => {
          if (state.gold < item.value) this.toast('Not enough gold.', false);
          else {
            state.gold -= item.value;
            give(state, itemId, 1);
            useSkill(state, 'mercantile');
            this.toast(`Bought ${item.name}`, false);
          }
        };
        box.appendChild(b);
      }
    } else {
      const list = mode === 'silt' ? loc.silt : mode === 'boat' ? loc.boat : loc.guide;
      if (!canTravel(state)) {
        const warn = document.createElement('p');
        warn.textContent = 'The port will not carry a prisoner.';
        box.appendChild(warn);
      }
      for (const dest of list) {
        const b = document.createElement('button');
        b.textContent = CONTENT.locations.get(dest)?.name ?? dest;
        b.onclick = () => {
          const res = travelTo(state, CONTENT.locations, dest, mode);
          this.toast(res.ok ? `Arrived: ${b.textContent}` : res.reason, false);
          if (res.ok) {
            box.remove();
            this.enterLocation(true);
          }
        };
        box.appendChild(b);
      }
    }
    const close = document.createElement('button');
    close.textContent = 'Close';
    close.onclick = () => box.remove();
    box.appendChild(close);
    this.ui.querySelector('#dialogue')?.remove();
    this.ui.appendChild(box);
  }

  private panel(title: string): HTMLElement {
    this.ui.querySelector('.panel')?.remove();
    const panel = document.createElement('div');
    panel.className = 'panel';
    const h = document.createElement('h2');
    h.textContent = title;
    panel.appendChild(h);
    const close = document.createElement('button');
    close.textContent = 'Close';
    close.onclick = () => panel.remove();
    panel.appendChild(close);
    this.ui.appendChild(panel);
    return panel;
  }

  private openJournal(): void {
    const state = this.state!;
    const panel = this.panel('Journal');
    const groups = new Map<string, QuestDef[]>();
    for (const q of CONTENT.quests) {
      if (!state.quests[q.id]) continue;
      const list = groups.get(q.category) ?? [];
      list.push(q);
      groups.set(q.category, list);
    }
    if (groups.size === 0) {
      const p = document.createElement('p');
      p.textContent = 'No threads yet. Speak to Jiub, then to Sellus Gravius.';
      panel.appendChild(p);
    }
    for (const [cat, list] of groups) {
      const h = document.createElement('h2');
      h.textContent = cat;
      panel.appendChild(h);
      for (const q of list) {
        const rec = questRecord(state, q.id);
        const p = document.createElement('p');
        const text = rec.complete ? 'Concluded.' : (q.stages[rec.stage]?.journal ?? q.summary);
        p.textContent = `${q.title}. ${text}`;
        panel.appendChild(p);
      }
    }
  }

  private openInventory(): void {
    const state = this.state!;
    const panel = this.panel('Inventory');
    const p = document.createElement('p');
    p.textContent = `Gold ${state.gold}. Weapon ${state.equipment.weapon ?? 'fists'}. Wraithguard ${isWraithguardEquipped(state) ? 'worn' : 'not worn'}.`;
    panel.appendChild(p);
    for (const row of state.inventory) {
      const item = CONTENT.items.get(row.id);
      const b = document.createElement('button');
      b.textContent = `${item?.name ?? row.id} ×${row.qty}`;
      b.onclick = () => {
        if (item?.kind === 'potion' || item?.effect) {
          const res = drinkPotion(state, CONTENT.items, row.id);
          this.toast(res.ok ? res.reason : res.reason, false);
          if (res.ok) this.audio.spell();
        } else {
          const res = equipItem(state, CONTENT.items, row.id);
          this.toast(res.ok ? `Equipped ${item?.name ?? row.id}` : res.reason, false);
        }
        this.openInventory();
      };
      panel.appendChild(b);
    }
  }

  private openMagic(): void {
    const state = this.state!;
    const panel = this.panel('Magic');
    const cast = document.createElement('button');
    cast.className = 'primary';
    cast.textContent = `Cast ${this.selectedSpell}`;
    cast.onclick = () => this.castSelected();
    panel.appendChild(cast);
    for (const id of state.spells) {
      const spell = CONTENT.spells.get(id) ?? state.customSpells.find((s) => s.id === id);
      if (!spell) continue;
      const b = document.createElement('button');
      b.textContent = `${spell.name} (${spell.school} ${spell.cost})`;
      if (id === this.selectedSpell) b.className = 'primary';
      b.onclick = () => {
        this.selectedSpell = id;
        this.openMagic();
      };
      panel.appendChild(b);
    }
    const mix = document.createElement('button');
    mix.textContent = 'Mix marshmerrow and wickwheat';
    mix.onclick = () => {
      const res = mixPotion(state, CONTENT.items, 'marshmerrow', 'wickwheat');
      if (res.potion) CONTENT.items.set(res.potion.id, res.potion);
      this.toast(res.ok ? res.potion!.name : res.reason, false);
      if (res.ok && res.potion) {
        const drunk = drinkPotion(state, CONTENT.items, res.potion.id);
        this.toast(drunk.reason, false);
      }
    };
    panel.appendChild(mix);
    const make = document.createElement('button');
    make.textContent = 'Spellmake: ember (destruction)';
    make.onclick = () => {
      const spell = makeSpell(state, { id: 'fire_damage', name: 'Fire', magnitude: 15 }, 'destruction', 'Ember Canticle');
      if (spell.id) {
        CONTENT.spells.set(spell.id, spell);
        this.selectedSpell = spell.id;
        this.toast(spell.name, false);
        this.audio.spell();
      } else this.toast('Not enough gold.', false);
    };
    panel.appendChild(make);
    const ench = document.createElement('button');
    ench.textContent = 'Enchant soul gem: heal';
    ench.onclick = () => {
      const res = enchantItem(state, 'soul_gem', { id: 'restore_health', name: 'Restore Health', magnitude: 20 }, 'Ash Amulet');
      this.toast(res.ok ? 'Enchanted.' : res.reason, false);
      if (res.ok && res.id) {
        const used = useEnchantment(state, res.id);
        this.toast(used.reason, false);
      }
    };
    panel.appendChild(ench);
    for (const spellId of ['mark_spell', 'recall_spell', 'divine_spell', 'almsivi_spell']) {
      if (!state.spells.includes(spellId)) continue;
      const b = document.createElement('button');
      b.textContent = spellId.replace('_spell', '');
      b.onclick = () => {
        this.selectedSpell = spellId;
        this.castSelected();
      };
      panel.appendChild(b);
    }
  }

  private castSelected(): void {
    const state = this.state!;
    const spell = CONTENT.spells.get(this.selectedSpell) ?? state.customSpells.find((s) => s.id === this.selectedSpell);
    if (!spell) return;
    if (!state.spells.includes(spell.id) && !state.customSpells.some((s) => s.id === spell.id)) {
      this.toast('unlearned', false);
      return;
    }
    if (spell.effect.id === 'mark' || spell.effect.id === 'recall' || spell.effect.id === 'divine' || spell.effect.id === 'almsivi') {
      const moved = castTravelSpell(state, CONTENT.spells, CONTENT.locations, spell.id);
      if (!moved.success) {
        this.toast(moved.reason === 'fizzle' ? 'The spell fails' : moved.reason, false);
        this.audio.miss();
        return;
      }
      this.audio.spell();
      this.toast(moved.reason === 'marked' ? 'Marked.' : moved.reason, false);
      if (moved.ok && spell.effect.id !== 'mark') this.enterLocation(true);
      return;
    }
    const foeId = nearestHostile(this.actors, state.px, state.pz, 2.5);
    const foe = foeId ? this.actors.find((a) => a.id === foeId) : undefined;
    const res = castSpell(state, CONTENT.spells, spell.id);
    if (!res.success) {
      this.toast(res.reason === 'fizzle' ? 'The spell fails' : res.reason, false);
      this.audio.miss();
      return;
    }
    this.audio.spell();
    if (res.damage && foe) {
      const hit = spellStrike(state, { id: foe.id, hp: foe.hp }, res.damage);
      foe.hp = hit.hp;
      this.toast(hit.revived ? 'The Heart restores him' : hit.killed ? 'Fallen' : `${res.damage}`, true);
      if (foe.hp <= 0) {
        foe.mesh.visible = false;
        foe.hostile = false;
      }
    } else this.toast(res.reason, false);
  }

  private openMap(): void {
    const state = this.state!;
    const panel = this.panel('Map of Vvardenfell');
    const here = CONTENT.locations.get(state.location);
    const p = document.createElement('p');
    p.textContent = `You are in ${here?.name ?? state.location}. ${state.guidance ? 'Guidance is on: the compass names the next place.' : 'Guidance is off. The journal is your map.'}`;
    panel.appendChild(p);
    for (const loc of CONTENT.locationList) {
      if (!state.flags[`seen:${loc.id}`] && loc.id !== state.location) continue;
      const b = document.createElement('button');
      b.textContent = `${loc.name}${loc.id === state.location ? ' (here)' : ''}`;
      panel.appendChild(b);
    }
  }

  private openStats(): void {
    const state = this.state!;
    const panel = this.panel(`${state.name} · level ${state.level}`);
    const p = document.createElement('p');
    p.textContent = `${state.race} · ${state.birthsign} · ${state.className}. ${state.diseases.join(', ') || 'No disease.'} ${state.vampire ? 'Vampire (' + state.vampire + ').' : ''}`;
    panel.appendChild(p);
    for (const a of ATTRIBUTES) {
      const line = document.createElement('div');
      line.textContent = `${a} ${state.attributes[a]}`;
      panel.appendChild(line);
    }
    if (state.levelUpPending) {
      const note = document.createElement('p');
      note.textContent = 'Choose three attributes to raise.';
      panel.appendChild(note);
      const picks: (typeof ATTRIBUTES)[number][] = [];
      for (const a of ATTRIBUTES) {
        const b = document.createElement('button');
        b.textContent = a;
        b.onclick = () => {
          if (picks.includes(a) || picks.length >= 3) return;
          picks.push(a);
          b.className = 'primary';
          if (picks.length === 3) {
            levelUp(state, [picks[0]!, picks[1]!, picks[2]!]);
            this.toast('You grow.', false);
            this.openStats();
          }
        };
        panel.appendChild(b);
      }
    }
    const skills = document.createElement('p');
    skills.textContent = state.major.map((id) => `${id} ${state.skills[id]}`).join(' · ');
    panel.appendChild(skills);
  }

  private showOptions(fromTitle: boolean): void {
    const state = this.state;
    const panel = this.panel('Options');
    const mute = document.createElement('button');
    mute.textContent = (state?.mute ?? this.audio.muted) ? 'Unmute' : 'Mute';
    mute.onclick = () => {
      const next = !(state?.mute ?? this.audio.muted);
      if (state) state.mute = next;
      this.audio.setMuted(next);
      mute.textContent = next ? 'Unmute' : 'Mute';
    };
    panel.appendChild(mute);
    const vol = document.createElement('input');
    vol.type = 'range';
    vol.min = '0';
    vol.max = '1';
    vol.step = '0.05';
    vol.value = String(state?.volume ?? this.audio.volume);
    vol.oninput = () => {
      const v = Number(vol.value);
      if (state) state.volume = v;
      this.audio.setVolume(v);
    };
    panel.appendChild(vol);
    const fs = document.createElement('button');
    fs.textContent = 'Fullscreen lock';
    fs.onclick = () => {
      const el = this.root;
      if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
      const orient = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      orient.lock?.('landscape').catch(() => {});
    };
    panel.appendChild(fs);
    if (state) {
      const g = document.createElement('button');
      g.textContent = state.guidance ? 'Guidance on' : 'Guidance off';
      g.onclick = () => {
        state.guidance = !state.guidance;
        g.textContent = state.guidance ? 'Guidance on' : 'Guidance off';
      };
      panel.appendChild(g);
      const q = document.createElement('button');
      q.textContent = `Quality ${state.quality}`;
      q.onclick = () => {
        state.quality = state.quality === 'low' ? 'high' : 'low';
        this.renderer.shadowMap.enabled = state.quality === 'high';
        q.textContent = `Quality ${state.quality}`;
      };
      panel.appendChild(q);
      const cam = document.createElement('button');
      cam.textContent = state.camera === 'first' ? 'Camera: eyes' : 'Camera: pulled back';
      cam.onclick = () => {
        state.camera = state.camera === 'first' ? 'pullback' : 'first';
        cam.textContent = state.camera === 'first' ? 'Camera: eyes' : 'Camera: pulled back';
      };
      panel.appendChild(cam);
      const save = document.createElement('button');
      save.textContent = 'Save';
      save.onclick = () => {
        writeLocalSave(state);
        this.toast('Saved.', false);
      };
      panel.appendChild(save);
    }
    if (fromTitle) {
      const back = document.createElement('button');
      back.textContent = 'Title';
      back.onclick = () => this.showTitle();
      panel.appendChild(back);
    }
  }

  private showEnding(): void {
    if (this.mode === 'ending') return;
    this.mode = 'ending';
    const state = this.state!;
    this.ui.querySelector('#hud')?.remove();
    this.ui.querySelector('#float')?.remove();
    this.ui.querySelector('#dialogue')?.remove();
    this.ui.querySelector('.panel')?.remove();
    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.innerHTML = `
      <div class="sub">Azura</div>
      <h1>The Heart is still</h1>
      <p style="max-width:36rem;text-align:center">The Blight recedes from the ash. Dagoth Ur is severed from the Heart, and the mountain keeps its own dead. You were the prisoner under a certain star. The canticle ends, and the island remains.</p>
      <div class="credit">${state.name} · 2026-09-26 · Grok 4.7</div>
      <div class="row"></div>`;
    const row = screen.querySelector('.row')!;
    const again = document.createElement('button');
    again.className = 'primary';
    again.textContent = 'Title';
    again.onclick = () => {
      this.state = null;
      this.buildTitleVista();
      this.showTitle();
    };
    row.appendChild(again);
    this.ui.appendChild(screen);
  }

  private refreshHud(): void {
    const state = this.state;
    if (!state) return;
    const hud = this.ui.querySelector('#hud');
    if (!hud) return;
    const set = (sel: string, cur: number, max: number) => {
      const el = hud.querySelector(sel) as HTMLElement | null;
      if (el) el.style.width = `${Math.max(0, Math.min(100, (cur / Math.max(1, max)) * 100))}%`;
    };
    set('.hp > span', state.health, state.healthMax);
    set('.mp > span', state.magicka, state.magickaMax);
    set('.ft > span', state.fatigue, state.fatigueMax);
    const line = hud.querySelector('.questline') as HTMLElement;
    const active = CONTENT.quests.find((q) => state.quests[q.id] && !state.quests[q.id]!.complete);
    const upcoming =
      !active && state.released
        ? CONTENT.quests.find(
            (q) => q.category === 'main' && !state.quests[q.id]?.complete && !branchClosed(state, q.stages[0]?.complete),
          )
        : undefined;
    const text = active
      ? currentJournal(state, active) ?? active.summary
      : upcoming
        ? (upcoming.stages[0]?.journal ?? upcoming.summary)
        : state.quests.mq_awakening?.complete
          ? 'The gold door ahead leads up to the Seyda Neen dock.'
          : 'The ship rocks. Seyda Neen is outside.';
    const loc = CONTENT.locations.get(state.location);
    line.textContent = `${loc?.name ?? ''} — ${text}`;
    const hudEl = hud as HTMLElement;
    hudEl.dataset.x = state.px.toFixed(2);
    hudEl.dataset.z = state.pz.toFixed(2);
    hudEl.dataset.loc = state.location;
    hudEl.dataset.yaw = state.yaw.toFixed(2);
    hudEl.dataset.keys = [...this.keys].join(',');
    const compass = hud.querySelector('.compass') as HTMLElement;
    let near: Actor | null = null;
    let nearD = 3.6;
    let foes = 0;
    let threat = 0;
    for (const actor of this.actors) {
      if (actor.hostile && actor.hp > 0) {
        foes += 1;
        if (actor.kind !== 'racer' && Math.hypot(actor.x - state.px, actor.z - state.pz) < 10) threat += 1;
      }
      if (actor.hostile) continue;
      const d = Math.hypot(actor.x - state.px, actor.z - state.pz);
      if (d < nearD) {
        nearD = d;
        near = actor;
      }
    }
    hudEl.dataset.near = near?.name ?? '';
    hudEl.dataset.nearid = near?.id ?? '';
    hudEl.dataset.foes = String(foes);
    hudEl.dataset.threat = String(threat);
    hudEl.dataset.hp = String(Math.round(state.health));
    hudEl.dataset.hpmax = String(state.healthMax);
    hudEl.dataset.gold = String(state.gold);
    if (near) compass.textContent = near.kind === 'exit' ? `Path: ${near.name}` : near.name;
    else if (state.guidance && active) {
      const target = active.sites.find((s) => s.id !== state.location)?.id ?? active.location;
      const there = CONTENT.locations.get(target);
      compass.textContent = there && there.id !== state.location ? `Toward ${there.name}` : '';
    } else compass.textContent = '';
  }

  private toast(text: string, hit: boolean): void {
    const el = document.getElementById('float');
    if (!el) return;
    el.textContent = text;
    el.className = 'float ' + (hit ? 'hit' : 'miss');
    this.floatTimer = 1.1;
  }
}

