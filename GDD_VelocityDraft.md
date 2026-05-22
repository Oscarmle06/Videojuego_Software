# **Velocity Draft**

## _Game Design Document_

---

##### **@2026 ITARI Games Studio — Todos los derechos reservados**
##### Aixa Elenka Mendoza Filisola | A01782727 · Oscar Miguel Lara Elizondo | A01781855 · José Emilio Lara Posada | A01782838

---

## _Index_

1. [Game Design](#game-design)
    1. [Summary](#summary)
    2. [Gameplay](#gameplay)
    3. [Mindset](#mindset)
2. [Technical](#technical)
    1. [Screens](#screens)
    2. [Controls](#controls)
    3. [Mechanics](#mechanics)
3. [Level Design](#level-design)
    1. [Themes](#themes)
    2. [Game Flow](#game-flow)
4. [Development](#development)
    1. [Abstract Classes / Components](#abstract-classes--components)
    2. [Derived Classes / Component Compositions](#derived-classes--component-compositions)
    3. [Technical Overview](#technical-overview)
    4. [Game Physics](#game-physics)
    5. [Database Structure](#database-structure)
5. [Graphics](#graphics)
    1. [Style Attributes](#style-attributes)
    2. [Graphics Needed](#graphics-needed)
6. [Sounds / Music](#sounds--music)
    1. [Style Attributes](#style-attributes-1)
    2. [Sounds Needed](#sounds-needed)
    3. [Music Needed](#music-needed)
7. [Schedule](#schedule)

---

## _Game Design_

---

### **Summary**

Velocity Draft is a 2.5D car-combat roguelike that merges retro arcade racing with modern deck-building strategy. Every run, players build a card deck to evolve their vehicle, race against AI rivals on procedurally generated tracks, and fight to survive with a persistent health bar — permadeath looming at every corner.

### **Gameplay**

The goal is to complete a series of races in a continuous "run" format, finishing each race in the **top 3** while keeping the health bar alive. Players do not choose a class — instead, they build their driving style through a deck-building system, selecting one card from three offered after each victorious race. Cards range from permanent performance upgrades (Passives) to limited-use weapons (Offensive) and healing tools (Repair).

As the player progresses through tracks, the difficulty scales: more complex track layouts, more CPU rivals, and weather modifiers that alter handling. Finishing outside the top 3 or reaching 0 HP ends the entire run.

### **Mindset**

The goal is to provoke a constant state of*risk vs. reward tension. Unlike a casual racing game, every decision — which card to pick, when to use an offensive item, whether to push for position or play defensively — carries real consequences thanks to permadeath. Players should feel the adrenaline of survival combined with the satisfaction of a well-executed strategic play.

### **LOGO**

![Alt text](/assets/imgs/logo.png)

---

## _Technical_

---

### **Screens**

1. **Title Screen**
   - START → Level Selection or new run
   - OPTIONS → brightness, sound, music sliders
   - EXIT → closes the game

![Alt text](/assets/imgs/titlescreen.png)

2. **Level Selection**
   - Level buttons 1–7 + Trophy (final race), unlocked sequentially
   - Locked levels are non-interactive
   - BACK → Title Screen

   ![Alt text](/assets/imgs/levelselection.png)

3. **Options / Pause Menu** *(doubles as pause screen)*
   - Sliders: Sound (SFX volume), Music, Brightness
   - SAVE & EXIT → returns to Level Selection
   - BACK → returns to game

   ![Alt text](/assets/imgs/option.png)

4. **Gameplay Screen**
   - Main 2.5D race view (Mode 7 floor + sprite karts)
   - HUD: health bar, race position, active cards (up to 3 offensive slots), minimap
   - ESC → Pause Menu

   ![Alt text](/assets/imgs/playerview.png)

5. **Results Screen**
   - WIN variant: trophy + flag, level number, finish time
   - TRY AGAIN variant: same layout, different header
   - Triggers Card Selection on WIN

   ![Alt text](/assets/imgs/win.png)

6. **Card Selection Screen**
   - Shown after each win (Level 1 onward)
   - Displays 3 randomly drawn cards from the 12-card pool
   - Player selects 1 with mouse/Enter

   ![Alt text](/assets/imgs/card_seleection.png)

7. **Car Statistics Screen**
   - Shows cumulative passive upgrades: Tires, Spoiler Aero, Chassis, Transmission
   - Progress bars per stat — persists across runs (not lost on death)
   - BACK → returns to game

   ![Alt text](/assets/imgs/statistics.png)

8. **Storytelling / Cutscenes**
   - Intro cutscene (reserve driver backstory)
   - Win cutscene (championship victory)
   - Permadeath cutscene
   - Simplistic pixel art style, text-driven, advanced with SPACE

   ![Alt text](/assets/imgs/story.png)

9. **Credits Screen**
   - Team names, music credits, sprites credits, legal notices
   - Background music playing
   - BACK TO MAIN MENU button

   ![Alt text](/assets/imgs/credit_scene.png)

10. **Game Over Screen**
    - Triggered by health = 0 or finish outside top 3
    - Shows: highest level reached, death cause, cards collected during run

---

### **Controls**

| Key       | Action                                      |
|-----------|---------------------------------------------|
| W / ↑     | Accelerate                                  |
| S / ↓     | Brake / Reverse (when stopped)              |
| A / ←     | Turn left                                   |
| D / →     | Turn right                                  |
| O         | Select offensive/repair card                |
| P         | Use selected offensive/repair card          |
| ESC       | Pause game *(not implemented yet)*          |
| SPACE     | Advance cutscene *(not implemented yet)*    |
| Mouse     | Navigate menus, select cards in menu        |
| Enter     | Confirm card selection in menu              |

---

### **Mechanics**

#### Health Bar
A single persistent health bar replaces the traditional lives system. Damage is received from crashes, off-road contact with road cracks, enemy collisions, and projectile hits. At 0 HP the car explodes and the entire run ends (permadeath).

#### Race Classification
Finish in the **top 3** to advance. Finishing 4th or lower ends the run immediately, regardless of HP remaining.

#### Card System
At run start, the full 12-card pool is available. After each victorious race, 3 random cards are drawn and the player picks 1. Card categories:

**Passives (Permanent upgrades — no button slot)**
- **Racing Transmission** — increases base acceleration
- **Heavy Chassis** — reduces damage and impulse from kart collisions; multiplies opponent's impulse
- **Sport Tires** — increases grip (rotation speed at high velocities, tighter turns)
- **Aerodynamic Spoiler** — increases base top speed

**Offensive (Active, key-triggered, limited durability 1–2 races, max 3 in deck)**
- **Tire Shredder** — projectile that causes rival to lose control and drop top speed for 3–5 sec
- **EMP** — shockwave that disables nearby enemies' attacks and pushes them outward
- **Grappler Hook** — latches onto the car ahead; steals 15% of their current speed
- **Sonic Wave** — forward/backward sound blast that damages and pushes enemies sideways

**Repair (Active, between or during races)**
- **Repair Bot** — recover 30% HP immediately
- **Pit Stop** — recover 60% HP, but only usable between races
- **Temporary Armor** — adds a shield bar that absorbs the next hit without damaging base HP
- **Takedown Recovery** — recover 5–10% HP each time an enemy crashes or goes off-track via your cards

#### Card Drop Probabilities
| Card                 | Category  | Drop Rate |
|----------------------|-----------|------------|
| Racing Transmission  | Passive   | 13%        |
| Heavy Chassis        | Passive   | 13%        |
| Sport Tires          | Passive   | 13%        |
| Aerodynamic Spoiler  | Passive   | 13%        |
| Tire Shredder        | Offensive | 8%         |
| EMP                  | Offensive | 8%         |
| Grappler Hook        | Offensive | 8%         |
| Sonic Wave           | Offensive | 8%         |
| Repair Bot           | Repair    | 5%         |
| Pit Stop             | Repair    | 4%         |
| Temporary Armor      | Repair    | 4%         |
| Takedown Recovery    | Repair    | 3%         |

> Passives 52% total · Offensive 32% total · Repair 16% total

#### AI Rival Behaviors
- **The Fast (Leader)** — prioritizes position, avoids fights, dangerous when approached
- **The Aggressive** — targets the player with collisions and traps; forces repair card usage
- **The Strategic** — uses long-range projectiles from behind; forces dodging
- **The Evasive** — mirrors player movement to block position advances

#### Obstacles & Environment
- **Off-road terrain** — applies speed penalty (55% topSpeed), disables offensive cards
- **Road cracks** — direct 5–10% HP damage + camera shake on contact

**Weather Modifiers (Global)**
| Condition | Effect |
|-----------|---------|
| Clear | No modifiers, full visibility |
| Rain | Grip multiplier reduced (wider turns), grey fog filter, rain streak animation, rain SFX |
| Wind | Constant lateral force vector applied to all karts; players must counter-steer; wind SFX |

---

## _Level Design_

---

### **Themes**

The visual theme is retro arcade racing: vivid green grass, blue sky, palm trees and classic track-side elements. Each race uses a different time-of-day background (skybox) with its own atmosphere:

| Time | Atmosphere | Sky |
|----------|-------------------------------|-------------------------|
| Sunrise | Quiet, soft, fresh start | Orange/golden horizon |
| Midday | Bright, warm, non-threatening | Blue sky with clouds |
| Sunset | Warm, reflective, melancholic | Orange/purple gradient |

![Alt text](/assets/imgs/sunnyday.png)
![Alt text](/assets/imgs/sunrise.png)
![Alt text](/assets/imgs/sunset.png)

Weather overlays (Clear, Rain, Wind) apply on top of the time-of-day backgrounds starting from Level 4.

Track complexity increases with each level: more waypoints (turns), additional laps, and tighter layouts. Lap count maxes out at Level 5.

---

### **Game Flow**

1. **Title Screen** → Story Cutscene (reserve driver backstory, team quit, fight for championship alone)
2. **Level Selection** → Only Level 1 available initially

**Level 1 — Time Trial (tutorial)**
- Solo run, no CPUs, beat a forgiving target time
- Teaches: acceleration, braking, turning
- Unlocks the full card pool on completion

**Card Selection** → First exposure; game explains card types, HP mechanic, offensive cards

**Level 2 — First Real Race**
- 3 CPUs, neutral/sunny/midday conditions
- Must finish top 3 to continue
- Permadeath active from here on (run restarts as "another season", some upgrades retained)

**Card Selection**

**Level 3** — Similar to L2, CPUs receive hidden upgrades (offensive, passive, or repair)

**Card Selection**

**Level 4** — Afternoon, rainy weather introduced
- Teaches weather impact on handling
- Introduces weather randomization for all future races (sunny / rainy / windy)

**Card Selection**

**Level 5** — 4 CPUs, weather randomized
- New rival introduced: former teammate on a well-funded team (story beat)

**Card Selection**

**Level 6** — Similar to L5, pre-championship race

**Card Selection**

**Level 7 — Championship Race**
- All mechanics active, highest CPU difficulty
- Winning triggers the victory cutscene and credits

---

## _Development_

---

### **Abstract Classes / Components**

| Class | Responsibility |
|----------------|----------------|
| **GameLoop** | Core execution cycle via `requestAnimationFrame()`. Manages update/render pipeline. All components initialized here. |
| **Input** | Keyboard state manager. Listens to `keydown`/`keyup` events, exposes `isPressed(key)`. |
| **Camera** | Player's POV. Stores `posX`, `posY`, `dirX`, `dirY`, `planeX`, `planeY`, `posZ`. Follows PlayerKart. |
| **Track** | Procedurally generated circuit. Handles waypoint generation, Catmull-Rom spline, edge normals, grid rasterization, spawn position, and checkpoint generation. |
| **Kart** | Base entity for all vehicles. Shared state: position, direction vector, speed, topSpeed, acceleration, grip, health. |
| **Projectile** | Base entity for offensive items. Shared state: position, direction, speed, damage, duration, owner reference. |

---

### **Derived Classes / Component Compositions**

| Class | Description |
|-------|-------------|
| **FloorCaster** | Receives Camera + Track each frame. Mode 7-style floor projection per scanline, samples Track grid for asphalt/grass color. Writes to Canvas pixel buffer. |
| **SpriteRenderer** | Receives Camera + list of Kart/Projectile objects. Computes screen position and scale per sprite (billboard). Painter's Algorithm sort. |
| **Minimap** | Renders top-down overview on secondary canvas. Draws track edges, kart positions as colored dots, camera direction indicator. |
| **HUDRenderer** | Reads PlayerKart + CardSystem state. Renders health bar, lap, race position, active offensive slots on main canvas. |
| **PlayerKart** | Extends Kart. Reads Input each frame for acceleration/braking/steering. Terrain modifiers applied from Track grid. Stats modified by CardSystem passives. |
| **CPUKart** | Extends Kart. Controlled by AIController (no Input). Follows spline waypoints. Behavior type assigned at race start. |
| **AIController** | Manages all CPUKart instances. Computes steering/acceleration per behavior type each frame. Uses spline for pathfinding, PlayerKart position for offensive decisions. |
| **CardSystem** | Manages deck across races. Stores card pool, active passives applied to PlayerKart, 3-slot offensive inventory. Presents 3 random cards between races. |
| **RaceManager** | Tracks lap counts, race positions, finish conditions. Determines podium result. Triggers CardSystem post-race. Manages roguelike run-end conditions (outside top 3 or HP = 0). |
| **CardSelectionScreen** | Rendered between races. Displays 3 available cards, handles selection input, returns control to GameLoop. |
| **MainMenu** | Entry point. Handles deck building at run start (up to 12 cards) before first race. |
| **GameOverScreen** | Displayed on run end. Shows highest level reached, cards collected during run. |
| **TireShredder / EMP / GrapplerHook / SonicWave** | Extend Projectile. Implement specific offensive behaviors per card. |

---

### **Technical Overview**

#### 2.5D Implementation

The engine combines three techniques:

**Mode 7 — Floor Projection**

The canvas is split at `horizon = canvasHeight / 2`. Everything below is rendered per-scanline:

Each pixel samples `track.grid[gridY][gridX]` → asphalt (80,80,80) or grass (34,100,34).

**Sprite Scaling (Z-axis billboard)**

Karts and projectiles are rendered as scaled billboards using inverse camera plane transform:

Sorted back-to-front (Painter's Algorithm) before drawing.

**Skybox**

The sky half (above horizon) is filled with a flat color or a scrolling pixel-art background image that changes per time-of-day theme.

#### Track Generation

1. Generate N waypoints in polar coordinates around (32, 32) with random radius variation
2. Smooth with Catmull-Rom spline (50 steps per segment, circular wraparound with `(i±1+N)%N`)
3. Generate left/right edges via normalized perpendicular vectors at each spline point
4. Rasterize edges into 64×64 grid (linear interpolation left→right, `Math.floor()` to cell index)
5. `findStartPosition()` returns `splinePoints[0]` with direction toward `splinePoints[1]`

---

### **Game Physics**

#### Kart Movement

#### Steering / Rotation

Camera plane rotates identically to keep FOV consistent.

#### Terrain (sampled each frame from grid)

| Terrain | topSpeed | friction |
|----------|-------------|-------------|
| Asphalt (grid = 1) | `baseTopSpeed` | `baseFriction` |
| Grass (grid = 0) | `baseTopSpeed × 0.55` | `baseFriction × 2.0` |

#### Kart vs Track Collision

- Off-grid boundary → velocity = 0, kart pushed back
- Off-track (grass) → terrain penalties apply, offensive cards disabled

#### Kart vs Kart Collision (Circle Collision)

On collision: both receive impulse away from each other. The Aggressive CPU uses this intentionally. Heavy Chassis card reduces damage received and modifies impulse magnitudes.

#### Card Stat Modifiers (applied at selection time, stackable)

| Card | Effect |
|------|--------|
| Racing Transmission | `acceleration += bonus` |
| Heavy Chassis | Damage reduction %, impulse reduction on self, multiplied on opponent |
| Sport Tires | `baseRotSpeed += bonus` (tighter turns at speed) |
| Aerodynamic Spoiler | `baseTopSpeed += bonus` |

---

### **Database Structure**

Purpose: player progression persistence, session analytics for difficulty tuning, card balance data (selection frequency → drop rate / power adjustments).

---

## _Graphics_

---

### **Style Attributes**

Pixel art, retro arcade racing aesthetic. Vivid but limited palette to avoid visual overload. All characters and enemies are outlined in black for contrast against the background.

Sprite resolution: **64×64 pixels** per kart and card. Health bar visible at all times — flashes red when HP hits 0 before the cutscene triggers.

**Color palettes (proposed):**

| Option | Primary | Shadow | Highlight |
|--------|---------|---------|-----------|
| 1 (Red) | #E63946 | #E63946 | #E63946 |
| 2 (Blue) | #2D9CDB | #1C2A44 | #56CCF2 |
| 3 (Green) | #27AE60 | #145A32 | #6FCF97 |
| 4 (Yellow) | #F2C94C | #B7950B | #FFF176 |

Player kart: vivid blue (Option 2). Each CPU has a distinct palette tied to their personality type.

### **Graphics Needed**

**Karts (Player + 4 CPU variants)**

For each kart: side profile (L), side profile (R), front view, back view, angled back-left, angled back-right, angled front-left, angled front-right *(used for drift/turn animation)*

![alt text](/assets/imgs/kart.png)
![alt text](/assets/imgs/colorpal.png)

**Cards (12 total)**
- Front face: unique illustration + category letter (P / O / R) + ability identifier
- Back face: shared design for all cards (same deck implied)

![alt text](/assets/imgs/cards.png)

**UI Elements**
- Health bar
- Race position indicator
- Card HUD slots (3 offensive)
- Minimap overlay frame

**Backgrounds / Skyboxes**
- Sunrise, Midday, Sunset pixel art backgrounds
- Rain streak overlay
- Level Select top-down track map

**Cutscene Art**
- Intro (helmet on table)
- Win / Permadeath variants

---

## _Sounds / Music_

---

### **Style Attributes**

Sound effects should be punchy and arcade-style — enough to confirm actions without overwhelming the race audio. Music is original, city pop / Japanese racing game aesthetic (Gran Turismo influence): upbeat, melodic, loop-friendly.

### **Sounds Needed**

| Sound | Reference |
|--------|-----------|
| Car Accelerating | [YouTube](https://www.youtube.com/watch?v=WWa441avBHs) |
| Car Decelerating | [YouTube](https://www.youtube.com/watch?v=veP_A5bQT4c) |
| Car Drifting (tire screech) | [YouTube](https://www.youtube.com/watch?v=iwJnfe69Glo) |
| Explosion | [YouTube](https://www.youtube.com/watch?v=HTXiJpCDiH4) |
| Car Crash | [YouTube](https://www.youtube.com/watch?v=uakY1LYZ3Vo) |
| UI Selection | [YouTube](https://www.youtube.com/watch?v=d9sQvn0pYts) |
| Rain | [YouTube](https://www.youtube.com/watch?v=C-hzP3mOBGY) |
| Wind | [YouTube](https://www.youtube.com/watch?v=5jlUVr6gkos) |
| Race Start | [YouTube](https://www.youtube.com/watch?v=KOoCEIwswYg) |

### **Music Needed**

All tracks original, composed and recorded by the team.

| Track | Context |
|-------|---------|
| Main Menu | Title screen |
| Card Selection | Between-race card screen |
| Storyline | Cutscenes |
| Race | During races |
| Winning Race | Post-race win |
| Ending Race | Credits / run end |

Style: city pop / Japanese racing game aesthetic. Upbeat, melodic, loop-friendly.

---

## _Schedule_

---

### Sprint 1 — Documentation & Conceptualization ✅
- Finalization of GDD
- Initial UML / Entity-Relationship diagram sketch
- Creation of user stories (game + database)

### Sprint 2 — Core Engine ✅
- Base classes: `Kart`, `Track`, `Camera`
- Input system (keyboard/mouse)
- MySQL database setup and table creation

### Sprint 3 — Roguelite System & AI ← *Current*
- Implement `CardSystem` (passive upgrades + active abilities)
- Implement kart physics and track/kart collision
- Develop AI behavior for all 4 CPU types (`AIController`)

### Sprint 4 — Level Design & Content
- Race tracks with increasing complexity (more waypoints, laps)
- Weather system integration (rain/wind modifiers)
- HUD: health bar, race position, active card slots

### Sprint 5 — Assets, Sounds & Web Integration
- Music and SFX integration
- Finalize all 2.5D sprites and environment backgrounds
- HTML/JS/CSS web page development

### Sprint 6 — Testing, Bug Fixing & Delivery
- Intensive QA (errors, glitches, memory leaks, logic errors)
- AI difficulty + card power balancing
- Final documentation review and stable build delivery
