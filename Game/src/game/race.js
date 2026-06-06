// race.js
// Maneja la lógica principal de la carrera: inicialización, loop de juego y renderizado.
// Sincronizado dinámicamente con la API de MariaDB para el balanceo de cartas.
// Oscar Lara, Emilio Lara, Aixa Mendoza, May 2026 (Actualizado Junio 2026)

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

//  SFX
const SFX = {
    raceStart: './assets/audios/raceStart.mp3',
    explosion: './assets/audios/explosion.mp3',
};

function playSFX(name, volume = 1.0) {
    const sfx = new Audio(SFX[name]);
    sfx.volume = volume;
    sfx.play().catch(() => {});
}

// Pool de cartas para los CPUs (Se poblará dinámicamente desde MariaDB, excluyendo Repair Bot)
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

// Almacén global en memoria del mazo balanceado con los efectos de la base de datos
let BALANCED_DECK = {};

// Conexión asíncrona con el backend de Express para jalar la configuración viva de la DB
async function sincronizarBalanceDesdeMariaDB() {
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
                    
                    // Las IAs no reciben la carta curativa 'Repair Bot'
                    if (row.card_name !== 'Repair Bot') {
                        nuevoPool.push({ 
                            name: row.card_name, 
                            type: isPassive ? 'passive' : 'active' 
                        });
                    }
                }
                // Mapeamos los valores SQL a flotantes numéricos para el motor de físicas
                BALANCED_DECK[row.card_name].effects[row.effect_type] = parseFloat(row.value);
            });

            // Reemplazamos los fallbacks estáticos por el balance real de la DB
            CPU_CARD_POOL = nuevoPool;
            console.log("🚀 ¡Velocity Draft sincronizado con MariaDB exitosamente!", BALANCED_DECK);
        }
    } catch (error) {
        console.error("⚠️ Error al conectar con el backend de MariaDB. Usando valores locales por defecto.", error);
    }
}

function createPersonality(type, player) {
    if (type === 'fast')        return new FastPersonality(player);
    if (type === 'aggressive')  return new AgressivePersonality(player);
    if (type === 'strategic')   return new StrategicPersonality(player);
    if (type === 'provocative') return new ProvocativePersonality(player);
    return new FastPersonality(player);
}

const RANDOM_WEATHER = ['clear', 'rain', 'wind'];

export const LEVEL_CONFIGS = {
    1: { level: 1, track: { N: 10, centerX: 32, centerY: 32, baseRadius: 16, variation: 6 }, laps: 1, cpus: ['fast'], weather: 'clear', timeOfDay: 'day' },
    2: { level: 2, track: { N: 12, centerX: 36, centerY: 32, baseRadius: 16, variation: 9 }, laps: 2, cpus: ['fast', 'aggressive', 'strategic'], weather: 'clear', timeOfDay: 'day' },
    3: { level: 3, track: { N: 13, centerX: 36, centerY: 32, baseRadius: 17, variation: 11 }, laps: 2, cpus: ['fast', 'aggressive', 'provocative'], weather: 'clear', timeOfDay: 'sunrise' },
    4: { level: 4, track: { N: 14, centerX: 38, centerY: 32, baseRadius: 17, variation: 12 }, laps: 3, cpus: ['fast', 'aggressive', 'strategic'], weather: 'rain', timeOfDay: 'sunset' },
    5: { level: 5, track: { N: 15, centerX: 40, centerY: 34, baseRadius: 18, variation: 13 }, laps: 3, cpus: ['fast', 'aggressive', 'strategic', 'provocative'], weather: 'random', timeOfDay: 'day' },
    6: { level: 6, track: { N: 16, centerX: 40, centerY: 34, baseRadius: 18, variation: 14 }, laps: 3, cpus: ['fast', 'aggressive', 'strategic', 'provocative'], weather: 'random', timeOfDay: 'sunset' },
    7: { level: 7, track: { N: 17, centerX: 40, centerY: 34, baseRadius: 18, variation: 15 }, laps: 3, cpus: ['fast', 'aggressive', 'strategic', 'provocative'], weather: 'random', timeOfDay: 'sunrise' },
};

const SKY_ASSETS = {
    day:     { src: './assets/sunnyday.png', overlay: null },
    sunrise: { src: './assets/sunrise.png',  overlay: 'rgba(255, 200, 80, 0.15)' },
    sunset:  { src: './assets/sunset.png',   overlay: 'rgba(255, 80, 20, 0.25)'  },
};

const TREE_SRCS    = ['./assets/arbol1.png', './assets/arbol2.png', './assets/arbol3.png'];
const TREE_COUNT   = 80;
const TREE_MIN_DIST = 1.5;

export class Race {
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
        this.kartSprite.src = './assets/playercar2.png';
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

        this.COUNTDOWN_PHASES = [
            { start: 0.0, sx: 535, sy:   3, sw: 256, sh: 256 },
            { start: 1.0, sx: 270, sy:   3, sw: 256, sh: 256 },
            { start: 2.0, sx:   3, sy:   3, sw: 256, sh: 256 },
            { start: 3.0, sx:   3, sy: 268, sw: 510, sh: 256 },
        ];
        this.COUNTDOWN_TOTAL = 4.0;

        this.POS_CELL_W = Math.floor(677 / 5);
        this.POS_CELL_H = Math.floor(369 / 2 - 70);
        this.POS_CELLS  = [
            null,
            { col: 0, row: 0 },
            { col: 1, row: 0 },
            { col: 2, row: 0 },
            { col: 3, row: 0 },
            { col: 4, row: 0 },
        ];
    }

    // ── Inicialización interna de la carrera ──────────────────────────────────────

    _init() {
        const cfg = this.config;
        const t   = cfg.track;

        // Audio API 
        this.audioCtx = new AudioContext();

        // Pista
        this.track = new Track(64);
        this.track.generateWaypoints(t.N, t.centerX, t.centerY, t.baseRadius, t.variation);
        this.track.generateCurve();
        this.track.generateEdges(3);
        this.track.generateCheckpoints();
        this.track.rasterize();
        this.track.findStartPosition();
        this.track.generateRacingLine();
        this.track.generateTrees(TREE_COUNT, TREE_MIN_DIST);

        // Imágenes de árboles
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
                _scale: 3.5 + Math.random() * 0.4,
            });
        }

        // Posición del jugador en la parrilla
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

        // Karts CPU
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

        this.allKarts = [this.playerKart];
        for (let i = 0; i < this.cpus.length; i++) {
            this.allKarts.push(this.cpus[i]);
        }

        // Cámara
        this.camera = new Camera(playerPos.x, playerPos.y, playerPos.dirX, playerPos.dirY);

        // VFX y cartas del jugador
        this.vfx         = new VFX();
        this.activeCards.vfx = this.vfx;
        this.activeCards.cpus = this.cpus;

        // Inyectamos las cartas del jugador leyendo los efectos reales traídos de MariaDB
        for (let i = 0; i < this.raceCards.length; i++) {
            const cardName = this.raceCards[i];
            const dbCard = BALANCED_DECK[cardName] || { name: cardName, type: 'active', effects: {} };
            this.activeCards.equip(JSON.parse(JSON.stringify(dbCard)));
        }

        // Inicializamos los sistemas de cartas de las CPU con los datos numéricos de la DB
        for (let i = 0; i < this.cpus.length; i++) {
            this.cpus[i].initCardSystem(this.allKarts, this.vfx);
            const randomIndex = Math.floor(Math.random() * CPU_CARD_POOL.length);
            const poolCard    = CPU_CARD_POOL[randomIndex];
            
            const dbCard = BALANCED_DECK[poolCard.name] || { name: poolCard.name, type: poolCard.type, effects: {} };
            this.cpus[i].cardSystem.equip(JSON.parse(JSON.stringify(dbCard)));
            console.log(`CPU ${i} (${this.cpus[i].personality.personality}) recibió de DB: ${dbCard.name}`);
        }

        // Renderers
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

        // Web Audio API Engine Loop
        const audioCtx = new AudioContext();
        fetch('./assets/audios/motor.mp3')
            .then(r => r.arrayBuffer())
            .then(buf => audioCtx.decodeAudioData(buf))
            .then(decoded => {
                const source = audioCtx.createBufferSource();
                source.buffer = decoded;
                source.loop = true;
                source.loopStart = 0.1;
                source.loopEnd = decoded.duration - 0.1;
                const gainNode = audioCtx.createGain();
                gainNode.gain.value = 4.0;
                source.connect(gainNode);
                gainNode.connect(audioCtx.destination);                
                source.start();
                this.playerKart.engineSound = source;
                this.playerKart.engineAudioCtx = this.audioCtx;
            });
    }

    // ── Loop de carrera asíncrono para esperar la API ──────────────────────────────

    async startRace(onFinish) {
        // 1. Forzamos la descarga del balance dinámico antes de instanciar componentes
        await sincronizarBalanceDesdeMariaDB();

        // 2. Ejecutamos el armado de la escena con los mazos inyectados
        this._init();

        let raceState        = 'intro';
        let introElapsed     = 0;
        let settleElapsed    = 0;
        let countdownElapsed = 0;
        let lastTime         = 0;
        let finalPosition    = null;
        let exploding        = false;
        let explosionFrame   = 0;
        let explosionTimer   = 0;
        let resolved         = false;
        let resultTimer      = null;
        let raceStartSoundPlayed = false;

        const INTRO_DURATION  = 3.0;
        const SETTLE_DURATION = 0.8;
        const TARGET_LAPS     = this.config.laps;

        const loop = (timestamp) => {
            let dt = 0;
            if (lastTime !== 0) {
                dt = (timestamp - lastTime) / 1000;
            }
            lastTime = timestamp;

            const kartSprites = [];
            for (let i = 0; i < this.cpus.length; i++) {
                kartSprites.push({ x: this.cpus[i].x, y: this.cpus[i].y, image: this.kartSprite });
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

            if (raceState === 'intro') {
                introElapsed += dt;
                let progress = introElapsed / INTRO_DURATION;
                if (progress > 1) progress = 1;
                this._moveCameraAlongSpline(progress);
                this._renderScene();
                this.spriteRenderer.render(this.camera, allSprites);
                this.minimap.render(this.camera, kartSprites, this.track, this.config.level);
                this._renderOverlay();
                if (introElapsed >= INTRO_DURATION) raceState = 'settling';

            } else if (raceState === 'settling') {
                settleElapsed += dt;
                this.camera.followPlayer(this.playerKart, dt);
                this._renderScene();
                this.spriteRenderer.render(this.camera, allSprites);
                this.minimap.render(this.camera, kartSprites, this.track, this.config.level);
                this._renderOverlay();
                if (settleElapsed >= SETTLE_DURATION) raceState = 'countdown';

            } else if (raceState === 'countdown') {
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
                if (countdownElapsed >= this.COUNTDOWN_TOTAL) raceState = 'racing';

            } else if (raceState === 'racing') {
                if (this.playerKart.laps >= TARGET_LAPS && !resolved) {
                    resolved      = true;
                    finalPosition = this._getRacePosition();
                    raceState     = 'results';
                }

                this.playerKart.update({
                    accelerate: this.input.isPressed('w'),
                    brake:      this.input.isPressed('s'),
                    turnLeft:   this.input.isPressed('a'),
                    turnRight:  this.input.isPressed('d'),
                }, this.track, dt);

                for (let i = 0; i < this.cpus.length; i++) {
                    this.cpus[i].update(this.track, dt);
                }

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
                if (expResult.died && !resolved) {
                    resolved      = true;
                    finalPosition = this.allKarts.length;
                    raceState     = 'results';
                }

                this.cardHUD.render(this.activeCards);

            } else if (raceState === 'results') {
                if (finalPosition <= 3) {
                    this.ctx.drawImage(this.winImage, 0, 0, this.canvas.width, this.canvas.height);
                } else {
                    this.ctx.drawImage(this.loseImage, 0, 0, this.canvas.width, this.canvas.height);
                }
                if (resultTimer === null) resultTimer = timestamp;
                if (timestamp - resultTimer >= 3000) {
                    this.playerKart.engineSound.stop();
                    for (let i = 0; i < this.cpus.length; i++) {
                        if (this.cpus[i].engineSound) this.cpus[i].engineSound.stop();
                    }
                    onFinish(finalPosition <= 3);
                    return;
                }
            }

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    _getRacePosition() {
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
                    ahead = sorted[j].startPos < sorted[i].startPos;
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

    _renderScene() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.skyRenderer.render(this.camera);
        this.floorCaster.render(this.camera, this.track);
    }

    _renderOverlay() {
        if (this._skyOverlay !== null) {
            this.ctx.fillStyle = this._skyOverlay;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    _renderHP() {
        const pct = this.playerKart.hp / this.playerKart.maxHP;
        if (pct > 0.80)      this.ctx.fillStyle = '#31c044';
        else if (pct > 0.60) this.ctx.fillStyle = '#7fca41';
        else if (pct > 0.40) this.ctx.fillStyle = '#cac141';
        else if (pct > 0.20) this.ctx.fillStyle = '#ca7341';
        else                 this.ctx.fillStyle = '#ca4141';
        this.ctx.fillRect(20, 10, 230 * pct, 40);
        this.ctx.drawImage(this.HPSprite, 5, -30, 250, 100);
    }

    _renderLaps() {
        if (!this.lapSprite.complete) return;
        let laps = this.playerKart.laps;
        if (laps > 2) laps = 2;
        const sx = laps * 411;
        this.ctx.drawImage(this.lapSprite, sx, 0, 411, 864, 1, 380, 150, 315);
        this.ctx.fillStyle = '#2b2b2b';
        this.ctx.fillRect(20, 10, 230, 40);
    }

    _renderPosition() {
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

    _renderExplosion(frame, timer, dt, exploding) {
        if (!exploding) return { exploding: false, frame: frame, timer: timer, died: false };
        timer += dt;
        if (timer > 0.15) {
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

    _renderCountdownHUD(countdownElapsed) {
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
        let scale          = 2.0 - (phaseElapsed / 0.3);
        if (scale < 1) scale = 1;
        let baseH = 280;
        if (phaseIdx === 3) baseH = 190;
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

    _renderCameraAlongSpline(t) { // Mantengo el helper por consistencia de código
         this._moveCameraAlongSpline(t);
    }

    _moveCameraAlongSpline(t) {
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
        if (len > 0.0001) {
            this.camera.dirX   =  dx / len;
            this.camera.dirY   =  dy / len;
            this.camera.planeX = -this.camera.dirY * 0.66;
            this.camera.planeY =  this.camera.dirX * 0.66;
        }
    }
}