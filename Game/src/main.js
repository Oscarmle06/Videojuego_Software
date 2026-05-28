// Main file of the game, responsible for initializing everything and running the main game loop. It handles the different game states (title screen, intro, countdown, racing, results) and orchestrates the rendering and updating of all game elements.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { Input } from './engine/input.js';
import { PlayerKart } from './game/playerKart.js';
import { CardSystem } from './game/cardSystem.js';
import { CardHUD } from './renderer/cardHUD.js';
import { CardSelectScreen } from './renderer/cardSelectScreen.js';
import { Race, LEVEL_CONFIGS } from './game/race.js';
import { ActiveCards } from './game/activeCards.js';
import { VFX } from './game/VFX.js'

// ── Canvas setup ──────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = 1020;
canvas.height = 600;

// ── Core systems ──────────────────────────────────────────────────────────────
const input      = new Input();
const playerKart = new PlayerKart(0, 0, 1, 0);
const cardSystem = new CardSystem();
const cardCanvas = document.getElementById('cardCanvas');
const cardHUD    = new CardHUD(cardCanvas, cardCanvas.getContext('2d'), cardSystem);
const mapCanvas  = document.getElementById('mapCanvas');
const vfx = new VFX();
const activeCards = new ActiveCards(playerKart, [], vfx)

// ── Images ────────────────────────────────────────────────────────────────────
const titleImage   = new Image();  titleImage.src   = './assets/Title_Screen.png';
const gameOverImage = new Image(); gameOverImage.src = './assets/Lose_Screen.png';
const winImage     = new Image();  winImage.src     = './assets/Win_Screen.png';

// ── Game state ────────────────────────────────────────────────────────────────
let gameState    = 'title'; // title → cardSelect → racing → gameOver → championship
let currentLevel = 1;
let lastTime     = 0;
let currentRace  = null;
let selectedRaceCards = [];

// ── Title screen click ────────────────────────────────────────────────────────
canvas.addEventListener('click', handleClick);

function handleClick(e) {
    const rect   = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (gameState === 'title') {
        if (mouseX > 410 && mouseX < 630 && mouseY > 455 && mouseY < 500) {
            gameState = 'cardSelect';
        }
    } else if (gameState === 'gameOver') {
        // Click anywhere to restart
        currentLevel = 1;
        cardSystem.reset(playerKart);
        gameState = 'cardSelect';
    } else if (gameState === 'championship') {
        // Click anywhere to restart
        currentLevel = 1;
        cardSystem.reset(playerKart);
        gameState = 'cardSelect';
    }
}

// ── Race management ───────────────────────────────────────────────────────────
function startCurrentRace() {

    currentRace = new Race(
    {...LEVEL_CONFIGS[currentLevel], level: currentLevel},
    playerKart,
    canvas,
    ctx,
    input,
    cardSystem,
    cardHUD,
    mapCanvas,
    selectedRaceCards,
    activeCards,
);

    currentRace.startRace((won) => {
        if (!won) {
            gameState = 'gameOver';
        } else if (currentLevel >= 7) {
            gameState = 'championship';
        } else {
            currentLevel++;
            gameState = 'cardSelect';
        }
        requestAnimationFrame(gameLoop);
    });
}

// ── Card select screen ────────────────────────────────────────────────────────

  const cardSelectScreen = new CardSelectScreen(canvas, ctx, cardHUD.images, (card) => {
      cardSelectScreen.active = false;
      selectedRaceCards = []; // limpiar siempre
      if (card.type === 'passive') {
          cardSystem.addCard({ name: card.name, level: 1, type: 'passive' }, playerKart);
      } else {
          selectedRaceCards = [card.name];
      }
      gameState = 'racing';
      startCurrentRace();
  });

// ── Game loop ─────────────────────────────────────────────────────────────────
function gameLoop(timestamp) {

    const dt = lastTime === 0 ? 0 : (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (gameState === 'title') {
        ctx.drawImage(titleImage, 0, 0, canvas.width, canvas.height);

    } 
    else if (gameState === 'racing') {
      return}

    else if (gameState === 'cardSelect') {
    if (!cardSelectScreen.active) cardSelectScreen._deal();
    cardSelectScreen.render();

    } else if (gameState === 'gameOver') {
        ctx.drawImage(gameOverImage, 0, 0, canvas.width, canvas.height);

    } else if (gameState === 'championship') {
        ctx.drawImage(winImage, 0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop)
