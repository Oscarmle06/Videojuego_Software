// VFX.js
// This module defines the VFX class, responsible for managing and rendering visual effects like shockwaves and shields.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

export class VFX {
    constructor() {
        this.effects = [];

        this.shockwaveSheet = new Image();
        this.shockwaveSheet.src = './assets/shockwave.png';

        this.shieldImg = new Image();
        this.shieldImg.src = './assets/shield.png';

        this.FRAME_W = Math.floor(500 / 3);
        this.FRAME_H = Math.floor(500 / 3);
        this.COLS    = 3;
        this.TOTAL_FRAMES = 9;
    }

    addShockwave(x, y, color = 'emp', owner = null) { // The addShockwave method adds a shockwave effect at the specified (x, y) coordinates with an optional color parameter. `owner` is the kart that created the effect, so it renders on that kart (not always the player).
        this.effects.push({
        type:     'shockwave',
        x, y,
        owner,
        elapsed:  0,
        duration: 0.6,
        color:    color,
        });
    }

    addHookLine(from, to) { // Adds a Grappler Hook tether: a line linking the kart that used the hook (from) to its victim (to). Stores kart references so the line tracks them as they move.
        this.effects.push({
            type:     'hookLine',
            from,     // kart that fired the hook
            to,       // victim kart
            elapsed:  0,
            duration: 3.0,
        });
    }

    addShield(x, y, owner = null) { // The addShield method adds a shield effect at the specified (x, y) coordinates. `owner` is the kart that created it, so the shield renders on that kart (not always the player).
        const effect = {
        type:    'shield',
        x, y,
        owner,
        elapsed: 0,
        active:  true,
        };
        this.effects.push(effect);
        return effect;
    }

    update(deltaTime, playerKart) { // The update method iterates through the active effects and updates their elapsed time. For shockwave effects, it checks if the elapsed time has exceeded the duration and removes the effect if so. For shield effects, it checks if the shield is still active and removes it if not. Additionally, for shield effects, it updates their position to follow the player kart.
        for (let i = this.effects.length - 1; i >= 0; i--) {
        const e = this.effects[i];
        e.elapsed += deltaTime;

        // Effects follow the kart that created them (their owner), not always the player
        if (e.type === 'shield' || e.type === 'shockwave' || e.type === 'empShockwave') {
            if (e.owner) {
                e.x = e.owner.x;
                e.y = e.owner.y;
            }
        }

        if (e.type === 'shockwave' && e.elapsed >= e.duration) {
            this.effects.splice(i, 1);
        }
        if (e.type === 'shield' && !e.active) {
            this.effects.splice(i, 1);
        }
        if (e.type === 'hookLine' && e.elapsed >= e.duration) {
            this.effects.splice(i, 1);
        }
        }
    }

    renderLines(camera, ctx, canvas) { // Draws every active Grappler Hook tether in screen space, projecting each kart's live world position with the same camera matrix the sprite renderer uses.
        for (const e of this.effects) {
            if (e.type !== 'hookLine') continue;

            const a = this._projectToScreen(camera, canvas, e.from.x, e.from.y);
            const b = this._projectToScreen(camera, canvas, e.to.x,   e.to.y);
            if (!a || !b) continue; // an endpoint is behind the camera

            // Fade out over the final second
            const remaining = e.duration - e.elapsed;
            const alpha = Math.max(0, Math.min(1, remaining));

            // Thicker when the closest endpoint is near the camera
            const width = Math.max(2, Math.min(16, 14 / Math.min(a.depth, b.depth)));

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.lineCap     = 'round';

            // Outer glow
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth   = width;
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur  = 12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Bright inner core
            ctx.shadowBlur  = 0;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth   = Math.max(1, width * 0.4);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            ctx.restore();
        }
    }

    _projectToScreen(camera, canvas, wx, wy) { // Projects a world (x, y) point to screen coordinates, anchored near the kart body. Returns null if the point is behind the camera.
        const dx = wx - camera.posX;
        const dy = wy - camera.posY;
        const invDet = 1.0 / (camera.planeX * camera.dirY - camera.dirX * camera.planeY);
        const transformX = invDet * ( camera.dirY * dx - camera.dirX * dy);
        const transformY = invDet * (-camera.planeY * dx + camera.planeX * dy); // depth
        if (transformY <= 0) return null;
        const screenX = (canvas.width / 2) * (1 + transformX / transformY);
        const groundY = (canvas.height / 2) + camera.posZ / transformY;
        const bodyY   = groundY - (canvas.height / transformY) * 0.25; // raise to the kart body
        return { x: screenX, y: bodyY, depth: transformY };
    }

    getSprites() { // The getSprites method generates an array of sprite objects for rendering the active effects. 
    // It checks the type of each effect and creates a corresponding sprite object with properties such as position, image, scale, and alpha for rendering.
    const sprites = [];

    for (const e of this.effects) {

      if (e.type === 'shockwave') {
        const progress   = e.elapsed / e.duration;           // 0 → 1
        const frameIndex = Math.min(Math.floor(progress * this.TOTAL_FRAMES), this.TOTAL_FRAMES - 1);
        const col = frameIndex % this.COLS;
        const row = Math.floor(frameIndex / this.COLS);

        sprites.push({ 
          x:        e.x,
          y:        e.y,
          image:    this.shockwaveSheet,
          // Recorte del spritesheet
          sx:       col * this.FRAME_W,
          sy:       row * this.FRAME_H,
          sw:       this.FRAME_W,
          sh:       this.FRAME_H,
          _scale:   2.0,
          _alpha: 1
        });
      }

      if (e.type === 'shield') {
        sprites.push({
          x:       e.x,
          y:       e.y,
          image:   this.shieldImg,
          _scale:  1.5,
          _alpha: 0.4
        });
      }
    }

    return sprites;
  }
}
    
                
