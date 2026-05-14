import { Personality } from "./personality.js";
export class EvasivePersonality extends Personality {
    constructor() {
        super("evasive", 15, 0.05);
    }
}