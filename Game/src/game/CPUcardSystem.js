// CPUCardSystem.js
// Maneja las cartas de los karts CPU. Las pasivas se aplican al equipar,
// las activas se usan automáticamente según la situación de la carrera,
// con un cooldown de 10 segundos entre usos.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { SpeedDebuff, SpeedDrain, SpeedBoost, Knockback, CardDisable, Shield } from './cardEffects.js';

const USE_COOLDOWN = 10;

export class CPUCardSystem {

    constructor(kart, player, allKarts, vfx) {
        this.kart      = kart;
        this.player    = player;
        this.allKarts  = allKarts;
        this.vfx       = vfx;
        this.slots     = [null, null, null];
        this._cooldown = 0;
    }

    // Agrega una carta al primer slot libre y aplica el efecto pasivo si aplica
    equip(card) {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                this.slots[i] = { ...card };
                if (card.type === 'passive') {
                    this._applyPassive(card);
                }
                return true;
            }
        }
        return false;
    }

    // Se llama cada frame desde CPUKart.update()
    update(deltaTime) {
        if (this._cooldown > 0) {
            this._cooldown -= deltaTime;
            return;
        }
        if (this.kart.cardDisabled) return;

        this._tryUseActiveCard();
    }

    // Aplica el efecto de una carta pasiva al kart
    _applyPassive(card) {
        if (card.name === 'Aerodynamic Spoiler') {
            this.kart.maxSpeed     += 1;
            this.kart.acceleration += 0.1;
        }
        if (card.name === 'Heavy Chassis') {
            this.kart.maxHP *= 1.2;
            this.kart.hp     = this.kart.maxHP;
        }
        if (card.name === 'Sport Tires') {
            this.kart.baseRotationSpeed += 1;
        }
        if (card.name === 'Racing Transmission') {
            this.kart.acceleration += 0.25;
        }
    }

    // Revisa todos los slots y usa la primera carta activa cuya condición se cumpla
    _tryUseActiveCard() {
        for (let i = 0; i < this.slots.length; i++) {
            const card = this.slots[i];
            if (card === null) continue;
            if (card.type !== 'active') continue;

            if (this._conditionMet(card.name)) {
                this._activate(card, i);
                return;
            }
        }
    }

    // Devuelve true si la situación de la carrera es la correcta para usar esa carta
    _conditionMet(name) {
        const playerDist    = this._distTo(this.player);
        const playerInFront = this._isInFront(this.player);
        const playerBehind  = this._isBehind(this.player);
        const myPosition    = this._getPosition();

        if (name === 'Tire Shredder') {
            // Solo si no vamos en 1er lugar y el jugador está adelante
            return myPosition > 1 && playerInFront && playerDist < 20;
        }
        if (name === 'Grappler Hook') {
            // Solo si no vamos en 1er lugar y el jugador está adelante
            return myPosition > 1 && playerInFront && playerDist < 20;
        }
        if (name === 'Sonic Wave') {
            // Solo si el jugador está muy cerca
            return playerBehind && playerDist < 4;
        }
        if (name === 'EMP') {
            // Solo si el jugador está atrás y cerca (nunca adelante, se desperdiciaría)
            return playerBehind && playerDist < 5;
        }
        if (name === 'Temporary Armor') {
            // Solo si tenemos menos del 40% de HP
            return (this.kart.hp / this.kart.maxHP) < 0.4;
        }

        return false;
    }

    // Ejecuta el efecto de la carta, la consume y arranca el cooldown
    _activate(card, slotIndex) {
        if (card.name === 'Tire Shredder') {
            const target = this._getNearestInFront();
            if (target !== null) {
                target.applyEffect(new SpeedDebuff(4, 0.4));
            }
        }

        if (card.name === 'Grappler Hook') {
            const target = this._getNearestInFront();
            if (target !== null) {
                const stolen = target.speed * 0.15;
                target.applyEffect(new SpeedDrain(3, 0.15));
                this.kart.applyEffect(new SpeedBoost(3, stolen));
            }
        }

        if (card.name === 'Sonic Wave') {
            this.vfx.addShockwave(this.kart.x, this.kart.y);
            const targets = this._getInRadius(3.5);
            for (let i = 0; i < targets.length; i++) {
                const t     = targets[i];
                const dx    = t.x - this.kart.x;
                const dy    = t.y - this.kart.y;
                const perpX = -this.kart.dirY;
                const perpY =  this.kart.dirX;
                let side    = 1;
                if ((dx * perpX + dy * perpY) < 0) side = -1;
                t.applyEffect(new Knockback(perpX * side * 30, perpY * side * 30, 15));
            }
        }

        if (card.name === 'EMP') {
            this.vfx.addShockwave(this.kart.x, this.kart.y, 'emp');
            const targets = this._getInRadius(4);
            for (let i = 0; i < targets.length; i++) {
                const t    = targets[i];
                const dx   = t.x - this.kart.x;
                const dy   = t.y - this.kart.y;
                let dist   = Math.sqrt(dx * dx + dy * dy);
                if (dist === 0) dist = 1;
                t.applyEffect(new Knockback((dx / dist) * 30, (dy / dist) * 30, 0));
                t.applyEffect(new CardDisable(2));
            }
        }

        if (card.name === 'Temporary Armor') {
            let yaEscudado = false;
            for (let i = 0; i < this.kart.activeEffects.length; i++) {
                if (this.kart.activeEffects[i].constructor.name === 'Shield') {
                    yaEscudado = true;
                }
            }
            if (!yaEscudado) {
                const shieldVFX = this.vfx.addShield(this.kart.x, this.kart.y);
                this.kart.applyEffect(new Shield(20, shieldVFX));
            }
        }

        this.slots[slotIndex] = null;
        this._cooldown = USE_COOLDOWN;
    }

    // Distancia entre este kart y un objetivo
    _distTo(target) {
        const dx = target.x - this.kart.x;
        const dy = target.y - this.kart.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // True si el objetivo está generalmente enfrente de este kart
    _isInFront(target) {
        const dx   = target.x - this.kart.x;
        const dy   = target.y - this.kart.y;
        let dist   = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) dist = 1;
        const dot  = (dx / dist) * this.kart.dirX + (dy / dist) * this.kart.dirY;
        return dot > 0.2;
    }

    // True si el objetivo está generalmente detrás de este kart
    _isBehind(target) {
        const dx   = target.x - this.kart.x;
        const dy   = target.y - this.kart.y;
        let dist   = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) dist = 1;
        const dot  = (dx / dist) * this.kart.dirX + (dy / dist) * this.kart.dirY;
        return dot < -0.2;
    }

    // Devuelve el kart más cercano que está enfrente
    _getNearestInFront() {
        let nearest = null;
        let minDist = Infinity;
        for (let i = 0; i < this.allKarts.length; i++) {
            const t = this.allKarts[i];
            if (t === this.kart) continue;
            const dx  = t.x - this.kart.x;
            const dy  = t.y - this.kart.y;
            const dot = dx * this.kart.dirX + dy * this.kart.dirY;
            if (dot <= 0) continue;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                nearest = t;
            }
        }
        return nearest;
    }

    // Devuelve todos los karts dentro de un radio dado
    _getInRadius(radius) {
        const result = [];
        const r2     = radius * radius;
        for (let i = 0; i < this.allKarts.length; i++) {
            const t = this.allKarts[i];
            if (t === this.kart) continue;
            const dx = t.x - this.kart.x;
            const dy = t.y - this.kart.y;
            if (dx * dx + dy * dy <= r2) {
                result.push(t);
            }
        }
        return result;
    }

    // Devuelve la posición actual de este kart en la carrera (1 = primero)
    _getPosition() {
        let totalCheckpoints = 1;
        if (this.allKarts.length > 0 && this.allKarts[0].nextCheckpoint !== undefined) {
            for (let i = 0; i < this.allKarts.length; i++) {
                if (this.allKarts[i].nextCheckpoint > totalCheckpoints) {
                    totalCheckpoints = this.allKarts[i].nextCheckpoint;
                }
            }
        }

        let myLaps = 0;
        let myCheckpoint = 0;
        if (this.kart.laps !== undefined) myLaps = this.kart.laps;
        if (this.kart.nextCheckpoint !== undefined) myCheckpoint = this.kart.nextCheckpoint;
        const myScore = myLaps * totalCheckpoints + myCheckpoint;

        let ahead = 0;
        for (let i = 0; i < this.allKarts.length; i++) {
            const k = this.allKarts[i];
            if (k === this.kart) continue;
            let kLaps = 0;
            let kCheckpoint = 0;
            if (k.laps !== undefined) kLaps = k.laps;
            if (k.nextCheckpoint !== undefined) kCheckpoint = k.nextCheckpoint;
            const score = kLaps * totalCheckpoints + kCheckpoint;
            if (score > myScore) ahead++;
        }

        return ahead + 1;
    }
}