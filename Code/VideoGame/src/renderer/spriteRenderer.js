// spriteRenderer.js
// This module defines the SpriteRenderer class, responsible for rendering all sprites in the game.
// It draws on the main canvas.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

export class SpriteRenderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this.width  = canvas.width;
    this.height = canvas.height;
  }

  render(camera, sprites) {
    this.ctx.imageSmoothingEnabled = false;

    // Sort sprites back to front so farther ones draw first
    sprites.sort((a, b) => {
      const distA = (a.x - camera.posX) ** 2 + (a.y - camera.posY) ** 2;
      const distB = (b.x - camera.posX) ** 2 + (b.y - camera.posY) ** 2;
      return distB - distA;
    });

    for (let i = 0; i < sprites.length; i++) {
      const sprite = sprites[i];
      const dx = sprite.x - camera.posX;
      const dy = sprite.y - camera.posY;

      // Inverse camera matrix — projects world position into camera space
      // invDet is 1 / determinant of the camera matrix (planeX*dirY - dirX*planeY)
      const invDet    = 1.0 / (camera.planeX * camera.dirY - camera.dirX * camera.planeY);
      const transformX = invDet * ( camera.dirY * dx - camera.dirX * dy);
      const transformY = invDet * (-camera.planeY * dx + camera.planeX * dy);

      // transformY is depth — skip if behind the camera
      if (transformY <= 0) continue;

      // Screen size based on distance (transformY), adjusted by optional scale
      const scale        = (sprite._scale ?? 1.0) * 0.5;
      const spriteHeight = Math.floor(this.height / transformY) * scale;
      const spriteWidth  = spriteHeight;

      // Screen position
      const screenX = Math.floor((this.width / 2) * (1 + transformX / transformY));
      const drawX   = screenX - spriteWidth * 0.5;
      const drawY   = (this.height / 2) + camera.posZ / transformY - spriteHeight;

      // Skip if fully off screen
      if (drawX + spriteWidth < 0 || drawX > this.width) continue;

      if (sprite.image) {
        this.ctx.save();
        this.ctx.globalAlpha = sprite._alpha ?? 1.0;

        // Spritesheet slice or full image
        if (sprite.sx !== undefined) {
          this.ctx.drawImage(
            sprite.image,
            sprite.sx, sprite.sy, sprite.sw, sprite.sh,
            drawX, drawY, spriteWidth, spriteHeight
          );
        } else {
          this.ctx.drawImage(sprite.image, drawX, drawY, spriteWidth, spriteHeight);
        }

        this.ctx.restore();
      } else if (sprite.color) {
        // Fallback: draw as a colored circle
        const r = Math.min(spriteWidth, spriteHeight) * 0.5;
        this.ctx.fillStyle = sprite.color;
        this.ctx.beginPath();
        this.ctx.arc(screenX, drawY + r, r, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }
}
