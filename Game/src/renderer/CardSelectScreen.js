// This code is temporal for demo purposes, and will be replaced by a more 
// polished card selection screen in the future, including the randomizing 
// of cards and included in game state flow. For now, it just allows you to select any 4
// passives and 3 race cards

export class CardSelectScreen {
  constructor(canvas, ctx, images, onConfirm) {
    this.canvas    = canvas;
    this.ctx       = ctx;
    this.images    = images;
    this.onConfirm = onConfirm; // callback when player clicks START

    this.PASSIVES = [
      'Aerodynamic Spoiler',
      'Heavy Chassis',
      'Sport Tires',
      'Racing Transmission',
    ];

    this.RACE_CARDS = [
      'Tire Shredder',
      'Grappler Hook',
      'Sonic Wave',
      'EMP',
      'Repair Bot',
      'Temporary Armor',
    ];

    this.selectedPassives  = []; // max 4
    this.selectedRaceCards = []; // max 3

    this.CARD_W = 100;
    this.CARD_H = 135;
    this.GAP    = 14;

    // Build clickable card rects so we can hit-test on click
    this.passiveRects  = [];
    this.raceCardRects = [];
    this._buildRects();

    canvas.addEventListener('click', this._handleClick.bind(this));
  }

  _buildRects() {
    const startX = 40;

    // Passive cards — row at y=120
    for (let i = 0; i < this.PASSIVES.length; i++) {
      this.passiveRects.push({
        x: startX + i * (this.CARD_W + this.GAP),
        y: 120,
        w: this.CARD_W,
        h: this.CARD_H,
      });
    }

    // Race cards — row at y=340
    for (let i = 0; i < this.RACE_CARDS.length; i++) {
      this.raceCardRects.push({
        x: startX + i * (this.CARD_W + this.GAP),
        y: 340,
        w: this.CARD_W,
        h: this.CARD_H,
      });
    }
  }

  _handleClick(e) {
    const rect   = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check passive cards
    for (let i = 0; i < this.passiveRects.length; i++) {
      if (this._hitTest(mouseX, mouseY, this.passiveRects[i])) {
        this._toggleCard(this.PASSIVES[i], this.selectedPassives, 4);
        return;
      }
    }

    // Check race cards
    for (let i = 0; i < this.raceCardRects.length; i++) {
      if (this._hitTest(mouseX, mouseY, this.raceCardRects[i])) {
        this._toggleCard(this.RACE_CARDS[i], this.selectedRaceCards, 3);
        return;
      }
    }

    // Check START button
    const btnX = this.canvas.width * 0.5 - 80;
    const btnY = this.canvas.height - 70;
    if (this._canStart() &&
        mouseX > btnX && mouseX < btnX + 160 &&
        mouseY > btnY && mouseY < btnY + 45) {
      this.onConfirm(this.selectedPassives, this.selectedRaceCards);
    }
  }

  _hitTest(mx, my, rect) {
    return mx > rect.x && mx < rect.x + rect.w &&
           my > rect.y && my < rect.y + rect.h;
  }

  _toggleCard(name, list, max) {
    const idx = list.indexOf(name);
    if (idx !== -1) {
      list.splice(idx, 1); // deselect
    } else if (list.length < max) {
      list.push(name);     // select if slot available
    }
  }

  _canStart() {
    return true
  }

  render() {
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT YOUR CARDS', W * 0.5, 50);

    // Section labels
    ctx.font      = 'bold 16px monospace';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    ctx.fillText(`PASSIVE UPGRADES  (${this.selectedPassives.length}/4)`, 40, 108);
    ctx.fillText(`RACE CARDS  (${this.selectedRaceCards.length}/3)`, 40, 328);

    // Draw passive cards
    for (let i = 0; i < this.PASSIVES.length; i++) {
      const name     = this.PASSIVES[i];
      const rect     = this.passiveRects[i];
      const selected = this.selectedPassives.indexOf(name) !== -1;
      this._drawCard(rect.x, rect.y, name, selected);
    }

    // Draw race cards
    for (let i = 0; i < this.RACE_CARDS.length; i++) {
      const name     = this.RACE_CARDS[i];
      const rect     = this.raceCardRects[i];
      const selected = this.selectedRaceCards.indexOf(name) !== -1;
      this._drawCard(rect.x, rect.y, name, selected);
    }

    // START button
    const btnX = W * 0.5 - 80;
    const btnY = H - 70;
    ctx.fillStyle = this._canStart() ? '#FFD700' : '#333333';
    ctx.fillRect(btnX, btnY, 160, 45);
    ctx.fillStyle = this._canStart() ? '#000000' : '#666666';
    ctx.font      = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('START', W * 0.5, btnY + 30);

    ctx.textAlign = 'left';
  }

  _drawCard(x, y, name, selected) {
    const ctx = this.ctx;
    const w   = this.CARD_W;
    const h   = this.CARD_H;

    // Background
    if (selected) {
        ctx.fillStyle = 'rgba(255,215,0,0.15)';
    } else {
        ctx.fillStyle = 'rgba(20,20,20,0.9)';
    }
    ctx.fillRect(x, y, w, h);

    // Border
    if (selected) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth   = 2;
    } else {
        ctx.strokeStyle = '#444444';
        ctx.lineWidth   = 1;
    }
    ctx.strokeRect(x, y, w, h);

    // Image
    const img = this.images[name];
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, x + 4, y + 4, w - 8, h - 22);
    }

    // Name
    if (selected) {
        ctx.fillStyle = '#FFD700';
    } else {
        ctx.fillStyle = '#cccccc';
    }
    ctx.font      = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(name, x + w * 0.5, y + h - 6);

    ctx.textAlign = 'left';
}
}