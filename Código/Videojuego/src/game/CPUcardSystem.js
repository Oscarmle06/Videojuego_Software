// CPUCardSystem.js
// Manages card logic for CPU karts. Passive cards are applied immediately on equip;
// active cards are used automatically when situational conditions are met,
// with a shared cooldown of 10 seconds between uses.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { SpeedDebuff, SpeedDrain, SpeedBoost, Knockback, CardDisable, Shield } from './cardEffects.js';

const USE_COOLDOWN = 10; // seconds between any two active card uses for a CPU kart

export class CPUCardSystem { // Handles card equipping, passive stat bonuses, and autonomous active-card decisions for CPU karts
    constructor(kart, player, allKarts, vfx) {
        this.kart      = kart;
        this.player    = player;
        this.allKarts  = allKarts;
        this.vfx       = vfx;
        this.slots     = [null, null, null]; // three card slots, mirroring the player's card system
        this._cooldown = 0;
    }

    equip(card) { // Adds a card to the first available slot and immediately applies its stat bonus if it is a passive card
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === null) {
                this.slots[i] = { ...card };
                if (card.type === 'passive') {
                    this._applyPassive(card);
                }
                return true;
            }
        }
        return false; // all slots are full
    }

    update(deltaTime) { // Called every frame from CPUKart.update(); ticks down the cooldown and attempts to use an active card when ready
        if (this._cooldown > 0) {
            this._cooldown -= deltaTime;
            return;
        }
        if (this.kart.cardDisabled) return;

        this._tryUseActiveCard();
    }

    _applyPassive(card) { // Directly modifies kart stats to reflect the passive card's permanent bonus
        if (card.name === 'Aerodynamic Spoiler') {
            this.kart.maxSpeed     += 1;
            this.kart.acceleration += 0.1;
        }
        if (card.name === 'Heavy Chassis') {
            this.kart.maxHP *= 1.2;
            this.kart.hp     = this.kart.maxHP; // refill HP to the new maximum
        }
        if (card.name === 'Sport Tires') {
            this.kart.baseRotationSpeed += 1;
        }
        if (card.name === 'Racing Transmission') {
            this.kart.acceleration += 0.25;
        }
    }

    _tryUseActiveCard() { // Scans all slots and activates the first active card whose situational condition is satisfied
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

    _conditionMet(name) { // Returns true when the current race situation is the right moment to use the given card
        const playerDist    = this._distTo(this.player);
        const playerInFront = this._isInFront(this.player);
        const playerBehind  = this._isBehind(this.player);
        const myPosition    = this._getPosition();

        if (name === 'Tire Shredder') {
            return myPosition > 1 && playerInFront && playerDist < 20; // only fire when behind and the player is ahead in range
        }
        if (name === 'Grappler Hook') {
            return myPosition > 1 && playerInFront && playerDist < 20; // same trigger as Tire Shredder — steal speed from a kart ahead
        }
        if (name === 'Sonic Wave') {
            return playerBehind && playerDist < 4; // push away a kart that is right behind and about to overtake
        }
        if (name === 'EMP') {
            return playerBehind && playerDist < 5; // disable cards of a close trailing kart; useless if they are already ahead
        }
        if (name === 'Temporary Armor') {
            return (this.kart.hp / this.kart.maxHP) < 0.4; // shield up when critically low on health
        }

        return false;
    }

    _activate(card, slotIndex) { // Executes the card's effect, removes it from the slot, and starts the cooldown
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
            this.vfx.addShockwave(this.kart.x, this.kart.y, 'sonic', this.kart);
            const targets = this._getInRadius(3.5);
            for (let i = 0; i < targets.length; i++) {
                const t     = targets[i];
                const dx    = t.x - this.kart.x;
                const dy    = t.y - this.kart.y;
                const perpX = -this.kart.dirY;
                const perpY =  this.kart.dirX;
                let side    = 1;
                if ((dx * perpX + dy * perpY) < 0) side = -1; // determine which side of the kart the target is on
                t.applyEffect(new Knockback(perpX * side * 40, perpY * side * 40, 15));
            }
        }

        if (card.name === 'EMP') {
            this.vfx.addShockwave(this.kart.x, this.kart.y, 'emp', this.kart);
            const targets = this._getInRadius(4);
            for (let i = 0; i < targets.length; i++) {
                const t    = targets[i];
                const dx   = t.x - this.kart.x;
                const dy   = t.y - this.kart.y;
                let dist   = Math.sqrt(dx * dx + dy * dy);
                if (dist === 0) dist = 1; // avoid division by zero for overlapping karts
                t.applyEffect(new Knockback((dx / dist) * 40, (dy / dist) * 40, 0));
                t.applyEffect(new CardDisable(2));
            }
        }

        if (card.name === 'Temporary Armor') {
            let alreadyShielded = false;
            for (let i = 0; i < this.kart.activeEffects.length; i++) {
                if (this.kart.activeEffects[i].constructor.name === 'Shield') {
                    alreadyShielded = true;
                }
            }
            if (!alreadyShielded) { // prevent stacking multiple shield effects
                const shieldVFX = this.vfx.addShield(this.kart.x, this.kart.y, this.kart);
                this.kart.applyEffect(new Shield(20, shieldVFX));
            }
        }

        this.slots[slotIndex] = null; // consume the card
        this._cooldown = USE_COOLDOWN;
    }

    _distTo(target) { // Returns the Euclidean distance between this kart and the target
        const dx = target.x - this.kart.x;
        const dy = target.y - this.kart.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    _isInFront(target) { // Returns true if the target is roughly ahead of this kart; dot > 0.2 gives a ~78° forward cone
        const dx   = target.x - this.kart.x;
        const dy   = target.y - this.kart.y;
        let dist   = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) dist = 1;
        const dot  = (dx / dist) * this.kart.dirX + (dy / dist) * this.kart.dirY;
        return dot > 0.2;
    }

    _isBehind(target) { // Returns true if the target is roughly behind this kart; dot < -0.2 gives a ~78° rear cone
        const dx   = target.x - this.kart.x;
        const dy   = target.y - this.kart.y;
        let dist   = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) dist = 1;
        const dot  = (dx / dist) * this.kart.dirX + (dy / dist) * this.kart.dirY;
        return dot < -0.2;
    }

    _getNearestInFront() { // Returns the closest kart that is in the forward half-space; uses squared distance to avoid a square-root per candidate
        let nearest = null;
        let minDist = Infinity;
        for (let i = 0; i < this.allKarts.length; i++) {
            const t = this.allKarts[i];
            if (t === this.kart) continue;
            const dx  = t.x - this.kart.x;
            const dy  = t.y - this.kart.y;
            const dot = dx * this.kart.dirX + dy * this.kart.dirY;
            if (dot <= 0) continue; // skip karts that are behind
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                nearest = t;
            }
        }
        return nearest;
    }

    _getInRadius(radius) { // Returns all karts (excluding self) within the given world-unit radius; uses squared comparison for efficiency
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

    _getPosition() { // Returns this kart's current race position (1 = first) based on laps × total checkpoints + next checkpoint
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

        return ahead + 1; // 1-based position
    }
}