// race.js 
// Main game logic for Velocity Draft, including track generation, kart management, race state machine, and rendering. This file orchestrates the entire racing experience, from the initial countdown to the final results screen.
// Oscar Lara, Emilio Lara, Aixa Mendoza, June 2026

import { Track } from './track.js';
import { CPUKart } from './CPUKart.js';
import { Camera } from '../engine/camera.js';
import { FastPersonality } from './fastPersonality.js';
import { AgressivePersonality } from './agressivePersonality.js';
import { StrategicPersonality } from './strategicPersonality.js';
import { ProvocativePersonality } from './ProvocativePersonality.js';
import { ActiveCards } from './activeCards.js';
import { VFX } from './VFX.js';
import { FloorCaster } from '../renderer/floorCaster.js';
import { SpriteRenderer } from '../renderer/spriteRenderer.js';
import { SkyRenderer } from '../renderer/skyRenderer.js';
import { Minimap } from '../renderer/minimap.js';
import { CardHUD } from '../renderer/cardHUD.js';

// Sound effect asset map, keyed by logical name to keep playSFX calls readable
const SFX = {
    raceStart: './assets/audios/raceStart.mp3',
    explosion: './assets/audios/explosion.mp3',
};

function playSFX(name, volume = 1.0) { // Creates a one-shot Audio instance so multiple overlapping sounds can play simultaneously
    const sfx = new Audio(SFX[name]);
    sfx.volume = volume;
    sfx.play().catch(() => {});
}

// Fallback card pool used before the DB sync completes; replaced entirely once the server responds
let CPU_CARD_POOL = [
    { name: 'Aerodynamic Spoiler', type: 'passive' },
    { name: 'Heavy Chassis',       type: 'passive' },
    { name: 'Sport Tires',         type: 'passive' },
    { name: 'Racing Transmission', type: 'passive' },
    { name: 'Tire Shredder',       type: 'active'  },
    { name: 'Grappler Hook',       type: 'active'  },
    { name: 'Sonic Wave',          type: 'active'  },
    { name: 'EMP',                 type: 'active'  },
    { name: 'Temporary Armor',     type: 'active'  },
];

// Live card definitions fetched from MariaDB; keyed by card name for O(1) lookup when equipping cards
let BALANCED_DECK = {};

async function syncBalanceFromMariaDB() { // Fetches live card effect values from the server and rebuilds CPU_CARD_POOL and BALANCED_DECK
    try {
        const response = await fetch('http://localhost:3000/api/cards');
        const result = await response.json();

        if (result.success) {
            const nuevoPool = [];
            BALANCED_DECK = {};

            result.data.forEach(row => {
                if (!BALANCED_DECK[row.card_name]) {
                    const isPassive = row.category.startsWith('Passive');
                    BALANCED_DECK[row.card_name] = {
                        name: row.card_name,
                        category: row.category,
                        type: isPassive ? 'passive' : 'active',
                        effects: {}
                    };

                    // Repair Bot is excluded from the CPU pool since it requires player-specific targeting logic
                    if (row.card_name !== 'Repair Bot') {
                        nuevoPool.push({
                            name: row.card_name,
                            type: isPassive ? 'passive' : 'active'
                        });
                    }
                }
                BALANCED_DECK[row.card_name].effects[row.effect_type] = parseFloat(row.value);
            });

            CPU_CARD_POOL = nuevoPool;
            console.log("Velocity Draft synced!", BALANCED_DECK);
        }
    } catch (error) {
        console.error("Error while syncing with MariaDB:", error);
    }
}

function createPersonality(type, player) { // Maps a personality string to its corresponding AI class; defaults to FastPersonality for unknown types
    if (type === 'fast')        return new FastPersonality(player);
    if (type === 'aggressive')  return new AgressivePersonality(player);
    if (type === 'strategic')   return new StrategicPersonality(player);
    if (type === 'provocative') return new ProvocativePersonality(player);
    return new FastPersonality(player);
}

const RANDOM_WEATHER = ['clear', 'rain', 'wind'];

// Per-level configuration: track shape, lap count, CPU roster, weather, and time-of-day lighting
export const LEVEL_CONFIGS = {
    1: { level: 1, track: { N: 10, centerX: 32, centerY: 32, baseRadius: 16, variation: 6 }, laps: 1, cpus: ['fast'], weather: 'clear', timeOfDay: 'day' },
    2: { level: 2, track: { N: 12, centerX: 36, centerY: 32, baseRadius: 16, variation: 9 }, laps: 2, cpus: ['fast', 'aggressive', 'strategic'], weather: 'clear', timeOfDay: 'day' },
    3: { level: 3, track: { N: 13, centerX: 36, centerY: 32, baseRadius: 17, variation: 11 }, laps: 2, cpus: ['fast', 'aggressive', 'provocative'], weather: 'clear', timeOfDay: 'sunrise' },
    4: { level: 4, track: { N: 14, centerX: 38, centerY: 32, baseRadius: 17, variation: 12 }, laps: 3, cpus: ['fast', 'aggressive', 'strategic'], weather: 'rain', timeOfDay: 'sunset' },
    5: { level: 5, track: { N: 15, centerX: 40, centerY: 34, baseRadius: 18, variation: 13 }, laps: 3, cpus: ['fast', 'aggressive', 'strategic', 'provocative'], weather: 'random', timeOfDay: 'day' },
    6: { level: 6, track: { N: 16, centerX: 40, centerY: 34, baseRadius: 18, variation: 14 }, laps: 3, cpus: ['fast', 'aggressive', 'strategic', 'provocative'], weather: 'random', timeOfDay: 'sunset' },
    7: { level: 7, track: { N: 17, centerX: 40, centerY: 34, baseRadius: 18, variation: 15 }, laps: 3, cpus: ['fast', 'aggressive', 'strategic', 'provocative'], weather: 'random', timeOfDay: 'sunrise' },
};

// Sky background images and their optional color overlays per time-of-day setting
const SKY_ASSETS = {
    day:     { src: './assets/sunnyday.png', overlay: null },
    sunrise: { src: './assets/sunrise.png',  overlay: 'rgba(255, 200, 80, 0.15)' },
    sunset:  { src: './assets/sunset.png',   overlay: 'rgba(255, 80, 20, 0.25)'  },
};

const TREE_SRCS    = ['./assets/arbol1.png', './assets/arbol2.png', './assets/arbol3.png']; // Available tree sprite variants, picked at random per instance
const TREE_COUNT   = 80;   // Total number of trees scattered around the track
const TREE_MIN_DIST = 1.5; // Minimum world-unit distance from the track edge before a tree can be placed

export class Race { // Orchestrates a single race: track setup, kart management, the game-loop state machine, and all rendering
    constructor(config, playerKart, canvas, ctx, input, cardSystem, cardHUD, mapCanvas, raceCards = [], activeCards) {
        this.config     = config;
        this.playerKart = playerKart;
        this.canvas     = canvas;
        this.ctx        = ctx;
        this.input      = input;
        this.cardSystem = cardSystem;
        this.cardHUD    = cardHUD;
        this.mapCanvas  = mapCanvas;
        this.raceCards = raceCards;
        this.activeCards = activeCards;

        // Pause state — _spaceWasPressed prevents a single key-hold from toggling pause twice
        this.paused           = false;
        this._spaceWasPressed = false;
        this._lastTime        = 0;
        this._loop            = null;
        this._loopId          = null;
        this.onPause          = null;  // callback set by main.js to show the pause screen
        this.engineAudioCtx   = null;

        if (config.weather === 'random') {
            this.weather = RANDOM_WEATHER[Math.floor(Math.random() * RANDOM_WEATHER.length)];
        } else {
            this.weather = config.weather;
        }

        this.track         = null;
        this.cpus          = [];
        this.allKarts      = [];
        this.camera        = null;
        this.vfx           = null;
        this.treeSprites   = [];
        this.treeImages    = [];
        this.floorCaster   = null;
        this.spriteRenderer = null;
        this.skyRenderer   = null;
        this.minimap       = null;
        this._skyOverlay   = null;

        // Sprites
        this.kartSprite = new Image();
        this.kartSprite.src = './assets/redkart.png';
        this.explosionSprite = new Image();
        this.explosionSprite.src = './assets/Explosion.png';
        this.HPSprite = new Image();
        this.HPSprite.src = './assets/HPGauge.png';
        this.lapSprite = new Image();
        this.lapSprite.src = './assets/Real_Lap_Counter.png';
        this.winImage = new Image();
        this.winImage.src = './assets/Win_Screen.png';
        this.loseImage = new Image();
        this.loseImage.src = './assets/Lose_Screen.png';
        this.countdownSprite = new Image();
        this.countdownSprite.src = './assets/321GOMK1.png';
        this.positionSprite = new Image();
        this.positionSprite.src = './assets/Positions.png';
        const cpuColors = ['bluekart.png', 'greenkart.png', 'greykart.png', 'yellowkart.png'];
        this.cpuSprites = cpuColors.map(colorFile => {
            const img = new Image();
            img.src = `./assets/${colorFile}`;
            return img;
        });

        // Each phase maps an elapsed-time threshold to the sprite-sheet crop for "3", "2", "1", and "GO!"
        this.COUNTDOWN_PHASES = [
            { start: 0.0, sx: 535, sy:   3, sw: 256, sh: 256 },
            { start: 1.0, sx: 270, sy:   3, sw: 256, sh: 256 },
            { start: 2.0, sx:   3, sy:   3, sw: 256, sh: 256 },
            { start: 3.0, sx:   3, sy: 268, sw: 510, sh: 256 },
        ];
        this.COUNTDOWN_TOTAL = 4.0;

        // Position sprite-sheet is divided into a 5-column grid; POS_CELLS maps race position (1–5) to a grid cell
        this.POS_CELL_W = Math.floor(677 / 5);
        this.POS_CELL_H = Math.floor(369 / 2 - 70);
        this.POS_CELLS  = [
            null,           // index 0 unused — positions are 1-based
            { col: 0, row: 0 },
            { col: 1, row: 0 },
            { col: 2, row: 0 },
            { col: 3, row: 0 },
            { col: 4, row: 0 },
        ];
    }

    _init() { // Builds the track, places all karts on the grid, equips cards, and initializes all renderers and audio
        const cfg = this.config;
        const t   = cfg.track;

        // Shared AudioContext for all in-race sounds except the engine loop, which gets its own context
        this.audioCtx = new AudioContext();

        // Track generation: waypoints → smooth spline → physical edges → checkpoints → pixel grid → start line → racing-line AI path → tree placement
        this.track = new Track(64);
        this.track.generateWaypoints(t.N, t.centerX, t.centerY, t.baseRadius, t.variation);
        this.track.generateCurve();
        this.track.generateEdges(3);
        this.track.generateCheckpoints();
        this.track.rasterize();
        this.track.findStartPosition();
        this.track.generateRacingLine();
        this.track.generateTrees(TREE_COUNT, TREE_MIN_DIST);

        // Pre-load each unique tree image so individual sprites can reference them without re-fetching
        for (let i = 0; i < TREE_SRCS.length; i++) {
            const img = new Image();
            img.src = TREE_SRCS[i];
            this.treeImages.push(img);
        }

        this.treeSprites = [];
        for (let i = 0; i < this.track.trees.length; i++) {
            const randomImage = this.treeImages[Math.floor(Math.random() * this.treeImages.length)];
            this.treeSprites.push({
                x:      this.track.trees[i].x,
                y:      this.track.trees[i].y,
                image:  randomImage,
                _scale: 3.5 + Math.random() * 0.4, // slight random size variation to break visual repetition
            });
        }

        // Player starts at the back of the grid (behind all CPUs) so faster karts don't immediately block them
        const playerSlot = cfg.cpus.length + 1;
        const playerPos  = this.track.findStartPosition(playerSlot);
        this.playerKart.x              = playerPos.x;
        this.playerKart.y              = playerPos.y;
        this.playerKart.dirX           = playerPos.dirX;
        this.playerKart.dirY           = playerPos.dirY;
        this.playerKart.speed          = 0;
        this.playerKart.laps           = 0;
        this.playerKart.nextCheckpoint = 0;
        this.playerKart.startPos       = playerSlot;
        this.playerKart.fastestLapTime = 0;

        // Spawn one CPU per personality type defined in the level config, each in its own grid slot
        this.cpus = [];
        for (let i = 0; i < cfg.cpus.length; i++) {
            const slot        = i + 1;
            const pos         = this.track.findStartPosition(slot);
            const personality = createPersonality(cfg.cpus[i], this.playerKart);
            const cpu         = new CPUKart(pos.x, pos.y, pos.dirX, pos.dirY, personality, this.playerKart, this.audioCtx);
            cpu.startPos = slot;
            this.cpus.push(cpu);
            cpu.initEngineSound();
        }

        // allKarts keeps player first so position-sort ties always resolve in favor of the player
        this.allKarts = [this.playerKart];
        for (let i = 0; i < this.cpus.length; i++) {
            this.allKarts.push(this.cpus[i]);
        }

        this.camera = new Camera(playerPos.x, playerPos.y, playerPos.dirX, playerPos.dirY);

        // VFX instance is shared between activeCards and the race so card effects can spawn visual particles
        this.vfx         = new VFX();
        this.activeCards.vfx = this.vfx;
        this.activeCards.cpus = this.cpus;

        // Deep-copy each DB card before equipping so shared effect objects don't bleed between karts
        for (let i = 0; i < this.raceCards.length; i++) {
            const cardName = this.raceCards[i];
            const dbCard = BALANCED_DECK[cardName] || { name: cardName, type: 'active', effects: {} };
            this.activeCards.equip(JSON.parse(JSON.stringify(dbCard)));
        }

        // Give each CPU a random card from the pool, using live DB values when available
        for (let i = 0; i < this.cpus.length; i++) {
            this.cpus[i].initCardSystem(this.allKarts, this.vfx);
            const randomIndex = Math.floor(Math.random() * CPU_CARD_POOL.length);
            const poolCard    = CPU_CARD_POOL[randomIndex];

            const dbCard = BALANCED_DECK[poolCard.name] || { name: poolCard.name, type: poolCard.type, effects: {} };
            this.cpus[i].cardSystem.equip(JSON.parse(JSON.stringify(dbCard)));
            console.log(`CPU ${i} (${this.cpus[i].personality.personality}) equipped from DB: ${dbCard.name}`);
        }

        // Fall back to day sky if the level's timeOfDay key is not found in SKY_ASSETS
        let sky = SKY_ASSETS[cfg.timeOfDay];
        if (sky === undefined) {
            sky = SKY_ASSETS.day;
        }
        this._skyOverlay    = sky.overlay;
        this.floorCaster    = new FloorCaster(this.canvas, this.ctx);
        this.spriteRenderer = new SpriteRenderer(this.canvas, this.ctx);
        this.skyRenderer    = new SkyRenderer(this.canvas, this.ctx, {
            imageSrc:      sky.src,
            fallbackColor: sky.overlay,
            scrollSpeed:   0.08,
        });
        this.minimap = new Minimap(this.mapCanvas);

        // Engine sound uses a separate AudioContext so it can be suspended independently of the race AudioContext during pause
        const audioCtx = new AudioContext();
        this.engineAudioCtx = audioCtx;
        fetch('./assets/audios/motor.mp3')
            .then(r => r.arrayBuffer())
            .then(buf => audioCtx.decodeAudioData(buf))
            .then(decoded => {
                const source = audioCtx.createBufferSource();
                source.buffer = decoded;
                source.loop = true;
                source.loopStart = 0.1;   // tiny trim so the loop splice point is clean
                source.loopEnd = decoded.duration - 0.1;
                const gainNode = audioCtx.createGain();
                gainNode.gain.value = 4.0;
                source.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                source.start();
                this.playerKart.engineSound = source;
                this.playerKart.engineAudioCtx = audioCtx;
            });
    }

    async startRace(onFinish) { // Syncs card balance from the server, initializes the race, then runs the requestAnimationFrame game loop
        let finishedCalled = false
        this.onFinish = onFinish;
        await syncBalanceFromMariaDB();
        this._init();
        this._lastTime = 0;
        this._startTime = performance.now();

        let raceState        = 'intro';
        let introElapsed     = 0;
        let settleElapsed    = 0;
        let countdownElapsed = 0;
        let finalPosition    = null;
        let exploding        = false;
        let explosionFrame   = 0;
        let explosionTimer   = 0;
        let resolved         = false;
        let resultTimer      = null;
        let raceStartSoundPlayed = false;
        let diedByExplosion  = false;
        let raceTimerStarted = false;
        let currentLapStart  = 0;
        let observedLaps     = 0;
        let fastestLapTime   = Infinity;
        let raceFinishTime   = 0;

        const INTRO_DURATION  = 3.0;
        const SETTLE_DURATION = 0.8;
        const TARGET_LAPS     = this.config.laps;

        const loop = (timestamp) => {
            if (finishedCalled) return;
            try {
            // Pause handling: pressing space during the race suspends this loop
            // and hands control to main.js, which renders the pause screen.
            const spacePressed = this.input.isPressed(' ');
            if (spacePressed && !this._spaceWasPressed && raceState !== 'results' && !this.paused) {
                this._spaceWasPressed = true;
                this._pause();
                return; // stop scheduling frames; resume() restarts the loop
            }
            this._spaceWasPressed = spacePressed;

            let dt = 0;
            if (this._lastTime !== 0) {
                dt = (timestamp - this._lastTime) / 1000;
            }
            this._lastTime = timestamp;

            const kartSprites = [];
            for (let i = 0; i < this.cpus.length; i++) {
                const spriteData = this.cpuSprites[i % this.cpuSprites.length];
                kartSprites.push({ 
                    x: this.cpus[i].x, 
                    y: this.cpus[i].y, 
                    image: spriteData 
                });
            }
            kartSprites.push({ x: this.playerKart.x, y: this.playerKart.y, image: this.kartSprite, isPlayer: true });

            const allSprites = [];
            for (let i = 0; i < kartSprites.length; i++) {
                allSprites.push(kartSprites[i]);
            }
            const vfxSprites = this.vfx.getSprites();
            for (let i = 0; i < vfxSprites.length; i++) {
                allSprites.push(vfxSprites[i]);
            }
            for (let i = 0; i < this.treeSprites.length; i++) {
                allSprites.push(this.treeSprites[i]);
            }

                // State machine: intro → settling → countdown → racing → results
            // Each state handles its own rendering and transitions to the next state when its condition is met

            if (raceState === 'intro') { // Camera flies along the track spline to give a cinematic preview before locking onto the player
                introElapsed += dt;
                let progress = introElapsed / INTRO_DURATION;
                if (progress > 1) progress = 1;
                this._moveCameraAlongSpline(progress);
                this._renderScene();
                this.spriteRenderer.render(this.camera, allSprites);
                this.minimap.render(this.camera, kartSprites, this.track, this.config.level);
                this._renderOverlay();
                if (introElapsed >= INTRO_DURATION) raceState = 'settling';

            } else if (raceState === 'settling') { // Short buffer between the intro fly-by and the countdown so the camera smoothly locks onto the player kart
                settleElapsed += dt;
                this.camera.followPlayer(this.playerKart, dt);
                this._renderScene();
                this.spriteRenderer.render(this.camera, allSprites);
                this.minimap.render(this.camera, kartSprites, this.track, this.config.level);
                this._renderOverlay();
                if (settleElapsed >= SETTLE_DURATION) raceState = 'countdown';

            } else if (raceState === 'countdown') { // Displays the 3-2-1-GO! HUD while the race start sound plays; karts cannot move yet
                if (!raceStartSoundPlayed) {
                    raceStartSoundPlayed = true;
                    playSFX('raceStart', 0.6);
                }
                
                countdownElapsed += dt;
                this.camera.followPlayer(this.playerKart, dt);
                this._renderScene();
                this.spriteRenderer.render(this.camera, allSprites);
                this.minimap.render(this.camera, kartSprites, this.track, this.config.level);
                this._renderOverlay();
                this._renderCountdownHUD(countdownElapsed);
                this._renderPosition();
                if (countdownElapsed >= this.COUNTDOWN_TOTAL) {
                    raceState = 'racing';
                    raceTimerStarted = true;
                    currentLapStart = timestamp;
                    this._startTime = timestamp;
                }

            } else if (raceState === 'racing') { // Main gameplay loop: input, physics, collisions, card usage, and full HUD rendering
                if (this.playerKart.laps >= TARGET_LAPS && !resolved && !finishedCalled) { // Player finished all laps — snapshot position before any kart order changes
                    resolved      = true;
                    finalPosition = this._getRacePosition();
                    raceFinishTime = timestamp;
                    raceState     = 'results';
                }

                this.playerKart.update({
                    accelerate: this.input.isPressed('w'),
                    brake:      this.input.isPressed('s'),
                    turnLeft:   this.input.isPressed('a'),
                    turnRight:  this.input.isPressed('d'),
                }, this.track, dt);

                if (raceTimerStarted && this.playerKart.laps > observedLaps) { // Lap completed — measure time and update the fastest lap record
                    const lapTime = (timestamp - currentLapStart) / 1000;
                    if (lapTime > 0 && lapTime < fastestLapTime) {
                        fastestLapTime = lapTime;
                        this.playerKart.fastestLapTime = lapTime;
                    }
                    observedLaps = this.playerKart.laps;
                    currentLapStart = timestamp;
                }

                for (let i = 0; i < this.cpus.length; i++) {
                    this.cpus[i].update(this.track, dt);
                }

                // Broad-phase N² collision check — small enough kart count that spatial hashing is not needed
                for (let i = 0; i < this.allKarts.length; i++) {
                    for (let j = i + 1; j < this.allKarts.length; j++) {
                        this.allKarts[i].checkKartCollision(this.allKarts[j]);
                    }
                }

                this.camera.followPlayer(this.playerKart, dt);
                this.vfx.update(dt, this.playerKart);
                this.activeCards.tryUse(this.input);

                this._renderScene();
                this.spriteRenderer.render(this.camera, allSprites);
                this.minimap.render(this.camera, kartSprites, this.track, this.config.level);
                this._renderOverlay();
                this.vfx.renderLines(this.camera, this.ctx, this.canvas);
                this._renderPosition();
                this._renderLaps();
                this._renderHP();

                if (this.playerKart.hp <= 0 && !exploding && !resolved) {
                    exploding      = true;
                    explosionFrame = 0;
                    explosionTimer = 0;
                    playSFX('explosion', 0.8); 
                }

                const expResult = this._renderExplosion(explosionFrame, explosionTimer, dt, exploding);
                exploding      = expResult.exploding;
                explosionFrame = expResult.frame;
                explosionTimer = expResult.timer;
                if (expResult.died && !resolved && !finishedCalled) {
                    resolved        = true;
                    diedByExplosion = true;
                    finalPosition   = this.allKarts.length;
                    raceFinishTime   = timestamp;
                    raceState       = 'results';
                }

                this.cardHUD.render(this.activeCards);

            } else if (raceState === 'results') { // Displays win or lose screen for 3 seconds, then stops all audio and calls onFinish with race stats
                if (finalPosition <= 3) {
                    this.ctx.drawImage(this.winImage, 0, 0, this.canvas.width, this.canvas.height);
                } else {
                    this.ctx.drawImage(this.loseImage, 0, 0, this.canvas.width, this.canvas.height);
                }
                if (resultTimer === null) resultTimer = timestamp; // Start the 3-second display timer on the first results frame
                if (timestamp - resultTimer >= 3000 && !finishedCalled) {
                    finishedCalled = true;
                    resolved = true;

                    if (this.playerKart.engineSound) this.playerKart.engineSound.stop();
                    for (let i = 0; i < this.cpus.length; i++) {
                        if (this.cpus[i].engineSound) this.cpus[i].engineSound.stop();
                    }

                    if (this._loopId) cancelAnimationFrame(this._loopId);

                    const stats = {
                        won: finalPosition <= 3,
                        position: finalPosition,
                        totalTime: ((raceFinishTime || timestamp) - this._startTime) / 1000,
                        fastestLap: Number.isFinite(fastestLapTime) ? fastestLapTime : 0
                    };
                    console.log("RACE DEBUG: Trying to execute onFinish with stats:", stats);
                    if (typeof this.onFinish === 'function') {
                        this.onFinish(stats);
                    }
                    else {
                        console.error("RACE ERROR: onFinish callback is not a function:", this.onFinish);
                    }
                    return;
                }
            }

            this._loopId = requestAnimationFrame(loop);
        } catch (e) {
            console.error("Error in race loop:", e);
        }
    };

        this._loop = loop;
        this._loopId = requestAnimationFrame(loop);
    }

    _pause() { // Suspends the race loop and engine audio, then notifies main.js
        if (this.paused) return;
        this.paused = true;
        try { if (this.audioCtx)       this.audioCtx.suspend();       } catch (e) {}
        try { if (this.engineAudioCtx) this.engineAudioCtx.suspend(); } catch (e) {}
        if (this.onPause) this.onPause();
    }

    resume() { // Resumes the race exactly where it was paused
        if (!this.paused) return;
        this.paused = false;
        // Treat a still-held space as "already pressed" so it doesn't re-pause instantly
        this._spaceWasPressed = this.input.isPressed(' ');
        this._lastTime = 0; // avoids a huge dt jump on the first frame back
        try { if (this.audioCtx)       this.audioCtx.resume();       } catch (e) {}
        try { if (this.engineAudioCtx) this.engineAudioCtx.resume(); } catch (e) {}
        requestAnimationFrame(this._loop);
    }

    stopAudio() { // Stops all engine sounds; used when leaving the race from the pause menu
        try { if (this.playerKart.engineSound) this.playerKart.engineSound.stop(); } catch (e) {}
        for (let i = 0; i < this.cpus.length; i++) {
            try { if (this.cpus[i].engineSound) this.cpus[i].engineSound.stop(); } catch (e) {}
        }
        try { if (this.audioCtx)       this.audioCtx.close();       } catch (e) {}
        try { if (this.engineAudioCtx) this.engineAudioCtx.close(); } catch (e) {}
    }

    _getRacePosition() { // Returns the player's current position (1-based) by ranking all karts on total laps × checkpoints; ties broken by starting grid slot
        const total  = this.track.checkpoints.length;
        const sorted = [];
        for (let i = 0; i < this.allKarts.length; i++) {
            sorted.push(this.allKarts[i]);
        }

        for (let i = 0; i < sorted.length - 1; i++) {
            for (let j = i + 1; j < sorted.length; j++) {
                const pa = sorted[i].laps * total + sorted[i].nextCheckpoint;
                const pb = sorted[j].laps * total + sorted[j].nextCheckpoint;
                let ahead = false;
                if (pb !== pa) {
                    ahead = pb > pa;
                } else {
                    ahead = sorted[j].startPos < sorted[i].startPos; // earlier grid slot wins the tie
                }
                if (ahead) {
                    const tmp = sorted[i];
                    sorted[i] = sorted[j];
                    sorted[j] = tmp;
                }
            }
        }

        for (let i = 0; i < sorted.length; i++) {
            if (sorted[i] === this.playerKart) return i + 1;
        }
        return this.allKarts.length;
    }

    _renderScene() { // Clears the canvas and redraws sky and floor each frame; must be called before sprite rendering
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.skyRenderer.render(this.camera);
        this.floorCaster.render(this.camera, this.track);
    }

    _renderOverlay() { // Applies a translucent color tint over the whole scene to simulate time-of-day lighting (sunrise/sunset)
        if (this._skyOverlay !== null) {
            this.ctx.fillStyle = this._skyOverlay;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    _renderHP() { // Draws the HP bar with a color that shifts from green to red as health decreases
        const pct = this.playerKart.hp / this.playerKart.maxHP;
        if (pct > 0.80)      this.ctx.fillStyle = '#31c044';
        else if (pct > 0.60) this.ctx.fillStyle = '#7fca41';
        else if (pct > 0.40) this.ctx.fillStyle = '#cac141';
        else if (pct > 0.20) this.ctx.fillStyle = '#ca7341';
        else                 this.ctx.fillStyle = '#ca4141';
        this.ctx.fillRect(45, 10, 204 * pct, 40);
        this.ctx.drawImage(this.HPSprite, 5, -30, 250, 100);
    }

    _renderLaps() { // Draws the lap counter sprite; clamps at lap 2 since the sprite sheet only has 3 frames (0, 1, 2)
        if (!this.lapSprite.complete) return;
        let laps = this.playerKart.laps;
        if (laps > 2) laps = 2;
        const sx = laps * 411;
        this.ctx.drawImage(this.lapSprite, sx, 0, 411, 864, 1, this.canvas.height - 200, 150, 315);
        this.ctx.fillStyle = '#2b2b2b';
        this.ctx.fillRect(20, 10, 230, 40); // dark rectangle covers the area behind the HP bar sprite so the bar color is readable
    }

    _renderPosition() { // Crops the correct position badge (1st–5th) from the sprite sheet and draws it in the bottom-right corner
        if (!this.positionSprite.complete) return;
        const pos  = this._getRacePosition();
        const cell = this.POS_CELLS[pos];
        if (!cell) return;
        const displayH = 100;
        const displayW = displayH * (this.POS_CELL_W / this.POS_CELL_H);
        this.ctx.drawImage(
            this.positionSprite,
            cell.col * this.POS_CELL_W, cell.row * this.POS_CELL_H,
            this.POS_CELL_W, this.POS_CELL_H,
            this.canvas.width - displayW - 20, this.canvas.height - displayH - 20,
            displayW, displayH,
        );
    }

    _renderExplosion(frame, timer, dt, exploding) { // Advances the explosion sprite animation frame-by-frame; returns died=true when the last frame completes
        if (!exploding) return { exploding: false, frame: frame, timer: timer, died: false };
        timer += dt;
        if (timer > 0.15) { // each explosion frame lasts 150 ms
            timer = 0;
            frame++;
        }
        if (frame >= 4) {
            return { exploding: false, frame: frame, timer: timer, died: true };
        }
        this.ctx.drawImage(
            this.explosionSprite, frame * 225, 0, 225, 277,
            this.playerKart.x, this.playerKart.y, 800, 800,
        );
        return { exploding: true, frame: frame, timer: timer, died: false };
    }

    _renderCountdownHUD(countdownElapsed) { // Renders the active countdown digit centered on screen with a pop-in scale animation
        if (!this.countdownSprite.complete) return;
        let phaseIdx = 0;
        for (let i = this.COUNTDOWN_PHASES.length - 1; i >= 0; i--) {
            if (countdownElapsed >= this.COUNTDOWN_PHASES[i].start) {
                phaseIdx = i;
                break;
            }
        }
        const phase        = this.COUNTDOWN_PHASES[phaseIdx];
        const phaseElapsed = countdownElapsed - phase.start;
        let scale          = 2.0 - (phaseElapsed / 0.3); // scale animates from 2× down to 1× over the first 300 ms of each phase
        if (scale < 1) scale = 1;
        let baseH = 280;
        if (phaseIdx === 3) baseH = 190; // "GO!" banner is wider so a smaller base height keeps it proportional
        const displayH = baseH * scale;
        const displayW = displayH * (phase.sw / phase.sh);
        this.ctx.save();
        this.ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
        this.ctx.drawImage(
            this.countdownSprite,
            phase.sx, phase.sy, phase.sw, phase.sh,
            -displayW * 0.5, -displayH * 0.5, displayW, displayH,
        );
        this.ctx.restore();
    }

    _renderCameraAlongSpline(t) { // Public alias kept for compatibility; delegates to _moveCameraAlongSpline
        this._moveCameraAlongSpline(t);
    }

    _moveCameraAlongSpline(t) { // Positions and orients the camera at normalized parameter t (0–1) along the track spline, used for the intro fly-by
        const pts    = this.track.splinePoints;
        const rawIdx = t * (pts.length - 1);
        const idx    = Math.floor(rawIdx);
        const frac   = rawIdx - idx;
        const p0     = pts[idx];
        const p1     = pts[Math.min(idx + 1, pts.length - 1)];
        this.camera.posX = p0.x + (p1.x - p0.x) * frac;
        this.camera.posY = p0.y + (p1.y - p0.y) * frac;
        const dx  = p1.x - p0.x;
        const dy  = p1.y - p0.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0.0001) { // skip direction update for zero-length segments to avoid NaN in the camera plane
            this.camera.dirX   =  dx / len;
            this.camera.dirY   =  dy / len;
            this.camera.planeX = -this.camera.dirY * 0.66; // 0.66 gives a ~66° FOV for the raycaster
            this.camera.planeY =  this.camera.dirX * 0.66;
        }
    }
}
