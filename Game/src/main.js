// Main file of the game, responsible for initializing everything and running the main game loop. It handles the different game states (title screen, intro, countdown, racing, results) and orchestrates the rendering and updating of all game elements.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { Input } from './engine/input.js';
import { PlayerKart } from './game/playerKart.js';
import { CardSystem } from './game/cardSystem.js';
import { CardHUD } from './renderer/cardHUD.js';
import { CardSelectScreen } from './renderer/CardSelectScreen.js';
import { Race, LEVEL_CONFIGS } from './game/race.js';
import { ActiveCards } from './game/activeCards.js';
import { VFX } from './game/VFX.js'

//  Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = 1020;
canvas.height = 600; // native 1.7 aspect — CSS scales it uniformly so the art is never stretched

// Pause-screen sliders, expressed as fractions of the canvas so they stay aligned
// with the full-screen PauseScreen image at any resolution.
const PAUSE_SLIDER = {
    x: 310 / 1020,   // left edge of the track
    w: 250 / 1020,   // track width
    h:  20 / 600,    // thickness
    yMusic:      400 / 600,
    ySfx:        190 / 600,
    yBrightness: 300 / 600,
};

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
const storyscreen = new Image(); storyscreen.src = './assets/storyscreen.png';
const championshipWinImage = new Image(); championshipWinImage.src = './assets/ChampionshipWin.png';
const creditsImage = new Image(); creditsImage.src = './assets/credits.png';
const pauseImage = new Image(); pauseImage.src = './assets/PauseScreen.png';

const racePracticeIntro = new Image(); racePracticeIntro.src = './assets/RacePracticeIntro.png';
const raceIntroImage1 = new Image(); raceIntroImage1.src = './assets/Race1Intro.png';
const raceIntroImage2 = new Image(); raceIntroImage2.src = './assets/Race2Intro.png';
const raceIntroImage3 = new Image(); raceIntroImage3.src = './assets/Race3Intro.png';
const raceIntroImage4 = new Image(); raceIntroImage4.src = './assets/Race4Intro.png';
const raceIntroImage5 = new Image(); raceIntroImage5.src = './assets/Race5Intro.png';
const racechampionshipIntro = new Image();racechampionshipIntro.src = './assets/RaceChampionshipIntro.png';

//  Game state 
let gameState  = 'title'; // title → cardSelect → racing → gameOver → championship
let previousState = 'title'
let currentLevel = 1;
let lastTime     = 0;
let currentRace  = null;
let selectedRaceCards = [];
let musicVolume = 0.7;
let sfxVolume = 0.7;
let brightness = 1.0;
let selectedCardForRace = null;
let raceCardActivations = {};

//  Player progress persistence (DB)
// The logged-in player_id is written to localStorage by the login page (auth.js).
// Since the game runs in a same-origin iframe, we can read it here.
function getPlayerId() {
    try {
        const session = JSON.parse(localStorage.getItem('vd_session'));
        return session ? session.player_id : null;
    } catch (e) {
        return null;
    }
}

async function loadProgress() { // On startup, resume the player at their last saved race
    const playerId = getPlayerId();
    if (!playerId) return; // not logged in → stay on level 1 (in-memory only)
    try {
        const res  = await fetch(`http://localhost:3000/api/player/progress?player_id=${playerId}`);
        const data = await res.json();
        if (data.success && data.level) currentLevel = data.level;
    } catch (e) {
        console.error('No se pudo cargar el progreso:', e);
    }
}

function saveProgress(level) { // Persist the current race level to the DB (fire-and-forget)
    const playerId = getPlayerId();
    if (!playerId) return;
    fetch('http://localhost:3000/api/player/progress', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ player_id: playerId, level })
    }).catch(e => console.error('No se pudo guardar el progreso:', e));
}

function resetRun() { // Full reset (permadeath): wipe level, kart upgrades and cards back to base
    currentLevel = 1;
    playerKart.reset();
    cardSystem.reset();
    activeCards.reset();
    selectedRaceCards = [];
    selectedCardForRace = null;
    raceCardActivations = {};
    saveProgress(1);
}

//Story screen
let storyPage = 0;
const storyText = [ 
    [
    "You are a rookie racer with talent",
    "BUT NO REPUTATION",
    " ",
    "On the eve of the racing season", 
    "your team manager and your entire pit crew quit",
    "leaving you with a car in need of upgrades"],
     
    [
    "With no support",
    "everyone expects you to fail",
    "",
    "Instead, you decide",
    "TO PROVE THEM WRONG"
    ],
    [
    "To become the champion",
    "you must win 7 races",
    "",
    "Earn upgrades and power-ups",
    "along the way"
    ],

    [
    "PLAY YOUR CARDS RIGHT",
    "",
    "Good luck, driver!"
    ]
    
];

//  Music
    const music = new Audio()
    music.loop = true;
    music.volume = musicVolume;

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
    sfx.volume = sfxVolume;
    sfx.play().catch(() => {});
}

//  Title screen click 
canvas.addEventListener('click', (e) => {
    if (!music.currentSrc) setMusic('title'); 
    handleClick(e);
});

function handleClick(e) {
    const rect   = canvas.getBoundingClientRect();
    // Map CSS pixels to the canvas's internal coordinate system (the canvas is CSS-scaled)
    const mouseX = (e.clientX - rect.left) * (canvas.width  / rect.width);
    const mouseY = (e.clientY - rect.top)  * (canvas.height / rect.height);
    const W = canvas.width;
    const H = canvas.height;

    if (gameState === 'title') {
        previousState = 'title'
        if (mouseX > 0.4020*W && mouseX < 0.6176*W && mouseY > 0.7583*H && mouseY < 0.8333*H) {
            playSFX('select');
            if (currentLevel === 1) {
                gameState = 'storyScreen';

            } else {
                gameState = 'cardSelect';
                setMusic('cardSelect');
            }
        }
        if (mouseX >= 0.3922*W && mouseX <= 0.6127*W && mouseY >= 0.8417*H && mouseY <= 0.9000*H){
            playSFX ('select');
            gameState = 'pause';
        }
    }
    else if (gameState === 'storyScreen'){
        previousState = 'storyScreen';
        playSFX('select');
        storyPage++;
        if (storyPage >= storyText.length){
            storyPage = 0;
            gameState = 'raceIntro';
        }
    }
    else if (gameState === 'raceIntro'){
        previousState = 'raceIntro';
        playSFX('select');
        gameState = 'racing';
        setMusic('racing');
        startCurrentRace ();
    }
    else if (gameState === 'gameOver') {
        // Reach here only after an explosion; resetRun() already wiped progress
        previousState = 'gameOver';
        playSFX('select');
        gameState = 'title';
        setMusic('title');
    } else if (gameState === 'championship') {
        // resetRun() already ran when the championship was won
        previousState = 'championship';
        playSFX('select');
        gameState = 'title';
        setMusic('title');
    }
    else if (gameState === 'credits') {
        previousState = 'credits';
        if (mouseX > 0.7627*W && mouseX < 0.9814*W && mouseY > 0.9083*H && mouseY < 0.9833*H) {
        playSFX('select');
        currentLevel = 1;
        gameState = 'title';
        setMusic ('title')
    } }
    else if (gameState === 'pause') {
        const sx0 = PAUSE_SLIDER.x * W;
        const sx1 = (PAUSE_SLIDER.x + PAUSE_SLIDER.w) * W;
        const sliderValue = () => Math.max(0, Math.min(1, (mouseX - sx0) / (PAUSE_SLIDER.w * W)));

        if (mouseX >= sx0 && mouseX <= sx1 && mouseY >= PAUSE_SLIDER.yMusic*H && mouseY <= (PAUSE_SLIDER.yMusic+PAUSE_SLIDER.h)*H){
            musicVolume = sliderValue();
            music.volume = musicVolume;
        }
        if (mouseX >= sx0 && mouseX <= sx1 && mouseY >= PAUSE_SLIDER.ySfx*H && mouseY <= (PAUSE_SLIDER.ySfx+PAUSE_SLIDER.h)*H){
            sfxVolume = sliderValue();
        }
        if (mouseX >= sx0 && mouseX <= sx1 && mouseY >= PAUSE_SLIDER.yBrightness*H && mouseY <= (PAUSE_SLIDER.yBrightness+PAUSE_SLIDER.h)*H){
            brightness = sliderValue();
        }
        if (mouseX > 0.5559*W && mouseX < 0.8402*W && mouseY > 0.2600*H && mouseY < 0.5600*H) {// Save & exit: persist progress, then leave to title
            saveProgress(currentLevel);
            if (currentRace) currentRace.stopAudio();
            currentRace = null;
            gameState = 'title';
            setMusic ('title');
        }
        else if (mouseX > 0.5588*W && mouseX < 0.8431*W && mouseY > 0.6500*H && mouseY < 0.7167*H) { //resume the race
            playSFX('select');
            if (previousState === 'racing' && currentRace) {
                gameState = 'racing';
                currentRace.resume();
            } else {
                gameState = previousState;
            }
         }

    }
}

//  Race management 
function startCurrentRace() {
    raceCardActivations = {};
    activeCards.onCardActivated = (cardName) => {
        raceCardActivations[cardName] = (raceCardActivations[cardName] || 0) + 1;
    };

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

// Configuración del manejador de pausa
    currentRace.onPause = () => {
        previousState = 'racing';
        gameState = 'pause';
        requestAnimationFrame(gameLoop);
    };

    // Inicio de la carrera
   currentRace.startRace((result) => {
    console.log("DEBUG: Callback recibido:", result);

    const { won, exploded, position, totalTime, fastestLap } = result;

    const validStats = {
        position: position ?? 0,
        totalTime: totalTime ?? 0,
        fastestLap: fastestLap ?? 0
    };

    const userId = getPlayerId();
    saveRaceResults(userId, validStats.position, validStats.totalTime, validStats.fastestLap, currentLevel);

    if (won) {
        if (currentLevel >= 7) {
            resetRun();
            gameState = 'championship';
            setMusic('championship');
        } else {
            currentLevel++;
            saveProgress(currentLevel);
            gameState = 'cardSelect';
            setMusic('cardSelect');
        }
    } else if (exploded) {
        resetRun();
        gameState = 'gameOver';
        setMusic('lose');
    } else {
        saveProgress(currentLevel);
        gameState = 'cardSelect';
        setMusic('cardSelect');
    }

    requestAnimationFrame(gameLoop);
});
}

//  Card select screen 

  const cardSelectScreen = new CardSelectScreen(canvas, ctx, cardHUD.images, (card) => {
        playSFX('select');
      cardSelectScreen.active = false;
      selectedRaceCards = []; // limpiar siempre
      selectedCardForRace = card.name;
      if (card.type === 'passive') {
          cardSystem.addCard({ name: card.name, level: 1, type: 'passive' }, playerKart);
      } else {
          selectedRaceCards = [card.name];
      }
      gameState = 'raceIntro';
  });

function buildRaceCardPayload() {
    if (!selectedCardForRace) return [];
    return [{
        name: selectedCardForRace,
        selected_count: 1,
        activated_count: raceCardActivations[selectedCardForRace] || 0
    }];
}

function saveRaceResults(userId, position, totalTime, fastestLap, raceLevel) {
    fetch('http://localhost:3000/api/save-race', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            player_id: userId,
            position: position,
            total_play_time: totalTime,
            fastest_lap: fastestLap,
            race_level: raceLevel,
            cards: buildRaceCardPayload()
        })
    })
    .then(res => res.json())
    .then(data => console.log("Guardado:", data))
    .catch(err => console.error("Error:", err));
}

//  Game loop 
function gameLoop(timestamp) {

    const dt = lastTime === 0 ? 0 : (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (gameState === 'title') {
        ctx.drawImage(titleImage, 0, 0, canvas.width, canvas.height);
    } 
    else if (gameState === 'racing') {
      return;
    }
    
    else if (gameState === 'storyScreen') {
        ctx.drawImage (storyscreen, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '28px "Russo One"';
        ctx.textAlign = 'center';
        const lines = storyText [storyPage];
        for (let i = 0; i<lines.length; i++)
        {
            ctx.fillText (lines[i], canvas.width/2, 220+i*40);
        }
         ctx.fillText (
            'CLICK TO CONTINUE', canvas.width/2, canvas.height - 45
        );
    }

    else if (gameState === 'raceIntro') {
        let introImage;
        if (currentLevel === 1) introImage = racePracticeIntro;
        else if (currentLevel === 2) introImage = raceIntroImage1;
        else if (currentLevel === 3) introImage = raceIntroImage2;
        else if (currentLevel === 4) introImage = raceIntroImage3;
        else if (currentLevel === 5) introImage = raceIntroImage4;
        else if (currentLevel === 6) introImage = raceIntroImage5;
        else if (currentLevel === 7) introImage = racechampionshipIntro;
        ctx.drawImage (introImage,0,0,canvas.width,canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 28px "Russo One"';
        ctx.textAlign = 'center';
        ctx.fillText (
            'CLICK TO CONTINUE', canvas.width/2, canvas.height - 45
        );
      }

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
        ctx.drawImage(championshipWinImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0)';
        ctx.fillRect(canvas.width / 2 - 320, canvas.height - 60, 640, 45);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 22px "Russo One"';
        ctx.textAlign = 'center';
        ctx.fillText('CLICK ANYWHERE TO GO BACK TO TITLE SCREEN', canvas.width / 2, canvas.height - 28);
    }
    else if (gameState === 'credits') {
        ctx.drawImage (creditsImage,0,0,canvas.width,canvas.height);
    }
    else if (gameState === 'pause') {
        ctx.drawImage (pauseImage,0,0,canvas.width, canvas.height);

        const W = canvas.width, H = canvas.height;
        const sx = PAUSE_SLIDER.x * W;
        const sw = PAUSE_SLIDER.w * W;
        const sh = PAUSE_SLIDER.h * H;
        const drawSlider = (yFrac, value) => {
            const y = yFrac * H;
            ctx.fillStyle = '#ae6408';
            ctx.fillRect(sx, y, value * sw, sh);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeRect(sx, y, sw, sh);
        };

        drawSlider(PAUSE_SLIDER.yMusic,      musicVolume); // Music slider
        drawSlider(PAUSE_SLIDER.ySfx,        sfxVolume);   // Sound slider
        drawSlider(PAUSE_SLIDER.yBrightness, brightness);  // Brightness slider
    }
    if (brightness < 1) {
        ctx.fillStyle = `rgba(0,0,0, ${1 - brightness})`;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }
    requestAnimationFrame(gameLoop);
}

loadProgress();          // resume the logged-in player at their last saved race
requestAnimationFrame(gameLoop)
