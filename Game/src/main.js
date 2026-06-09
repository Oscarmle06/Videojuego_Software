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
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (gameState === 'title') {
        previousState = 'title'
        if (mouseX > 410 && mouseX < 630 && mouseY > 455 && mouseY < 500) {
            playSFX('select');
            if (currentLevel === 1) {
                gameState = 'storyScreen';
                
            } else {
                gameState = 'cardSelect';
                setMusic('cardSelect');
            }
        }
        if (mouseX >= 400 && mouseX <= 625 && mouseY >= 505 && mouseY <= 540){
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
        previousState = 'gameOver';
        playSFX('select');
        currentLevel = 1;
        let cardSystem = new CardSystem();
        gameState = 'title';
        setMusic('title');
    } else if (gameState === 'championship') {
        previousState = 'championship';
        playSFX('select');
        currentLevel = 1;
        let cardSystem = new CardSystem();
        gameState = 'title';
        setMusic('title');
    }
    else if (gameState === 'credits') {
        previousState = 'credits';
        if (mouseX > 778 && mouseX < 1001 && mouseY > 545  && mouseY <590) {
        playSFX('select');
        currentLevel = 1;
        gameState = 'title';
        setMusic ('title')
    } }
    else if (gameState === 'pause') {
        if (mouseX >=310 && mouseX <= 560 && mouseY >= 400 && mouseY <= 420){
            musicVolume = Math.max((mouseX-310)/250);
            music.volume = musicVolume;
        }
        if (mouseX >=310 && mouseX <= 560 && mouseY >= 190 && mouseY <= 210){
            sfxVolume = Math.max((mouseX-310)/250);
        }
        if (mouseX >=310 && mouseX <= 560 && mouseY >= 300 && mouseY <= 320){
            brightness = Math.max((mouseX -310)/250);
        }
        if (mouseX > 567 && mouseX < 857 && mouseY > 156  && mouseY <336) {//here has to go the real save and exit (connected to the database)
            currentLevel = 1;
            gameState = 'title';
            setMusic ('title');
        }
        else if (mouseX > 570 && mouseX < 860 && mouseY > 390  && mouseY <430) { //pause the race
            playSFX('select');
            gameState = previousState;
         }

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

    currentRace.startRace((won, stats) => {
        if (!won) {
            const userId = getPlayerId();
            saveRaceResults(userId, stats.position, stats.totalTime, stats.fastestLap);
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
      gameState = 'raceIntro';
  });

async function saveRaceResults(player_id, position, totalTime, fastestLap) {
    const raceData = {
        player_id: player_id,
        position: position,
        total_play_time: totalTime,
        fastest_lap: fastestLap
    };

    try {
        const response = await fetch('http://localhost:3000/api/save-race', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(raceData)
        });
        const result = await response.json();
        console.log("Resultado guardado:", result);
    } catch (error) {
        console.error("Error al guardar resultados:", error);
    }
}

//  Game loop 
function gameLoop(timestamp) {

    const dt = lastTime === 0 ? 0 : (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (gameState === 'title') {
        ctx.drawImage(titleImage, 0, 0, canvas.width, canvas.height);
    } 
    else if (gameState === 'racing') {
      return}
    
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
            'CLICK TO CONTINUE', canvas.width/2, 550
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
            'CLICK TO CONTINUE', canvas.width/2, 550
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

        //Music slider
        ctx.fillStyle = '#ae6408';
        ctx.fillRect(310, 400, musicVolume * 250, 20);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(310, 400, 250, 20);

        // sound slider
        ctx.fillStyle = '#ae6408';
        ctx.fillRect(310,190, sfxVolume * 250, 20);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(310, 190, 250, 20);

        // Brightness slider
        ctx.fillStyle = '#ae6408';
        ctx.fillRect(310, 300, brightness * 250, 20);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(310, 300, 250, 20);
    }
    if (brightness < 1) {
        ctx.fillStyle = `rgba(0,0,0, ${1 - brightness})`;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop)
