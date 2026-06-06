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

    addShockwave(x, y, color = 'emp') { // The addShockwave method adds a shockwave effect at the specified (x, y) coordinates with an optional color parameter. The effect is stored in the effects array with its type, position, elapsed time, duration, and color.
        this.effects.push({
        type:     'shockwave',
        x, y,
        elapsed:  0,
        duration: 0.6,
        color:    color,   
        });
    }

    addShield(x, y) { // The addShield method adds a shield effect at the specified (x, y) coordinates. The effect is stored in the effects array with its type, position, elapsed time, and active status.
        const effect = {
        type:    'shield',
        x, y,
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

        // Effects should follow the player kart's position
        if (e.type === 'shield' || e.type === 'shockwave' || e.type === 'empShockwave') {
            e.x = playerKart.x;
            e.y = playerKart.y;
        }

        if (e.type === 'shockwave' && e.elapsed >= e.duration) {
            this.effects.splice(i, 1);
        }
        if (e.type === 'shield' && !e.active) {
            this.effects.splice(i, 1);
        }
        }
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
    
                
