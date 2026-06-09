// Minimap.js
// This module defines the Minimap class, responsible for rendering a top-down view of the track, the player's and CPU positions.
// This draws on the second canvas.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026


export class Minimap {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.width  = canvas.width;
    this.height = canvas.height;
  }

  render(camera, sprites, track, level) {

    const ctx   = this.ctx;
    const scale = Math.min(this.width, this.height) / 70;

    ctx.clearRect(0, 0, this.width, this.height);

    // Grid background
    ctx.strokeStyle = '#2a3a2a';
    ctx.lineWidth   = 0.5;
    for (let i = 0; i < 70; i++) {
      ctx.beginPath();
      ctx.moveTo(i * scale, 0);
      ctx.lineTo(i * scale, this.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * scale);
      ctx.lineTo(this.width, i * scale);
      ctx.stroke();
    }

    // Track main spline 
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(track.splinePoints[0].x * scale, track.splinePoints[0].y * scale);
    for (let i = 1; i < track.splinePoints.length; i++) {
      ctx.lineTo(track.splinePoints[i].x * scale, track.splinePoints[i].y * scale);
    }
    ctx.lineTo(track.splinePoints[0].x * scale, track.splinePoints[0].y * scale);
    ctx.stroke();

    // Left track edge
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(track.leftEdge[0].x * scale, track.leftEdge[0].y * scale);
    for (let i = 1; i < track.leftEdge.length; i++) {
      ctx.lineTo(track.leftEdge[i].x * scale, track.leftEdge[i].y * scale);
    }
    ctx.stroke();

    // Right track edge
    ctx.strokeStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(track.rightEdge[0].x * scale, track.rightEdge[0].y * scale);
    for (let i = 1; i < track.rightEdge.length; i++) {
      ctx.lineTo(track.rightEdge[i].x * scale, track.rightEdge[i].y * scale);
    }
    ctx.stroke();

    if (track.racingLinePoints && track.racingLinePoints.length > 0) {
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(track.racingLinePoints[0].x * scale, track.racingLinePoints[0].y * scale);
        for (let i = 1; i < track.racingLinePoints.length; i++) {
            ctx.lineTo(track.racingLinePoints[i].x * scale, track.racingLinePoints[i].y * scale);
        }
        ctx.lineTo(track.racingLinePoints[0].x * scale, track.racingLinePoints[0].y * scale);
        ctx.stroke();
    }

    // Kart dots
    for (let i = 0; i < sprites.length; i++) {
      ctx.fillStyle = sprites[i].color ?? '#0000ff';
      ctx.beginPath();
      ctx.arc(sprites[i].x * scale, sprites[i].y * scale, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player camera dot and direction line
    const cx = camera.posX * scale;
    const cy = camera.posY * scale;

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + camera.dirX * 8, cy + camera.dirY * 8);
    ctx.stroke();

    this.drawCheckpoints(track, scale);
    this.renderRaceNumber(level);
  }

  drawCheckpoints(track, scale) {
    const ctx = this.ctx;
    ctx.strokeStyle = '#00000000';
    ctx.lineWidth   = 1;
    for (let i = 0; i < track.checkpoints.length; i++) {
      const cp = track.checkpoints[i];
      ctx.beginPath();
      ctx.moveTo((cp.cx + cp.nx * cp.width) * scale, (cp.cy + cp.ny * cp.width) * scale);
      ctx.lineTo((cp.cx - cp.nx * cp.width) * scale, (cp.cy - cp.ny * cp.width) * scale);
      ctx.stroke();
    }
  }

  renderRaceNumber(level) {
    this.ctx.fillStyle = '#ffffff';
this.ctx.font      = 'bold 18px monospace';
this.ctx.textAlign = 'center';
this.ctx.fillText(`Race ${level}`, this.width-52, 22);
this.ctx.textAlign = 'left';
}
}