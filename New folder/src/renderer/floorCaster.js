export class FloorCaster {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this.width  = canvas.width;
    this.height = canvas.height;
  }

  render(camera, track) {
    const imageData = this.ctx.createImageData(this.width, this.height);
    const pixels    = imageData.data;

    const horizon = Math.floor(this.height / 2);

    // 1. Dibujar cielo (mitad superior)
    for (let y = 0; y < horizon; y++) {
        for (let x = 0; x < this.width; x++) {
            const i = (y * this.width + x) * 4;
            pixels[i]   = 120; // R
            pixels[i+1] = 207; // G
            pixels[i+2] = 247; // B
            pixels[i+3] = 255;
        }
        }
    // 2. Dibujar piso (mitad inferior)
    for (let y = horizon; y < this.height; y++) {

        // ¿Qué tan lejos está el suelo en esta fila?
        const rowDist = camera.posZ / (y - horizon);

        // Rayo izquierdo y derecho de la cámara
            //Fila muy lejos  → rowDist grande → floorX_step grande → esquina muy desplazada
            //Fila muy cerca  → rowDist pequeño → floorX_step pequeño → esquina poco desplazada
        const floorX_step = rowDist * (camera.dirX - camera.planeX);
        const floorY_step = rowDist * (camera.dirY - camera.planeY);

        // Cuánto avanza por cada píxel horizontal
            // 2 * planeX es el ancho total d
            // el plano de cámara.
            // De esquina izquierda a esquina derecha. 
            // Dividido entre width te da la fracción del mapa que corresponde a un píxel. 
            // Multiplicado por rowDist lo escala a la distancia correcta.
            // Fila lejos → rowDist grande → step grande → cada píxel salta mucho en el mapa → se ve comprimido. 
            // Fila cerca → step pequeño → cada píxel avanza poco → se ve expandido. Eso es la perspectiva.
        const stepX = rowDist * (2 * camera.planeX) / this.width;
        const stepY = rowDist * (2 * camera.planeY) / this.width;

        // Coordenada en el mapa donde empieza esta fila
        // la posición de la camara más el cambio por pixel de step basado en rowDist
        let floorX = camera.posX + floorX_step; // empieza en la esquina izquierda
        let floorY = camera.posY + floorY_step;

        for (let x = 0; x < this.width; x++) {
            // Samplear textura en (floorX, floorY)
            const color = this.sampleTexture(floorX, floorY, track);
            // fog — mezcla el color con gris oscuro según la distancia
            const fogR = 120, fogG = 207, fogB = 247;
            const fogAmount = Math.min(rowDist / 20, 0.3);  // 0 = cerca, 1 = lejos
            const r = color.r * (1 - fogAmount) + fogR * fogAmount;
            const g = color.g * (1 - fogAmount) + fogG * fogAmount;
            const b = color.b * (1 - fogAmount) + fogB * fogAmount;

            const i = (y * this.width + x) * 4;
            pixels[i]   = r;
            pixels[i+1] = g;
            pixels[i+2] = b;
            pixels[i+3] = 255;

            floorX += stepX;
            floorY += stepY;
        }
    }
        
    // 3. Mandar los píxeles a la pantalla
    this.ctx.putImageData(imageData, 0, 0);
    }

    // Textura checker piso
        sampleTexture(floorX, floorY, track) {
            const gridX = Math.floor(floorX);
            const gridY = Math.floor(floorY);
            const cp = track.checkpoints[0];
            const dx = floorX - cp.cx;
            const dy = floorY - cp.cy;
            const distTangente = dx * cp.tx + dy * cp.ty;
            const distNormal   = dx * cp.nx + dy * cp.ny;
            const checker = (Math.floor(floorX) + Math.floor(floorY)) % 2 === 0;
            // verificar que está dentro del grid
            if (gridX >= 0 && gridX < track.gridSize && gridY >= 0 && gridY < track.gridSize) {
                
                if (Math.abs(distTangente) < 1 && Math.abs(distNormal) < track.trackWidth *4) {
                // línea de meta
                return checker ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
                }
                else if (track.grid[gridY][gridX] === 1) {
                // asfalto
                return { r: 80, g: 80, b: 80 };
                }
            }
            // pasto — fuera de pista o fuera del grid
            return { r: 34, g: 100, b: 34 };
            }
    }

