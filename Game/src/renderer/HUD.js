// This file is currently not being used, it was supposed to display some elements of the HUD, including the player kart, but it was not fully implemented and is currently not being used in the game. It may be used in the future to display more elements of the HUD, such as the player kart
// We found issues with rendering the player kart directly on the HUD, so we decided to render the player kart just like the other karts in the main render loop, and not use this HUD class for now.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

export class HUD {
  constructor(canvas, ctx, HUDassets) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this.width  = canvas.width;
    this.height = canvas.height;
    this.HUDassets = HUDassets;
  }

    render() {
      if (this.HUDassets.kartSprite.complete) {
      
        // Dibujar Jugador 1
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.HUDassets.kartSprite, this.canvas.width - 550, this.canvas.height - 400 , 512, 512);
      }
    }
}