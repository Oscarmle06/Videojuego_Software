import { PlayerKart } from './playerKart.js';
export class CPUKart extends PlayerKart {
    constructor(x, y, dirX, dirY, personality) {
        super(x, y, dirX, dirY); // llama al constructor de PlayerKart
        this.personality = personality;
        this.currentSplineIndex = 0;

    }

    update(track, deltaTime) {
    const decisions = this.personality.getInput(this, track);
    super.update(decisions, track, deltaTime);
}
    
}