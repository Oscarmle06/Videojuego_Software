export class Track {
  constructor(gridSize = 64) {
    this.gridSize = gridSize;
    this.grid     = [];
    this.waypoints = [];
    this.splinePoints = [];
    this.checkpoints = [];
    this.trackWidth = 1;
  }

  generate() {
    // Generar Waypoints
    this.generateWaypoints(15, 36, 34, 15, 17);
    this.generateCurve();
    this.generateEdges(3);
    this.generateCheckpoints();
    this.rasterize();
    this.findStartPosition();
  }

    generateWaypoints(N, centerX, centerY, baseRadius, variation){
      for (let i = 0; i < N; i++){
          const angle = (i / N) * Math.PI * 2;
          const radius = (i === 0 || i === 1 || i === N-1) ? baseRadius : baseRadius + Math.random() * variation;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          this.waypoints.push({x, y});
      }
      return this.waypoints
    }

    catmullRom(P0, P1, P2, P3, t) {
      const x = 0.5 * ((2 * P1.x) + (-P0.x + P2.x) * t + (2*P0.x - 5*P1.x + 4*P2.x - P3.x) * t*t + (-P0.x + 3*P1.x - 3*P2.x + P3.x) * t*t*t);
      const y = 0.5 * ((2 * P1.y) + (-P0.y + P2.y) * t + (2*P0.y - 5*P1.y + 4*P2.y - P3.y) * t*t + (-P0.y + 3*P1.y - 3*P2.y + P3.y) * t*t*t);
      return {x, y};
    }
    
    generateCurve(steps = 50) {
      const N = this.waypoints.length;

      for (let i = 0; i < N; i++) {
        const P0 = this.waypoints[(i - 1 + N) % N];
        const P1 = this.waypoints[i];
        const P2 = this.waypoints[(i + 1) % N];
        const P3 = this.waypoints[(i + 2) % N];

        for (let step = 0; step < steps; step++) {
          const t = step / steps;
          const point = this.catmullRom(P0, P1, P2, P3, t);
          this.splinePoints.push(point);
        }
      }
    }

    generateEdges(trackWidth) {
      this.trackWidth = trackWidth;
      this.leftEdge  = [];
      this.rightEdge = [];

      const N = this.splinePoints.length;

      for (let i = 0; i < N; i++) {
        const current = this.splinePoints[i];
        const next    = this.splinePoints[(i + 1) % N];

        // tangente
        const tx = next.x - current.x;
        const ty = next.y - current.y;

        // normalizar — hacer el vector de longitud 1
        const len = Math.sqrt(tx*tx + ty*ty);
        const nx = (-ty) / len;
        const ny = ( tx) / len;

        // bordes
        this.leftEdge.push({
          x: current.x + nx * trackWidth,
          y: current.y + ny * trackWidth
        });
        this.rightEdge.push({
          x: current.x - nx * trackWidth, 
          y: current.y - ny * trackWidth
        });
      }
    }

    rasterize() {
      // inicializar grid con puros 0
      this.grid = [];
      for (let y = 0; y < this.gridSize; y++) {
        this.grid[y] = [];
        for (let x = 0; x < this.gridSize; x++) {
          this.grid[y][x] = 0;
        }
      }

      // para cada punto del spline, pintar celdas cercanas como pista
      for (let i = 0; i < this.splinePoints.length; i++) {
        const left  = this.leftEdge[i];
        const right = this.rightEdge[i];

        // interpolar entre borde izquierdo y derecho
        for (let t = 0; t <= 1; t += 0.05) {
          const x = Math.floor(left.x + (right.x - left.x) * t);
          const y = Math.floor(left.y + (right.y - left.y) * t);

          if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.grid[y][x] = 1;
          }
        }
      }
    }

    findStartPosition(gridSlot = 0) {
      const idx = (0 - gridSlot * 15 + this.splinePoints.length) % this.splinePoints.length;
      const start = this.splinePoints[idx];
      const next  = this.splinePoints[(idx + 1) % this.splinePoints.length];

      // dirección inicial — apunta hacia donde va la pista
      const dx = next.x - start.x;
      const dy = next.y - start.y;
      const len = Math.sqrt(dx*dx + dy*dy);

      return {
        x:    start.x,
        y:    start.y,
        dirX: dx / len,
        dirY: dy / len
      };
    }

    generateCheckpoints(step = 3) {
      const pts = this.splinePoints;
      const N   = pts.length;
      for (let i = 0; i < N; i += step) {
          const current = pts[i];
          const next    = pts[(i + step) % N];
          const tx = next.x - current.x;
          const ty = next.y - current.y;
          const len = Math.sqrt(tx*tx + ty*ty);
          if (len < 0.001) continue;
          this.checkpoints.push({
            cx : current.x,
            cy : current.y,
            tx : tx / len,
            ty : ty / len,
            nx : (-ty) / len,
            ny : ( tx) / len,
          });
      }
    }
  }

//NEWEST VERSION
