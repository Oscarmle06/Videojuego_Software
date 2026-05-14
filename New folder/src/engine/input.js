export class Input {
  constructor() {
    this.keys = {};

    window.addEventListener('keydown', (e) => { this.keys[e.key.toLowerCase()] = true;});
    window.addEventListener('keyup',   (e) => { delete this.keys[e.key.toLowerCase()]; });
  }

  isPressed(key) {
    return this.keys[key.toLowerCase()];
  }
}