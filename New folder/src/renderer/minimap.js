export class Minimap {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.width  = canvas.width;
    this.height = canvas.height;
  }

  render(camera, sprites, track) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const scale = Math.min(this.width, this.height) / 70;
    // 1. Limpiar el mapa

    // 2. Dibujar la cuadrícula del piso
    this.ctx.strokeStyle = '#2a3a2a';
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i < 70; i++) {
        // línea vertical en x=i
        this.ctx.beginPath();
        this.ctx.moveTo(i * scale, 0);
        this.ctx.lineTo(i * scale, this.height);
        this.ctx.stroke();
        // línea horizontal en y=i — escríbela tú, es igual
        this.ctx.beginPath();
        this.ctx.moveTo(0, i * scale);
        this.ctx.lineTo(this.width, i * scale);
        this.ctx.stroke();
    }

    // 3. Dibujar los sprites como puntos
    for (const sprite of sprites) {
        const sx = sprite.x * scale;
        const sy = sprite.y * scale;

        this.ctx.fillStyle = sprite.color;
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // 4. Dibujar la cámara y su dirección
    const cx = camera.posX * scale;
    const cy = camera.posY * scale;

    // punto de la cámara
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // línea de dirección — apunta hacia donde mira
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(cx + camera.dirX * 10, cy + camera.dirY * 10);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    // 5. Dibujar minimapa
    const points = track.splinePoints;
      const first = points[0];

      this.ctx.strokeStyle = '#00ff00';
      this.ctx.beginPath();
      this.ctx.moveTo(first.x * scale, first.y * scale);

      for (const p of points) {
          this.ctx.lineTo(p.x * scale, p.y * scale);
      }

      this.ctx.lineTo(first.x * scale, first.y * scale);
      this.ctx.stroke();

      // borde izquierdo
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.moveTo(track.leftEdge[0].x * scale, track.leftEdge[0].y * scale);
      for (const p of track.leftEdge) {
        this.ctx.lineTo(p.x * scale, p.y * scale);
      }
      this.ctx.stroke();

      // borde derecho
      this.ctx.strokeStyle = '#ffff00';
      this.ctx.beginPath();
      this.ctx.moveTo(track.rightEdge[0].x * scale, track.rightEdge[0].y * scale);
      for (const p of track.rightEdge) {
        this.ctx.lineTo(p.x * scale, p.y * scale);
      }
      this.ctx.stroke();

      this.drawCheckpoints(track, scale);
        }

      drawCheckpoints(track, scale) {
    for (const cp of track.checkpoints) {
        const x1 = (cp.cx + cp.nx * track.trackWidth) * scale;
        const y1 = (cp.cy + cp.ny * track.trackWidth) * scale;
        const x2 = (cp.cx - cp.nx * track.trackWidth) * scale;
        const y2 = (cp.cy - cp.ny * track.trackWidth) * scale;

        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
}
}