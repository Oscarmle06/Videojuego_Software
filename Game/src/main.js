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

//  Canvas setup 
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = 1020;
canvas.height = 600;

//  Core systems 
const input      = new Input();
const playerKart = new PlayerKart(0, 0, 1, 0);
const cardSystem = new CardSystem();
const cardCanvas = document.getElementById('cardCanvas');
const cardHUD    = new CardHUD(cardCanvas, cardCanvas.getContext('2d'), cardSystem);
const mapCanvas  = document.getElementById('mapCanvas');
const vfx = new VFX();
const activeCards = new ActiveCards(playerKart, [], vfx)


//  Images 
const titleImage   = new Image();  titleImage.src   = './assets/Title_Screen.png';
const gameOverImage = new Image(); gameOverImage.src = './assets/Lose_Screen.png';
const winImage     = new Image();  winImage.src     = './assets/Win_Screen.png';

//  Game state 
let gameState    = 'title'; // title → cardSelect → racing → gameOver → championship
let currentLevel = 1;
let lastTime     = 0;
let currentRace  = null;
let selectedRaceCards = [];

//  Music
const music = new Audio()
    music.loop = true;
    music.volume = 0.7;

function setMusic(state) {
    const tracks = {
        title:      './assets/music/Velvet_Tide.mp3',
        cardSelect: './assets/music/Midnight_Pit_Stop.mp3',
        racing:     './assets/music/Race.mp3',
        championship:        './assets/music/Gold_Medal_Run.mp3',
        lose:       './assets/music/One_Final_Turn.mp3',
    };
    const url = tracks[state];
        if (!url || music.src.endsWith(url)) return;
        music.src = url;
        music.play().catch(() => {});
}

//  SFX
const SFX = {
    select:    './assets/audios/selectSound.mp3',
};

function playSFX(name) {
    const sfx = new Audio(SFX[name]);
    sfx.play().catch(() => {});
}

//  Title screen click 
canvas.addEventListener('click', (e) => {
    if (!music.currentSrc) setMusic('title'); 
    handleClick(e);
});

function handleClick(e) {
    const rect   = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (gameState === 'title') {
        if (mouseX > 410 && mouseX < 630 && mouseY > 455 && mouseY < 500) {
            playSFX('select');
            if (currentLevel === 1) {
                gameState = 'racing';
                setMusic('racing');
                startCurrentRace();
            } else {
                gameState = 'cardSelect';
                setMusic('cardSelect');
            }
        }
    } else if (gameState === 'gameOver') {
        playSFX('select');
        currentLevel = 1;
        let cardSystem = new CardSystem();
        gameState = 'title';
        setMusic('title');
    } else if (gameState === 'championship') {
        playSFX('select');
        currentLevel = 1;
        let cardSystem = new CardSystem();
        gameState = 'title';
        setMusic('title');
    }
}

//  Race management 
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
            setMusic('lose');
        } else if (currentLevel >= 7) {
            gameState = 'championship';
            setMusic('championship')
        } else {
            currentLevel++;
            gameState = 'cardSelect';
            setMusic('cardSelect')

        }
        requestAnimationFrame(gameLoop);
    });
}

//  Card select screen 

  const cardSelectScreen = new CardSelectScreen(canvas, ctx, cardHUD.images, (card) => {
        playSFX('select');
      cardSelectScreen.active = false;
      selectedRaceCards = []; // limpiar siempre
      if (card.type === 'passive') {
          cardSystem.addCard({ name: card.name, level: 1, type: 'passive' }, playerKart);
      } else {
          selectedRaceCards = [card.name];
      }
      gameState = 'racing';
      setMusic('racing');
      startCurrentRace();
  });

//  Game loop 
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
        ctx.fillStyle = 'rgba(0, 0, 0)';
        ctx.fillRect(canvas.width / 2 - 320, canvas.height - 60, 640, 45);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 22px "Russo One"';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK ANYWHERE TO GO BACK TO TITLE SCREEN', canvas.width / 2, canvas.height - 28);

    } else if (gameState === 'championship') {
        ctx.drawImage(winImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0)';
        ctx.fillRect(canvas.width / 2 - 320, canvas.height - 60, 640, 45);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 22px "Russo One"';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK ANYWHERE TO GO BACK TO TITLE SCREEN', canvas.width / 2, canvas.height - 28);
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop)
