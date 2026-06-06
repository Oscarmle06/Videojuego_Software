// activeCards.js
// This module defines the ActiveCards class, which manages the active cards that the player can equip
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { SpeedDebuff, SpeedDrain, SpeedBoost, Knockback, CardDisable, InstantHeal, Shield } from './cardEffects.js';
export class ActiveCards {
  constructor(playerKart, cpuKarts, vfx) {
    this.player       = playerKart;   
    this.cpus         = cpuKarts;     
    this.vfx          = vfx;
    this.slots        = [null, null, null];
    this.selectedSlot = 0;
    this._qWasPressed = false;        
    this._eWasPressed = false;        
  }

  equip(card) { // Tries to equip a card in the first available slot. Returns true if successful, false if no slots are available.
    for (let i = 0; i < this.slots.length; i++) {
        if (this.slots[i] === null) {
            this.slots[i] = { ...card };
            return true;
        }
    }
    console.warn(`No hay slots disponibles para ${card.name}`);
    return false;
}

  tryUse(input) {      // Checks for input to select and activate cards. O to cycle through slots, P to activate the selected card. Each card has a different effect on the player or CPU karts.                
    if (this.player.cardsDisabled) return;

    const qPressed = input.isPressed('o');
    if (qPressed && !this._qWasPressed) {
      this.selectedSlot = (this.selectedSlot + 1) % 3;
    }
    this._qWasPressed = qPressed;

    const ePressed = input.isPressed('p');
    if (ePressed && !this._eWasPressed) {
      const slot = this.slots[this.selectedSlot];
      if (slot) {
        this._activate(slot);
      }
    }
    this._eWasPressed = ePressed;
  }

  _activate(slot) { // Activates the effect of the card in the selected slot, 
  // applying different effects to the player or CPU karts based on the card's name. 
  // After activation, the card is consumed and removed from the slot.
    
    // Extraemos los efectos dinámicos que vienen desde la base de datos
    const dbEffects = slot.effects || {};

    switch (slot.name) {

      case 'Tire Shredder': { // Finds the nearest CPU kart in front of the player and applies a speed debuff to it.
        const target = this._getNearestInFront();
        if (!target) { 
          console.log('No target in front'); 
          return; 
        }
        target.applyEffect(new SpeedDebuff(dbEffects));
        console.log('Tire Shredder hit', target);
        break;
      }

      case 'Grappler Hook': { // Finds the nearest CPU kart in front of the player, applies a speed drain effect to it and a speed boost to the player based on the stolen speed.
        const target = this._getNearestInFront();
        if (!target) { 
          console.log('No target in front'); 
          return; 
        }
        const fraction = dbEffects.SpeedDrain_Fraction || 0.15;
        const stolen = target.speed * fraction;
        target.applyEffect(new SpeedDrain(dbEffects));
        this.player.applyEffect(new SpeedBoost(dbEffects.SpeedBoost_Duration || 3, stolen));
        break;
      }

      case 'Sonic Wave': { // Creates a shockwave effect and applies a knockback to all CPU karts within a radius, pushing them away from the player.
        this.vfx.addShockwave(this.player.x, this.player.y);
        const radius = dbEffects.Effect_Radius || 3.5;
        const targets = this._getInRadius(radius);
        
        const force = dbEffects.Knockback_Force || 30;
        const dmg = dbEffects.Knockback_Damage || 15;

        for (const t of targets) {
          const dx    = t.x - this.player.x;
          const dy    = t.y - this.player.y;
          const perpX = -this.player.dirY;
          const perpY =  this.player.dirX;
          const side  = (dx * perpX + dy * perpY) > 0 ? 1 : -1;
          t.applyEffect(new Knockback(perpX * side * force, perpY * side * force, dmg));
        }
        break;
      }

      case 'EMP': { // Creates an EMP shockwave effect and applies a card disable effect to all CPU karts within a radius, preventing them from using their cards for a short time.
        this.vfx.addShockwave(this.player.x, this.player.y, 'emp');
        const radius = dbEffects.Effect_Radius || 4;
        const targets = this._getInRadius(radius);
        
        const force = dbEffects.Knockback_Force || 30;

        for (const t of targets) {
          const dx   = t.x - this.player.x;
          const dy   = t.y - this.player.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          t.applyEffect(new Knockback((dx/dist) * force, (dy/dist) * force, 0));
          t.applyEffect(new CardDisable(dbEffects));
        }
        break;
      }

      case 'Repair Bot': { // Heals the player instantly.
        this.player.applyEffect(new InstantHeal(dbEffects));
        break;
      }

      case 'Temporary Armor': { // Applies a temporary shield to the player.
        let alreadyHasShield = false;
        for (let i = 0; i < this.player.activeEffects.length; i++) {
            if (this.player.activeEffects[i].constructor.name === 'Shield') {
                alreadyHasShield = true;
                break;
            }
        }
          if (!alreadyHasShield) { // Evita aplicar otro escudo si ya hay uno activo
            const shieldVFX = this.vfx.addShield(this.player.x, this.player.y);
            console.log('shieldVFX creado:', shieldVFX);
            
            const shieldEffect = new Shield(dbEffects, shieldVFX);
            console.log('Shield effect:', shieldEffect);
            
            this.player.applyEffect(shieldEffect);
            console.log('activeEffects después:', this.player.activeEffects);
          }
          break;
        }
    }
    // Consumir la carta después de usarla
    this.slots[this.selectedSlot] = null;
  }

  _getNearestInFront() { // Finds the nearest CPU kart in front of the player by checking the dot product between the player's direction and the vector to each CPU kart. Returns the nearest kart or null if no karts are in front.
    let nearest = null;
    let minDist = Infinity;
    for (const cpu of this.cpus) {
      const dx  = cpu.x - this.player.x;
      const dy  = cpu.y - this.player.y;
      const dot = dx * this.player.dirX + dy * this.player.dirY; // Dot product to check if the CPU kart is in front of the player
      if (dot <= 0) continue; // If the CPU kart is behind the player, skip it
      const dist = dx*dx + dy*dy;
      if (dist < minDist) { 
        minDist = dist; nearest = cpu; 
      }
    }
    return nearest;
  }

  _getInRadius(radius) { // Finds all CPU karts within a certain radius from the player by checking the distance between the player and each CPU kart. Returns an array of karts within the radius.
    const inRadius = [];
    for (let i = 0; i < this.cpus.length; i++) {
        const dx = this.cpus[i].x - this.player.x;
        const dy = this.cpus[i].y - this.player.y;
        if (dx*dx + dy*dy <= radius*radius) {
            inRadius.push(this.cpus[i]);
        }
    }
    return inRadius;
  }
}