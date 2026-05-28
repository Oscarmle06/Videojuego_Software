// playerKart.js
// This module defines the PlayerKart, which represents all of the karts in the game, including the player and the CPUs. It handles movement, collisions, checkpoints, laps, and active effects like shockwaves and shields.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { Shield } from './cardEffects.js';

export class PlayerKart {
  constructor(x, y, dirX, dirY) {
    this.x = x;
    this.y = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.maxHP = 50;
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
    this.activeEffects  = [];
    this.cardsDisabled  = false;
    this.hasShield      = false;
  }

  update(decisions, track, deltaTime) { // The update method takes the decisions from the CPU personality (or player input) and applies them to update the kart's speed, direction, position, and effects. It also checks for checkpoint progress and lap completion.
    if (decisions.accelerate) { // If the accelerate decision is true, increase the speed by the acceleration rate multiplied by deltaTime. This allows for smooth acceleration over time.
      this.speed += this.acceleration * deltaTime;
    }
    if (decisions.brake) { // If the brake decision is true, decrease the speed by the acceleration rate multiplied by deltaTime. This allows for smooth deceleration over time.
      this.speed -= this.acceleration * deltaTime;
    }
    if (decisions.turnLeft) { // If the turnLeft decision is true, rotate the direction vector to the left. The rotation speed is based on the baseRotationSpeed and is scaled by the current speed relative to maxSpeed, so that you can turn faster at higher speeds. The rotation is applied using a standard 2D rotation matrix.
      const rotationSpeed = this.baseRotationSpeed * (this.speed / this.maxSpeed);
      const cos = Math.cos(-rotationSpeed * deltaTime);
      const sin = Math.sin(-rotationSpeed * deltaTime);
      const oldDirX = this.dirX;
      this.dirX = this.dirX * cos - this.dirY * sin;
      this.dirY = oldDirX * sin + this.dirY * cos;
    }
    if (decisions.turnRight) { // If the turnRight decision is true, rotate the direction vector to the right. The rotation speed is based on the baseRotationSpeed and is scaled by the current speed relative to maxSpeed, so that you can turn faster at higher speeds. The rotation is applied using a standard 2D rotation matrix.
      const rotationSpeed = this.baseRotationSpeed * (this.speed / this.maxSpeed);
      const cos = Math.cos(rotationSpeed * deltaTime);
      const sin = Math.sin(rotationSpeed * deltaTime);
      const oldDirX = this.dirX;
      this.dirX = this.dirX * cos - this.dirY * sin;
      this.dirY = oldDirX * sin + this.dirY * cos;
    }
    this.speed -= this.friction * this.speed * deltaTime;

    const onGrass = this._isOnGrass(track); // Check if the kart is currently on grass, which affects the speed limit. The _isOnGrass method checks the track's grid to determine if the kart's current position is on a grass tile or not
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

    for (let i = this.activeEffects.length - 1; i >= 0; i--) { // Update active effects in reverse order to allow for safe removal when they expire. Each effect's onUpdate method is called to apply its logic, and if the effect has expired, it is removed from the activeEffects array.
      this.activeEffects[i].onUpdate(this, deltaTime);
      if (this.activeEffects[i].expired) {
        this.activeEffects.splice(i, 1);
      }
    }

    this.checkCheckpoints(track);
  }

  checkCheckpoints(track) {
    const total = track.checkpoints.length;

    for (let offset = 0; offset < 10; offset++) { // Check the next few checkpoints ahead of the current one to see if the kart has passed any of them. This allows for some
      // corner cutting without missing track progress.
        const idx = (this.nextCheckpoint + offset) % total; // 
        const cp = track.checkpoints[idx];

        const dx = this.x - cp.cx;
        const dy = this.y - cp.cy;
        const along = dx * cp.tx + dy * cp.ty;
        const across = dx * cp.nx + dy * cp.ny; // Calculate the distance from the kart to the checkpoint along the tangent direction (along) and the normal direction (across). 
        // The kart is considered to have passed the checkpoint if it is within a certain distance along the tangent and within the width of the checkpoint along the normal.

        if (Math.abs(along) < 3 && Math.abs(across) < cp.width) {
            this.nextCheckpoint = (idx + 1) % total;
            this.lapProgress = this.nextCheckpoint / total;

            if (this.nextCheckpoint === 0) {
                this.laps++;
                this.lapProgress = 0;
            }
            break;
        }
    }
}

  applyEffect(effect) { // The applyEffect method is called when the kart selects up a card.
  this.activeEffects.push(effect);
  effect.onApply(this);
  } 

  _applyDamage(amount) {  // The _applyDamage method is called when the kart takes damage from collisions or attacks. It first checks if the kart has an active shield effect.
    for (let i = 0; i < this.activeEffects.length; i++) {
        if (this.activeEffects[i] instanceof Shield) {
            this.activeEffects[i].absorb();
            return;
        }
    }
    this.hp = Math.max(0, this.hp - amount);
}

  _isOnGrass(track) { // The _isOnGrass method checks the track's grid to determine if the kart's current position is on a grass tile or not.
    const gx = Math.floor(this.x);
    const gy = Math.floor(this.y);
    if (gx < 0 || gx >= track.gridSize || gy < 0 || gy >= track.gridSize) return true;
    return track.grid[gy][gx] !== 1;
  }

  checkKartCollision(other) { // The checkKartCollision method checks for collisions between this kart and another kart. 
  // It calculates the distance between the two karts and if they are colliding, it applies a simple elastic collision response to separate them and adjust their velocities. 
  // It also applies damage to both karts based on the impact speed.
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
    const vRel = (v2x - v1x) * nx + (v2y - v1y) * ny; // How fast the karts are moving towards each other along the normal direction. 
    // If this is positive, they are moving apart, and we can skip the collision response. 
    // If it's negative, they are moving towards each other and we need to apply the collision response.

    // Skip if karts are already separating
    if (vRel >= 0) return;

    // impulse = -(1 + restitution {is 1 for elasticity}) * vRel / (1/m1 + 1/m2) -> * 0.5 for equal mass karts
    const impulse = -(2) * vRel * 0.5; 

    const new_v1x = v1x - impulse * nx;
    const new_v1y = v1y - impulse * ny;
    const new_v2x = v2x + impulse * nx;
    const new_v2y = v2y + impulse * ny;

    // Decompose velocity back into speed (scalar) + direction (unit vector)
    const newSpeed1 = Math.sqrt(new_v1x * new_v1x + new_v1y * new_v1y);
    if (newSpeed1 > 0.01) {
      this.speed = Math.min(newSpeed1, this.maxSpeed * 1.2); // Allow a small boost over max speed from collisions
      this.dirX = new_v1x / newSpeed1;
      this.dirY = new_v1y / newSpeed1;
    } else {
      this.speed = 0;
    }

    const newSpeed2 = Math.sqrt(new_v2x * new_v2x + new_v2y * new_v2y);
    if (newSpeed2 > 0.01) {
      other.speed = Math.min(newSpeed2, other.maxSpeed * 1.2); // Allow a small boost over max speed from collisions
      other.dirX = new_v2x / newSpeed2;
      other.dirY = new_v2y / newSpeed2;
    } else {
      other.speed = 0;
    }

    // Damage proportional to closing speed along the normal
    const impactSpeed = Math.abs(vRel);
    const damage = (impactSpeed / (this.maxSpeed * 2)) * 30;
    this._applyDamage(damage);
    other._applyDamage(damage);
  }
}
