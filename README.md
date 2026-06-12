<p align = "center">
  <img src = "/Documentos/GDD/assets/imgs_used/logo.png" width= "250">
</p>

# REPOSITORY ORGANIZATION

```
Videojuego_Software/
│
├── Código/                          ← all runnable source code
│   ├── README.md                    ← setup & run instructions
│   ├── ACCESSIBILITY_REPORT.md      ← colorblind filter accessibility report
│   ├── package.json                 ← npm run dev starts everything
│   ├── index.html                   ← redirects to the web dashboard
│   │
│   ├── Web/
│   │   ├── frontend/                ← web dashboard (HTML, CSS, JS)
│   │   │   ├── index.html
│   │   │   ├── login.html
│   │   │   ├── register.html
│   │   │   ├── stats.html
│   │   │   ├── tutorial.html
│   │   │   ├── game.html
│   │   │   ├── css/style.css
│   │   │   ├── js/auth.js
│   │   │   └── js/stats.js
│   │   └── backend/                 ← Express REST API
│   │       ├── app.js
│   │       └── .env                 ← DB credentials (connects to our MariaDB)
│   │
│   ├── Videojuego/                  ← 2.5D raycasting game (Vite)
│   │   ├── play.html                ← game entry point
│   │   ├── assets/                  ← sprites, audio, music, card images
│   │   ├── sprites/                 ← player kart sprites
│   │   └── src/
│   │       ├── main.js
│   │       ├── engine/              ← input, camera
│   │       ├── game/                ← race, karts, cards, AI personalities
│   │       └── renderer/            ← raycaster, HUD, minimap, card screen
│   │
│   └── Base_de_Datos/
│       ├── velocity_draft_complete.sql   ← SINGLE combined script (run this)
│       ├── velocity_draft_db.sql         ← schema (DDL)
│       ├── velocity_draft_data.sql       ← seed data (DML)
│       ├── vd_views.sql                  ← views
│       ├── vd_sp.sql                     ← stored procedures
│       └── vd_triggers.sql               ← triggers
│
├── Documentos/                      ← project documentation
│   ├── GDD/                         ← Game Design Document + assets
│   ├── Software_Requirements_Specification.md
│   └── (PDF specs go here)
│
├── Presentación/
│   └── video_link.txt               ← YouTube demo link
│
├── sprites/                         ← source art files (.pixil, PNG originals)
├── Presentations/                   ← initial pitch PDF
└── OTHERS/                          ← coursework & supporting activities
```

## Código
All source code for the project. Run `cd Código && npm install && npm run dev` to start — see `Código/README.md` for full setup instructions including database initialization.

## Documentos
Project documentation: Game Design Document, Software Requirements Specification, and design specs.

## Presentación
Contains a `.txt` file with the YouTube link to the full system demo video.

## sprites
Source art library with all sprites created for the project (.pixil files and PNG originals), including assets not yet integrated into the game.

## OTHERS
Coursework and supporting academic activities (Cat Café project, database diagrams and justifications).


# Getting started?
See `Código/README.md` for installation and execution instructions.
