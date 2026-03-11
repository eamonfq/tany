const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET /api/items - List all active items, optional ?category=
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { category } = req.query;
    let items;
    if (category) {
      items = db.prepare('SELECT * FROM items WHERE is_active = 1 AND category = ? ORDER BY category, name').all([category]);
    } else {
      items = db.prepare('SELECT * FROM items WHERE is_active = 1 ORDER BY category, name').all();
    }
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/items/:id
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get([Number(req.params.id)]);
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/items
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { name, category, description, unit_price, discount_price, image_url } = req.body;
    if (!name || !category || unit_price == null) {
      return res.status(400).json({ error: 'name, category y unit_price son obligatorios' });
    }
    const result = db.prepare(
      'INSERT INTO items (name, category, description, unit_price, discount_price, image_url) VALUES (?, ?, ?, ?, ?, ?)'
    ).run([name, category, description || null, unit_price, discount_price || null, image_url || null]);
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get([result.lastInsertRowid]);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/items/:id
router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const { name, category, description, unit_price, discount_price, image_url, is_active } = req.body;
    const existing = db.prepare('SELECT * FROM items WHERE id = ?').get([Number(req.params.id)]);
    if (!existing) return res.status(404).json({ error: 'Item no encontrado' });

    db.prepare(
      'UPDATE items SET name = ?, category = ?, description = ?, unit_price = ?, discount_price = ?, image_url = ?, is_active = ? WHERE id = ?'
    ).run([
      name || existing.name,
      category || existing.category,
      description !== undefined ? description : existing.description,
      unit_price != null ? unit_price : existing.unit_price,
      discount_price !== undefined ? discount_price : existing.discount_price,
      image_url !== undefined ? image_url : existing.image_url,
      is_active != null ? is_active : existing.is_active,
      Number(req.params.id)
    ]);
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get([Number(req.params.id)]);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/items/:id (soft delete)
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM items WHERE id = ?').get([Number(req.params.id)]);
    if (!existing) return res.status(404).json({ error: 'Item no encontrado' });
    db.prepare('UPDATE items SET is_active = 0 WHERE id = ?').run([Number(req.params.id)]);
    res.json({ message: 'Item desactivado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
