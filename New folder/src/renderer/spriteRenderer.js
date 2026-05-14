export class SpriteRenderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this.width  = canvas.width;
    this.height = canvas.height;
  }

  render(camera, sprites) {
    this.ctx.imageSmoothingEnabled = false;
    sprites.sort((a, b) => {
        const distA = (a.x - camera.posX) ** 2 + (a.y - camera.posY) ** 2;  // distancia de sprite A a la cámara
        const distB = (b.x - camera.posX) ** 2 + (b.y - camera.posY) ** 2;  // distancia de sprite B a la cámara
        return distB - distA;  // más lejos primero
    });

    for (const sprite of sprites) {
      const dx = sprite.x - camera.posX;
      const dy = sprite.y - camera.posY;

      // 1. Transformación inversa — coordenadas de cámara
      const invDet = 1.0 / (camera.planeX * camera.dirY - camera.dirX * camera.planeY);
      const transformX = invDet * ( camera.dirY * dx - camera.dirX * dy);
      const transformY = invDet * (-camera.planeY * dx + camera.planeX * dy);

      // 2. Si está detrás de la cámara, ignorar
      if (transformY <= 0) continue;

      // 3. Tamaño en pantalla
      const spriteHeight = Math.floor(this.height / transformY) * 0.5;
      const spriteWidth  = spriteHeight;

      // 4. Posición en pantalla
      const screenX = Math.floor((this.width / 2) * (1 + transformX / transformY));
      const drawX   = screenX - spriteWidth / 2;
      const drawY   = (this.height / 2) + camera.posZ / transformY - spriteHeight;

      // 5. Dibujar solo si es visible
      if (drawX + spriteWidth < 0 || drawX > this.width) continue;

      if (sprite.image) {
        this.ctx.drawImage(sprite.image, drawX, drawY, spriteWidth, spriteHeight);
      } else if (sprite.color) {
        const r = Math.min(spriteWidth, spriteHeight) / 2;
        this.ctx.fillStyle = sprite.color;
        this.ctx.beginPath();
        this.ctx.arc(screenX, drawY + r, r, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }
}