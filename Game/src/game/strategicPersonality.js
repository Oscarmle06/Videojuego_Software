// strategicPersonality.js
// This module defines the StrategicPersonality class, a type of AI personality for CPU karts that focuses on using cards strategically.
// Note that the actual strategic behavior is not implemented yet, but will be.

import { Personality } from "./personality.js";
export class StrategicPersonality extends Personality {
    constructor() {
        super("strategic", 20, 0.3);
    }
}