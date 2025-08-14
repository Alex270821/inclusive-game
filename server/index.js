require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/score', async (req, res) => {
  const { user_id = 1, module, score } = req.body;
  await pool.query(
    'INSERT INTO scores(user_id, module, score) VALUES($1,$2,$3)',
    [user_id, module, score]
  );
  res.sendStatus(201);
});

app.listen(3000, () => console.log('API lancée sur :3000'));