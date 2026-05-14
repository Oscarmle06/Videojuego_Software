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