// Main file of the game, responsible for initializing everything and running the main game loop. It handles the different game states (title screen, intro, countdown, racing, results) and orchestrates the rendering and updating of all game elements.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026

import { Camera }             from './engine/camera.js';
import { Input }              from './engine/input.js';
import { FloorCaster }        from './renderer/floorCaster.js';
import { SpriteRenderer }     from './renderer/spriteRenderer.js';
import { SkyRenderer }        from './renderer/skyRenderer.js';
import { Minimap }            from './renderer/minimap.js';
import { Track }              from './game/track.js';
import { PlayerKart }         from './game/playerKart.js';
import { CPUKart }            from './game/CPUKart.js';
import { FastPersonality }    from './game/fastPersonality.js';
import { StrategicPersonality } from './game/strategicPersonality.js';
import { AgressivePersonality } from './game/agressivePersonality.js';
import { EvasivePersonality } from './game/evasivePersonality.js';
import { CardSystem }         from './game/cardSystem.js';
import { CardHUD }            from './renderer/cardHUD.js';
import { ActiveCards }        from './game/activeCards.js';
import { VFX }                from './game/VFX.js';
import { CardSelectScreen } from './renderer/CardSelectScreen.js';

//  Canvas setup 
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = 1020;
canvas.height = 600;

//  Sky options (picked randomly each race) 
const SKY_OPTIONS = [
  { src: './assets/sunnyday.png', overlay: null },
  { src: './assets/sunrise.png',  overlay: 'rgba(255, 200, 80, 0.15)' },
  { src: './assets/sunset.png',   overlay: 'rgba(255, 80, 20, 0.25)'  },
];
const SKY_CHOICE  = SKY_OPTIONS[Math.floor(Math.random() * SKY_OPTIONS.length)];
const SKY_OVERLAY = SKY_CHOICE.overlay;

//  Tree assets 
const TREE_SRCS     = ['./assets/arbol1.png', './assets/arbol2.png', './assets/arbol3.png'];
const TREE_COUNT    = 80;
const TREE_MIN_DIST = 1.5;

const treeImages = [];
for (let i = 0; i < TREE_SRCS.length; i++) {
  const img = new Image();
  img.src   = TREE_SRCS[i];
  treeImages.push(img);
}

//  Core systems 
const input       = new Input();
const floorCaster = new FloorCaster(canvas, ctx);
const skyRenderer = new SkyRenderer(canvas, ctx, { imageSrc: SKY_CHOICE.src, fallbackColor: SKY_OVERLAY, scrollSpeed: 0.08 });
const minimap     = new Minimap(document.getElementById('mapCanvas'));

//  Track 
const track = new Track(64);
track.generate();
track.generateTrees(TREE_COUNT, TREE_MIN_DIST);

// Build tree sprites after track is generated
const treeSprites = [];
for (let i = 0; i < track.trees.length; i++) {
  treeSprites.push({
    x:      track.trees[i].x,
    y:      track.trees[i].y,
    image:  treeImages[Math.floor(Math.random() * treeImages.length)],
    _scale: 3.5 + Math.random() * 0.4,
  });
}

//  Karts 
const pos1 = track.findStartPosition(1);
const pos2 = track.findStartPosition(2);
const pos3 = track.findStartPosition(3);
const pos4 = track.findStartPosition(4);
const pos5 = track.findStartPosition(5);

const playerKart = new PlayerKart(pos5.x, pos5.y, pos5.dirX, pos5.dirY);
const cpu1       = new CPUKart(pos1.x, pos1.y, pos1.dirX, pos1.dirY, new FastPersonality());
const cpu2       = new CPUKart(pos2.x, pos2.y, pos2.dirX, pos2.dirY, new AgressivePersonality());
const cpu3       = new CPUKart(pos3.x, pos3.y, pos3.dirX, pos3.dirY, new EvasivePersonality());
const cpu4       = new CPUKart(pos4.x, pos4.y, pos4.dirX, pos4.dirY, new StrategicPersonality());
const camera     = new Camera(pos5.x, pos5.y, pos5.dirX, pos5.dirY);
const allKarts   = [playerKart, cpu1, cpu2, cpu3, cpu4];

// Grid start positions — used as tiebreaker when lap progress is equal
playerKart.startPos = 5;
cpu1.startPos = 1;
cpu2.startPos = 2;
cpu3.startPos = 3;
cpu4.startPos = 4;

//  Cards 
const cardSystem = new CardSystem();
const cardCanvas = document.getElementById('cardCanvas');
const cardHUD    = new CardHUD(cardCanvas, cardCanvas.getContext('2d'), cardSystem);

const vfx         = new VFX();
const activeCards = new ActiveCards(playerKart, [cpu1, cpu2, cpu3, cpu4], vfx);

// Card select screen — uses the same images as CardHUD
const cardSelectScreen = new CardSelectScreen(canvas, ctx, cardHUD.images, (passives, raceCards) => {
  // Load passive upgrades
  for (let i = 0; i < passives.length; i++) {
    cardSystem.addCard({ name: passives[i], level: 1, type: 'passive' }, playerKart);
  }
  // Load race cards
  for (let i = 0; i < raceCards.length; i++) {
    activeCards.equip({ name: raceCards[i], type: 'battle' });
  }
  gameState = 'title';
});

//  Sprites / images 
const spriteRenderer = new SpriteRenderer(canvas, ctx);

const kartSprite      = new Image();  kartSprite.src      = './assets/playercar2.png';
const explosionSprite = new Image();  explosionSprite.src = './assets/Explosion.png';
const HPSprite        = new Image();  HPSprite.src        = './assets/HPGauge.png';
const lapSprite       = new Image();  lapSprite.src       = './assets/Real_Lap_Counter.png';
const winImage        = new Image();  winImage.src        = './assets/Win_Screen.png';
const loseImage       = new Image();  loseImage.src       = './assets/Lose_Screen.png';
const titleImage      = new Image();  titleImage.src      = './assets/Title_Screen.png';
const countdownSprite = new Image();  countdownSprite.src = './assets/321GOMK1.png';
const positionSprite  = new Image();  positionSprite.src  = './assets/Positions.png';

//  Countdown spritesheet layout 
// 321GOMK1.png: 1324×527
// Row 0: y=3  h=256 | Row 1: y=268 h=256
// Cell 0: x=3 w=256 (1) | Cell 1: x=270 w=256 (2) | Cell 2: x=535 w=256 (3)
// GO!: row1 x=3 w=523
const COUNTDOWN_PHASES = [
  { start: 0.0, sx: 535, sy:   3, sw: 256, sh: 256 }, // 3
  { start: 1.0, sx: 270, sy:   3, sw: 256, sh: 256 }, // 2
  { start: 2.0, sx:   3, sy:   3, sw: 256, sh: 256 }, // 1
  { start: 3.0, sx:   3, sy: 268, sw: 523, sh: 256 }, // GO!
];
const COUNTDOWN_TOTAL = 4.0;

//  Position spritesheet layout 
const POS_CELL_W = Math.floor(677 / 5);
const POS_CELL_H = Math.floor(369 / 2 - 70);
const POS_CELLS  = [
  null,
  { col: 0, row: 0 }, // 1st
  { col: 1, row: 0 }, // 2nd
  { col: 2, row: 0 }, // 3rd
  { col: 3, row: 0 }, // 4th
  { col: 4, row: 0 }, // 5th
];

//  Game state 
let gameState        = 'cardSelect'; // title → intro → settling → countdown → racing → results
let introElapsed     = 0;
let settleElapsed    = 0;
let countdownElapsed = 0;
let lastTime         = 0;
let finalPosition    = null;
let exploding      = false;
let explosionFrame = 0;
let explosionTimer = 0;

const INTRO_DURATION  = 7.0;
const SETTLE_DURATION = 0.8;

//  Title screen click 
canvas.addEventListener('click', handleTitleClick);

function handleTitleClick(e) {
  if (gameState !== 'title') return;
  const rect   = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  if (mouseX > 410 && mouseX < 630 && mouseY > 455 && mouseY < 500) {
    gameState = 'intro';
  }
}

//  Helper: race position 
function getRacePosition() {
  const total  = track.checkpoints.length;
  const sorted = [...allKarts];

  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const pa = sorted[i].laps * total + sorted[i].nextCheckpoint;
      const pb = sorted[j].laps * total + sorted[j].nextCheckpoint;
      const ahead = pb !== pa ? pb > pa : sorted[j].startPos < sorted[i].startPos;
      if (ahead) {
        const temp = sorted[i];
        sorted[i]  = sorted[j];
        sorted[j]  = temp;
      }
    }
  }

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] === playerKart) return i + 1;
  }
}

//  Render helpers 
function renderScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  skyRenderer.render(camera);
  floorCaster.render(camera, track);
}

function renderOverlay() {
  if (SKY_OVERLAY) {
    ctx.fillStyle = SKY_OVERLAY;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function renderHP() {
  const hpPercent = playerKart.hp / playerKart.maxHP;
  const fillWidth = 230 * hpPercent;

  if      (hpPercent > 0.80) ctx.fillStyle = '#31c044';
  else if (hpPercent > 0.60) ctx.fillStyle = '#7fca41';
  else if (hpPercent > 0.40) ctx.fillStyle = '#cac141';
  else if (hpPercent > 0.20) ctx.fillStyle = '#ca7341';
  else                       ctx.fillStyle = '#ca4141';

  ctx.fillRect(20, 10, fillWidth, 40);
  ctx.drawImage(HPSprite, 5, -30, 250, 100);
}

function renderLaps() {
  if (!lapSprite.complete) return;
  const sx = Math.min(playerKart.laps, 2) * 411;
  ctx.drawImage(lapSprite, sx, 0, 411, 864, 1, 380, 150, 315);

  // HP bar background
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(20, 10, 230, 40);
}

function renderPosition() {
  if (!positionSprite.complete) return;
  const pos  = getRacePosition();
  const cell = POS_CELLS[pos];
  if (!cell) return;

  const displayH = 100;
  const displayW = displayH * (POS_CELL_W / POS_CELL_H);
  ctx.drawImage(
    positionSprite,
    cell.col * POS_CELL_W, cell.row * POS_CELL_H, POS_CELL_W, POS_CELL_H,
    canvas.width - displayW - 20, canvas.height - displayH - 20, displayW, displayH
  );
}

function renderExplosion(deltaTime) {
  if (!exploding) return;

  explosionTimer += deltaTime;
  if (explosionTimer > 0.15) {
    explosionTimer = 0;
    explosionFrame++;
  }

  if (explosionFrame >= 4) {
    exploding     = false;
    finalPosition = 5;
    gameState     = 'results';
    return;
  }

  ctx.drawImage(explosionSprite, explosionFrame * 225, 0, 225, 277,
    playerKart.x, playerKart.y, 800, 800);
}

function renderCountdownHUD() {
  if (!countdownSprite.complete) return;

  // Find which phase we're in by scanning backwards
  let phaseIdx = 0;
  for (let i = COUNTDOWN_PHASES.length - 1; i >= 0; i--) {
    if (countdownElapsed >= COUNTDOWN_PHASES[i].start) { phaseIdx = i; break; }
  }

  const phase        = COUNTDOWN_PHASES[phaseIdx];
  const phaseElapsed = countdownElapsed - phase.start;

  // Punch scale: starts big and shrinks to normal over 0.3s
  const scale    = 2.0 - Math.min(phaseElapsed / 0.3, 1);
  const baseH    = phaseIdx === 3 ? 190 : 280; // GO! is wider, needs less height
  const displayH = baseH * scale;
  const displayW = displayH * (phase.sw / phase.sh);

  ctx.save();
  ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
  ctx.drawImage(
    countdownSprite,
    phase.sx, phase.sy, phase.sw, phase.sh,
    -displayW * 0.5, -displayH * 0.5, displayW, displayH
  );
  ctx.restore();
}

// Lerps the camera along the track spline for the intro flyby
function moveCameraAlongSpline(t) {
  const points = track.splinePoints;
  const rawIdx = t * (points.length - 1);
  const idx    = Math.floor(rawIdx);
  const frac   = rawIdx - idx;
  const p0     = points[idx];
  const p1     = points[Math.min(idx + 1, points.length - 1)];

  camera.posX = p0.x + (p1.x - p0.x) * frac;
  camera.posY = p0.y + (p1.y - p0.y) * frac;

  const dx  = p1.x - p0.x;
  const dy  = p1.y - p0.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0.0001) {
    camera.dirX   =  dx / len;
    camera.dirY   =  dy / len;
    camera.planeX = -camera.dirY * 0.66;
    camera.planeY =  camera.dirX * 0.66;
  }
}

//  Game loop 
function gameLoop(timestamp) {
  const deltaTime = lastTime === 0 ? 0 : (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  // Kart sprites built every frame so positions stay current
  const kartSprites = [
    { x: cpu1.x,        y: cpu1.y,        image: kartSprite },
    { x: cpu2.x,        y: cpu2.y,        image: kartSprite },
    { x: cpu3.x,        y: cpu3.y,        image: kartSprite },
    { x: cpu4.x,        y: cpu4.y,        image: kartSprite },
    { x: playerKart.x,  y: playerKart.y,  image: kartSprite, isPlayer: true },
  ];
  const allSprites = [...kartSprites, ...treeSprites, ...vfx.getSprites()];

    if (gameState === 'cardSelect') {
    cardSelectScreen.render();
    return requestAnimationFrame(gameLoop);
  }

  if (gameState === 'title') {
    ctx.drawImage(titleImage, 0, 0, canvas.width, canvas.height);

  } else if (gameState === 'intro') {
    introElapsed += deltaTime;
    moveCameraAlongSpline(Math.min(introElapsed / INTRO_DURATION, 1));
    renderScene();
    spriteRenderer.render(camera, allSprites);
    minimap.render(camera, kartSprites, track);
    renderOverlay();
    if (introElapsed >= INTRO_DURATION) gameState = 'settling';

  } else if (gameState === 'settling') {
    settleElapsed += deltaTime;
    camera.followPlayer(playerKart, deltaTime);
    renderScene();
    spriteRenderer.render(camera, allSprites);
    minimap.render(camera, kartSprites, track);
    renderOverlay();
    if (settleElapsed >= SETTLE_DURATION) gameState = 'countdown';

  } else if (gameState === 'countdown') {
    countdownElapsed += deltaTime;
    camera.followPlayer(playerKart, deltaTime);
    renderScene();
    spriteRenderer.render(camera, allSprites);
    minimap.render(camera, kartSprites, track);
    renderOverlay();
    renderCountdownHUD();
    renderPosition();
    if (countdownElapsed >= COUNTDOWN_TOTAL) gameState = 'racing';

  } else if (gameState === 'racing') {
    // Check win condition before updating
    if (playerKart.laps >= 3 && finalPosition === null) {
      finalPosition = getRacePosition();
      gameState     = 'results';
    }

    // Input
    playerKart.update({
      accelerate: input.isPressed('w'),
      brake:      input.isPressed('s'),
      turnLeft:   input.isPressed('a'),
      turnRight:  input.isPressed('d'),
    }, track, deltaTime);

    // CPU update
    cpu1.update(track, deltaTime);
    cpu2.update(track, deltaTime);
    cpu3.update(track, deltaTime);
    cpu4.update(track, deltaTime);

    // Resolve collisions before rendering to avoid visual overlap
    for (let i = 0; i < allKarts.length; i++) {
      for (let j = i + 1; j < allKarts.length; j++) {
        allKarts[i].checkKartCollision(allKarts[j]);
      }
    }

    camera.followPlayer(playerKart, deltaTime);
    vfx.update(deltaTime, playerKart);
    activeCards.tryUse(input);

    renderScene();
    spriteRenderer.render(camera, allSprites);
    minimap.render(camera, kartSprites, track);
    renderOverlay();
    renderPosition();
    renderLaps();
    renderHP();
    renderExplosion(deltaTime);
    if (playerKart.hp <= 0 && !exploding) {
      exploding      = true;
      explosionFrame = 0;
      explosionTimer = 0;
    }

    cardHUD.render(activeCards);

  } else if (gameState === 'results') {
    const image = finalPosition <= 3 ? winImage : loseImage;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);