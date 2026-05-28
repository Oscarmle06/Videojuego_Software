// track.js
// This module defines the Track class, responsible for generating the track layout, including checkpoints.
// Trees and the finish line are also generated here.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

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
    this.generateWaypoints(14, 40, 34, 18, 13);
    this.generateCurve();
    this.generateEdges(3);
    this.generateCheckpoints();
    this.rasterize();
    this.findStartPosition();
    this.generateRacingLine();
  }

    generateWaypoints(N, centerX, centerY, baseRadius, variation){ // The generateWaypoints method creates a set of waypoints arranged in a circular pattern around a specified center point.
      for (let i = 0; i < N; i++){
          const angle = (i / N) * Math.PI * 2;
          const radius = (i === 0 || i === 1 || i === N-1) ? baseRadius : baseRadius + Math.random() * variation;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          this.waypoints.push({x, y});
      }
      return this.waypoints
    }

    catmullRom(P0, P1, P2, P3, t) { // The catmullRom method calculates a point on a Catmull-Rom spline defined by four control points (P0, P1, P2, P3) and a parameter t (0 to 1).
      const x = 0.5 * ((2 * P1.x) + (-P0.x + P2.x) * t + (2*P0.x - 5*P1.x + 4*P2.x - P3.x) * t*t + (-P0.x + 3*P1.x - 3*P2.x + P3.x) * t*t*t);
      const y = 0.5 * ((2 * P1.y) + (-P0.y + P2.y) * t + (2*P0.y - 5*P1.y + 4*P2.y - P3.y) * t*t + (-P0.y + 3*P1.y - 3*P2.y + P3.y) * t*t*t);
      return {x, y};
    }
    
    generateCurve(steps = 50) { // The generateCurve method creates a smooth track by generating points along a Catmull-Rom spline defined by the waypoints. 
    // It iterates through each waypoint and uses it along with its neighbors to calculate points on the spline, which are stored in the splinePoints array.
      const N = this.waypoints.length;

      for (let i = 0; i < N; i++) {
        const P0 = this.waypoints[(i - 1 + N) % N];
        const P1 = this.waypoints[i];
        const P2 = this.waypoints[(i + 1) % N];
        const P3 = this.waypoints[(i + 2) % N];

        for (let step = 0; step < steps; step++) {
          const t = step / steps;
          const point = this.catmullRom(P0, P1, P2, P3, t);
          this.splinePoints.push(point); // The generated spline points are stored in the splinePoints array
      }
      }
    }

    // The generateTrees method randomly places a specified number of trees on the track
    generateTrees(count = 100, minDist = 1.5, margin = 2) { // min dist is the minimum distance between trees, margin is the distance from the edges of the grid where trees won't be placed
    this.trees = [];
    const minDistSq = minDist * minDist;
    let attempts = 0;

    while (this.trees.length < count && attempts < count * 20) {
        attempts++;
        const x = margin + Math.random() * (this.gridSize - margin * 2);
        const y = margin + Math.random() * (this.gridSize - margin * 2);

        if (this.grid[Math.floor(y)][Math.floor(x)] === 1) continue; // Don't place trees on the track

        let tooClose = false;
        for (let i = 0; i < this.trees.length; i++) { // Check if the new tree is too close to existing trees
            const dx = this.trees[i].x - x;
            const dy = this.trees[i].y - y;
            if (dx*dx + dy*dy < minDistSq) {
                tooClose = true;
                break;
            }
        }
        if (tooClose) continue;

        this.trees.push({ x, y });
    }
}

    generateEdges(trackWidth) { // The generateEdges method calculates the left and right edges of the track based on the spline points and the specified track width.
      this.trackWidth = trackWidth;
      this.leftEdge  = [];
      this.rightEdge = [];

      const N = this.splinePoints.length;

      for (let i = 0; i < N; i++) {
        const current = this.splinePoints[i];
        const next    = this.splinePoints[(i + 1) % N];

        // tangent
        const tx = next.x - current.x;
        const ty = next.y - current.y;

        // normalized tangent 
        const len = Math.sqrt(tx*tx + ty*ty);
        const nx = (-ty) / len;
        const ny = ( tx) / len;

        // borders are trackWidth distance away from the center along the normal direction
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

    rasterize() { // The rasterize method creates a grid representation of the track by marking cells as 1 where the track is present and 0 elsewhere.
      // start with an empty grid
      this.grid = [];
      for (let y = 0; y < this.gridSize; y++) {
        this.grid[y] = [];
        for (let x = 0; x < this.gridSize; x++) {
          this.grid[y][x] = 0;
        }
      }

      // for each pair of left and right edge points, interpolate between them and mark the corresponding grid cells as 1 to indicate the presence of the track. 
      // This creates a rasterized representation of the track on the grid.
      for (let i = 0; i < this.splinePoints.length; i++) {
        const left  = this.leftEdge[i];
        const right = this.rightEdge[i];

        // From left to right edge, mark the grid cells as 1
        for (let t = 0; t <= 1; t += 0.05) {
          const x = Math.floor(left.x + (right.x - left.x) * t);
          const y = Math.floor(left.y + (right.y - left.y) * t);

          if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.grid[y][x] = 1;
          }
        }
      }
    }

    findStartPosition(gridSlot = 0) { // The findStartPosition method determines the starting position and direction for the karts based on a specified grid slot.
      const idx = (0 - gridSlot * 15 + this.splinePoints.length) % this.splinePoints.length;
      const start = this.splinePoints[idx];
      const next  = this.splinePoints[(idx + 1) % this.splinePoints.length];

      // Direction from start to next point on the spline, normalized to a unit vector. This will be the initial direction of the karts at the start of the
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

    generateCheckpoints(step = 3) { // The generateCheckpoints method creates checkpoints along the track by taking points from the spline at regular intervals 
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
            width : this.trackWidth * 4
          });
      }
    }

    findClosestSplineIndex(waypoint) {
    let closestIndex = 0;
    let closestDist = Infinity;
    for (let i = 0; i < this.splinePoints.length; i++) {
        const dx = this.splinePoints[i].x - waypoint.x;
        const dy = this.splinePoints[i].y - waypoint.y;
        const dist = dx*dx + dy*dy;
        if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
        }
    }
    return closestIndex;
}

  generateRacingLine() {
    const racingWaypoints = [];

    for (let i = 0; i < this.waypoints.length; i++) {
        const idx = this.findClosestSplineIndex(this.waypoints[i]);
        
        const N = this.splinePoints.length;
        const prev = this.splinePoints[(idx - 1 + N) % N];
        const curr = this.splinePoints[idx];
        const next = this.splinePoints[(idx + 1) % N];

        const t1x = curr.x - prev.x;
        const t1y = curr.y - prev.y;
        const t2x = next.x - curr.x;
        const t2y = next.y - curr.y;
        const t1len = Math.sqrt(t1x*t1x + t1y*t1y);
        const t2len = Math.sqrt(t2x*t2x + t2y*t2y);
        const curvature = (t1x/t1len) * (t2y/t2len) - (t1y/t1len) * (t2x/t2len);

        let apex;
        if (Math.abs(curvature) > 0.03) {
            const pct = 0.4;
            const edge = curvature < 0 ? this.rightEdge[idx] : this.leftEdge[idx];
            apex = {
                x: curr.x + (edge.x - curr.x) * pct,
                y: curr.y + (edge.y - curr.y) * pct
            };
        } else {
            apex = this.splinePoints[idx];
        }
        racingWaypoints.push(apex);  // ← faltaba esto
    }

    // Filtrar waypoints muy cercanos antes del Catmull-Rom
    const filtered = [racingWaypoints[0]];
    for (let i = 1; i < racingWaypoints.length; i++) {
        const prev = filtered[filtered.length - 1];
        const curr = racingWaypoints[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        if (dx*dx + dy*dy > 4) { // distancia mínima de 2 unidades
            filtered.push(curr);
        }
    }

    // Catmull-Rom afuera del loop ← aquí
    this.racingLinePoints = [];
    const N2 = racingWaypoints.length;
    for (let i = 0; i < N2; i++) {
        const P0 = racingWaypoints[(i - 1 + N2) % N2];
        const P1 = racingWaypoints[i];
        const P2 = racingWaypoints[(i + 1) % N2];
        const P3 = racingWaypoints[(i + 2) % N2];

        for (let step = 0; step < 50; step++) {
            const t = step / 50;
            this.racingLinePoints.push(this.catmullRom(P0, P1, P2, P3, t));
        }
    }
}

smoothRacingLine(iterations = 2) {
    for (let iter = 0; iter < iterations; iter++) {
        const N = this.racingLinePoints.length;
        const smoothed = [];
        for (let i = 0; i < N; i++) {
            const prev = this.racingLinePoints[(i - 1 + N) % N];
            const curr = this.racingLinePoints[i];
            const next = this.racingLinePoints[(i + 1) % N];
            smoothed.push({
                x: (prev.x + curr.x + next.x) / 3,
                y: (prev.y + curr.y + next.y) / 3
            });
        }
        this.racingLinePoints = smoothed;
    }
}


}


//NEWEST VERSION
