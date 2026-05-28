// personality.js
// This module defines the Personality class, which represents the AI behavior of CPU karts. It determines how they navigate the track.
// On future versions we will implement also CPU reacting to player position nearby.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

export class Personality {
    constructor(personality, lookahead, brakeThreshold) {
        this.personality = personality;
        this.lookahead = lookahead;
        this.brakeThreshold = brakeThreshold;
        this.blockFrame = 0;
    }
    getInput(kart, track) { // The getInput method calculates the target point on the track based on the kart's current position and the track's spline points. It then determines the direction to that target point and decides whether to accelerate, brake, or turn based on the angle between the kart's current direction and the direction to the target point.
            let closestIndex = kart.currentSplineIndex;
            let closestDist = Infinity;
        for (let i = 0; i < 10; i++) {
            const index = (kart.currentSplineIndex + i) % track.racingLinePoints.length;
            const point = track.racingLinePoints[index];
            const dx = point.x - kart.x; // Calculate the distance from the kart to this spline point
            const dy = point.y - kart.y; 
            const dist = dx*dx + dy*dy;
            if (dist < closestDist) {
                closestDist = dist;
                closestIndex = index;
            }
        }
        kart.currentSplineIndex = closestIndex;
        const targetIndex = (closestIndex + this.lookahead) % track.racingLinePoints.length;
        const targetPoint = track.racingLinePoints[targetIndex];
        const dx = targetPoint.x - kart.x;
        const dy = targetPoint.y - kart.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        const tx = dx / len;
        const ty = dy / len;
        const nx = -ty;
        const ny = tx;
        const distTangente = dx * tx + dy * ty; // Distance along the tangent direction (positive if in front, negative if behind)
        const distNormal = dx * nx + dy * ny;   // Distance along the normal direction (positive if to the right, negative if to the left)
        const cross = kart.dirX * ty - kart.dirY * tx; // Cross product to determine if the target is to the left or right of the kart's current direction
        const dot = kart.dirX * tx + kart.dirY * ty; // Dot product to determine how aligned the kart is with the target direction (positive if generally pointing towards it, negative if generally pointing away)
        
        const accelerate = dot > this.brakeThreshold; // Accelerate if we are generally pointing towards the checkpoint, otherwise brake to try to turn towards it
        const brake = !accelerate;      // Breake if we are not pointing towards the checkpoint
        const turnLeft = cross < 0;  // Turn left if the checkpoint is to the left
        const turnRight = cross > 0; // Turn right if the checkpoint is to the right
           
        return  {
            accelerate: accelerate,
            brake: brake,
            turnLeft: turnLeft,
            turnRight: turnRight,
            cross: cross
            }
        }

        detectPlayer(kart) {
            const player = kart.player; 
            const dx = player.x - kart.x;
            const dy = player.y - kart.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            // Is the player within detection range?
            const dot = (dx / dist) * kart.dirX + (dy / dist) * kart.dirY;

            return {
                dist,       // distance to the player
                dx, dy,     // vector towards the player
                inFront: dot > 0.3,   // true if the player is in front
                behind:  dot < -0.3,  // true if the player is behind
            };
        }

        applyBlocking(kart, track, cross, turnLeft, turnRight, detectionDist = 8, intensity = 1.0) {
    const playerInfo = this.detectPlayer(kart);
    if (!kart.player || isNaN(playerInfo.dist) || playerInfo.dist === 0) return { turnLeft, turnRight };
    if (playerInfo.behind && playerInfo.dist < detectionDist) {
        const checkpoint = track.checkpoints[kart.nextCheckpoint ?? 0];
        if (!checkpoint) return { turnLeft, turnRight };       
const cpuLateral    = kart.x * checkpoint.nx + kart.y * checkpoint.ny;
        const playerLateral = kart.player.x * checkpoint.nx + kart.player.y * checkpoint.ny;
        const diff = playerLateral - cpuLateral;

        const desperation = (1 - Math.min(playerInfo.dist / detectionDist, 1)) * intensity;
        const curveThreshold = 0.4 + desperation * 0.4;
        const lateralThreshold = 0.3 - desperation * 0.2;
        const inCurve = Math.abs(cross) > curveThreshold;

        if (Math.abs(diff) > lateralThreshold && !inCurve) {
            this.blockFrame++;
            if (this.blockFrame % 2 === 0) {
                turnLeft  = diff < 0;
                turnRight = diff > 0;
            }
        }
    }
    return { turnLeft, turnRight };
}
}

    
        
