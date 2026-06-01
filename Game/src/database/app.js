import express from 'express';
import mysql from 'mysql2/promise';
import env from 'dotenv';

env.config();

const app = express();
const port = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

