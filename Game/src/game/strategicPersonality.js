// strategicPersonality.js
// This module defines the StrategicPersonality class, a type of AI personality for CPU karts that focuses on using cards strategically.
// Note that the actual strategic behavior is not implemented yet, but will be.

import { Personality } from "./Personality.js";
export class StrategicPersonality extends Personality {
    constructor() {
        super("strategic", 25, 0.3);
    }

    getInput(kart, track) {
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
        const targetIndex = (closestIndex + this.lookahead) % track.racingLinePoints.length;
        const targetPoint = track.racingLinePoints[targetIndex];
        const dx = targetPoint.x - kart.x;
        const dy = targetPoint.y - kart.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        const tx = dx / len;
        const ty = dy / len;
        const cross = kart.dirX * ty - kart.dirY * tx;
        const dot   = kart.dirX * tx + kart.dirY * ty;

        const accelerate = dot > this.brakeThreshold;
        const brake = !accelerate;
        let turnLeft  = cross < 0;
        let turnRight = cross > 0;

        const playerInfo = this.detectPlayer(kart);
        if (playerInfo.dist < 10) {
            const checkpoint = track.checkpoints[kart.nextCheckpoint ?? 0];
            if (checkpoint) {
                const cpuLateral    = kart.x * checkpoint.nx + kart.y * checkpoint.ny;
                const playerLateral = kart.player.x * checkpoint.nx + kart.player.y * checkpoint.ny;
                const diff = playerLateral - cpuLateral;

                const desperation = (1 - Math.min(playerInfo.dist / 8, 1));
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
        }

        return { accelerate, brake, turnLeft, turnRight };
    }
}