# Velocity Draft

A roguelike kart-racing game built with vanilla JavaScript and a raycasting 2.5D engine.
Players race through 7 levels, picking one card between each race to upgrade their kart or arm themselves for the next fight.

---

## Prerequisites

- **Node.js** v18 or later
- **MariaDB** (or MySQL 8) running locally
- A MariaDB user with full privileges on the game database (see DB setup below)

---

## 1. Clone the repository

```bash
git clone <REPOSITORY_URL>
cd Videojuego_Software/Code
```

---

## 2. Set up the database

All SQL scripts are in `DataBase/`. The easiest option is to run the single combined script:

### 2a. Create the DB user and grant privileges

Open a MariaDB shell as root and run:

```sql
CREATE USER IF NOT EXISTS 'velocity_admin'@'localhost' IDENTIFIED BY 'Velocity_2026!+';
GRANT ALL PRIVILEGES ON velocity_draft_db.* TO 'velocity_admin'@'localhost';
FLUSH PRIVILEGES;
```

### 2b. Run the combined script (recommended)

```bash
mariadb -u velocity_admin -p < DataBase/velocity_draft_complete.sql
```

Or run each file individually **in this exact order**:

```bash
mariadb -u velocity_admin -p < DataBase/velocity_draft_db.sql      # 1. Schema
mariadb -u velocity_admin -p < DataBase/velocity_draft_data.sql    # 2. Seed data
mariadb -u velocity_admin -p < DataBase/vd_views.sql               # 3. Views
mariadb -u velocity_admin -p < DataBase/vd_sp.sql                  # 4. Stored procedures
mariadb -u velocity_admin -p < DataBase/vd_triggers.sql            # 5. Triggers
```

---

## 3. Configure the environment

The backend reads credentials from `Web/backend/.env`. The file already exists in the repo with the default values shown below:

```env
DB_HOST=localhost
DB_USER=velocity_admin
DB_PASSWORD=Velocity_2026!+
DB_NAME=velocity_draft_db
PORT=3000
```

---

## 4. Install dependencies

```bash
npm install
```

---

## 5. Start the project

`npm run dev` launches **both** the backend API (Express on port 3000) and the Vite dev server (web dashboard + game, port 5173) in a single terminal using `concurrently`.

```bash
npm run dev
```

To run them separately:

```bash
npm run dev:backend    # Express API → http://localhost:3000
npm run dev:frontend   # Vite dev server → http://localhost:5173
```

---

## 6. Open the web dashboard

Navigate to **http://localhost:5173** — it redirects automatically to the login page. The game runs embedded inside the dashboard at `http://localhost:5173/Web/frontend/game.html`.

> The backend must be running before opening the dashboard — it handles login, card balance, and race result persistence.

---

## How to play

### Card Select
Before each race you are dealt 4 random cards and must pick **one**:
- **Passive upgrades** — permanent stat boosts applied to your kart for the rest of the championship
- **Active (battle) cards** — single-use abilities available during the next race only

### Controls
| Key | Action |
|-----|--------|
| W   | Accelerate |
| S   | Brake |
| A   | Turn left |
| D   | Turn right |
| O   | Cycle through equipped cards |
| P   | Use selected card |
| Space | Pause / resume |

### Passive Upgrades
| Card | Effect |
|------|--------|
| Aerodynamic Spoiler | +1 top speed, +0.1 acceleration |
| Heavy Chassis | +20% max HP (refills on apply) |
| Sport Tires | +1 turn speed |
| Racing Transmission | +0.25 acceleration |

### Race Cards
| Card | Effect |
|------|--------|
| Tire Shredder | Reduces the nearest kart ahead to 40% speed for 4 s |
| Grappler Hook | Drains 15% speed from the kart ahead and adds it to yours |
| Sonic Wave | Lateral knockback + 15 damage to all karts within 3.5 units |
| EMP | Pushes back and disables cards of all karts within 4 units |
| Repair Bot | Instantly restores 30% of your max HP |
| Temporary Armor | Absorbs the next instance of damage or knockback |

### Race
The championship runs across **7 levels** with increasing difficulty:

| Level | Laps | CPU opponents | Weather | Time of day |
|-------|------|--------------|---------|-------------|
| 1 — Practice | 1 | 1 (Fast) | Clear | Day |
| 2 | 2 | 3 (Fast, Aggressive, Strategic) | Clear | Day |
| 3 | 2 | 3 (Fast, Aggressive, Provocative) | Clear | Sunrise |
| 4 | 3 | 3 (Fast, Aggressive, Strategic) | Rain | Sunset |
| 5 | 3 | 4 (all personalities) | Random | Day |
| 6 | 3 | 4 (all personalities) | Random | Sunset |
| 7 — Championship | 3 | 4 (all personalities) | Random | Sunrise |

- Finish in the **top 3** to advance to the next level
- If you finish outside the top 3, you retry the same level with a new card pick
- Your kart **explodes** and the run ends (permadeath) if your HP hits 0

---

## Authors
Oscar Lara, Emilio Lara, Aixa Mendoza — May 2026

---

## Features

### Completed
- 2.5D raycasting engine (Mode 7 floor, sprite scaling, sky scrolling)
- Procedurally generated tracks (Catmull-Rom spline with random variation)
- Kart physics — acceleration, friction, steering, terrain
- Kart-vs-kart collisions with damage
- 4 CPU AI personalities — Fast, Aggressive, Strategic, Provocative
- Card system — 4 passive upgrades and 6 active battle cards
- Card balance loaded live from MariaDB (no hardcoded values)
- Status effects — SpeedDebuff, SpeedBoost, SpeedDrain, Knockback, Shield, CardDisable, InstantHeal
- HUD — HP gauge, lap counter, position badge, minimap, card HUD
- VFX — shockwave ring, shield bubble
- Card selection screen between races
- Roguelike progression — 7 levels, card pick after each race, permadeath on explosion
- Title screen, story screen, race intros, countdown, win/lose results
- Pause menu with music, SFX, and brightness sliders
- Time-of-day skyboxes (day, sunrise, sunset)
- Weather config per level (clear, rain, random)
- Procedural tree placement
- Background music and SFX
- Web dashboard (Fighter Hub) — player stats, leaderboard, admin analytics
- Express + MariaDB backend with REST API
- Player authentication (login / register)
- Race result persistence (position, time, fastest lap, card usage)
- Admin analytics — card impact, daily quality trends, per-race performance

