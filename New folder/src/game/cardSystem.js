export class CardSystem {

    constructor() {
        this.cards = [];
    }

    addCard(card, kart) {
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

    applyPassive(card, kart) {
        if (card.type === "passive") {
            if (card.name === "Aerodynamic Spoiler") {
                // Apply the passive effect
                kart.maxSpeed += 1;
            }
            if (card.name === "Heavy Chassis") {
                // Apply the passive effect
                kart.maxHP *= 1.5;
            }
            if (card.name === "Sport Tires") {
                // Apply the passive effect
                kart.baseRotationSpeed += 1;
            }
            if (card.name === "Racing Transmission") {
                // Apply the passive effect
                kart.acceleration += 0.5;
            }
            }
        }
    }
