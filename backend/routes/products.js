import express from 'express';
import { db } from '../index.js';

const router = express.Router();

// Criar produto
router.post('/', async (req, res) => {
  try {
    const { name, description, quantity, price } = req.body;
    const result = await db.run(
      'INSERT INTO products (name, description, quantity, price) VALUES (?, ?, ?, ?)',
      [name, description, quantity, price]
    );
    const product = {
      id: result.lastID,
      name,
      description,
      quantity,
      price
    };
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar produto' });
  }
});

// Listar produtos
router.get('/', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  try {
    const { name, description, quantity, price } = req.body;
    const result = await db.run(
      'UPDATE products SET name = ?, description = ?, quantity = ?, price = ? WHERE id = ?',
      [name, description, quantity, price, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ message: 'Produto não encontrado' });
    const updated = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar produto' });
  }
});

// Excluir produto
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json({ message: 'Produto excluído' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir produto' });
  }
});

export default router;
