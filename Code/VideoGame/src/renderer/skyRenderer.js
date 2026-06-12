// SkyRenderer.js
// This module defines the SkyRenderer class, responsible for rendering the sky background, including a scrolling sky texture that reacts to the player's direction.
// It draws on the main canvas.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

export class SkyRenderer {
  constructor(canvas, ctx, options = {}) {
    this.canvas        = canvas;
    this.ctx           = ctx;
    this.width         = canvas.width;
    this.height        = canvas.height;
    this.fallbackColor = options.fallbackColor ?? '#87CEEB';
    this.scrollSpeed   = options.scrollSpeed ?? 0.03;
    this.skyOffset     = 0; // current horizontal scroll position in pixels
    this.image         = null;

    if (options.imageSrc) {
      this.image     = new Image();
      this.image.src = options.imageSrc;
    }
  }

  render(camera) {
    const horizon = Math.floor(this.height / 2); // The horizon is set at the middle of the screen

    // Scroll the sky based on camera angle
    const angle      = Math.atan2(camera.dirY, camera.dirX); // Direction angle of the camera
    const normalized = (angle + Math.PI) / (Math.PI * 2); // 0 to 1 based on angle
    const imgW       = this.image.width; 
    const imgH       = this.image.height;

    let delta = normalized * imgW - this.skyOffset; // Calculate how much we need to scroll the sky to match the camera direction
    if (delta >  imgW * 0.5) delta -= imgW;
    if (delta < -imgW * 0.5) delta += imgW;

    // Update sky offset with a smoothing factor to prevent sudden jumps
    this.skyOffset = (this.skyOffset + delta * 0.15 + imgW) % imgW;
    const offsetX  = Math.floor(this.skyOffset);

    // Draw sky with wrapping
    const srcSliceW = imgW - offsetX;
    const dstSliceW = Math.ceil(this.width * srcSliceW / imgW);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.width, horizon);
    this.ctx.clip();

    this.ctx.drawImage(this.image, offsetX, 0, srcSliceW, imgH, 0, 0, dstSliceW, horizon);

    if (dstSliceW < this.width) {
      this.ctx.drawImage(this.image, 0, 0, offsetX, imgH, dstSliceW, 0, this.width - dstSliceW, horizon);
    }

    this.ctx.restore();
  }
}

// referenced from: https://lodev.org/cgtutor/raycasting.html