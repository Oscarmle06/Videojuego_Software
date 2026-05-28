// CardHUD.js - Responsible for rendering the player's card inventory and upgrades in the HUD.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026
export class CardHUD {
  constructor(canvas, ctx, cardSystem) {
    this.canvas     = canvas;
    this.ctx        = ctx;
    this.cardSystem = cardSystem;
    this.W = canvas.width;
    this.H = canvas.height;

    this.PASSIVE_NAMES = [
      'Aerodynamic Spoiler',
      'Heavy Chassis',
      'Sport Tires',
      'Racing Transmission',
    ];

    // Preload card images
    this.images = {};
    const files = {
      'Aerodynamic Spoiler': './assets/cards/aerodynamic_spoiler.png',
      'Heavy Chassis':       './assets/cards/heavychasis.png',
      'Sport Tires':         './assets/cards/sporttires.png',
      'Racing Transmission': './assets/cards/racing-transmition.png',
      'Tire Shredder':       './assets/cards/tireshredder.png',
      'Sonic Wave':          './assets/cards/sonicwave.png',
      'Grappler Hook':       './assets/cards/grapplerhook.png',
      'EMP':                 './assets/cards/EMP.png',
      'Temporary Armor':     './assets/cards/temporaryArmour.png',
      'Repair Bot':          './assets/cards/repairbot.png',
      'Pit Stop':            './assets/cards/pitstop.png',
    };
    for (const [name, src] of Object.entries(files)) {
      const img = new Image();
      img.src = src;
      this.images[name] = img;
    }
  }

  render(activeCards) {
    const ctx    = this.ctx;
    const width  = this.W;
    const height = this.H;

    // Background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    // Race cards section
    const SLOT_W  = 110;
    const SLOT_H  = 145;
    const SLOT_X  = (width - SLOT_W) / 2;
    const GAP     = 12;
    const START_Y = 20;

    ctx.fillStyle = '#ffffff'; // title
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RACE CARDS', width / 2, START_Y - 6);

    for (let i = 0; i < 3; i++) {
      const card     = activeCards.slots[i] ?? null;
      const selected = i === activeCards.selectedSlot;
      const x        = SLOT_X + i * (SLOT_W + GAP) - 120;
      const y        = START_Y;

      const borderColor = selected ? '#FFD700' : card ? '#ffffff' : '#444444';
      this._drawSlot(x, y, SLOT_W, SLOT_H, card, borderColor);

      ctx.fillStyle = selected ? '#FFD700' : '#555555';
      ctx.font      = 'bold 20px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}`, x + 6, y + 14);
    }

    // Divider
    const dividerY = 185;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, dividerY);
    ctx.lineTo(width - 10, dividerY);
    ctx.stroke();

    // Upgrades section
    const PASS_PANEL_H = 180;
    const passY        = dividerY + 12;
    const miniW        = SLOT_W + 61;
    const miniH        = PASS_PANEL_H - 16;
    const miniY        = passY + 8;

    ctx.fillStyle = '#ffffff'; // upgrades
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UPGRADES', width / 2, passY - 4);

    ctx.fillStyle = 'rgba(105, 105, 105, 0.6)';
    ctx.fillRect(15, passY, 355, 370);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(15, passY, 355, 370);

    // Draw all 4 passive cards in a 2x2 grid
    for (let i = 0; i < 4; i++) {
      const name  = this.PASSIVE_NAMES[i];
      const owned = this._findCard(name);
      const col   = i % 2;
      const row   = Math.floor(i / 2);
      const mx    = 20 + col * (miniW + 2);
      const my    = miniY + row * 180;

      ctx.fillStyle = owned ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0)';
      ctx.fillRect(mx, my, miniW, miniH);
      ctx.strokeStyle = owned ? '#aaaaaa' : '#2a2a2a';
      ctx.lineWidth = 1;
      ctx.strokeRect(mx, my, miniW, miniH);

      if (owned && this.images[name]?.complete) {
        ctx.globalAlpha = 1;
        ctx.drawImage(this.images[name], mx + 1, my + 1, miniW - 2, miniH - 14);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv${owned.level}`, mx + miniW / 2, my + miniH - 3);
      } else {
        ctx.fillStyle = '#2a2a2a';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('·', mx + miniW / 2, my + miniH / 2 + 6);
      }
    }

    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // Returns the card object if the player owns it, otherwise null
  _findCard(name) {
    for (let i = 0; i < this.cardSystem.cards.length; i++) {
      if (this.cardSystem.cards[i].name === name) return this.cardSystem.cards[i];
    }
    return null;
  }

  _drawSlot(x, y, w, h, card, borderColor) { // The _drawSlot method is responsible for rendering an individual card slot in the HUD. 
  // It takes the position (x, y), dimensions (w, h), the card object, and the border color as parameters. 
  // The method draws the slot background, border, and if a card is present, it renders the card image and name. If the slot is empty, it displays a '+' symbol and 'empty' text.
    const ctx = this.ctx;

    ctx.fillStyle = card ? 'rgba(20,20,20,0.9)' : 'rgba(0,0,0,0.4)';
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth   = 2;
    ctx.strokeRect(x, y, w, h);

    if (card && this.images[card.name]?.complete) {
      ctx.drawImage(this.images[card.name], x + 4, y + 4, w - 8, h - 20);
      ctx.fillStyle = '#cccccc';
      ctx.font      = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(card.name, x + w / 2, y + h - 14);
    } else {
      // Empty slot
      ctx.fillStyle = '#2a2a2a';
      ctx.font      = '28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+', x + w / 2, y + h / 2 + 10);
      ctx.fillStyle = '#444';
      ctx.font      = '16px monospace';
      ctx.fillText('empty', x + w / 2, y + h - 6);
    }
  }
}