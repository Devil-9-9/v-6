import { BLOCK_IDS, STRUCTS, VEHICLES, TOOLS, itemInfo } from '../blocks/Items.js';
import { drawBlockIcon } from '../blocks/TextureAtlas.js';

/**
 * Creative inventory: every block, ready-made buildings (hotel, house, tower, portals), vehicles and tools.
 * Tap a hotbar slot at the bottom, then tap an item to put it there. Saved on the device.
 */
export class Inventory {
  constructor({ game, root }) {
    this.game = game; this.root = root; this.tab = 'blocks'; this.slot = 0; this.isOpen = false;
    this.grid = root.querySelector('#inv-grid');
    this.bar = root.querySelector('#inv-hotbar');
    this.tabs = [...root.querySelectorAll('[data-tab]')];
    this.tabs.forEach((b) => b.addEventListener('click', () => { this.tab = b.dataset.tab; this.render(); }));
    this.onClose = null;
    root.querySelector('#inv-close').addEventListener('click', () => this.onClose?.());
    window.addEventListener('keydown', (e) => { if (this.isOpen && (e.code === 'Escape' || e.code === 'KeyI')) { e.preventDefault(); this.onClose?.(); } });
  }

  open() { this.isOpen = true; this.slot = this.game.build.slot; this.root.classList.remove('hidden'); this.render(); }
  close() { this.isOpen = false; this.root.classList.add('hidden'); }

  items() {
    if (this.tab === 'blocks') return BLOCK_IDS;
    const t = this.tab === 'builds' ? ['struct', STRUCTS] : this.tab === 'vehicles' ? ['veh', VEHICLES] : ['tool', TOOLS];
    return Object.keys(t[1]).map((k) => t[0] + ':' + k);
  }

  cell(item, onClick, extra = '') {
    const el = document.createElement('button'); el.className = 'inv-cell ' + extra;
    if (typeof item === 'number') { const c = document.createElement('canvas'); drawBlockIcon(c, this.game.atlas.canvas, item); el.appendChild(c); }
    else { const e = document.createElement('span'); e.className = 'emo'; e.textContent = itemInfo(item).icon; el.appendChild(e); }
    const l = document.createElement('small'); l.textContent = itemInfo(item).label; el.appendChild(l);
    const info = itemInfo(item).info; if (info) el.title = info;
    el.addEventListener('click', onClick);
    return el;
  }

  render() {
    this.tabs.forEach((b) => b.classList.toggle('on', b.dataset.tab === this.tab));
    this.grid.textContent = '';
    for (const it of this.items()) {
      this.grid.appendChild(this.cell(it, () => {
        this.game.build.setSlot(this.slot, it);
        this.slot = (this.slot + 1) % this.game.hotbar.length;      // next tap fills the next slot
        this.render();
      }));
    }
    this.bar.textContent = '';
    this.game.hotbar.forEach((it, i) => this.bar.appendChild(this.cell(it, () => { this.slot = i; this.game.build.select(i); this.render(); }, i === this.slot ? 'sel' : '')));
  }
}
