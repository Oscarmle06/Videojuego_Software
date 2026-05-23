import { Personality } from "./Personality.js";
export class AgressivePersonality extends Personality {
    constructor() {
        super("aggressive", 25, 0.05);
    }
}