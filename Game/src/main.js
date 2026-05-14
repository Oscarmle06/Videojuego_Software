// src/main.js
import { Camera } from './engine/camera.js';
import { Input }  from './engine/input.js';
import { FloorCaster } from './renderer/floorCaster.js';
import { SpriteRenderer } from './renderer/spriteRenderer.js';
import { Minimap } from './renderer/minimap.js';
import { Track } from './game/track.js';
import { PlayerKart } from './game/playerKart.js';
import { CPUKart } from './game/CPUKart.js';
import { Personality } from './game/Personality.js';
import { FastPersonality } from './game/fastPersonality.js';
import { StrategicPersonality } from './game/strategicPersonality.js';
import { AgressivePersonality } from './game/agressivePersonality.js';
import { EvasivePersonality } from './game/evasivePersonality.js';
import { CardSystem } from './game/cardSystem.js';
import { HUD } from './renderer/HUD.js';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

canvas.width  = 800;
canvas.height = 600;
const mapCanvas = document.getElementById('mapCanvas');
const minimap = new Minimap(mapCanvas);
const input  = new Input();
const floorCaster = new FloorCaster(canvas, ctx);
const track = new Track(64);
track.generate();
const pos1 = track.findStartPosition(1);
const pos2 = track.findStartPosition(2);
const pos3 = track.findStartPosition(3);
const pos4 = track.findStartPosition(4);
const pos5 = track.findStartPosition(5);

const camera = new Camera(pos5.x, pos5.y, pos5.dirX, pos5.dirY);
const playerKart = new PlayerKart(pos5.x, pos5.y, pos5.dirX, pos5.dirY);
const spriteRenderer = new SpriteRenderer(canvas, ctx);
const cpu1 = new CPUKart(pos1.x, pos1.y, pos1.dirX, pos1.dirY, new FastPersonality());
const cpu2 = new CPUKart(pos2.x, pos2.y, pos2.dirX, pos2.dirY, new AgressivePersonality());
const cpu3 = new CPUKart(pos3.x, pos3.y, pos3.dirX, pos3.dirY, new EvasivePersonality());
const cpu4 = new CPUKart(pos4.x, pos4.y, pos4.dirX, pos4.dirY, new StrategicPersonality());

// Explosion
let exploding = false;
let explosionFrame = 0;
let explosionTimer = 0;

// Grid start positions (used as tiebreaker when progress is equal)
cpu1.startPos = 1;
cpu2.startPos = 2;
cpu3.startPos = 3;
cpu4.startPos = 4;
playerKart.startPos = 5;

const cardSystem = new CardSystem();
const spoiler = { name: 'Racing Transmission', type: 'passive', stat: 'maxSpeed', value: 2, level: 1 };
cardSystem.addCard(spoiler, playerKart);

// Sprites
  const kartSprite = new Image();
  kartSprite.src = './sprites/playercar2.png';

// Explosion
  const explosionSprite = new Image();
  explosionSprite.src = './assets/Explosion.png';

// HP
  const HPSprite = new Image();
  HPSprite.src = './assets/HPGauge.png'

// LapCounters
  const lapSprite = new Image();
  lapSprite.src = './assets/Real_Lap_Counter.png';

  function renderLaps() {
    if (!lapSprite.complete) return;
    
    const lapFrame = Math.min(playerKart.laps, 2); // 0, 1 o 2
    const sx = lapFrame * 411;
    
    ctx.drawImage(lapSprite, sx, 0, 411, 864, 1, 380, 150, 315);

    //For HP BKG
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(20, 10, 230, 40)
  }

// Win or Lose screen
  const winImage = new Image();
  winImage.src = './assets/Win_Screen.png';

  const loseImage = new Image();
  loseImage.src = './assets/Lose_Screen.png';

    // Final Position
    let finalPosition = null;

    function getRacePosition() {
      const allKarts = [playerKart, cpu1, cpu2, cpu3, cpu4];
      const numCheckpoints = track.checkpoints.length;
      const sorted = [...allKarts].sort((a, b) => {
        const pa = a.laps * numCheckpoints + a.nextCheckpoint;
        const pb = b.laps * numCheckpoints + b.nextCheckpoint;
        if (pb !== pa) return pb - pa;
        return a.startPos - b.startPos;
      });
      return sorted.indexOf(playerKart) + 1;
    }

// Title screen 
  const titleImage = new Image();
  titleImage.src = './assets/Title_Screen.png';

  canvas.addEventListener('click', (e) => {
  if (gameState !== 'title') return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Ajusta estos 4 valores hasta que quede sobre el botón START
  const btnX = 310, btnY = 455, btnW = 170, btnH = 45;

  if (mouseX > btnX && mouseX < btnX + btnW &&
      mouseY > btnY && mouseY < btnY + btnH) {
    gameState = 'intro';
  }
  });

// HUD assets
  const HUDassets = {
      kartSprite: kartSprite,
      lapSprite: lapSprite,
      hpsprite: HPSprite
  };
//const hud = new HUD(canvas, ctx, HUDassets);a

let lastTime = 0;

// Race start sequence: 'intro' → 'settling' → 'countdown' → 'racing'
  let gameState    = 'racing';
  let introElapsed  = 0;
  let settleElapsed = 0;
  let countdownElapsed = 0;

  const INTRO_DURATION  = 7.0;  // camera tours all spline points
  const SETTLE_DURATION = 0.8;  // camera lerps to player, no text shown

// Spritesheet 321GOMK1.png: 1324×527
// Pixel-scanned exact cell boundaries:
//   Row 0 content: y=3, h=256  |  Row 1 content: y=268, h=256
//   Cell 0: x=3,  w=256  (1)
//   Cell 1: x=270,w=256  (2)
//   Cell 2: x=535,w=256  (3)
//   GO!: row1 cells 0+1 → x=3, w=523
const COUNTDOWN_PHASES = [
  { start: 0.0, sx: 535, sy: 3, sw: 256, sh: 256 }, // 3
  { start: 1.0, sx: 270, sy: 3, sw: 256, sh: 256 }, // 2
  { start: 2.0, sx:   3, sy: 3, sw: 256, sh: 256 }, // 1
  { start: 3.0, sx:   3, sy: 268, sw: 523, sh: 256 }, // GO!
];
const COUNTDOWN_TOTAL = 4.0;

const countdownSprite = new Image();
countdownSprite.src = './sprites/321GOMK1.png';

const positionSprite = new Image();
positionSprite.src = './sprites/MKPositions.png';
// 663×387, 4 cols × 3 rows → 1st..12th (row0: 1-4, row1: 5-8, row2: 9-12)
const POS_CELL_W = Math.floor(663 / 4); // 165
const POS_CELL_H = Math.floor(387 / 3); // 129
const POS_CELLS = [
  null,
  { col: 0, row: 0 }, // 1st
  { col: 1, row: 0 }, // 2nd
  { col: 2, row: 0 }, // 3rd
  { col: 3, row: 0 }, // 4th
  { col: 0, row: 1 }, // 5th
];

function renderHP() {

  const hpPercent = playerKart.hp / playerKart.maxHP; // 0.0 a 1.0
  const fillWidth = 230 * hpPercent;

  if (hpPercent <= 1 && hpPercent > .80) {
      ctx.fillStyle = '#31c044';
  }
  else if (hpPercent < .80 && hpPercent > .60) {
      ctx.fillStyle = '#7fca41';
  }
  else if (hpPercent < .60 && hpPercent > .40) {
      ctx.fillStyle = '#cac141';
  }
  else if (hpPercent < .40 && hpPercent > .20) {
      ctx.fillStyle = '#ca7341';
  }
  else if (hpPercent < .20 && hpPercent > 0) {
      ctx.fillStyle = '#ca4141';
  }
  ctx.fillRect(20, 10, fillWidth, 40)

  ctx.drawImage(HPSprite, 5, -30, 250, 100)

}

function checkHP() {
  if (playerKart.hp <= 0 && !exploding) {
    exploding = true;
    explosionFrame = 0;
    explosionTimer = 0;
  }
}

function renderExplosion(deltaTime) {
  if (!exploding) return;

  explosionTimer += deltaTime;
  if (explosionTimer > 0.15) {
    explosionTimer = 0;
    explosionFrame++;
  }

  if (explosionFrame >= 4) {
  exploding = false;
  finalPosition = 5; // siempre lose
  gameState = 'results';
  return;
}

  const sx = explosionFrame * 225;
  ctx.drawImage(explosionSprite, sx, 0, 225, 277,
    playerKart.x, playerKart.y, 800, 800);
}

function moveCameraAlongSpline(t) {
  const points = track.splinePoints;
  const rawIdx = t * (points.length - 1);
  const idx  = Math.floor(rawIdx);
  const frac = rawIdx - idx;

  const p0 = points[idx];
  const p1 = points[Math.min(idx + 1, points.length - 1)];

  camera.posX = p0.x + (p1.x - p0.x) * frac;
  camera.posY = p0.y + (p1.y - p0.y) * frac;

  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0.0001) {
    camera.dirX   =  dx / len;
    camera.dirY   =  dy / len;
    camera.planeX = -camera.dirY * 0.66;
    camera.planeY =  camera.dirX * 0.66;
  }
}

function renderCountdownHUD() {
  if (!countdownSprite.complete) return;

  let phaseIdx = 0;
  for (let i = COUNTDOWN_PHASES.length - 1; i >= 0; i--) {
    if (countdownElapsed >= COUNTDOWN_PHASES[i].start) { phaseIdx = i; break; }
  }

  const phase        = COUNTDOWN_PHASES[phaseIdx];
  const phaseElapsed = countdownElapsed - phase.start;
  const isGo         = phaseIdx === 3;

  // Scale punch: 2.0 → 1.0 over first 0.3s of each phase
  const scale = 2.0 - Math.min(phaseElapsed / 0.3, 1);

  const baseH    = isGo ? 190 : 280;
  const displayH = baseH * scale;
  const displayW = displayH * (phase.sw / phase.sh);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.drawImage(
    countdownSprite,
    phase.sx, phase.sy, phase.sw, phase.sh,
    -displayW / 2, -displayH / 2, displayW, displayH
  );
  ctx.restore();
}

function renderPosition() {
  if (!positionSprite.complete) return;

  const allKarts = [playerKart, cpu1, cpu2, cpu3, cpu4];
  const numCheckpoints = track.checkpoints.length;

  const sorted = [...allKarts].sort((a, b) => {
    const pa = a.laps * numCheckpoints + a.nextCheckpoint;
    const pb = b.laps * numCheckpoints + b.nextCheckpoint;
    if (pb !== pa) return pb - pa;
    return a.startPos - b.startPos; // tiebreak: lower startPos = ahead in grid
  });

  const pos = sorted.indexOf(playerKart) + 1;
  const cell = POS_CELLS[pos];
  if (!cell) return;

  const sx = cell.col * POS_CELL_W;
  const sy = cell.row * POS_CELL_H;
  const displayH = 100;
  const displayW = displayH * (POS_CELL_W / POS_CELL_H);

  ctx.drawImage(
    positionSprite,
    sx, sy, POS_CELL_W, POS_CELL_H,
    canvas.width - displayW - 20, canvas.height - displayH - 20,
    displayW, displayH
  );
}

function gameLoop(timestamp) {
  const deltaTime = lastTime === 0 ? 0 : (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  const sprites = [
    { x: 7.0, y: 5.0, color: '#ff0000' },
    { x: 5.0, y: 8.0, color: '#00ff00' },
    { x: 3.0, y: 5.0, color: '#0000ff' },
    { x: cpu1.x, y: cpu1.y, image: kartSprite },
    { x: cpu2.x, y: cpu2.y, image: kartSprite },
    { x: cpu3.x, y: cpu3.y, image: kartSprite },
    { x: cpu4.x, y: cpu4.y, image: kartSprite },
    { x: playerKart.x, y: playerKart.y, image: kartSprite, isPlayer: true }
  ];

  if (gameState === 'title') {
  ctx.drawImage(titleImage, 0, 0, canvas.width, canvas.height);

} else if (gameState === 'intro') { 
    introElapsed += deltaTime;
    moveCameraAlongSpline(Math.min(introElapsed / INTRO_DURATION, 1));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    floorCaster.render(camera, track);
    minimap.render(camera, sprites, track);
    spriteRenderer.render(camera, sprites);

    if (introElapsed >= INTRO_DURATION) gameState = 'settling';

  } else if (gameState === 'settling') {
    settleElapsed += deltaTime;
    camera.followPlayer(playerKart, deltaTime);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    floorCaster.render(camera, track);
    minimap.render(camera, sprites, track);
    spriteRenderer.render(camera, sprites);

    if (settleElapsed >= SETTLE_DURATION) gameState = 'countdown';

  } else if (gameState === 'countdown') {
    countdownElapsed += deltaTime;
    camera.followPlayer(playerKart, deltaTime);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    floorCaster.render(camera, track);
    minimap.render(camera, sprites, track);
    spriteRenderer.render(camera, sprites);
    renderCountdownHUD();
    renderPosition();

    if (countdownElapsed >= COUNTDOWN_TOTAL) gameState = 'racing';

  } else if (gameState === 'racing') {


    if (playerKart.laps >= 3 && finalPosition === null) {
      finalPosition = getRacePosition();
      gameState = 'results';
    }
    // 1. Leer input y actualizar estado
    const decisions = {
      accelerate: input.isPressed('w'),
      brake: input.isPressed('s'),
      turnLeft: input.isPressed('a'),
      turnRight: input.isPressed('d')
    };
    playerKart.update(decisions, track, deltaTime);
    cpu1.update(track, deltaTime);
    cpu2.update(track, deltaTime);
    cpu3.update(track, deltaTime);
    cpu4.update(track, deltaTime);

    // Colisiones resueltas antes de renderizar para evitar frames con overlap visual
    const allKarts = [playerKart, cpu1, cpu2, cpu3, cpu4];
    for (let i = 0; i < allKarts.length; i++) {
      for (let j = i + 1; j < allKarts.length; j++) {
        allKarts[i].checkKartCollision(allKarts[j]);
      }
    }

    camera.followPlayer(playerKart, deltaTime);

    // 2. Renderizar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    floorCaster.render(camera, track);
    minimap.render(camera, sprites, track);
    spriteRenderer.render(camera, sprites);
    renderPosition();
    renderLaps();
    renderHP();
    checkHP();
    renderExplosion(deltaTime);

    //hud.render(playerKart);
  } else if (gameState === 'results') {
      const image = finalPosition <= 3 ? winImage : loseImage;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }


  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);