// app.js — Express Backend for Velocity Draft
// This file sets up an Express server that connects to a MariaDB database, providing API endpoints for the game to fetch card data and record race results. It also includes endpoints for player statistics and admin analytics.
// Oscar Lara, Emilio Lara, Aixa Mendoza, June 2026

import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); 

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self' http://localhost:3000 http://localhost:5173; connect-src 'self' http://localhost:3000 http://localhost:5173;");
  next();
});

app.use(express.json());

// Conection pool for MariaDB - allows us to reuse connections and handle multiple requests efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function ensureRuntimeSchema() {
    await pool.query(
        'ALTER TABLE PLAYER ADD COLUMN IF NOT EXISTS current_level INT NOT NULL DEFAULT 1'
    );
    await pool.query(
        'ALTER TABLE PLAYER_GAME ADD COLUMN IF NOT EXISTS race_level INT NOT NULL DEFAULT 1'
    );
    await pool.query(`
        CREATE TABLE IF NOT EXISTS CARD_RACE_USAGE (
            player_id INT NOT NULL,
            game_id INT NOT NULL,
            card_id INT NOT NULL,
            selected_count INT NOT NULL DEFAULT 1,
            activated_count INT NOT NULL DEFAULT 0,
            PRIMARY KEY (player_id, game_id, card_id),
            CONSTRAINT fk_cru_player_game FOREIGN KEY (player_id, game_id) REFERENCES PLAYER_GAME(player_id, game_id) ON DELETE CASCADE,
            CONSTRAINT fk_cru_card FOREIGN KEY (card_id) REFERENCES CARD(card_id) ON DELETE CASCADE
        )
    `);
}

ensureRuntimeSchema().then(() => {
    console.log("Database schema checked/updated.");
}).catch(error => {
    console.error("Critical error updating schema:", error.message);
});

// 1. ENDPOINT: Health Check
app.get('/', (req, res) => {
    res.status(200).json({
        status: "online",
        project: "Velocity Draft - Backend Engine",
        authors: ["Oscar Lara", "Emilio Lara", "Aixa Mendoza"]
    });
});

// 2. ENDPOINT: Get all cards with their effects
app.get('/api/cards', async (req, res) => {
    try {
        // We make sure the names on the columns match the ones that appear in race.js
        const query = `
            SELECT 
                card_name, 
                category, 
                effect_type, 
                value 
            FROM vw_card_effects_detail
        `;
        
        const [rows] = await pool.query(query);
        
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Error in MariaDB (/api/cards):", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 3. ENDPOINT: Record race results and calculate average play time
app.post('/api/race/result', async (req, res) => {
    const { player_id, game_id, position, total_time, fastest_lap } = req.body;
    
    try {
        await pool.query(
            'CALL sp_record_race_result(?, ?, ?, ?, ?)', 
            [player_id, game_id, position, total_time, fastest_lap]
        );
        
        res.status(200).json({ success: true, message: "Result and average saved successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. ENDPOINT: Start a new race session
app.post('/api/race/start', async (req, res) => {
    const { rival_type, rival_qty } = req.body;
    
    try {
        await pool.query('CALL sp_create_game_session(?, ?, @generated_id)', [rival_type, rival_qty]);
        
        // Cachar el ID que generó el SP
        const [rows] = await pool.query('SELECT @generated_id AS game_id');
        const gameId = rows[0].game_id;
        
        res.status(200).json({ success: true, game_id: gameId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. ENDPOINT: Get player statistics
app.get('/api/stats', async (req, res) => {
    const player_id = req.query.player_id;

    try {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) as total_games,
                SUM(CASE WHEN position = 1 THEN 1 ELSE 0 END) as wins,
                MIN(fastest_lap) as best_lap,
                AVG(total_play_time) as avg_time
            FROM PLAYER_GAME 
            WHERE player_id = ?
        `, [player_id]);

        const stats = rows[0]; 

        res.status(200).json({
            success: true,
            data: {
                totalGames: stats.total_games || 0,
                wins: stats.wins || 0,
                bestLap: stats.best_lap ? parseFloat(stats.best_lap).toFixed(2) : "0.00",
                avgTime: stats.avg_time ? parseFloat(stats.avg_time).toFixed(2) : "0.00"
            }
        });
    } catch (error) {
        console.error("Error in MariaDB (/api/stats):", error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 6. ENDPOINT: Login process - validates user credentials and returns session info including role (player or admin)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // AQUÍ es donde aplicas el JOIN por user_id
        const query = `
            SELECT u.username, u.role, p.player_id 
            FROM USERS u
            LEFT JOIN PLAYER p ON u.user_id = p.user_id 
            WHERE u.username = ? AND u.password = ?
        `;
        const [rows] = await pool.query(query, [username, password]);
        
        if (rows.length > 0) {
            const user = rows[0];
            res.status(200).json({ 
                success: true, 
                username: user.username, 
                role: user.role, 
                player_id: user.player_id 
            });
        } else {
            res.status(401).json({ success: false, message: "Credenciales incorrectas" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. ENDPOINT: Leaderboard (Top 10 players by wins and best lap time)
app.get('/api/leaderboard', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.player_id,  -- ¡AQUÍ ESTÁ EL CAMBIO!
                p.game_name as name, 
                COUNT(pg.game_id) as games, 
                SUM(CASE WHEN pg.position = 1 THEN 1 ELSE 0 END) as wins,
                MIN(pg.fastest_lap) as bestLap
            FROM PLAYER p
            JOIN PLAYER_GAME pg ON p.player_id = pg.player_id
            GROUP BY p.player_id, p.game_name
            ORDER BY wins DESC, bestLap ASC
            LIMIT 10;
        `;
        const [rows] = await pool.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error en /api/leaderboard:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 8. ENDPOINT: Admin analytics - card impact with real selections/activations and podium conversion
app.get('/api/admin/card-impact', async (req, res) => {
    try {
        const query = `
            SELECT
                c.name,
                c.category,
                SUM(cru.selected_count) AS selected_count,
                SUM(cru.activated_count) AS activated_count,
                SUM(CASE WHEN pg.position <= 3 THEN 1 ELSE 0 END) AS podiums,
                ROUND(100 * SUM(CASE WHEN pg.position <= 3 THEN 1 ELSE 0 END) / NULLIF(SUM(cru.selected_count), 0), 1) AS podium_rate,
                ROUND(AVG(pg.position), 2) AS avg_position,
                ROUND(AVG(pg.total_play_time), 2) AS avg_time,
                ROUND(MIN(NULLIF(pg.fastest_lap, 0)), 2) AS best_lap
            FROM CARD_RACE_USAGE cru
            JOIN CARD c ON cru.card_id = c.card_id
            JOIN PLAYER_GAME pg ON cru.player_id = pg.player_id AND cru.game_id = pg.game_id
            GROUP BY c.name, c.category
            ORDER BY selected_count DESC, podium_rate DESC
            LIMIT 10;
        `;
        const [rows] = await pool.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Backwards-compatible summary of selected cards.
app.get('/api/admin/top-cards', async (req, res) => {
    try {
        const query = `
            SELECT c.name, SUM(cru.selected_count) as total_uses
            FROM CARD_RACE_USAGE cru
            JOIN CARD c ON cru.card_id = c.card_id
            GROUP BY c.name
            ORDER BY total_uses DESC
            LIMIT 10;
        `;
        const [rows] = await pool.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 9. ENDPOINT: Daily race quality trend
app.get('/api/admin/daily-quality', async (req, res) => {
    try {
        const query = `
            SELECT
                DATE(g.login_date) AS day,
                COUNT(*) AS races,
                COUNT(DISTINCT pg.player_id) AS players,
                ROUND(AVG(pg.total_play_time), 2) AS avg_time,
                ROUND(MIN(NULLIF(pg.fastest_lap, 0)), 2) AS best_lap,
                ROUND(100 * SUM(CASE WHEN pg.position <= 3 THEN 1 ELSE 0 END) / COUNT(*), 1) AS podium_rate
            FROM PLAYER_GAME pg
            JOIN GAMESESSION g ON pg.game_id = g.game_id
            GROUP BY DATE(g.login_date)
            ORDER BY day ASC
            LIMIT 14;
        `;
        const [rows] = await pool.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Backwards-compatible average play time trend.
app.get('/api/admin/time-trends', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DATE(g.login_date) as day, AVG(pg.total_play_time) as avg_time
            FROM PLAYER_GAME pg
            JOIN GAMESESSION g ON pg.game_id = g.game_id
            GROUP BY DATE(g.login_date)
            ORDER BY day ASC
            LIMIT 7;
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 10. ENDPOINT: Race level performance distribution
app.get('/api/admin/race-performance', async (req, res) => {
    try {
        const query = `
            SELECT
                race_level,
                COUNT(*) AS starts,
                SUM(CASE WHEN position = 1 THEN 1 ELSE 0 END) AS wins,
                SUM(CASE WHEN position <= 3 THEN 1 ELSE 0 END) AS podiums,
                ROUND(100 * SUM(CASE WHEN position = 1 THEN 1 ELSE 0 END) / COUNT(*), 1) AS win_rate,
                ROUND(100 * SUM(CASE WHEN position <= 3 THEN 1 ELSE 0 END) / COUNT(*), 1) AS podium_rate,
                ROUND(AVG(total_play_time), 2) AS avg_time,
                ROUND(AVG(NULLIF(fastest_lap, 0)), 2) AS avg_fastest_lap
            FROM PLAYER_GAME
            GROUP BY race_level
            ORDER BY race_level ASC;
        `;
        const [rows] = await pool.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Backwards-compatible race distribution.
app.get('/api/admin/race-distribution', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                CASE
                    WHEN position <= 3 THEN 'Podio (1-3)'
                    WHEN position <= 6 THEN 'Media (4-6)'
                    ELSE 'Baja (7+)'
                END as category,
                COUNT(*) as count
            FROM PLAYER_GAME
            GROUP BY category;
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 11. ENDPOINT: Register process - creates a new user and associated player profile in a transaction to ensure data integrity
app.post('/api/register', async (req, res) => {
    const { email, username, password, game_name } = req.body;
    
    try {
        // Iniciamos una transacción
        await pool.query('START TRANSACTION');

        // 1. Insertar usuario
        const [userResult] = await pool.query(
            'INSERT INTO USERS (email, username, password, role) VALUES (?, ?, ?, ?)',
            [email, username, password, 'player'] 
        );
        const userId = userResult.insertId;

        // 2. Insertar perfil del jugador
        await pool.query(
            'INSERT INTO PLAYER (user_id, game_name) VALUES (?, ?)',
            [userId, game_name]
        );

        await pool.query('COMMIT');
        res.status(201).json({ success: true, message: "Cuenta creada exitosamente" });
        
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error en registro:", error);
        res.status(500).json({ success: false, error: "Error al crear cuenta: " + error.message });
    }
});

// 12. ENDPOINT: Get a player's saved race progress (current level)
app.get('/api/player/progress', async (req, res) => {
    const player_id = req.query.player_id;
    try {
        const [rows] = await pool.query(
            'SELECT current_level FROM PLAYER WHERE player_id = ?',
            [player_id]
        );
        res.status(200).json({
            success: true,
            level: rows.length > 0 ? rows[0].current_level : 1
        });
    } catch (error) {
        console.error("Error in MariaDB (GET /api/player/progress):", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 13. ENDPOINT: Save a player's race progress (current level)
app.post('/api/player/progress', async (req, res) => {
    const { player_id, level } = req.body;

    if (!player_id || !Number.isInteger(Number(level))) {
        return res.status(400).json({ success: false, error: "player_id and numeric level are required" });
    }

    try {
        await pool.query(
            'UPDATE PLAYER SET current_level = ? WHERE player_id = ?',
            [Number(level), player_id]
        );
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in MariaDB (POST /api/player/progress):", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 14. ENDPOINT: Save race statistics (used by the game to record player performance after each race)
app.post('/api/save-race', async (req, res) => {
    const { player_id, position, total_play_time, fastest_lap, race_level, cards = [] } = req.body;
    
    // Función de reintento integrada
    const executeTransaction = async (retries = 3) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [gameResult] = await connection.query(
                'INSERT INTO GAMESESSION (login_date, time_in_race) VALUES (NOW(), ?)',
                [total_play_time || 0]
            );
            await connection.query(
                'INSERT INTO PLAYER_GAME (player_id, game_id, position, total_play_time, fastest_lap, race_level) VALUES (?, ?, ?, ?, ?, ?)',
                [player_id, gameResult.insertId, position, total_play_time || 0, fastest_lap || 0, race_level || 1]
            );
            const [[playerUser]] = await connection.query(
                'SELECT user_id FROM PLAYER WHERE player_id = ?',
                [player_id]
            );
            for (const card of cards) {
                if (!card || !card.name) continue;
                const [[dbCard]] = await connection.query(
                    'SELECT card_id FROM CARD WHERE name = ?',
                    [card.name]
                );
                if (!dbCard) continue;
                const selectedCount = Math.max(0, Number(card.selected_count) || 0);
                const activatedCount = Math.max(0, Number(card.activated_count) || 0);
                await connection.query(
                    `INSERT INTO CARD_RACE_USAGE (player_id, game_id, card_id, selected_count, activated_count)
                     VALUES (?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                        selected_count = selected_count + VALUES(selected_count),
                        activated_count = activated_count + VALUES(activated_count)`,
                    [player_id, gameResult.insertId, dbCard.card_id, selectedCount, activatedCount]
                );
                if (playerUser && selectedCount > 0) {
                    await connection.query(
                        `INSERT INTO CARD_Stats (user_id, card_id, usage_count)
                         VALUES (?, ?, ?)
                         ON DUPLICATE KEY UPDATE usage_count = usage_count + VALUES(usage_count)`,
                        [playerUser.user_id, dbCard.card_id, selectedCount]
                    );
                }
            }
            await connection.commit();
            return gameResult.insertId;
        } catch (error) {
            await connection.rollback();
            // 1213 is mariaDB's error code for deadlock
            if (error.errno === 1213 && retries > 0) {
                await new Promise(r => setTimeout(r, 100));
                return executeTransaction(retries - 1);
            }
            throw error;
        } finally {
            connection.release();
        }
    };

    try {
        const gameId = await executeTransaction();
        res.json({ success: true, game_id: gameId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Server listening on specified port
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
