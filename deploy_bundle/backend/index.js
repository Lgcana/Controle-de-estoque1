import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());


export let db;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DATABASE_URL || path.resolve(__dirname, './database/estoque.db');

// Garante que o diretório do DB exista e, se necessário, copie o DB inicial
async function prepareDatabaseFile() {
  const destDir = path.dirname(dbPath);
  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      console.log(`Criado diretório do DB: ${destDir}`);
    }

    const localRepoDb = path.resolve(__dirname, './database/estoque.db');
    // Se houver um banco no repositório (localRepoDb) e o destino for diferente, copie-o uma única vez
    if (fs.existsSync(localRepoDb) && path.resolve(localRepoDb) !== path.resolve(dbPath)) {
      if (!fs.existsSync(dbPath)) {
        fs.copyFileSync(localRepoDb, dbPath);
        console.log(`Banco de dados copiado de ${localRepoDb} para ${dbPath}`);
      } else {
        console.log(`Banco de dados já existe em ${dbPath}`);
      }
    }
  } catch (err) {
    console.error('Erro ao preparar arquivo do banco:', err);
    throw err;
  }
}

async function initDB() {
  db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  )`);
  await db.exec(`CREATE TABLE IF NOT EXISTS stock_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    type TEXT,
    quantity INTEGER,
    date TEXT,
    user_id INTEGER
  )`);
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  console.log('Banco SQLite pronto!');
}

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function startServer() {
  // Prepara arquivo/pasta do DB antes de abrir
  await prepareDatabaseFile();
  await initDB();

  // Rotas só registradas após o banco estar pronto
  app.post('/api/stock/:id/move', async (req, res) => {
    const { type, quantity, user_id } = req.body;
    const product = await db.get('SELECT * FROM products WHERE id=?', [req.params.id]);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
    let newQuantity = product.quantity;
    if (type === 'entrada') newQuantity += quantity;
    else if (type === 'saida') newQuantity -= quantity;
    if (newQuantity < 0) return res.status(400).json({ message: 'Estoque insuficiente' });
    await db.run('UPDATE products SET quantity=? WHERE id=?', [newQuantity, req.params.id]);
    await db.run('INSERT INTO stock_history (product_id, type, quantity, date, user_id) VALUES (?, ?, ?, ?, ?)', [req.params.id, type, quantity, new Date().toISOString(), user_id || null]);
    res.json({ message: 'Movimentação registrada!' });
  });

  // Histórico de movimentações
  app.get('/api/stock/:id/history', async (req, res) => {
    const history = await db.all('SELECT * FROM stock_history WHERE product_id=? ORDER BY date DESC', [req.params.id]);
    res.json(history);
  });

  // Autenticação
  app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    const userExists = await db.get('SELECT * FROM users WHERE username=?', [username]);
    if (userExists) return res.status(400).json({ message: 'Usuário já existe' });
    const hashed = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed]);
    res.status(201).json({ message: 'Usuário cadastrado!' });
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username=?', [username]);
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Senha incorreta' });
    const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1d' });
    res.json({ token });
  });

  // Importa e usa as rotas de produtos
  const productsRouter = (await import('./routes/products.js')).default;
  app.use('/api/products', productsRouter);

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer();
