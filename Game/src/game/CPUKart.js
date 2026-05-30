// CPUKart.js
// This module defines the CPUKart class, which extends PlayerKart and represents the AI-controlled karts in the game. It uses a Personality to determine its behavior on the track.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026



import { PlayerKart } from './playerKart.js';
import { CPUCardSystem } from './CPUcardSystem.js';

export class CPUKart extends PlayerKart {
    constructor(x, y, dirX, dirY, personality, player, audioCTX = null) {
        super(x, y, dirX, dirY); // Call the parent constructor to initialize common properties
        this.personality = personality;
        this.currentSplineIndex = 0;
        this.player = player; 
        this.audioCtx = audioCTX;
        this.engineSound = null;
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


        // SFX and Doppler
        if (this.engineSound && this.gainNode) {
            const dx = this.player.x - this.x;
            const dy = this.player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this.gainNode.gain.value = Math.max(0, 2 * (1 - dist / 20));
            const relSpeed = (this.dirX * dx + this.dirY * dy) / dist;
            this.engineSound.playbackRate.value = Math.max(0.1, 1.0 + relSpeed * 2.5);
        }

    }

        async initEngineSound() {
        if (!this.audioCtx) return;
        const response = await fetch('./assets/audios/motor.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const decoded = await this.audioCtx.decodeAudioData(arrayBuffer);

        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = 4;
        this.gainNode.connect(this.audioCtx.destination);

        this.engineSound = this.audioCtx.createBufferSource();
        this.engineSound.buffer = decoded;
        this.engineSound.loop = true;
        this.engineSound.loopStart = 0.1;
        this.engineSound.loopEnd = decoded.duration - 0.1;
        this.engineSound.connect(this.gainNode);
        this.engineSound.start();
    }

}