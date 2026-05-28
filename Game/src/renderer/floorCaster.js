// FloorCaster.js
// This module defines the FloorCaster class, responsible for rendering the floor and track using raycasting techniques.
// It draws on the main canvas
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026


export class FloorCaster {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this.width  = canvas.width;
    this.height = canvas.height;
  }

  render(camera, track) { // For more info on the 2.5D technique, reference How_to_Implement_2_5D.docx
    const horizon   = Math.floor(this.height / 2);
    const floorData = this.ctx.createImageData(this.width, this.height - horizon);
    const pixels    = floorData.data;

    for (let y = horizon; y < this.height; y++) {
      // How far is the floor on this row
      const rowDist = camera.posZ / (y - horizon);

      // Left and right ray corners for this row
      const floorX_step = rowDist * (camera.dirX - camera.planeX);
      const floorY_step = rowDist * (camera.dirY - camera.planeY);

      // How much to step per horizontal pixel
      const stepX = rowDist * (2 * camera.planeX) / this.width;
      const stepY = rowDist * (2 * camera.planeY) / this.width;

      // Start at the left corner of this row
      let floorX = camera.posX + floorX_step;
      let floorY = camera.posY + floorY_step;

      for (let x = 0; x < this.width; x++) {
        const color     = this.sampleTexture(floorX, floorY, track);
        const fogAmount = Math.min(rowDist / 20, 0.1);

        const i    = ((y - horizon) * this.width + x) * 4;
        pixels[i]   = color.r * (1 - fogAmount) + 120 * fogAmount;
        pixels[i+1] = color.g * (1 - fogAmount) + 207 * fogAmount;
        pixels[i+2] = color.b * (1 - fogAmount) + 247 * fogAmount;
        pixels[i+3] = 255;

        floorX += stepX;
        floorY += stepY;
      }
    }

    this.ctx.putImageData(floorData, 0, horizon);
  }

  sampleTexture(floorX, floorY, track) { // The sampleTexture method determines the color of the floor at a given world coordinate (floorX, floorY) based on the track's layout.
    const gridX   = Math.floor(floorX);
    const gridY   = Math.floor(floorY);
    const cp      = track.checkpoints[0];
    const dx      = floorX - cp.cx;
    const dy      = floorY - cp.cy;
    const along   = dx * cp.tx + dy * cp.ty;
    const across  = dx * cp.nx + dy * cp.ny;
    const checker = (gridX + gridY) % 2 === 0;

    if (gridX >= 0 && gridX < track.gridSize && gridY >= 0 && gridY < track.gridSize) {
      // Finish line
      if (Math.abs(along) < 1 && Math.abs(across) < track.trackWidth) {
        return checker ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
      }
      // Asphalt
      if (track.grid[gridY][gridX] === 1) {
        return { r: 80, g: 80, b: 80 };
      }
    }

    // Grass
    return { r: 96, g: 154, b: 59 };
  }
}