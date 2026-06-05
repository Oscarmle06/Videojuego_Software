// cardSystem.js
// This module defines the CardSystem class, responsible for managing the passive cards that players can acquire
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

export class CardSystem { // 

    constructor() {
        this.cards = [];
    }

    addCard(card, kart) { // When a new card is added, it checks if the kart already has that card. If it does, it increases the card's level and reapplies its passive effect. If not, it adds the new card to the kart's collection and applies its passive effect.
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].name === card.name) {
                this.cards[i].level++;
                this.applyPassive(this.cards[i], kart);
                return;
            }
        }
        this.cards.push(card);
        this.applyPassive(card, kart);
    }

    applyPassive(card, kart) { // This method applies the passive effect of a card to the kart. It checks the type of the card and applies the corresponding stat changes to the kart based on the card's name.
        if (card.type === "passive") {
            if (card.name === "Aerodynamic Spoiler") {
                // Apply the passive effect
                kart.maxSpeed += 1;
                kart.acceleration += 0.1;
            }
            if (card.name === "Heavy Chassis") {
                // Apply the passive effect
                kart.maxHP *= 1.2;
                kart.hp = kart.maxHP; 
            }
            if (card.name === "Sport Tires") {
                // Apply the passive effect
                kart.baseRotationSpeed += 1;
            }
            if (card.name === "Racing Transmission") {
                // Apply the passive effect
                kart.acceleration += 0.25;
            }
            }
        }
    }
