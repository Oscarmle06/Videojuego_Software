// input.js
// This module defines the Input class, which handles keyboard input for controlling the player's kart. 
// It listens for keydown and keyup events and keeps track of which keys are currently pressed.

export class Input { 
  constructor() {
    this.keys = {};

    window.addEventListener('keydown', (e) => { this.keys[e.key.toLowerCase()] = true;});
    window.addEventListener('keyup',   (e) => { delete this.keys[e.key.toLowerCase()]; });
  }

  isPressed(key) { // Main input method: checks if a specific key is currently pressed.
    return this.keys[key.toLowerCase()];
  }
}