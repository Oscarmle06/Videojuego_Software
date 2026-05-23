# Velocity Draft 

## How to run

> 📌 **Note:** The prototype starts at the **Title Screen & Intro**, which will subsequently guide you to the card selection screen and the race.

1.  Clone the repository

```bash
git clone <URL_DE_SU_REPOSITORIO>
```

2. Navigate to the game folder (where the project files are located)

```bash
cd Game
```

3. Install dependencies:

```bash
npm install
```

4. Start the dev server:

```bash
npm run dev
```

5. Open your browser at `http://localhost:5173`

## How to play

### Card Select
Before the race, pick your loadout:
- Up to 4 **Passive Upgrades** — permanent stat boosts for the whole race
- Up to 3 **Race Cards** — active abilities you can use mid-race

### Controls
| Key | Action |
|-----|--------|
| W   | Accelerate |
| S   | Brake |
| A   | Turn left |
| D   | Turn right |
| O   | Cycle through race cards |
| P   | Use selected card |

### Passive Upgrades
| Card | Effect |
|------|--------|
| Aerodynamic Spoiler | Increases top speed and acceleration |
| Heavy Chassis | Increases max HP |
| Sport Tires | Increases turn speed |
| Racing Transmission | Increases acceleration |

### Race Cards
| Card | Effect |
|------|--------|
| Tire Shredder | Slows the nearest kart in front of you |
| Grappler Hook | Steals speed from the nearest kart in front |
| Sonic Wave | Knocks nearby karts sideways |
| EMP | Disables cards and pushes back nearby karts |
| Repair Bot | Restores 30% of your HP |
| Temporary Armor | Absorbs the next hit you take |

### Race
- Complete **3 laps** to finish
- Finish in **top 3** to win
- Your kart explodes if your HP reaches 0

## Authors
Oscar Lara, Emilio Lara, Aixa Mendoza — May 2026


## Features 

## Features 

✅ Completed

- 2.5D Engine (Mode 7 floor, sprite scaling, sky scrolling)
- Procedurally generated track using Catmull-Rom
- Kart physics (acceleration, friction, steering, terrain)
- Kart-vs-kart collisions with damage mechanics
- 4 CPU personalities (Fast, Aggressive, Evasive, Strategic)
- Card system — 4 passives and 6 actives
- Status effects (SpeedDebuff, SpeedBoost, Knockback, Shield, etc.)
- HUD (HP, laps, position, minimap, card HUD)
- VFX (shockwave, shield)
- Card selection screen
- Title screen, intro, countdown, and results screen
- Procedural trees
- Time-of-day skybox tied to the level


🚧 In Development / Missing according to GDD

- Multiple levels (currently only 1 track available)
- Roguelike progression between races (post-race card selection)
- Weather system (rain, wind) and its impact on physics
- Road cracks as damage hazards
- Database integration (users, stats, run history)
- Music and sound effects (SFX)
- Level selection screen
- Car statistics screen
- Story cutscenes
- Credits
