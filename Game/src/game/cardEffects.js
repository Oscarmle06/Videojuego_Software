// cardEffects.js
// This module defines the various status effects that can be applied to karts when using cards. Each effect has its own behavior and duration.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

export class StatusEffect { // Base class for all status effects
    constructor(duration) {
        this.duration = duration;
        this.elapsed = 0;
        this.expired = false;
    }

    onApply(kart) {} // Called when the effect is applied to a kart, can be overridden by subclasses to implement specific behavior

    onUpdate(kart, deltaTime) { // Called every frame to update the effect's duration and check for expiration
        this.elapsed += deltaTime;
        if (this.elapsed >= this.duration) {
            this.expired = true;
            this.onExpire(kart);
        }
    }

    onExpire(kart) {} // Called when the effect expires, can be overridden by subclasses to implement specific behavior when the effect ends
}

export class SpeedDebuff extends StatusEffect {  // Reduces the kart's max speed for a certain duration. 
    constructor(effects = {}) {
        const duration = effects.SpeedDebuff_Duration || 4;
        super(duration);
        this.speedMultiplier = effects.SpeedDebuff_Multiplier || 0.4;
        this.originalMax = 0;
    }

    onApply(kart) { // When applied, it stores the kart's original max speed and then reduces it by multiplying with the speed multiplier.
        this.originalMax = kart.maxSpeed;
        kart.maxSpeed *= this.speedMultiplier;
        if (kart.speed > kart.maxSpeed) {
            kart.speed = kart.maxSpeed;
        }
    }

    onExpire(kart) { // When the effect expires, it restores the kart's max speed to its original value.
        karto.maxSpeed = this.originalMax;
    }
}

export class SpeedDrain extends StatusEffect { // Reduces the kart's current speed by a fraction for a certain duration. 
    constructor(effects = {}) {
        const duration = effects.SpeedDrain_Duration || 3;
        super(duration);
        this.drainFraction = effects.SpeedDrain_Fraction || 0.15;
        this.stolenSpeed = 0;
    }
    onApply(kart) { // When applied, it calculates the amount of speed to drain based on the kart's current speed and the drain fraction, then reduces the kart's speed by that amount.
        this.stolenSpeed = kart.speed * this.drainFraction;
        kart.speed -= this.stolenSpeed;
        if (kart.speed < 0) kart.speed = 0;
    }
}

export class SpeedBoost extends StatusEffect { // Increases the kart's current speed by a fraction for a certain duration, up to a maximum of 130% of the kart's max speed.
    constructor(duration = 3, amount = 0) {
        super(duration);
        this.amount = amount;
    }
    onApply(kart) { // When applied, it increases the kart's speed by a fraction of its current speed, but does not allow the speed to exceed 130% of the kart's max speed.
        kart.speed += Math.min(kart.speed * this.amount, kart.maxSpeed * 1.3);
    }
}

export class Knockback extends StatusEffect { // Applies an instantaneous force to the kart, pushing it in a certain direction.
    constructor(forceX, forceY, damage = 0) {
        super(0);
        this.forceX = forceX;
        this.forceY = forceY;
        this.damage = damage;
    }
    onApply(kart) { // When applied, it calculates the new velocity of the kart by adding the knockback force to the kart's current velocity, and also applies damage if specified
        const vx = kart.dirX * kart.speed + this.forceX;
        const vy = kart.dirY * kart.speed + this.forceY;
        const newSpeed = Math.sqrt(vx * vx + vy * vy);
        if (newSpeed > 0.01) { // 
            kart.speed = Math.min(newSpeed, kart.maxSpeed * 1.5);
            kart.dirX = vx / newSpeed;
            kart.dirY = vy / newSpeed;
        }
        if (this.damage > 0) {
            kart.hp = Math.max(0, kart.hp - this.damage);
        }
        this.expired = true; // Knockback is instant, so we mark it expired immediately
    }
}

export class CardDisable extends StatusEffect { // Prevents the kart from using its card for a certain duration.
    constructor(effects = {}) {
        // Mantenemos tu mapeo de DB, pero si no viene nada, tomamos los 30 de balance que querían tus compañeros
        const duration = effects.CardDisable_Duration || 30;
        super(duration);
    }
    onApply(kart) {
        kart.cardDisabled = true;
    }
    onExpire(kart) {
        kart.cardDisabled = false;
    }
}

export class InstantHeal extends StatusEffect { // Heals the kart instantly by a certain fraction of its max health.
    constructor(effects = {}) {
        super(0);
        this.fraction = effects.InstantHeal_Fraction || 0.30; 
    }
    onApply(kart) {
        kart.hp = Math.min(kart.maxHP, kart.hp + kart.maxHP * this.fraction);
        this.expired = true; 
    }
}

export class Shield extends StatusEffect { // Provides a temporary shield that absorbs one instance of damage or knockback.
    constructor(effects = {}, vfxRef = null) {
        const duration = effects.Shield_Duration || 20;
        super(duration);
        this.vfxRef = vfxRef;
    }

    onApply(kart) {
        kart.hasShield = true;
    }

    onExpire(kart) {
        kart.hasShield = false;
        if (this.vfxRef) this.vfxRef.active = false;  // ← turn off the visual effect when the shield expires
    }

    absorb() {
        this.expired = true;
        if (this.vfxRef) this.vfxRef.active = false;  // ← turn off the visual effect immediately when the shield absorbs an attack
    }
}