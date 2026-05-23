// agressivePersonality.js
// This module defines the AgressivePersonality class, a type of AI personality for CPU karts that focuses on aggressive driving and close combat with other karts.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { Personality } from "./Personality.js";
export class AgressivePersonality extends Personality {
    constructor() {
        super("aggressive", 25, 0.05);
    }
}