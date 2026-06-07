import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// 1. Configuraciones de rutas para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Le decimos a dotenv que busque el .env exactamente en la misma carpeta que este app.js
dotenv.config({ path: path.join(__dirname, '.env') });

// 2. Inicializar Express (¡Esto tiene que ir ANTES de usar app.use!)
const app = express();
const port = process.env.PORT || 3000;

// 3. Middlewares globales
app.use(cors()); // Ahora sí funciona sin romper el servidor

// Agrega esto debajo de app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self' http://localhost:3000 http://localhost:5173; connect-src 'self' http://localhost:3000 http://localhost:5173;");
  next();
});

app.use(express.json());

// 4. Pool de conexiones a MariaDB
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Añade esto justo antes de tus endpoints /api en app.js
app.get('/', (req, res) => {
    res.status(200).json({
        status: "online",
        project: "Velocity Draft - Backend Engine",
        authors: ["Oscar Lara", "Emilio Lara", "Aixa Mendoza"]
    });
});

// 5. ENDPOINT: Obtener cartas y efectos (Sincronizado con race.js)
app.get('/api/cards', async (req, res) => {
    try {
        // Aseguramos que los nombres de las columnas coincidan con lo que race.js espera mapear
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

// 6. ENDPOINT: Guardar los resultados al cruzar la meta
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

// 7. ENDPOINT: Iniciar nueva carrera (Usa variable OUT para regresar el ID generado)
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

app.get('/api/stats', async (req, res) => {
    // ID del usuario activo (Emilio)
    const player_id = 1; 

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

// Endpoint de autenticación en tu backend Express
app.post('/api/login', async (req, res) => {
    // 1. Recibimos también el 'role' que seleccionó el usuario en login.html
    const { username, password, role } = req.body;

    try {
        // 2. Lista blanca de administradores (Sin modificar tu base de datos)
        const ADMINS_PERMITIDOS = ['Emilio_Lara', 'Oscar_Lara', 'Aixa_Mendoza'];

        // 3. Consulta real usando la estructura exacta de tu script SQL (USERS y PLAYER)
        const query = `
            SELECT u.user_id, u.username, u.password, p.player_id 
            FROM USERS u
            LEFT JOIN PLAYER p ON u.user_id = p.user_id 
            WHERE u.username = ?
        `;

        const [users] = await pool.query(query, [username]);

        // Si no se encuentra el registro en tu tabla USERS
        if (users.length === 0) {
            return res.status(200).json({ success: false, message: 'User not found.' });
        }

        const user = users[0];

        // 4. Validación de contraseña (usando tu columna real 'password')
        if (password !== user.password) {
            return res.status(200).json({ success: false, message: 'Invalid password.' });
        }

        // 5. Validación lógica del rol seleccionado en el formulario
        let rolAsignado = 'player'; // Por defecto entra como jugador

        if (role === 'admin') {
            // Si seleccionó Admin en la interfaz, verificamos que esté en el arreglo
            if (ADMINS_PERMITIDOS.includes(user.username)) {
                rolAsignado = 'admin';
            } else {
                // Si la contraseña es correcta pero no es admin, bloqueamos el inicio de sesión
                return res.status(200).json({ 
                    success: false, 
                    message: 'You do not have admin privileges. Please log in as a player.' 
                });
            }
        }

        // 6. Respuesta exitosa estructurada idéntica a lo que espera tu login.html
        res.status(200).json({
            success: true,
            role: rolAsignado,
            username: user.username,
            player_id: user.player_id || null // Si es admin puro sin auto-registro en PLAYER, devuelve null
        });

    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const query = `
            SELECT 
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

// 8. Encendido del servidor
app.listen(port, () => {
  console.log(`Servidor de Velocity Draft corriendo en http://localhost:${port}`);
});