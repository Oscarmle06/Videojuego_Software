// strategicPersonality.js
// Defines the StrategicPersonality AI: follows the racing line at moderate speed and
// actively blocks the player when they get close, using the checkpoint normal to mirror
// the player's lateral position on the track.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { Personality } from "./Personality.js";
export class StrategicPersonality extends Personality { // CPU personality that prioritizes track blocking over raw pace
    constructor() {
        super("strategic", 25, 0.3); // lookahead=25 points ahead on the racing line, brakeThreshold=0.3 (brakes on sharper turns)
    }

    getInput(kart, track) { // Returns the driving inputs for this frame; overrides blocking steering when the player is within 10 units
        // Find the nearest racing-line point ahead of the kart's last known index to re-anchor the lookahead target
        let closestIndex = kart.currentSplineIndex;
        let closestDist = Infinity;
        for (let i = 0; i < 10; i++) {
            const index = (kart.currentSplineIndex + i) % track.racingLinePoints.length;
            const point = track.racingLinePoints[index];
            const dx = point.x - kart.x;
            const dy = point.y - kart.y;
            const dist = dx*dx + dy*dy;
            if (dist < closestDist) {
                closestDist = dist;
                closestIndex = index;
            }
        }
        kart.currentSplineIndex = closestIndex;

        // Steer toward the point `lookahead` steps ahead on the racing line
        const targetIndex = (closestIndex + this.lookahead) % track.racingLinePoints.length;
        const targetPoint = track.racingLinePoints[targetIndex];
        const dx = targetPoint.x - kart.x;
        const dy = targetPoint.y - kart.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        const tx = dx / len;
        const ty = dy / len;
        const cross = kart.dirX * ty - kart.dirY * tx; // positive = target is to the right
        const dot   = kart.dirX * tx + kart.dirY * ty; // positive = target is ahead

        const accelerate = dot > this.brakeThreshold;
        const brake = !accelerate;
        let turnLeft  = cross < 0;
        let turnRight = cross > 0;

        // Blocking logic: when the player is close, steer to match their lateral position at the next checkpoint
        const playerInfo = this.detectPlayer(kart);
        if (playerInfo.dist < 10) {
            const checkpoint = track.checkpoints[kart.nextCheckpoint ?? 0];
            if (checkpoint) {
                const cpuLateral    = kart.x * checkpoint.nx + kart.y * checkpoint.ny;
                const playerLateral = kart.player.x * checkpoint.nx + kart.player.y * checkpoint.ny;
                const diff = playerLateral - cpuLateral; // positive = player is to the right of this kart

                // desperation increases as the player gets closer, making the block more aggressive
                const desperation = (1 - Math.min(playerInfo.dist / 8, 1));
                const curveThreshold = 0.4 + desperation * 0.4;
                const lateralThreshold = 0.3 - desperation * 0.2;
                const inCurve = Math.abs(cross) > curveThreshold; // skip blocking in tight corners to avoid spinning out

                if (Math.abs(diff) > lateralThreshold && !inCurve) {
                    this.blockFrame++;
                    if (this.blockFrame % 2 === 0) { // alternate every other frame to smooth out the blocking movement
                        turnLeft  = diff < 0;
                        turnRight = diff > 0;
                    }
                }
            }
        }

        return { accelerate, brake, turnLeft, turnRight };
    }
}