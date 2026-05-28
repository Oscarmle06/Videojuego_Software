import express from 'express'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


const app = express()
const PORT = 3000

app.use(express.static('.')) 
app.use(express.json())
app.get('/api/gatos.php', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT nombre, edad, caracter, imagen FROM gatos')
    res.json(rows)
  } catch (error) {
    console.error("Error en la BD de gatos ninja:", error)
    res.status(500).json({ error: 'Error al traer los gatos ninja' })
  }
})

app.get('/api/gatos.php', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT nombre, edad, caracter, imagen FROM gatos')
    res.json(rows)
  } catch (error) {
    console.error("Error en la BD de gatos ninja:", error)
    res.status(500).json({ error: 'Error al traer los gatos ninja' })
  }
})

app.get('/api/menu.php', async (req, res) => {
  const diaSemana = req.query.dia_semana

  try {
    const querySQL = `
      SELECT p.nombre, p.descripcion, p.imagen 
      FROM menu_dias md
      INNER JOIN platillos p ON md.platillo_id = p.id
      WHERE md.dia_semana = ?
    `
    
    const [rows] = await pool.query(querySQL, [diaSemana])
    res.json(rows)
  } catch (error) {
    console.error("Error en la BD del menú:", error)
    res.status(500).json({ error: 'Error al traer el menú del día' })
  }
})

app.listen(PORT, () => {
  console.log(`\n🐈 Servidor de Uchiha Café corriendo en: http://localhost:${PORT}`)
})