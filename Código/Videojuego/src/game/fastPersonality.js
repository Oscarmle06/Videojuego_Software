// fastPersonality.js
// This module defines the FastPersonality class, a type of AI personality for CPU karts that focuses on speed and aggressive driving.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026


import { Personality } from "./Personality.js";
export class FastPersonality extends Personality {
    constructor() {
        super("fast", 30, 0.3);
    }

}