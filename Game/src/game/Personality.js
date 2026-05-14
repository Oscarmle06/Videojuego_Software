export class Personality {
    constructor(personality, lookahead, brakeThreshold) {
        this.personality = personality;
        this.lookahead = lookahead;
        this.brakeThreshold = brakeThreshold;
    }
    getInput(kart, track) {
            let closestIndex = kart.currentSplineIndex;
            let closestDist = Infinity;
        for (let i = 0; i < 10; i++) {
            const index = (kart.currentSplineIndex + i) % track.splinePoints.length;
            const point = track.splinePoints[index];
            const dx = point.x - kart.x;
            const dy = point.y - kart.y;
            const dist = dx*dx + dy*dy;
            if (dist < closestDist) {
                closestDist = dist;
                closestIndex = index;
            }
        }
        kart.currentSplineIndex = closestIndex;
        const targetIndex = (closestIndex + this.lookahead) % track.splinePoints.length;
        const targetPoint = track.splinePoints[targetIndex];
        const dx = targetPoint.x - kart.x;
        const dy = targetPoint.y - kart.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        const tx = dx / len;
        const ty = dy / len;
        const nx = -ty;
        const ny = tx;
        const distTangente = dx * tx + dy * ty;
        const cross = kart.dirX * ty - kart.dirY * tx;
        const dot = kart.dirX * tx + kart.dirY * ty;
        
        const accelerate = dot > this.brakeThreshold; // Acelerar si estamos apuntando hacia el checkpoint
        const brake = !accelerate;      // Frenar si no estamos apuntando hacia el checkpoint
        const turnLeft = cross < 0;  // Girar a la izquierda si el checkpoint está a la derecha
        const turnRight = cross > 0; // Girar a la derecha si el checkpoint está a la izquierda
           
        return  {
            accelerate: accelerate,
            brake: brake,
            turnLeft: turnLeft,
            turnRight: turnRight
            }
        }
}