// CardSelectScreen.js
// Renders the between-race card selection screen where the player picks one of four
// randomly dealt cards (passive or active) before the next race starts.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

export class CardSelectScreen { // Full-screen overlay that shuffles and deals four cards, lets the player select one, then calls onConfirm with the chosen card
  constructor(canvas, ctx, images, onConfirm) { // images is the pre-loaded card image map from CardHUD; onConfirm is called with the selected card object
    this.canvas    = canvas;
    this.ctx       = ctx;
    this.images    = images;
    this.onConfirm = onConfirm;
    this.active    = false; // render() sets this to true; _handleClick ignores input while false
    this.bgImage = new Image();
    this.bgImage.src = './assets/card_selection.png';

    // Full card pool available for the deal — 4 passives (permanent stat upgrades) and 6 actives (one-race use)
    this.ALL_CARDS = [
      { name: 'Aerodynamic Spoiler', type: 'passive' },
      { name: 'Heavy Chassis',       type: 'passive' },
      { name: 'Sport Tires',         type: 'passive' },
      { name: 'Racing Transmission', type: 'passive' },
      { name: 'Tire Shredder',       type: 'battle' },
      { name: 'Grappler Hook',       type: 'battle' },
      { name: 'Sonic Wave',          type: 'battle' },
      { name: 'EMP',                 type: 'battle' },
      { name: 'Repair Bot',          type: 'battle' },
      { name: 'Temporary Armor',     type: 'battle' },
    ];

    this.CARD_W = 250;
    this.CARD_H = 270;
    this.GAP    = -60; // negative gap so cards slightly overlap for a compact hand look

    this.dealtCards   = [];
    this.selectedCard = null;
    this.cardRects    = []; // bounding boxes for hit-testing, recomputed each deal

    canvas.addEventListener('click', this._handleClick.bind(this));
  }

  _deal() { // Fisher-Yates shuffles ALL_CARDS and takes the first 4, then computes centred layout rectangles for each card
    const shuffled = [...this.ALL_CARDS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    this.dealtCards   = shuffled.slice(0, 4);
    this.selectedCard = null;
    this.cardRects    = [];

    const totalW  = 4 * this.CARD_W + 3 * this.GAP;
    const startX  = (this.canvas.width - totalW) * 0.5;  // centres the hand horizontally
    const startY  = (this.canvas.height - this.CARD_H) * 0.5;

    for (let i = 0; i < 4; i++) {
      this.cardRects.push({
        x: startX + i * (this.CARD_W + this.GAP),
        y: startY + 5,
        w: this.CARD_W,
        h: this.CARD_H,
      });
    }
  }

  _handleClick(e) { // Checks whether the click landed on a card or the START button; ignores clicks when the screen is not active
    if (!this.active) return;
    const rect   = this.canvas.getBoundingClientRect();
    // Map CSS pixels to the canvas's internal coordinate system (the canvas is CSS-scaled)
    const mouseX = (e.clientX - rect.left) * (this.canvas.width  / rect.width);
    const mouseY = (e.clientY - rect.top)  * (this.canvas.height / rect.height);

    for (let i = 0; i < this.cardRects.length; i++) {
      if (this._hitTest(mouseX, mouseY, this.cardRects[i])) {
        this.selectedCard = this.dealtCards[i];
        return;
      }
    }

    // START button — only active once the player has selected a card
    const btnX = this.canvas.width * 0.5 - 80;
    const btnY = this.canvas.height - 70;
    if (this.selectedCard &&
        mouseX > btnX && mouseX < btnX + 160 &&
        mouseY > btnY && mouseY < btnY + 45) {
      this.active = false;
      this.onConfirm(this.selectedCard);
    }
  }

  _hitTest(mx, my, rect) { // Returns true if (mx, my) is inside the given axis-aligned rectangle
    return mx > rect.x && mx < rect.x + rect.w &&
           my > rect.y && my < rect.y + rect.h;
  }

  render() { // Draws the background, all four dealt cards, and the START button; sets active=true on the first call
    this.active = true;
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;

    if (this.bgImage && this.bgImage.complete) {
        ctx.drawImage(this.bgImage, 0, 0, W, H);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 50px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CHOOSE A CARD', W * 0.5, 80);

    for (let i = 0; i < this.dealtCards.length; i++) {
      const card     = this.dealtCards[i];
      const rect     = this.cardRects[i];
      const selected = this.selectedCard && this.selectedCard.name === card.name;
      this._drawCard(rect.x, rect.y, card.name, selected);
    }

    // START button: gold when a card is selected, dark grey when not, to signal interactability
    const btnX = W * 0.5 - 80;
    const btnY = H - 70;
    ctx.fillStyle = this.selectedCard ? '#FFD700' : '#333333';
    ctx.fillRect(btnX, btnY, 160, 45);
    ctx.fillStyle = this.selectedCard ? '#000000' : '#666666';
    ctx.font      = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('START', W * 0.5, btnY + 30);
    ctx.textAlign = 'left';
  }

  _drawCard(x, y, name, selected) { // Draws a single card sprite at full opacity when selected, dimmed at 60% otherwise, with the card name below
    const ctx = this.ctx;
    const w   = this.CARD_W;
    const h   = this.CARD_H;

    const img = this.images[name];
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.globalAlpha = selected ? 1.0 : 0.6;
        ctx.drawImage(img, x, y, w, h);
        ctx.globalAlpha = 1.0;
    }

    if (selected) {
        ctx.fillStyle = '#FFD700'; // gold label for selected card
        ctx.font      = 'bold 20px monospace';
    } else {
        ctx.fillStyle = '#cccccc';
        ctx.font      = '20px monospace';
    }
    ctx.textAlign = 'center';
    ctx.fillText(name, x + w * 0.5, y + h + 14);
    ctx.textAlign = 'left';
  }
}