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
        console.error("⚠️ Error en MariaDB (/api/cards):", error.message);
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
        
        res.status(200).json({ success: true, message: "¡Resultado y promedio guardados!" });
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

// 8. Encendido del servidor
app.listen(port, () => {
  console.log(`🚀 Servidor de Velocity Draft corriendo en http://localhost:${port}`);
});