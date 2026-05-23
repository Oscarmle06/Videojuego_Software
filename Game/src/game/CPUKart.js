// CPUKart.js
// This module defines the CPUKart class, which extends PlayerKart and represents the AI-controlled karts in the game. It uses a Personality to determine its behavior on the track.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { PlayerKart } from './playerKart.js';

export class CPUKart extends PlayerKart {
    constructor(x, y, dirX, dirY, personality) {
        super(x, y, dirX, dirY); // Call the parent constructor to initialize common properties
        this.personality = personality;
        this.currentSplineIndex = 0;

    }

    update(track, deltaTime) { // The CPU kart's update method first gets the decisions from its personality based on the current state of the kart and the track, and then calls the parent update method to apply those decisions.
    const decisions = this.personality.getInput(this, track);
    super.update(decisions, track, deltaTime);
}
    
}