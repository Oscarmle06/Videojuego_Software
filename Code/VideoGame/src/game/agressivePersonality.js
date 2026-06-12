// agressivePersonality.js
// Aggressive CPU: 
//   - Racing line normal cuando el jugador está lejos
//   - Blend racing line + dirección al jugador cuando está cerca (≤15u) y en frente
//   - Cuando el jugador está detrás (≤7u), se pone en su camino y FRENA
//     hasta que el jugador ya no esté cerca/detrás, luego cooldown de 10s
//   - Todo el comportamiento agresivo se activa 10 segundos después del inicio
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { Personality } from "./Personality.js";

const RAM_DIST       = 15;
const BLOCK_DIST     = 3;
const WARMUP_SEC     = 10;
const BLOCK_COOLDOWN = 10;

export class AgressivePersonality extends Personality {
    constructor() {
        super("aggressive", 20, 0.05);
        this.blockFrame     = 0;
        this._elapsed       = 0;
        this._ready         = false;
        this._blocking      = false;  // currently in block+brake mode
        this._blockCooldown = 0;      // cooldown after block ends
    }

    getInput(kart, track) {
        // ── 1. Find closest spline point ───────────────────────────────────────
        let closestIndex = kart.currentSplineIndex;
        let closestDist  = Infinity;
        for (let i = 0; i < 10; i++) {
            const index = (kart.currentSplineIndex + i) % track.racingLinePoints.length;
            const point = track.racingLinePoints[index];
            const ddx = point.x - kart.x;
            const ddy = point.y - kart.y;
            const d   = ddx * ddx + ddy * ddy;
            if (d < closestDist) { closestDist = d; closestIndex = index; }
        }
        kart.currentSplineIndex = closestIndex;

        // ── 2. Racing-line direction ────────────────────────────────────────────
        const targetIndex = (closestIndex + this.lookahead) % track.racingLinePoints.length;
        const targetPoint = track.racingLinePoints[targetIndex];
        const ldx  = targetPoint.x - kart.x;
        const ldy  = targetPoint.y - kart.y;
        const llen = Math.sqrt(ldx * ldx + ldy * ldy) || 0.001;
        const ltx  = ldx / llen;
        const lty  = ldy / llen;

        const lineCross = kart.dirX * lty - kart.dirY * ltx;
        const lineDot   = kart.dirX * ltx + kart.dirY * lty;

        // ── 3. Warmup ───────────────────────────────────────────────────────────
        if (!this._ready) {
            this._elapsed += 1 / 60;
            if (this._elapsed >= WARMUP_SEC) this._ready = true;
            return {
                accelerate: lineDot > this.brakeThreshold,
                brake:      lineDot <= this.brakeThreshold,
                turnLeft:   lineCross < 0,
                turnRight:  lineCross > 0,
            };
        }

        // ── 4. Tick block cooldown ──────────────────────────────────────────────
        if (this._blockCooldown > 0) this._blockCooldown -= 1 / 60;

        // ── 5. Player info ──────────────────────────────────────────────────────
        const playerInfo  = this.detectPlayer(kart);
        const dotToPlayer = playerInfo.dist > 0
            ? (playerInfo.dx * kart.dirX + playerInfo.dy * kart.dirY) / playerInfo.dist
            : 0;
        const playerInFront = dotToPlayer >  0.2;
        const playerBehind  = dotToPlayer < -0.2;
        const inRamRange    = kart.player && !isNaN(playerInfo.dist) && playerInfo.dist <= RAM_DIST;
        const inBlockRange  = kart.player && !isNaN(playerInfo.dist) && playerInfo.dist <= BLOCK_DIST;

        let accelerate, brake, turnLeft, turnRight;

        // ── 6. Manage block state ───────────────────────────────────────────────
        if (this._blocking) {
            // Exit block mode if player is no longer behind and close
            if (!inBlockRange || !playerBehind) {
                this._blocking      = false;
                this._blockCooldown = BLOCK_COOLDOWN;
            }
        } else {
            // Enter block mode if player is behind, close, and cooldown is clear
            if (inBlockRange && playerBehind && this._blockCooldown <= 0) {
                this._blocking = true;
            }
        }

        if (inRamRange && playerInFront) {
            // ── Ram mode ────────────────────────────────────────────────────────
            const weight = 1 - (playerInfo.dist / RAM_DIST);
            const pdx    = playerInfo.dx / playerInfo.dist;
            const pdy    = playerInfo.dy / playerInfo.dist;
            const blendX = ltx * (1 - weight) + pdx * weight;
            const blendY = lty * (1 - weight) + pdy * weight;
            const blen   = Math.sqrt(blendX * blendX + blendY * blendY) || 0.001;
            const cross  = kart.dirX * (blendY / blen) - kart.dirY * (blendX / blen);

            accelerate = true;
            brake      = false;
            turnLeft   = cross < 0;
            turnRight  = cross > 0;

        } else if (this._blocking) {
            // ── Block+brake mode ────────────────────────────────────────────────
            const checkpoint = track.checkpoints[kart.nextCheckpoint ?? 0];

            if (checkpoint) {
                const cpuLateral    = kart.x        * checkpoint.nx + kart.y        * checkpoint.ny;
                const playerLateral = kart.player.x * checkpoint.nx + kart.player.y * checkpoint.ny;
                const diff          = playerLateral - cpuLateral;
                const desperation   = 1 - Math.min(playerInfo.dist / BLOCK_DIST, 1);
                const lateralThreshold = 0.3 - desperation * 0.2;

                if (Math.abs(diff) > lateralThreshold) {
                    this.blockFrame++;
                    turnLeft  = this.blockFrame % 2 === 0 ? diff < 0  : lineCross < 0;
                    turnRight = this.blockFrame % 2 === 0 ? diff > 0  : lineCross > 0;
                } else {
                    turnLeft  = lineCross < 0;
                    turnRight = lineCross > 0;
                }
            } else {
                turnLeft  = lineCross < 0;
                turnRight = lineCross > 0;
            }

            accelerate = false;
            brake      = true;

        } else {
            // ── Normal racing line ──────────────────────────────────────────────
            accelerate = lineDot > this.brakeThreshold;
            brake      = !accelerate;
            turnLeft   = lineCross < 0;
            turnRight  = lineCross > 0;
        }

        return { accelerate, brake, turnLeft, turnRight };
    }
}