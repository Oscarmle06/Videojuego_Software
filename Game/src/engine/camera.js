export class Camera {
  constructor(x, y, dirX, dirY) {
    this.posX = x;
    this.posY = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.planeX = -dirY * Math.tan(60 * Math.PI / 180);
    this.planeY =  dirX * Math.tan(60 * Math.PI / 180);
    this.posZ = 400;
  }

  followPlayer(playerKart, deltaTime) {
    const targetX = playerKart.x - playerKart.dirX * 1.5;
    const targetY = playerKart.y - playerKart.dirY * 1.5;

    // Exponential lerp: frame-rate independent, suave ante cambios bruscos de posición
    const posT = 1 - Math.exp(-12 * deltaTime);
    this.posX += (targetX - this.posX) * posT;
    this.posY += (targetY - this.posY) * posT;

    // Lerp de dirección + renormalizar (suaviza spin-outs y rebotes)
    const dirT = 1 - Math.exp(-8 * deltaTime);
    const lerpDirX = this.dirX + (playerKart.dirX - this.dirX) * dirT;
    const lerpDirY = this.dirY + (playerKart.dirY - this.dirY) * dirT;
    const len = Math.sqrt(lerpDirX * lerpDirX + lerpDirY * lerpDirY);
    this.dirX = lerpDirX / len;
    this.dirY = lerpDirY / len;

    this.planeX = -this.dirY * Math.tan(60 * Math.PI / 180);
    this.planeY =  this.dirX * Math.tan(60 * Math.PI / 180);
  }
}
