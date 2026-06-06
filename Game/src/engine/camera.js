// camera.js
// This module defines the Camera class, which manages the camera's position and orientation in the game world. The camera follows the player's kart smoothly, providing a third-person perspective.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026


export class Camera { // Constructor for the Camera class, initializes the camera's position and orientation
  constructor(x, y, dirX, dirY) {
    this.posX = x;
    this.posY = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.planeX = -dirY * Math.tan(60 * Math.PI / 180); // 60 degree FOV
    this.planeY =  dirX * Math.tan(60 * Math.PI / 180); // 60 degree FOV
    this.posZ = 400;
  }

  followPlayer(playerKart, deltaTime) {
    const targetX = playerKart.x - playerKart.dirX * 1.5;
    const targetY = playerKart.y - playerKart.dirY * 1.5;

    // Exponential lerp, smooth movement that quickly catches up to the target
    const posT = 1 - Math.exp(-8 * deltaTime); // 8 is a smoothing factor that determines how quickly the camera catches up to the target, closer to 1 means slower
    this.posX += (targetX - this.posX) * posT;
    this.posY += (targetY - this.posY) * posT;

    // Lerp for direction
    const dirT = 1 - Math.exp(-8 * deltaTime); // 8 is a smoothing factor that determines how quickly the camera changes direction to match the player's direction, closer to 1 means slower
    const lerpDirX = this.dirX + (playerKart.dirX - this.dirX) * dirT;
    const lerpDirY = this.dirY + (playerKart.dirY - this.dirY) * dirT;
    const len = Math.sqrt(lerpDirX * lerpDirX + lerpDirY * lerpDirY);
    this.dirX = lerpDirX / len;
    this.dirY = lerpDirY / len;

    this.planeX = -this.dirY * Math.tan(60 * Math.PI / 180);
    this.planeY =  this.dirX * Math.tan(60 * Math.PI / 180);
  }
}
