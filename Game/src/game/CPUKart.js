// CPUKart.js
// This module defines the CPUKart class, which extends PlayerKart and represents the AI-controlled karts in the game. It uses a Personality to determine its behavior on the track.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { PlayerKart } from './playerKart.js';
import { CPUCardSystem } from './CPUcardSystem.js';

export class CPUKart extends PlayerKart {
    constructor(x, y, dirX, dirY, personality, player) {
        super(x, y, dirX, dirY); // Call the parent constructor to initialize common properties
        this.personality = personality;
        this.currentSplineIndex = 0;
        this.player = player; 

    }

    initCardSystem(allKarts, vfx) {
        this.cardSystem = new CPUCardSystem(this, this.player, allKarts, vfx);
    }
 
    update(track, deltaTime) {
        const decisions = this.personality.getInput(this, track);
        super.update(decisions, track, deltaTime);
 
        if (this.cardSystem) {
            this.cardSystem.update(deltaTime);
        }
    }
}