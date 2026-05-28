// evasivePersonality.js
// This module defines the EvasivePersonality class, a type of AI personality for CPU karts that focuses on avoiding obstacles and other karts.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { Personality } from "./Personality.js";
export class EvasivePersonality extends Personality {
    constructor() {
        super("evasive", 15, 0.05);
    }
}