export class PlayerKart {
  constructor(x, y, dirX, dirY) {
    this.x = x;
    this.y = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.maxHP = 100;
    this.hp = this.maxHP;
    this.speed = 0;
    this.maxSpeed = 6;
    this.acceleration = 1.5;
    this.friction = 0.25;
    this.baseRotationSpeed = 3.0;
    this.laps = 0;
    this.lapProgress = 0;
    this.nextCheckpoint = 0;
    this.grassPenalty = 0.35;
    this.collisionRadius = 0.35;
  }

  update(decisions, track, deltaTime) {
    if (decisions.accelerate) {
      this.speed += this.acceleration * deltaTime;
    }
    if (decisions.brake) {
      this.speed -= this.acceleration * deltaTime;
    }
    if (decisions.turnLeft) {
      const rotationSpeed = this.baseRotationSpeed * (this.speed / this.maxSpeed);
      const cos = Math.cos(-rotationSpeed * deltaTime);
      const sin = Math.sin(-rotationSpeed * deltaTime);
      const oldDirX = this.dirX;
      this.dirX = this.dirX * cos - this.dirY * sin;
      this.dirY = oldDirX * sin + this.dirY * cos;
    }
    if (decisions.turnRight) {
      const rotationSpeed = this.baseRotationSpeed * (this.speed / this.maxSpeed);
      const cos = Math.cos(rotationSpeed * deltaTime);
      const sin = Math.sin(rotationSpeed * deltaTime);
      const oldDirX = this.dirX;
      this.dirX = this.dirX * cos - this.dirY * sin;
      this.dirY = oldDirX * sin + this.dirY * cos;
    }
    this.speed -= this.friction * this.speed * deltaTime;

    const onGrass = this._isOnGrass(track);
    const speedLimit = onGrass ? this.maxSpeed * this.grassPenalty : this.maxSpeed;
    if (onGrass && this.speed > speedLimit) {
      this.speed *= 0.95;
    }
    if (this.speed > speedLimit) this.speed = speedLimit;
    if (this.speed < -speedLimit / 2) this.speed = -speedLimit / 2;

    this.x += this.dirX * this.speed * deltaTime;
    this.y += this.dirY * this.speed * deltaTime;

    // Clamp to grid bounds
    this.x = Math.max(0.5, Math.min(track.gridSize - 0.5, this.x));
    this.y = Math.max(0.5, Math.min(track.gridSize - 0.5, this.y));

    this.checkCheckpoints(track);
  }

  checkCheckpoints(track) {
    const checkpoint = track.checkpoints[this.nextCheckpoint];
    const dx = this.x - checkpoint.cx;
    const dy = this.y - checkpoint.cy;
    const distTangente = dx * checkpoint.tx + dy * checkpoint.ty;
    const distNormal = dx * checkpoint.nx + dy * checkpoint.ny;
    if (Math.abs(distTangente) < 3 && Math.abs(distNormal) < track.trackWidth + 20) {
      this.nextCheckpoint = (this.nextCheckpoint + 1) % track.checkpoints.length;
      this.lapProgress = this.nextCheckpoint / track.checkpoints.length;
      if (this.nextCheckpoint === 0) {
        this.laps++;
        this.lapProgress = 0;
      }
    }
  }

  _isOnGrass(track) {
    const gx = Math.floor(this.x);
    const gy = Math.floor(this.y);
    if (gx < 0 || gx >= track.gridSize || gy < 0 || gy >= track.gridSize) return true;
    return track.grid[gy][gx] !== 1;
  }

  checkKartCollision(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distSq = dx * dx + dy * dy;
    const minDist = this.collisionRadius + other.collisionRadius;

    if (distSq >= minDist * minDist || distSq < 0.0001) return;
    const dist = Math.sqrt(distSq);
    const nx = dx / dist;
    const ny = dy / dist;

    // Separate karts gradually (20% per frame) to avoid instant position jump
    const overlap = minDist - dist;
    this.x -= nx * overlap * 0.2;
    this.y -= ny * overlap * 0.2;
    other.x += nx * overlap * 0.2;
    other.y += ny * overlap * 0.2;

    // Full velocity vectors (direction × speed)
    const v1x = this.dirX * this.speed;
    const v1y = this.dirY * this.speed;
    const v2x = other.dirX * other.speed;
    const v2y = other.dirY * other.speed;

    // Relative velocity projected onto the collision normal
    const vRel = (v2x - v1x) * nx + (v2y - v1y) * ny;

    // Skip if karts are already separating
    if (vRel >= 0) return;

    const impulse = -(2) * vRel * 0.5;

    const new_v1x = v1x - impulse * nx;
    const new_v1y = v1y - impulse * ny;
    const new_v2x = v2x + impulse * nx;
    const new_v2y = v2y + impulse * ny;

    // Decompose velocity back into speed (scalar) + direction (unit vector)
    const newSpeed1 = Math.sqrt(new_v1x * new_v1x + new_v1y * new_v1y);
    if (newSpeed1 > 0.01) {
      this.speed = Math.min(newSpeed1, this.maxSpeed * 1.2);
      this.dirX = new_v1x / newSpeed1;
      this.dirY = new_v1y / newSpeed1;
    } else {
      this.speed = 0;
    }

    const newSpeed2 = Math.sqrt(new_v2x * new_v2x + new_v2y * new_v2y);
    if (newSpeed2 > 0.01) {
      other.speed = Math.min(newSpeed2, other.maxSpeed * 1.2);
      other.dirX = new_v2x / newSpeed2;
      other.dirY = new_v2y / newSpeed2;
    } else {
      other.speed = 0;
    }

    // Damage proportional to closing speed along the normal
    const impactSpeed = Math.abs(vRel);
    const damage = (impactSpeed / (this.maxSpeed * 2)) * 30;
    this.hp = Math.max(0, this.hp - damage);
    other.hp = Math.max(0, other.hp - damage);
  }
}
