# Velocity Draft 

## How to run

> 📌 **Note:** The prototype starts at the **Title Screen & Intro**, which will subsequently guide you to the card selection screen and the race.

1. Navigate to the game folder (where the project files are located)

```bash
cd Game
```

2.  Clone the repository

```bash
git clone <URL_DE_SU_REPOSITORIO>
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

✅ Terminado

Motor 2.5D (Mode 7 floor, sprite scaling, sky scrolling)
Pista generada proceduralmente con Catmull-Rom
Física de karts (aceleración, fricción, steering, terreno)
Colisiones kart vs kart con daño
4 personalidades de CPU (Fast, Aggressive, Evasive, Strategic)
Sistema de cartas — 4 pasivas y 6 activas
Efectos de estado (SpeedDebuff, SpeedBoost, Knockback, Shield, etc.)
HUD (HP, laps, posición, minimap, card HUD)
VFX (shockwave, shield)
Pantalla de selección de cartas
Pantalla de título, intro, countdown, resultados
Árboles procedurales
Skybox por hora del día vinculado al nivel


🚧 En desarrollo / Faltante según GDD

Múltiples niveles (actualmente solo 1 pista)
Progresión roguelike entre carreras (selección de carta post-carrera)
Weather system (lluvia, viento) y sus efectos en física
Road cracks como hazard de daño
Base de datos (usuarios, estadísticas, historial de runs)
Música y efectos de sonido
Pantalla de level selection
Pantalla de estadísticas del carro
Cutscenes de historia
Créditos
